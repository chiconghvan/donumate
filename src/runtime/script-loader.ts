import { readdir } from 'fs/promises';
import { resolve, isAbsolute, join, relative, basename, extname, sep } from 'path';
import { pathToFileURL } from 'url';
import { select } from '@inquirer/prompts';
import { AppError } from '../utils/errors.js';
import { loadFlowProgram, loadFlowScript } from './dsl/executor.js';
import type { FlowProgram } from './dsl/types.js';
import type { WorkflowScript } from './types.js';

export const BUILTIN_SCRIPTS: Record<string, string> = {
  threads: 'scripts/threads.ts',
};

export type LoadedWorkflow =
  | { kind: 'ts'; run: WorkflowScript; filePath: string }
  | { kind: 'flow'; program: FlowProgram; filePath: string };

/**
 * Resolve script spec to an absolute file path.
 *
 * Resolution order:
 * 1. Built-in name ("threads" -> scripts/threads.ts)
 * 2. Absolute path (C:\...\scripts\foo.ts or /home/.../foo.ts)
 * 3. Relative to cwd (./scripts/foo.ts or scripts/foo.ts)
 */
function resolveScriptPath(spec: string): string {
  // Check built-in
  if (BUILTIN_SCRIPTS[spec]) {
    return resolve(process.cwd(), BUILTIN_SCRIPTS[spec]);
  }

  // Absolute path
  if (isAbsolute(spec)) {
    return spec;
  }

  // Relative to cwd
  return resolve(process.cwd(), spec);
}

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

async function listScriptFiles(): Promise<string[]> {
  const scriptsDir = resolve(process.cwd(), 'scripts');

  let entries: string[];
  try {
    entries = await readdir(scriptsDir);
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.endsWith('.ts') || entry.endsWith('.flow'))
    .map((entry) => toPosixPath(relative(process.cwd(), join(scriptsDir, entry))))
    .sort((a, b) => a.localeCompare(b));
}

export async function selectScript(): Promise<string> {
  const scriptFiles = await listScriptFiles();
  const builtinPaths = new Set(Object.values(BUILTIN_SCRIPTS));
  const choices = [
    ...Object.keys(BUILTIN_SCRIPTS).map((name) => ({
      name: `${name} (built-in)`,
      value: name,
    })),
    ...scriptFiles
      .filter((file) => !builtinPaths.has(file))
      .map((file) => ({
        name: `${basename(file, extname(file))} (${extname(file).slice(1)})`,
        value: file,
      })),
  ];

  if (choices.length === 0) {
    throw new AppError('No workflow scripts found. Add a .ts or .flow file in scripts/ or pass --script <path>.');
  }

  return select({
    message: 'Select workflow script',
    choices,
  });
}

export async function loadWorkflow(spec: string): Promise<LoadedWorkflow> {
  const filePath = resolveScriptPath(spec);
  if (filePath.endsWith('.flow')) {
    try {
      return { kind: 'flow', program: await loadFlowProgram(filePath), filePath };
    } catch (error) {
      throw new AppError(`Failed to load flow script: ${filePath}`, error);
    }
  }

  return { kind: 'ts', run: await importWorkflowScript(spec, filePath), filePath };
}

/**
 * Dynamically import a workflow script.
 * Returns the default export if it's a function.
 */
export async function loadScript(spec: string): Promise<WorkflowScript> {
  const filePath = resolveScriptPath(spec);
  if (filePath.endsWith('.flow')) {
    try {
      return await loadFlowScript(filePath);
    } catch (error) {
      throw new AppError(`Failed to load flow script: ${filePath}`, error);
    }
  }

  return importWorkflowScript(spec, filePath);
}

async function importWorkflowScript(spec: string, filePath: string): Promise<WorkflowScript> {
  const fileUrl = pathToFileURL(filePath).href;

  let mod: unknown;
  try {
    mod = await import(fileUrl);
  } catch (error) {
    throw new AppError(`Failed to import script: ${filePath}`, error);
  }

  // Support both `export default function` and `export default { default: function }`
  const fn = typeof mod === 'object' && mod !== null && 'default' in mod
    ? (mod as { default: unknown }).default
    : mod;

  if (typeof fn !== 'function') {
    throw new AppError(
      `Script ${spec} (${filePath}) does not export a default function.\n` +
      `Expected: export default async function(ctx: WorkflowContext) { ... }`
    );
  }

  return fn as WorkflowScript;
}
