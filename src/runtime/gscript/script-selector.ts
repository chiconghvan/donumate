import { readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { AppError } from '../../utils/errors.js';
import { globalAbort } from '../../utils/abort.js';
import { getUi } from '../../ui/ui-provider.js';

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

async function listGscriptFiles(): Promise<string[]> {
  const scriptsDir = resolve(process.cwd(), 'scripts');
  let entries: string[];
  try {
    entries = await readdir(scriptsDir);
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.toLowerCase().endsWith('.gscript'))
    .map((entry) => toPosixPath(relative(process.cwd(), join(scriptsDir, entry))))
    .sort((a, b) => a.localeCompare(b));
}

export async function selectGscript(defaultScript?: string): Promise<string> {
  if (process.stdin.isTTY) process.stdin.resume();
  const scriptFiles = await listGscriptFiles();
  const choices = [
    ...scriptFiles.map((file) => ({ label: file, value: file })),
    { label: 'Back', value: '__exit__' },
  ];

  if (choices.length === 1) {
    throw new AppError('No .gscript scripts found. Add a .gscript file in scripts/, or pass --script <path>.');
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
