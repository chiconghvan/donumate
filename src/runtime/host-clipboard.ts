import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppError } from '../utils/errors.js';

export async function writeHostClipboardText(text: string): Promise<void> {
  if (process.platform !== 'win32') {
    throw new AppError(`Host clipboard pasteText is not supported on ${process.platform}.`);
  }

  const dir = await mkdtemp(join(tmpdir(), 'donumate-clipboard-'));
  const filePath = join(dir, 'clipboard.txt');

  try {
    await writeFile(filePath, text, 'utf16le');
    await runPowerShellClipboardWrite(filePath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function runPowerShellClipboardWrite(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      'Get-Content -LiteralPath $args[0] -Raw -Encoding Unicode | Set-Clipboard',
      filePath,
    ], {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });

    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.once('error', (error) => {
      reject(new AppError('Failed to start PowerShell for clipboard write.', error));
    });

    child.once('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new AppError(`Failed to write clipboard with PowerShell.${stderr.trim() ? ` ${stderr.trim()}` : ''}`));
    });
  });
}
