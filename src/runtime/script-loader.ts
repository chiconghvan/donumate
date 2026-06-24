import { readdir, readFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, isAbsolute, join, relative, basename, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';
import { AppError, CliBackError } from '../utils/errors.js';
import { globalAbort } from '../utils/abort.js';
import { getUi } from '../ui/ui-provider.js';
import { isPackagedExecutable } from '../utils/runtime-mode.js';
import { loadFlowProgram } from './dsl/executor.js';
import type { FlowProgram } from './dsl/types.js';
import type { WorkflowScript } from './types.js';
import { graphDocumentToFlowProgram, parseGraphDocument } from '../script-builder/graph-model.js';

async function loadEsbuild(): Promise<typeof import('esbuild')> {
  return import('esbuild');
}

export const BUILTIN_SCRIPTS: Record<string, string> = {
  threads: 'scripts/threads.ts',
};

export type LoadedWorkflow =
  | { kind: 'ts'; run: WorkflowScript; filePath: string; cachedPath: string; cacheDir: string; cleanup: () => Promise<void> }
  | { kind: 'flow'; program: FlowProgram; filePath: string; cachedPath: string; cacheDir: string; cleanup: () => Promise<void> };

function resolveScriptPath(spec: string): string {
  if (BUILTIN_SCRIPTS[spec]) return resolve(process.cwd(), BUILTIN_SCRIPTS[spec]);
  if (isAbsolute(spec)) return spec;
  return resolve(process.cwd(), spec);
}

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

function isGraphWorkflowFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.flow.json');
}

function isWorkflowScriptFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.flow') || lower.endsWith('.flow.json') || lower.endsWith('.ts');
}

async function listScriptFiles(): Promise<string[]> {
  const scriptsDir = resolve(process.cwd(), 'scripts');
  let entries: string[];
  try {
    entries = await readdir(scriptsDir);
  } catch {
    return [];
  }
  const allowTs = !isPackagedExecutable();
  return entries
    .filter((entry) => entry.endsWith('.flow') || entry.endsWith('.flow.json') || (allowTs && entry.endsWith('.ts')))
    .map((entry) => toPosixPath(relative(process.cwd(), join(scriptsDir, entry))))
    .sort((a, b) => a.localeCompare(b));
}

export async function selectScript(defaultScript?: string): Promise<string> {
  if (process.stdin.isTTY) process.stdin.resume();
  const scriptFiles = await listScriptFiles();
  const builtinPaths = new Set(isPackagedExecutable() ? [] : Object.values(BUILTIN_SCRIPTS));
  const choices = [
    ...(!isPackagedExecutable() ? Object.keys(BUILTIN_SCRIPTS).map((name) => ({ label: `${name} (built-in)`, value: name })) : []),
    ...scriptFiles.filter((file) => !builtinPaths.has(file)).map((file) => ({ label: file, value: file })),
    { label: 'Back', value: '__exit__' },
  ];

  if (choices.length === 1) {
    throw new AppError(isPackagedExecutable()
      ? 'No workflow scripts found. Add a .flow.json, .flow, or .ts file in scripts/, or pass --script <path>.'
      : 'No workflow scripts found. Add a .flow.json, .flow, or .ts file in scripts/, or pass --script <path>.');
  }

  const ui = await getUi();
  const selected = await ui.runListPicker({
    title: `Run Scripts (${choices.length - 1} found)`,
    options: choices,
    initialValue: defaultScript,
    cancelHint: 'back',
  });

  if (selected === undefined || selected === '__exit__') {
    throw globalAbort.signal.aborted ? new AppError('Aborted') : new AppError('Exit');
  }

  return selected;
}

const CACHE_ROOT = join(tmpdir(), 'donumate', 'script-cache');
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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
      const { statSync } = await import('node:fs');
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
      // best effort
    }
  };
}

export async function loadWorkflow(spec: string): Promise<LoadedWorkflow> {
  const filePath = resolveScriptPath(spec);
  pruneOldCaches().catch(() => {});
  const cacheDir = await createCacheDir();

  try {
    if (isGraphWorkflowFile(filePath)) return await loadGraphWorkflow(filePath, cacheDir);
    if (filePath.endsWith('.flow')) return await loadFlowWorkflow(filePath, cacheDir);
    return await loadTsWorkflow(spec, filePath, cacheDir);
  } catch (error) {
    await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to load script: ${filePath}`, error);
  }
}

async function loadGraphWorkflow(filePath: string, cacheDir: string): Promise<LoadedWorkflow> {
  const cachedPath = join(cacheDir, 'workflow.flow.json');
  const source = await readFile(filePath, 'utf8');
  const document = parseGraphDocument(source, filePath);
  const program = graphDocumentToFlowProgram(document);
  await mkdir(cacheDir, { recursive: true });
  await import('node:fs/promises').then((fs) => fs.writeFile(cachedPath, source, 'utf8'));
  return {
    kind: 'flow',
    program,
    filePath,
    cachedPath,
    cacheDir,
    cleanup: makeCleanup(cacheDir),
  };
}

async function loadFlowWorkflow(filePath: string, cacheDir: string): Promise<LoadedWorkflow> {
  const cachedPath = join(cacheDir, 'workflow.flow');
  const source = await readFile(filePath, 'utf8');
  await import('node:fs/promises').then((fs) => fs.writeFile(cachedPath, source, 'utf8'));
  const program = await loadFlowProgram(cachedPath);
  return {
    kind: 'flow',
    program,
    filePath,
    cachedPath,
    cacheDir,
    cleanup: makeCleanup(cacheDir),
  };
}

async function loadTsWorkflow(spec: string, filePath: string, cacheDir: string): Promise<LoadedWorkflow> {
  const cachedPath = join(cacheDir, 'workflow.mjs');
  const { build: esbuild } = await loadEsbuild();
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
}

async function importCachedScript(spec: string, originalPath: string, fileUrl: string): Promise<WorkflowScript> {
  let mod: unknown;
  try {
    mod = await import(fileUrl);
  } catch (error) {
    throw new AppError(`Failed to import script: ${originalPath}`, error);
  }

  const fn = typeof mod === 'object' && mod !== null && 'default' in mod
    ? (mod as { default: unknown }).default
    : mod;

  if (typeof fn !== 'function') {
    throw new AppError(`Script ${spec} (${originalPath}) does not export a default function.`);
  }

  return fn as WorkflowScript;
}
