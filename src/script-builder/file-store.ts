import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { AppError } from '../utils/errors.js';
import type { FlowSample } from './types.js';

export type FileStore = {
  rootDir: string;
  scriptsDir: string;
};

export function createFileStore(rootDir = process.cwd()): FileStore {
  const resolved = resolve(rootDir);
  return {
    rootDir: resolved,
    scriptsDir: resolve(resolved, 'scripts'),
  };
}

export async function readFlowSource(store: FileStore, requestedPath: string): Promise<{ path: string; source: string }> {
  const path = resolveWorkflowPath(store, requestedPath);
  return {
    path,
    source: await readFile(path, 'utf8'),
  };
}

export async function saveFlowSource(store: FileStore, requestedPath: string, source: string): Promise<{ path: string }> {
  const path = resolveWorkflowPath(store, requestedPath, { allowMissing: true });
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, source, 'utf8');
  return { path };
}

export async function loadFlowSamplesFromScripts(store: FileStore): Promise<FlowSample[]> {
  const files = await collectFlowFiles(store.scriptsDir);
  const samples = await Promise.all(files.map(async (filePath) => ({
    name: relative(store.scriptsDir, filePath).replace(/\\/g, '/'),
    path: relative(store.rootDir, filePath).replace(/\\/g, '/'),
    source: await readFile(filePath, 'utf8'),
  })));
  return samples.sort((a, b) => a.name.localeCompare(b.name));
}

async function collectFlowFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFlowFiles(fullPath));
      continue;
    }
    if (entry.name.toLowerCase().endsWith('.flow')) files.push(fullPath);
  }
  return files;
}

function resolveWorkflowPath(store: FileStore, requestedPath: string, options?: { allowMissing?: boolean }): string {
  const trimmed = requestedPath.trim();
  if (!trimmed) throw new AppError('Path is required.');
  const absolute = isAbsolute(trimmed) ? resolve(trimmed) : resolve(store.rootDir, trimmed);
  const rel = relative(store.rootDir, absolute);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new AppError(`Path must stay inside ${store.rootDir}.`);
  if (!absolute.toLowerCase().endsWith('.flow')) throw new AppError('Only .flow files are supported by Script Builder.');
  void options;
  return absolute;
}
