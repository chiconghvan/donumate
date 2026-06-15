import WebSocket from 'ws';
import { AppError } from '../utils/errors.js';
import { fromRemoteValue } from './commands.js';
import type { BidiResponse, BrowsingContextTree, ScriptEvaluateResult } from './bidi-types.js';

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

  constructor(
    private readonly connectTimeoutMs: number,
    private readonly commandTimeoutMs: number,
  ) {}

  connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(wsUrl);
      const timer = setTimeout(() => {
        socket.terminate();
        reject(new AppError(`Timed out connecting to BiDi WebSocket: ${wsUrl}`));
      }, this.connectTimeoutMs);

      socket.once('open', () => {
        clearTimeout(timer);
        this.socket = socket;
        resolve();
      });

      socket.once('error', (error) => {
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

  async evaluate(contextId: string, expression: string): Promise<unknown> {
    const result = await this.command<ScriptEvaluateResult>('script.evaluate', {
      target: { context: contextId },
      expression,
      awaitPromise: true,
    });
    return fromRemoteValue(result.result);
  }

  async close(): Promise<void> {
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
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new AppError('BiDi WebSocket is not connected.'));
    }

    const id = this.nextId++;
    const envelope: Record<string, unknown> = { id, method, params };
    if (includeSessionId && this.sessionId) envelope.sessionId = this.sessionId;

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new AppError(`BiDi command timed out: ${method}`));
      }, this.commandTimeoutMs);

      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
      });

      socket.send(JSON.stringify(envelope), (error) => {
        if (!error) return;
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
