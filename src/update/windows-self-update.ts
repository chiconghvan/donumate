import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { InstallUpdateResult, UpdateInfo } from './types.js';

function isPackagedWindowsExe(): boolean {
  return process.platform === 'win32' && process.execPath.toLowerCase().endsWith('.exe') && !process.execPath.toLowerCase().endsWith('node.exe');
}

function escapeCmdValue(value: string): string {
  return value.replace(/%/g, '%%').replace(/"/g, '""');
}

function buildUpdaterScript(): string {
  return `@echo off
setlocal
set "TARGET=%~1"
set "SOURCE=%~2"
shift
shift
set "ARGS="
:collect_args
if "%~1"=="" goto replace
set "ARGS=%ARGS% "%~1""
shift
goto collect_args
:replace
for /l %%i in (1,1,60) do (
  move /Y "%SOURCE%" "%TARGET%" >nul 2>&1
  if not errorlevel 1 goto relaunch
  timeout /t 1 /nobreak >nul
)
exit /b 1
:relaunch
start "" "%TARGET%" %ARGS%
(goto) 2>nul & del "%~f0"
`;
}

async function downloadFile(url: string, targetPath: string): Promise<void> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'donumate-updater',
    },
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status})`);
  }

  await pipeline(Readable.fromWeb(response.body as import('node:stream/web').ReadableStream), createWriteStream(targetPath));
}

export async function installWindowsUpdate(update: UpdateInfo): Promise<InstallUpdateResult> {
  if (!isPackagedWindowsExe()) {
    return { started: false, message: 'Update install skipped: not running as packaged Windows exe.' };
  }

  const updateDir = path.join(tmpdir(), 'donumate-update');
  await mkdir(updateDir, { recursive: true });

  const downloadedExePath = path.join(updateDir, `donumate-${update.latestVersion}-win-x64.exe`);
  const updaterCmdPath = path.join(updateDir, `donumate-update-${process.pid}.cmd`);

  await downloadFile(update.downloadUrl, downloadedExePath);
  const downloaded = await stat(downloadedExePath);
  if (downloaded.size <= 0) throw new Error('Downloaded update is empty.');
  if (update.size > 0 && downloaded.size !== update.size) {
    throw new Error(`Downloaded update size mismatch. Expected ${update.size}, got ${downloaded.size}.`);
  }

  await writeFile(updaterCmdPath, buildUpdaterScript(), 'utf8');

  const args = process.argv.slice(1).map(escapeCmdValue);
  const child = spawn('cmd.exe', ['/d', '/c', updaterCmdPath, process.execPath, downloadedExePath, ...args], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();

  return { started: true };
}
