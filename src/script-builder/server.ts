import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { AppError, formatError } from '../utils/errors.js';
import { createFileStore, loadFlowSamplesFromScripts, readFlowSource, saveFlowSource, type FileStore } from './file-store.js';

export type ScriptBuilderServerOptions = {
  cwd?: string;
  initialPath?: string;
};

export type ScriptBuilderServer = {
  url: string;
  close: () => Promise<void>;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB_DIR = join(__dirname, 'web');

export async function startScriptBuilderServer(options: ScriptBuilderServerOptions = {}): Promise<ScriptBuilderServer> {
  await ensureBuilderAssets();
  const store = createFileStore(options.cwd ?? process.cwd());

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res, store, options.initialPath);
    } catch (error) {
      sendJson(res, error instanceof AppError ? 400 : 500, { error: formatError(error) });
    }
  });

  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolvePromise();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') throw new AppError('Failed to start script builder server.');
  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () => new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise())),
  };
}

async function ensureBuilderAssets(): Promise<void> {
  const source = resolve(process.cwd(), 'src/script-builder-app/main.tsx');
  const output = join(WEB_DIR, 'app.js');
  await import('node:fs/promises').then(async (fs) => {
    await fs.mkdir(WEB_DIR, { recursive: true });
    await build({
      entryPoints: [source],
      outfile: output,
      bundle: true,
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      jsx: 'automatic',
      sourcemap: true,
      logLevel: 'silent',
    });
  });
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, store: FileStore, initialPath?: string): Promise<void> {
  if (!req.url) throw new AppError('Missing request URL.');
  const url = new URL(req.url, 'http://127.0.0.1');

  if (url.pathname === '/api/bootstrap') {
    if (initialPath) {
      const payload = await readFlowSource(store, initialPath);
      sendJson(res, 200, payload);
      return;
    }
    sendJson(res, 200, {});
    return;
  }

  if (url.pathname === '/api/samples') {
    sendJson(res, 200, await loadFlowSamplesFromScripts(store));
    return;
  }

  if (url.pathname === '/api/open') {
    const requestedPath = url.searchParams.get('path') ?? '';
    sendJson(res, 200, await readFlowSource(store, requestedPath));
    return;
  }

  if (url.pathname === '/api/save') {
    const body = await readJsonBody<{ path: string; source: string }>(req);
    const saved = await saveFlowSource(store, body.path, body.source);
    sendJson(res, 200, saved);
    return;
  }

  await serveStatic(url.pathname, res);
}

async function serveStatic(pathname: string, res: ServerResponse): Promise<void> {
  const normalized = pathname === '/' ? '/index.html' : pathname;
  if (!['/index.html', '/styles.css', '/app.css', '/app.js'].includes(normalized)) throw new AppError('Not found.');
  const filePath = join(WEB_DIR, normalized.slice(1));
  const data = await readFile(filePath);
  const mime = extname(filePath) === '.html'
    ? 'text/html; charset=utf-8'
    : extname(filePath) === '.css'
      ? 'text/css; charset=utf-8'
      : 'text/javascript; charset=utf-8';
  res.writeHead(200, { 'content-type': mime, 'cache-control': 'no-store' });
  res.end(data);
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 5_000_000) throw new AppError('Request body too large.');
  }
  return JSON.parse(body || '{}') as T;
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}
