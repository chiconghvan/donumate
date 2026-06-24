import { spawn } from 'node:child_process';
import { startScriptBuilderServer } from './server.js';
import { AppError } from '../utils/errors.js';

export type LaunchScriptBuilderOptions = {
  cwd?: string;
  initialPath?: string;
  signal?: AbortSignal;
};

export async function launchScriptBuilder(options: LaunchScriptBuilderOptions = {}): Promise<void> {
  const server = await startScriptBuilderServer({ cwd: options.cwd, initialPath: options.initialPath });
  console.log(`Script builder ready: ${server.url}`);
  console.log('Press Ctrl+C to stop builder.');
  openBrowser(server.url);

  await new Promise<void>((resolve, reject) => {
    const stop = async () => {
      try {
        await server.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    if (options.signal?.aborted) {
      void stop();
      return;
    }
    options.signal?.addEventListener('abort', () => void stop(), { once: true });
  });
}

function openBrowser(url: string): void {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
      return;
    }
    if (platform === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
      return;
    }
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  } catch (error) {
    throw new AppError(`Failed to open browser. Open this URL manually: ${url}`, error);
  }
}
