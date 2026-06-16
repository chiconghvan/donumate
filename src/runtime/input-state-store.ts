import { mkdir, readFile, writeFile } from 'fs/promises';
import { createHash } from 'crypto';
import { join } from 'path';

const STATE_DIR = join(process.env.TEMP ?? process.env.TMP ?? process.cwd(), 'donumate', 'input-state');

type SavedInputState = {
  values: Record<string, string>;
};

function keyFor(scriptPath: string): string {
  return createHash('sha1').update(scriptPath).digest('hex');
}

function statePath(scriptPath: string): string {
  return join(STATE_DIR, `${keyFor(scriptPath)}.json`);
}

export async function loadSavedInputState(scriptPath: string): Promise<Record<string, string> | undefined> {
  try {
    const raw = await readFile(statePath(scriptPath), 'utf8');
    const parsed = JSON.parse(raw) as SavedInputState;
    if (!parsed || typeof parsed !== 'object' || !parsed.values || typeof parsed.values !== 'object') return undefined;
    return parsed.values;
  } catch {
    return undefined;
  }
}

export async function saveInputState(scriptPath: string, values: Record<string, string>): Promise<void> {
  await mkdir(STATE_DIR, { recursive: true });
  const payload: SavedInputState = { values };
  await writeFile(statePath(scriptPath), JSON.stringify(payload, null, 2), 'utf8');
}
