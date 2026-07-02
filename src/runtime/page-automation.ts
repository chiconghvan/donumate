import { stat } from 'fs/promises';
import { resolve } from 'path';
import type { BidiClient } from '../bidi/bidi-client.js';
import type { BidiKeyAction, BidiPointerAction, BidiPointerMoveAction, BrowsingContextInfo } from '../bidi/bidi-types.js';
import { countInteractiveElementsExpression, type InteractiveElementsResult, type ButtonInfo } from '../automation/interactive-elements.js';
import { sleep } from '../utils/retry.js';
import { runWithClipboardLock } from './clipboard-lock.js';
import { clampPoint, generateHumanMousePath, overshootPoint, overshootRadiusForBox, randomInt, randomPointInBox, randomStartPoint, type PathPoint, type Point, type TargetPoint } from './human-mouse.js';
import { writeHostClipboardText } from './host-clipboard.js';
import type { BrowserPageAutomation, HumanTypingOptions } from './page-automation-types.js';

const waitForLoadExpression = `(() => {
  return new Promise((resolve) => {
    const check = () => {
      if (document.readyState === 'complete') {
        resolve(true);
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });
})()`;

const getPageInfoExpression = `JSON.stringify({ title: document.title, url: location.href })`;
const VIRTUAL_MOUSE_ID = 'donut-virtual-mouse';
const VIRTUAL_KEYBOARD_ID = 'donut-virtual-keyboard';
const VIRTUAL_MOUSE_CURSOR_ID = '__donut_virtual_mouse_cursor__';
const CONTROL_KEY = '';
const CURSOR_SPEED_SCALE = 1.7;
const FILE_UPLOAD_TIMEOUT_MS = 60000;
const FILE_UPLOAD_MAX_ATTEMPTS = 3;
const KEY_CODES: Record<string, string> = {
  null: '\uE000',
  cancel: '\uE001',
  help: '\uE002',
  backspace: '\uE003',
  tab: '\uE004',
  clear: '\uE005',
  return: '\uE006',
  enter: '\uE007',
  shift: '\uE008',
  control: '\uE009',
  alt: '\uE00A',
  pause: '\uE00B',
  escape: '\uE00C',
  space: '\uE00D',
  pageup: '\uE00E',
  pagedown: '\uE00F',
  end: '\uE010',
  home: '\uE011',
  arrowleft: '\uE012',
  arrowup: '\uE013',
  arrowright: '\uE014',
  arrowdown: '\uE015',
  insert: '\uE016',
  delete: '\uE017',
  semicolon: '\uE018',
  equals: '\uE019',
  numpad0: '\uE01A',
  numpad1: '\uE01B',
  numpad2: '\uE01C',
  numpad3: '\uE01D',
  numpad4: '\uE01E',
  numpad5: '\uE01F',
  numpad6: '\uE020',
  numpad7: '\uE021',
  numpad8: '\uE022',
  numpad9: '\uE023',
  multiply: '\uE024',
  add: '\uE025',
  separator: '\uE026',
  subtract: '\uE027',
  decimal: '\uE028',
  divide: '\uE029',
  f1: '\uE031',
  f2: '\uE032',
  f3: '\uE033',
  f4: '\uE034',
  f5: '\uE035',
  f6: '\uE036',
  f7: '\uE037',
  f8: '\uE038',
  f9: '\uE039',
  f10: '\uE03A',
  f11: '\uE03B',
  f12: '\uE03C',
  meta: '\uE03D',
  command: '\uE03D',
  capslock: '\uE03E',
  numlock: '\uE03F',
  scrolllock: '\uE040',
};
const DEFAULT_TYPING_MIN_DELAY_MS = 35;
const DEFAULT_TYPING_MAX_DELAY_MS = 140;

export class PageAutomation implements BrowserPageAutomation {
  private contextId?: string;
  private mousePosition?: Point;

  constructor(private readonly bidi: BidiClient) {}

  /** Initialize BiDi session and get default browsing context */
  async init(): Promise<void> {
    await this.bidi.newSession();
    const tree = await this.bidi.getTree();
    this.contextId = tree.contexts[0]?.context;
    if (!this.contextId) {
      throw new Error('No browsing context returned by BiDi.');
    }
  }

  /** Navigate to URL */
  async goto(url: string): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.bidi.navigate(this.contextId, url);
  }

  async navUrl(url: string): Promise<void> {
    await this.goto(url);
  }

  async newTab(url?: string): Promise<void> {
    const current = this.contextId;
    const contextId = await this.bidi.createContext(current);
    this.contextId = contextId;
    this.mousePosition = undefined;
    if (url) await this.goto(url);
  }

  async closeTab(): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    const closing = this.contextId;
    await this.bidi.closeContext(closing);
    const tree = await this.bidi.getTree();
    this.contextId = tree.contexts.find((item) => item.context !== closing)?.context;
    this.mousePosition = undefined;
    if (!this.contextId) throw new Error('No browsing context remains after closing tab.');
  }

  async closeAllTabs(): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    const tree = await this.bidi.getTree();
    const contexts = tree.contexts.map((item) => item.context);
    if (contexts.length <= 1) return;
    for (const context of contexts.slice(1)) await this.bidi.closeContext(context).catch(() => {});
    await this.activeTab(contexts[0] ?? '0');
  }

  async activeTab(target: string): Promise<void> {
    const tree = await this.bidi.getTree();
    const contexts = flattenContexts(tree.contexts);
    const index = Number(target);
    const contextId = Number.isInteger(index) ? contexts[index]?.context : contexts.find((item) => item.context === target)?.context;
    if (!contextId) throw new Error(`Tab not found: ${target}`);
    await this.bidi.activateContext(contextId);
    this.contextId = contextId;
    this.mousePosition = undefined;
  }

  /** Wait for document.readyState === 'complete' */
  async waitForLoad(): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.bidi.evaluate(this.contextId, waitForLoadExpression);
  }

  /** Delay N milliseconds */
  async delay(ms: number): Promise<void> {
    await sleep(ms);
  }

  /** Execute arbitrary JS in page context with async IIFE support */
  async evaluate<T = unknown>(expression: string): Promise<T> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    return this.bidi.evaluate(this.contextId, expression) as Promise<T>;
  }

  /** Get page title and URL */
  async info(): Promise<{ title: string; url: string }> {
    const str = String(await this.evaluate(getPageInfoExpression));
    return JSON.parse(str) as { title: string; url: string };
  }

  async getUrl(): Promise<string> {
    return String(await this.evaluate('location.href'));
  }

  async waitUrlChange(previousUrl: string, timeoutMs = 10000): Promise<string> {
    const changedUrl = await this.evaluate<string | null>(`(() => {
      const previousUrl = ${JSON.stringify(previousUrl)};
      const timeoutMs = ${JSON.stringify(timeoutMs)};
      return new Promise((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const check = () => {
          if (location.href !== previousUrl) return resolve(location.href);
          if (Date.now() >= deadline) return resolve(null);
          setTimeout(check, 200);
        };
        check();
      });
    })()`);
    if (changedUrl === null) throw new Error(`Timed out waiting for URL to change from: ${previousUrl}`);
    return changedUrl;
  }

  async backNav(timeoutMs = 10000): Promise<void> {
    const previousUrl = await this.getUrl();
    await this.evaluate('history.back()');
    await this.waitUrlChange(previousUrl, timeoutMs);
  }

  async reloadNav(): Promise<void> {
    await this.evaluate('location.reload()');
    await this.waitForLoad();
  }

  /** Check whether an XPath matches at least one element */
  async existsXPath(xpath: string): Promise<boolean> {
    return Boolean(await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      return Boolean(document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    })()`));
  }

  /** Wait until an XPath matches at least one element */
  async waitForXPath(xpath: string, timeoutMs = 10000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (true) {
      try {
        if (await this.existsXPath(xpath)) return true;
      } catch (error) {
        if (!isNavigationContextError(error)) throw error;
      }

      const remaining = deadline - Date.now();
      if (remaining <= 0) return false;
      await sleep(Math.min(200, remaining));
    }
  }

  /** Click first element matching XPath */
  async clickXPath(xpath: string): Promise<void> {
    const target = await this.resolveXPathTarget(xpath, 'clickable');
    if (target.scrolled) await this.humanPause();
    await this.moveMouseTo(target);
    await this.humanPause();
    await this.clickCurrentMousePosition(target);
    await this.humanPause();
    this.mousePosition = { x: target.x, y: target.y };
  }

  /** Type text into first input-like element matching XPath using BiDi key actions */
  async typeTextXPath(xpath: string, text: string, options: HumanTypingOptions = {}): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.clickAndFocusXPath(xpath, 'typeable');

    try {
      await this.bidi.performActions(this.contextId, [
        {
          type: 'key',
          id: VIRTUAL_KEYBOARD_ID,
          actions: this.buildHumanTypingActions(text, options),
        },
      ]);
    } finally {
      await this.bidi.releaseActions(this.contextId);
    }
  }

  /** Paste text into first input-like element matching XPath using host clipboard and Ctrl+V */
  async pasteTextXPath(xpath: string, text: string): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');

    await runWithClipboardLock(async () => {
      if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
      await this.clickAndFocusXPath(xpath, 'typeable');
      await writeHostClipboardText(text);

      try {
        await this.bidi.performActions(this.contextId, [
          {
            type: 'key',
            id: VIRTUAL_KEYBOARD_ID,
            actions: [
              { type: 'keyDown', value: CONTROL_KEY },
              { type: 'keyDown', value: 'v' },
              { type: 'keyUp', value: 'v' },
              { type: 'keyUp', value: CONTROL_KEY },
            ],
          },
        ]);
      } finally {
        await this.bidi.releaseActions(this.contextId);
      }
    });
  }

  /** Backward-compatible alias for older automation calls */
  async typeXPath(xpath: string, text: string): Promise<void> {
    await this.typeTextXPath(xpath, text);
  }

  /** Read inner text from first element matching XPath */
  async textXPath(xpath: string): Promise<string> {
    const text = await this.evaluate<string | null>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return node ? (node.innerText ?? node.textContent ?? '') : null;
    })()`);
    if (text === null) throw new Error(`XPath not found: ${xpath}`);
    return text;
  }

  async getElementText(xpath: string): Promise<string> {
    return this.textXPath(xpath);
  }

  async getElementAttribute(xpath: string, attribute: string): Promise<string> {
    const value = await this.evaluate<string | null>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const attribute = ${JSON.stringify(attribute)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof Element)) return null;
      return node.getAttribute(attribute) ?? '';
    })()`);
    if (value === null) throw new Error(`XPath not found: ${xpath}`);
    return value;
  }

  async countElement(xpath: string): Promise<number> {
    return Number(await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      return document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;
    })()`));
  }

  async moveMouseXPath(xpath: string): Promise<void> {
    const target = await this.resolveXPathTarget(xpath, 'movable');
    if (target.scrolled) await this.humanPause();
    await this.moveMouseTo(target);
    await this.humanPause();
    this.mousePosition = { x: target.x, y: target.y };
  }

  async scroll(px: number): Promise<void> {
    await this.evaluate(`window.scrollBy(0, ${JSON.stringify(px)})`);
  }

  async executeJs<T = unknown>(script: string): Promise<T> {
    return this.evaluate<T>(wrapAsyncJs(script));
  }

  async fileUpload(filePath: string, xpath: string): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    const absolutePath = resolve(filePath);
    const file = await stat(absolutePath);
    if (!file.isFile()) throw new Error(`Upload path is not a file: ${absolutePath}`);

    for (let attempt = 1; attempt <= FILE_UPLOAD_MAX_ATTEMPTS; attempt += 1) {
      try {
        const element = await this.bidi.evaluateSharedReference(this.contextId, `(() => {
          const xpath = ${JSON.stringify(xpath)};
          const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (!(node instanceof HTMLInputElement) || node.type !== 'file') throw new Error('XPath must point to input[type=file].');
          return node;
        })()`);
        await this.bidi.setFiles(this.contextId, element, [absolutePath]);
        return;
      } catch (error) {
        if (attempt === FILE_UPLOAD_MAX_ATTEMPTS || !isRetryableUploadError(error)) throw error;
        await sleep(500);
      }
    }
  }

  /** Count all interactive elements (a, button, input, etc.) */
  async countInteractiveElements(): Promise<InteractiveElementsResult> {
    return this.evaluate<InteractiveElementsResult>(countInteractiveElementsExpression);
  }

  /** Get only button/link elements with details */
  async getButtons(): Promise<ButtonInfo[]> {
    const result = await this.countInteractiveElements();
    return result.buttons;
  }

  private async clickAndFocusXPath(xpath: string, actionName: string): Promise<void> {
    const target = await this.resolveXPathTarget(xpath, actionName);
    if (target.scrolled) await this.humanPause();
    await this.moveMouseTo(target);
    await this.humanPause();
    await this.clickCurrentMousePosition(target);
    await this.humanPause();
    this.mousePosition = { x: target.x, y: target.y };

    const focused = await this.evaluate<boolean>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof HTMLElement)) return false;
      node.focus();
      return document.activeElement === node || node.contains(document.activeElement);
    })()`);
    if (!focused) throw new Error(`XPath not found or not ${actionName}: ${xpath}`);
  }

  private buildHumanTypingActions(text: string, options: HumanTypingOptions): BidiKeyAction[] {
    const minDelayMs = options.minDelayMs ?? DEFAULT_TYPING_MIN_DELAY_MS;
    const maxDelayMs = options.maxDelayMs ?? DEFAULT_TYPING_MAX_DELAY_MS;
    const lowerDelayMs = Math.max(0, Math.min(minDelayMs, maxDelayMs));
    const upperDelayMs = Math.max(lowerDelayMs, Math.max(minDelayMs, maxDelayMs));
    const actions: BidiKeyAction[] = [];

    for (const chunk of splitGraphemes(text)) {
      actions.push({ type: 'keyDown', value: chunk });
      actions.push({ type: 'keyUp', value: chunk });
      actions.push({ type: 'pause', duration: this.typingDelay(chunk, lowerDelayMs, upperDelayMs) });
    }

    return actions;
  }

  private typingDelay(chunk: string, minDelayMs: number, maxDelayMs: number): number {
    const base = minDelayMs === maxDelayMs ? minDelayMs : this.randomInt(minDelayMs, maxDelayMs);
    if (/\s/.test(chunk)) return base + this.randomInt(20, 90);
    if (/[.,!?;:]$/.test(chunk)) return base + this.randomInt(80, 180);
    return base;
  }

  private async resolveXPathTarget(xpath: string, actionName: string): Promise<TargetPoint> {
    const raw = await this.evaluate<string>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof Element)) return JSON.stringify({ ok: false, reason: 'XPath did not match an element.' });

      const style = getComputedStyle(node);
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const readRect = () => node.getBoundingClientRect();
      const isInViewport = (rect) =>
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < viewport.height &&
        rect.left < viewport.width;
      const rectBefore = readRect();
      const visible = style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      const scrolled = !isInViewport(rectBefore);
      if (scrolled) node.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = readRect();
      const stillVisible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      const inViewport = isInViewport(rect);
      const ready = stillVisible && inViewport;
      if (!ready) return JSON.stringify({ ok: false, reason: 'Element is not visible or not in viewport.' });
      const box = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
      return JSON.stringify({ ok: true, viewport, scrolled, box });
    })()`);
    const result = JSON.parse(String(raw)) as ({ ok: true } & TargetPoint) | { ok: false; reason: string };
    if (!result.ok) throw new Error(`XPath not found or not ${actionName}: ${xpath}. ${result.reason}`);
    const point = randomPointInBox(result.box, result.viewport, 30);
    return { ...point, viewport: result.viewport, scrolled: result.scrolled, box: result.box };
  }

  private async moveMouseTo(target: TargetPoint): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.ensureVirtualCursor();

    const start = clampPoint(this.mousePosition ?? randomStartPoint(target), target.viewport);
    await this.showVirtualCursor(start, 0);

    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    if (distance > 500) {
      const overshot = overshootPoint(target, target.viewport, overshootRadiusForBox(target.box));
      await this.moveMouseAlongPath(generateHumanMousePath(start, overshot, { moveSpeed: CURSOR_SPEED_SCALE, targetWidth: target.box.width, viewport: target.viewport }));
      await this.moveMouseAlongPath(generateHumanMousePath(overshot, target, { moveSpeed: CURSOR_SPEED_SCALE, targetWidth: target.box.width, spreadOverride: 10, viewport: target.viewport }));
    } else {
      await this.moveMouseAlongPath(generateHumanMousePath(start, target, { moveSpeed: CURSOR_SPEED_SCALE, targetWidth: target.box.width, viewport: target.viewport }));
    }

    this.mousePosition = { x: target.x, y: target.y };
    await this.showVirtualCursor(target, 0);
  }

  private async moveMouseAlongPath(path: PathPoint[]): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    for (const point of path) {
      const duration = Math.max(0, Math.round(point.duration));
      await this.showVirtualCursor(point, duration);
      await this.bidi.performActions(this.contextId, [
        {
          type: 'pointer',
          id: VIRTUAL_MOUSE_ID,
          parameters: { pointerType: 'mouse' },
          actions: [{ ...this.toPointerMove(point), duration } as BidiPointerMoveAction],
        },
      ]);
    }
  }

  private async clickCurrentMousePosition(point: Point): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.bidi.performActions(this.contextId, [
      {
        type: 'pointer',
        id: VIRTUAL_MOUSE_ID,
        parameters: { pointerType: 'mouse' },
        actions: [
          { type: 'pointerMove', x: Math.round(point.x), y: Math.round(point.y), duration: 0, origin: 'viewport' },
          { type: 'pause', duration: randomInt(20, 120) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: randomInt(30, 140) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await this.bidi.releaseActions(this.contextId);
  }

  private async ensureVirtualCursor(): Promise<void> {
    await this.evaluate(`(() => {
      let cursor = document.getElementById(${JSON.stringify(VIRTUAL_MOUSE_CURSOR_ID)});
      if (cursor) return;
      cursor = document.createElement('div');
      cursor.id = ${JSON.stringify(VIRTUAL_MOUSE_CURSOR_ID)};
      cursor.style.position = 'fixed';
      cursor.style.left = '0px';
      cursor.style.top = '0px';
      cursor.style.width = '9px';
      cursor.style.height = '9px';
      cursor.style.marginLeft = '-4.5px';
      cursor.style.marginTop = '-4.5px';
      cursor.style.borderRadius = '999px';
      cursor.style.background = '#ff1f1f';
      cursor.style.border = '1px solid rgba(255,255,255,0.95)';
      cursor.style.boxShadow = '0 0 0 2px rgba(255,31,31,0.25), 0 1px 5px rgba(0,0,0,0.35)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '2147483647';
      cursor.style.transform = 'translate3d(-100px, -100px, 0)';
      cursor.style.transition = 'none';
      document.documentElement.appendChild(cursor);
    })()`);
  }

  private async showVirtualCursor(point: Point, duration = 0): Promise<void> {
    await this.evaluate(`(() => {
      const cursor = document.getElementById(${JSON.stringify(VIRTUAL_MOUSE_CURSOR_ID)});
      if (!cursor) return;
      cursor.style.transition = ${JSON.stringify(`transform ${Math.max(0, Math.round(duration))}ms linear`)};
      cursor.style.transform = ${JSON.stringify(`translate3d(${Math.round(point.x)}px, ${Math.round(point.y)}px, 0)`)};
    })()`);
  }

  private toPointerMove(point: PathPoint): BidiPointerAction {
    return {
      type: 'pointerMove',
      x: Math.round(point.x),
      y: Math.round(point.y),
      duration: Math.max(0, Math.round(point.duration)),
      origin: 'viewport',
    };
  }

  async sendKey(...keys: string[]): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    const mapped = keys.map((k) => KEY_CODES[k.toLowerCase()] ?? k);
    const actions: BidiKeyAction[] = [];
    for (const code of mapped) actions.push({ type: 'keyDown', value: code });
    for (let i = mapped.length - 1; i >= 0; i--) actions.push({ type: 'keyUp', value: mapped[i] ?? '' });
    try {
      await this.bidi.performActions(this.contextId, [{ type: 'key', id: VIRTUAL_KEYBOARD_ID, actions }]);
    } finally {
      await this.bidi.releaseActions(this.contextId);
    }
  }

  private randomInt(min: number, max: number): number {
    return randomInt(min, max);
  }

  private async humanPause(minMs = 200, maxMs = 700): Promise<void> {
    await sleep(this.randomInt(minMs, maxMs));
  }
}

function wrapAsyncJs(script: string): string {
  return `(async () => {\n${script}\n})()`;
}

function isNavigationContextError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /execution context was destroyed|most likely because of a navigation/i.test(message);
}

function isRetryableUploadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /execution context was destroyed|most likely because of a navigation|BiDi command timed out|no such frame|detached|target closed|XPath must point to input\[type=file\]/i.test(message);
}

function flattenContexts(contexts: BrowsingContextInfo[]): BrowsingContextInfo[] {
  const result: BrowsingContextInfo[] = [];
  for (const context of contexts) {
    result.push(context);
    if (context.children?.length) result.push(...flattenContexts(context.children));
  }
  return result;
}

function splitGraphemes(text: string): string[] {
  return Array.from(text);
}
