import WebSocket from 'ws';
import { AppError } from '../utils/errors.js';
import { fromRemoteValue } from './commands.js';
import type { BidiInputSourceActions, BidiResponse, BidiSharedReference, BrowsingContextCreateResult, BrowsingContextTree, ScriptEvaluateResult } from './bidi-types.js';

type Pending = {
  resolve(value: unknown): void;
  reject(error: Error): void;
  timer: NodeJS.Timeout;
};

export class BidiClient {
  private socket?: WebSocket;
  private nextId = 1;
  private sessionId?: string;
  private readonly pending = new Map<number, Pending>();
  private readonly signal?: AbortSignal;
  private onAbort?: () => void;

  constructor(
    private readonly connectTimeoutMs: number,
    private readonly commandTimeoutMs: number,
    signal?: AbortSignal,
  ) {
    this.signal = signal;
  }

  connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(wsUrl);

      const onAbort = () => {
        socket.terminate();
        reject(new AppError('Aborted'));
      };
      this.signal?.addEventListener('abort', onAbort, { once: true });

      const timer = setTimeout(() => {
        this.signal?.removeEventListener('abort', onAbort);
        socket.terminate();
        reject(new AppError(`Timed out connecting to BiDi WebSocket: ${wsUrl}`));
      }, this.connectTimeoutMs);

      socket.once('open', () => {
        this.signal?.removeEventListener('abort', onAbort);
        clearTimeout(timer);
        this.socket = socket;
        this.onAbort = () => this.rejectPending(new AppError('Aborted'));
        this.signal?.addEventListener('abort', this.onAbort, { once: true });
        resolve();
      });

      socket.once('error', (error) => {
        this.signal?.removeEventListener('abort', onAbort);
        clearTimeout(timer);
        reject(new AppError(`Failed to connect BiDi WebSocket: ${wsUrl}`, error));
      });

      socket.on('message', (data) => this.handleMessage(data.toString()));
      socket.on('close', () => this.rejectPending(new AppError('BiDi WebSocket closed.')));
    });
  }

  async newSession(): Promise<string> {
    const result = await this.command<{ sessionId: string }>('session.new', { capabilities: {} }, false);
    this.sessionId = result.sessionId;
    return result.sessionId;
  }

  getTree(): Promise<BrowsingContextTree> {
    return this.command<BrowsingContextTree>('browsingContext.getTree', {});
  }

  async navigate(contextId: string, url: string): Promise<void> {
    await this.command('browsingContext.navigate', { context: contextId, url });
  }

  async createContext(referenceContext?: string): Promise<string> {
    const result = await this.command<BrowsingContextCreateResult>('browsingContext.create', {
      type: 'tab',
      ...(referenceContext ? { referenceContext } : {}),
    });
    return result.context;
  }

  async closeContext(contextId: string): Promise<void> {
    await this.command('browsingContext.close', { context: contextId });
  }

  async activateContext(contextId: string): Promise<void> {
    await this.command('browsingContext.activate', { context: contextId });
  }

  async evaluate(contextId: string, expression: string): Promise<unknown> {
    const result = await this.command<ScriptEvaluateResult>('script.evaluate', {
      target: { context: contextId },
      expression,
      awaitPromise: true,
    });
    return fromRemoteValue(result.result);
  }

  async evaluateSharedReference(contextId: string, expression: string): Promise<BidiSharedReference> {
    const result = await this.command<ScriptEvaluateResult>('script.evaluate', {
      target: { context: contextId },
      expression,
      awaitPromise: true,
      resultOwnership: 'root',
    });
    const sharedId = result.result.sharedId;
    if (!sharedId) throw new AppError('BiDi script evaluation did not return a shared reference.');
    return { sharedId };
  }

  async setFiles(contextId: string, element: BidiSharedReference, files: string[]): Promise<void> {
    await this.command('input.setFiles', { context: contextId, element, files });
  }

  async performActions(contextId: string, actions: BidiInputSourceActions[]): Promise<void> {
    await this.command('input.performActions', { context: contextId, actions });
  }

  async releaseActions(contextId: string): Promise<void> {
    await this.command('input.releaseActions', { context: contextId });
  }

  async close(): Promise<void> {
    if (this.onAbort) {
      this.signal?.removeEventListener('abort', this.onAbort);
      this.onAbort = undefined;
    }
    if (!this.socket) return;
    await new Promise<void>((resolve) => {
      const socket = this.socket;
      if (!socket || socket.readyState === WebSocket.CLOSED) return resolve();
      socket.once('close', () => resolve());
      socket.close();
      setTimeout(resolve, 1000);
    });
  }

  private command<T = unknown>(method: string, params: unknown, includeSessionId = true): Promise<T> {
    if (this.signal?.aborted) {
      return Promise.reject(new AppError('Aborted'));
    }

    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new AppError('BiDi WebSocket is not connected.'));
    }

    const id = this.nextId++;
    const envelope: Record<string, unknown> = { id, method, params };
    if (includeSessionId && this.sessionId) envelope.sessionId = this.sessionId;

    return new Promise<T>((resolve, reject) => {
      const onAbort = () => {
        this.pending.delete(id);
        clearTimeout(timer);
        reject(new AppError('Aborted'));
      };
      this.signal?.addEventListener('abort', onAbort, { once: true });

      const timer = setTimeout(() => {
        this.signal?.removeEventListener('abort', onAbort);
        this.pending.delete(id);
        reject(new AppError(`BiDi command timed out: ${method}`));
      }, this.commandTimeoutMs);

      this.pending.set(id, {
        resolve: (value) => {
          this.signal?.removeEventListener('abort', onAbort);
          clearTimeout(timer);
          resolve(value as T);
        },
        reject: (error) => {
          this.signal?.removeEventListener('abort', onAbort);
          clearTimeout(timer);
          reject(error);
        },
        timer,
      });

      socket.send(JSON.stringify(envelope), (error) => {
        if (!error) return;
        this.signal?.removeEventListener('abort', onAbort);
        clearTimeout(timer);
        this.pending.delete(id);
        reject(new AppError(`Failed to send BiDi command: ${method}`, error));
      });
    });
  }

  private handleMessage(message: string): void {
    let parsed: BidiResponse;
    try {
      parsed = JSON.parse(message) as BidiResponse;
    } catch {
      return;
    }

    if (!('id' in parsed)) return;

    const pending = this.pending.get(parsed.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(parsed.id);

    if (parsed.type === 'success') {
      pending.resolve(parsed.result);
      return;
    }

    pending.reject(new AppError(`BiDi error: ${parsed.error}${parsed.message ? ` - ${parsed.message}` : ''}`));
  }

  private rejectPending(error: Error): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }
}
