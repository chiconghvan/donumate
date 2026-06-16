import { readdir, readFile, writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { resolve, isAbsolute, join, relative, basename, extname, sep } from 'path';
import { pathToFileURL } from 'url';
import { randomBytes } from 'crypto';
import { build as esbuild } from 'esbuild';
import { AppError, CliBackError } from '../utils/errors.js';
import { globalAbort } from '../utils/abort.js';
import { runListPicker } from '../ui/list-picker.js';
import { loadFlowProgram, loadFlowScript } from './dsl/executor.js';
import type { FlowProgram } from './dsl/types.js';
import type { WorkflowScript } from './types.js';

export const BUILTIN_SCRIPTS: Record<string, string> = {
  threads: 'scripts/threads.ts',
};

export type LoadedWorkflow =
  | { kind: 'ts'; run: WorkflowScript; filePath: string; cachedPath: string; cacheDir: string; cleanup: () => Promise<void> }
  | { kind: 'flow'; program: FlowProgram; filePath: string; cachedPath: string; cacheDir: string; cleanup: () => Promise<void> };

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

export async function selectScript(defaultScript?: string): Promise<string> {
  if (process.stdin.isTTY) {
    process.stdin.resume();
  }
  const scriptFiles = await listScriptFiles();
  const builtinPaths = new Set(Object.values(BUILTIN_SCRIPTS));
  const choices = [
    ...Object.keys(BUILTIN_SCRIPTS).map((name) => ({
      label: `${name} (built-in)`,
      value: name,
    })),
    ...scriptFiles
      .filter((file) => !builtinPaths.has(file))
      .map((file) => ({
        label: `${file}`,
        value: file,
      })),
    { label: 'Exit', value: '__exit__' },
  ];

  if (choices.length === 1) { // Only 'Exit' exists
    throw new AppError('No workflow scripts found. Add a .ts or .flow file in scripts/, or pass --script <path>.');
  }

  const selected = await runListPicker({
    title: `Select workflow script (${choices.length - 1} found)`,
    options: choices,
    initialValue: defaultScript,
    cancelHint: 'exit',
  });

  if (selected === undefined || selected === '__exit__') {
    throw globalAbort.signal.aborted ? new AppError('Aborted') : new AppError('Exit');
  }

  return selected;
}

const CACHE_ROOT = join(tmpdir(), 'donumate', 'script-cache');
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

function createRunId(): string {
  const time = Date.now().toString(36);
  const pid = process.pid.toString(36);
  const rand = randomBytes(4).toString('hex');
  return `${time}-${pid}-${rand}`;
}

async function createCacheDir(): Promise<string> {
  const dir = join(CACHE_ROOT, createRunId());
  await mkdir(dir, { recursive: true });
  return dir;
}

async function pruneOldCaches(): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(CACHE_ROOT);
  } catch {
    return;
  }
  const now = Date.now();
  for (const entry of entries) {
    const entryPath = join(CACHE_ROOT, entry);
    try {
      // Use file stat to check age; dirs created by us have mtime ~ creation time
      const { statSync } = await import('fs');
      const st = statSync(entryPath);
      if (now - st.mtimeMs > CACHE_MAX_AGE_MS) {
        await rm(entryPath, { recursive: true, force: true }).catch(() => {});
      }
    } catch {
      // ignore prune errors
    }
  }
}

function makeCleanup(dir: string): () => Promise<void> {
  return async () => {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  };
}

export async function loadWorkflow(spec: string): Promise<LoadedWorkflow> {
  const filePath = resolveScriptPath(spec);

  // Prune old caches best-effort (non-blocking)
  pruneOldCaches().catch(() => {});

  const cacheDir = await createCacheDir();

  if (filePath.endsWith('.flow')) {
    return loadFlowWorkflow(filePath, cacheDir);
  }

  return loadTsWorkflow(spec, filePath, cacheDir);
}

async function loadFlowWorkflow(filePath: string, cacheDir: string): Promise<LoadedWorkflow> {
  const cachedPath = join(cacheDir, 'workflow.flow');

  try {
    // Read original once, write to cache
    const source = await readFile(filePath, 'utf8');
    await writeFile(cachedPath, source, 'utf8');

    // Parse from cached copy — no dependency on original file after this
    const program = await loadFlowProgram(cachedPath);

    return {
      kind: 'flow',
      program,
      filePath,
      cachedPath,
      cacheDir,
      cleanup: makeCleanup(cacheDir),
    };
  } catch (error) {
    // Cleanup cache dir on failure
    await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
    throw new AppError(`Failed to load flow script: ${filePath}`, error);
  }
}

async function loadTsWorkflow(spec: string, filePath: string, cacheDir: string): Promise<LoadedWorkflow> {
  const cachedPath = join(cacheDir, 'workflow.mjs');

  try {
    // Bundle original TS into cached ESM — captures all relative imports
    await esbuild({
      entryPoints: [filePath],
      outfile: cachedPath,
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node22',
      sourcemap: 'inline',
      packages: 'external',
    });

    // Import cached bundle with unique URL to bypass Node ESM module cache
    const runId = createRunId();
    const fileUrl = pathToFileURL(cachedPath).href + '?run=' + encodeURIComponent(runId);
    const run = await importCachedScript(spec, filePath, fileUrl);

    return {
      kind: 'ts',
      run,
      filePath,
      cachedPath,
      cacheDir,
      cleanup: makeCleanup(cacheDir),
    };
  } catch (error) {
    await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to bundle/cache script: ${filePath}`, error);
  }
}

async function importWorkflowScript(spec: string, filePath: string): Promise<WorkflowScript> {
  const fileUrl = pathToFileURL(filePath).href;

  return importCachedScript(spec, filePath, fileUrl);
}

async function importCachedScript(spec: string, originalPath: string, fileUrl: string): Promise<WorkflowScript> {
  let mod: unknown;
  try {
    mod = await import(fileUrl);
  } catch (error) {
    throw new AppError(`Failed to import script: ${originalPath}`, error);
  }

  // Support both `export default function` and `export default { default: function }`
  const fn = typeof mod === 'object' && mod !== null && 'default' in mod
    ? (mod as { default: unknown }).default
    : mod;

  if (typeof fn !== 'function') {
    throw new AppError(
      `Script ${spec} (${originalPath}) does not export a default function.\n` +
      `Expected: export default async function(ctx: WorkflowContext) { ... }`
    );
  }

  return fn as WorkflowScript;
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
