import { open, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppError } from '../utils/errors.js';

const CLIPBOARD_LOCK_PATH = join(tmpdir(), 'donumate-host-clipboard.lock');
const CLIPBOARD_LOCK_WAIT_TIMEOUT_MS = 10 * 60 * 1000;
const CLIPBOARD_LOCK_STALE_MS = 5 * 60 * 1000;
const CLIPBOARD_LOCK_RETRY_MIN_MS = 50;
const CLIPBOARD_LOCK_RETRY_MAX_MS = 150;

let tail = Promise.resolve();

export async function runWithClipboardLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = tail.then(() => runWithProcessWideClipboardLock(fn), () => runWithProcessWideClipboardLock(fn));
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function runWithProcessWideClipboardLock<T>(fn: () => Promise<T>): Promise<T> {
  const lock = await acquireClipboardLock();
  try {
    return await fn();
  } finally {
    await releaseClipboardLock(lock);
  }
}

type ClipboardLock = {
  token: string;
  close: () => Promise<void>;
};

async function acquireClipboardLock(): Promise<ClipboardLock> {
  const deadline = Date.now() + CLIPBOARD_LOCK_WAIT_TIMEOUT_MS;
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  while (true) {
    try {
      const handle = await open(CLIPBOARD_LOCK_PATH, 'wx');
      try {
        await handle.writeFile(JSON.stringify({
          token,
          pid: process.pid,
          createdAt: new Date().toISOString(),
        }));
        return {
          token,
          close: () => handle.close(),
        };
      } catch (error) {
        await handle.close().catch(() => {});
        await rm(CLIPBOARD_LOCK_PATH, { force: true }).catch(() => {});
        throw error;
      }
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw new AppError('Failed to acquire host clipboard lock.', error);
      }

      await removeStaleClipboardLock();

      if (Date.now() >= deadline) {
        throw new AppError(`Timed out waiting for host clipboard lock: ${CLIPBOARD_LOCK_PATH}`);
      }

      await delay(randomInt(CLIPBOARD_LOCK_RETRY_MIN_MS, CLIPBOARD_LOCK_RETRY_MAX_MS));
    }
  }
}

async function releaseClipboardLock(lock: ClipboardLock): Promise<void> {
  await lock.close().catch(() => {});

  try {
    const current = await readLockMetadata();
    if (current?.token === lock.token) {
      await rm(CLIPBOARD_LOCK_PATH, { force: true });
    }
  } catch {
    // The paste operation has already finished. A failed cleanup should not mask it.
  }
}

async function removeStaleClipboardLock(): Promise<void> {
  const info = await stat(CLIPBOARD_LOCK_PATH).catch(() => undefined);
  if (!info) return;
  if (Date.now() - info.mtimeMs < CLIPBOARD_LOCK_STALE_MS) return;

  const metadata = await readLockMetadata();
  if (metadata?.pid && isProcessAlive(metadata.pid)) return;

  await rm(CLIPBOARD_LOCK_PATH, { force: true }).catch(() => {});
}

async function readLockMetadata(): Promise<{ token?: string; pid?: number } | undefined> {
  try {
    const raw = await readFile(CLIPBOARD_LOCK_PATH, 'utf8');
    const parsed = JSON.parse(raw) as { token?: unknown; pid?: unknown };
    return {
      token: typeof parsed.token === 'string' ? parsed.token : undefined,
      pid: typeof parsed.pid === 'number' ? parsed.pid : undefined,
    };
  } catch {
    return undefined;
  }
}

function isAlreadyExistsError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST');
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'EPERM');
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number): number {
  const lower = Math.floor(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
}
