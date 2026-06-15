import { readdir } from 'fs/promises';
import { dirname, join, parse, resolve } from 'path';
import { AppError } from '../utils/errors.js';
import { coerceAndValidateInputs, initialInputText, type FlowInputOverrides } from '../runtime/dsl/input-values.js';
import type { FlowInputDefinition, FlowInputValue } from '../runtime/dsl/types.js';

type RawKey = {
  name?: string;
  sequence?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
};

type BrowserEntry = {
  label: string;
  path: string;
  isDirectory: boolean;
  action: 'parent' | 'chooseFolder' | 'entry';
};

type BrowserState = {
  input: FlowInputDefinition;
  cwd: string;
  cursor: number;
  entries: BrowserEntry[];
  error?: string;
};

export async function runFlowInputForm(
  definitions: FlowInputDefinition[],
  overrides: FlowInputOverrides
): Promise<Record<string, FlowInputValue>> {
  if (definitions.length === 0) return {};
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return coerceAndValidateInputs(definitions, Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)])));
  }

  const form = new RawFlowInputForm(definitions, overrides);
  return form.run();
}

class RawFlowInputForm {
  private values: Record<string, string>;
  private cursor = 0;
  private errors: string[] = [];
  private browser: BrowserState | null = null;
  private readonly submitIndex: number;

  constructor(private readonly definitions: FlowInputDefinition[], overrides: FlowInputOverrides) {
    this.values = Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)]));
    this.submitIndex = definitions.length;
  }

  run(): Promise<Record<string, FlowInputValue>> {
    return new Promise((resolvePromise, rejectPromise) => {
      const stdin = process.stdin;
      const previousRawMode = stdin.isRaw;
      const onData = (chunk: Buffer) => {
        void this.handleKey(chunk, resolvePromise, rejectPromise);
      };

      const cleanup = () => {
        stdin.off('data', onData);
        stdin.setRawMode(previousRawMode);
        stdin.pause();
        clearScreen();
      };

      const resolveDone = (value: Record<string, FlowInputValue>) => {
        cleanup();
        resolvePromise(value);
      };
      const rejectDone = (error: Error) => {
        cleanup();
        rejectPromise(error);
      };

      this.resolve = resolveDone;
      this.reject = rejectDone;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.on('data', onData);
      this.render();
    });
  }

  private resolve?: (value: Record<string, FlowInputValue>) => void;
  private reject?: (error: Error) => void;

  private async handleKey(chunk: Buffer, resolveDone: (value: Record<string, FlowInputValue>) => void, rejectDone: (error: Error) => void): Promise<void> {
    const key = parseKey(chunk);
    if (key.ctrl && key.name === 'c' || key.name === 'escape') {
      rejectDone(new AppError('Flow input cancelled.'));
      return;
    }

    if (this.browser) {
      await this.handleBrowserKey(key);
      this.render();
      return;
    }

    const focused = this.definitions[this.cursor];
    if (key.name === 'tab' || key.name === 'down') {
      this.cursor = Math.min(this.submitIndex, this.cursor + 1);
    } else if (key.name === 'up' || key.name === 'shift-tab') {
      this.cursor = Math.max(0, this.cursor - 1);
    } else if (key.name === 'return') {
      if (this.cursor === this.submitIndex) {
        await this.submit(resolveDone);
      } else if (focused?.type === 'file' || focused?.type === 'folder') {
        await this.openBrowser(focused);
      } else if (focused?.type === 'checkbox') {
        this.toggleCheckbox(focused);
      }
    } else if (focused && (key.name === 'left' || key.name === 'right')) {
      if (focused.type === 'comboBox') this.cycleCombo(focused, key.name === 'right' ? 1 : -1);
      else if (focused.type === 'checkbox') this.toggleCheckbox(focused);
      else if (focused.type === 'file' || focused.type === 'folder') await this.openBrowser(focused);
    } else if (focused && (key.name === 'backspace' || key.name === 'delete')) {
      this.values[focused.name] = (this.values[focused.name] ?? '').slice(0, -1);
    } else if (focused && key.sequence && !key.ctrl && !key.meta && ['input', 'text', 'number', 'file', 'folder'].includes(focused.type)) {
      this.values[focused.name] = `${this.values[focused.name] ?? ''}${key.sequence}`;
    }

    this.render();
  }

  private async submit(resolveDone: (value: Record<string, FlowInputValue>) => void): Promise<void> {
    try {
      const values = await coerceAndValidateInputs(this.definitions, this.values);
      this.errors = [];
      resolveDone(values);
    } catch (error) {
      this.errors = [error instanceof Error ? error.message : String(error)];
    }
  }

  private toggleCheckbox(input: FlowInputDefinition): void {
    const now = /^(true|1|yes|on)$/i.test(this.values[input.name] ?? 'false');
    this.values[input.name] = String(!now);
  }

  private cycleCombo(input: FlowInputDefinition, direction: 1 | -1): void {
    const options = input.options ?? [];
    if (options.length === 0) return;
    const index = Math.max(0, options.indexOf(this.values[input.name] ?? options[0] ?? ''));
    this.values[input.name] = options[(index + direction + options.length) % options.length] ?? '';
  }

  private async openBrowser(input: FlowInputDefinition): Promise<void> {
    const cwd = resolve(process.cwd(), this.values[input.name] || '.');
    this.browser = { input, cwd, cursor: 0, entries: [] };
    await this.loadBrowserEntries();
  }

  private async handleBrowserKey(key: RawKey): Promise<void> {
    if (!this.browser) return;
    if (key.name === 'escape') {
      this.browser = null;
      return;
    }
    if (key.name === 'up') {
      this.browser.cursor = Math.max(0, this.browser.cursor - 1);
      return;
    }
    if (key.name === 'down') {
      this.browser.cursor = Math.min(this.browser.entries.length - 1, this.browser.cursor + 1);
      return;
    }
    if (key.name === 'left' || key.name === 'backspace') {
      this.browser.cwd = parentPath(this.browser.cwd);
      await this.loadBrowserEntries();
      return;
    }
    if (key.name !== 'return' && key.name !== 'right') return;

    const row = this.browser.entries[this.browser.cursor];
    if (!row) return;
    if (row.action === 'parent') {
      this.browser.cwd = parentPath(this.browser.cwd);
      await this.loadBrowserEntries();
      return;
    }
    if (row.action === 'chooseFolder') {
      this.values[this.browser.input.name] = this.browser.cwd;
      this.browser = null;
      return;
    }
    if (row.isDirectory) {
      this.browser.cwd = row.path;
      await this.loadBrowserEntries();
      return;
    }
    if (this.browser.input.type === 'file') {
      this.values[this.browser.input.name] = row.path;
      this.browser = null;
    }
  }

  private async loadBrowserEntries(): Promise<void> {
    if (!this.browser) return;
    const browser = this.browser;
    try {
      const items = await readdir(browser.cwd, { withFileTypes: true });
      const entries: BrowserEntry[] = [
        { label: '..', path: parentPath(browser.cwd), isDirectory: true, action: 'parent' },
        ...(browser.input.type === 'folder' ? [{ label: '[select current folder]', path: browser.cwd, isDirectory: true, action: 'chooseFolder' as const }] : []),
        ...items
          .map((item) => ({ label: `${item.isDirectory() ? '[dir] ' : '      '}${item.name}`, path: join(browser.cwd, item.name), isDirectory: item.isDirectory(), action: 'entry' as const }))
          .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.label.localeCompare(b.label)),
      ];
      this.browser = { ...browser, entries, cursor: 0, error: undefined };
    } catch (error) {
      this.browser = { ...browser, entries: [], cursor: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private render(): void {
    clearScreen();
    if (this.browser) {
      renderBrowser(this.browser);
      return;
    }

    process.stdout.write('┌ Flow inputs ─────────────────────────────────────────\n');
    process.stdout.write('│ Tab/↑/↓ move · ←/→ toggle/cycle/open path · Enter submit/open · Esc cancel\n');
    for (let index = 0; index < this.definitions.length; index += 1) {
      const definition = this.definitions[index];
      if (!definition) continue;
      const marker = index === this.cursor ? '›' : ' ';
      process.stdout.write(`│ ${marker} ${definition.name} (${definition.type}): ${renderValue(definition, this.values[definition.name] ?? '')}\n`);
    }
    process.stdout.write(`│ ${this.cursor === this.submitIndex ? '›' : ' '} Run flow\n`);
    for (const error of this.errors) process.stdout.write(`│ ERROR: ${error}\n`);
    process.stdout.write('└──────────────────────────────────────────────────────\n');
  }
}

function renderBrowser(browser: BrowserState): void {
  process.stdout.write(`┌ Select ${browser.input.type}: ${browser.cwd}\n`);
  process.stdout.write('│ ↑/↓ move · Enter choose/open · ← parent · Esc back\n');
  if (browser.error) process.stdout.write(`│ ERROR: ${browser.error}\n`);
  for (let index = 0; index < Math.min(browser.entries.length, 18); index += 1) {
    const row = browser.entries[index];
    if (!row) continue;
    process.stdout.write(`│ ${index === browser.cursor ? '›' : ' '} ${row.label}\n`);
  }
  process.stdout.write('└──────────────────────────────────────────────────────\n');
}

function renderValue(definition: FlowInputDefinition, value: string): string {
  if (definition.type === 'checkbox') return /^(true|1|yes|on)$/i.test(value) ? '[x]' : '[ ]';
  if (definition.type === 'comboBox') return `${value} (${definition.options?.join(' | ') ?? ''})`;
  return value || '<empty>';
}

function parseKey(chunk: Buffer): RawKey {
  const sequence = chunk.toString('utf8');
  if (sequence === '') return { name: 'c', ctrl: true };
  if (sequence === '') return { name: 'escape' };
  if (sequence === '\r' || sequence === '\n') return { name: 'return' };
  if (sequence === '\t') return { name: 'tab' };
  if (sequence === '[Z') return { name: 'shift-tab', shift: true };
  if (sequence === '' || sequence === '\b') return { name: 'backspace' };
  if (sequence === '[A') return { name: 'up' };
  if (sequence === '[B') return { name: 'down' };
  if (sequence === '[C') return { name: 'right' };
  if (sequence === '[D') return { name: 'left' };
  if (sequence.length === 1 && sequence >= ' ') return { sequence };
  return { name: 'unknown', sequence };
}

function clearScreen(): void {
  process.stdout.write('[2J[H');
}

function parentPath(path: string): string {
  const root = parse(path).root;
  return path === root ? root : dirname(path);
}
