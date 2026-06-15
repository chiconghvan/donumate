import type { BidiClient } from '../bidi/bidi-client.js';
import type { BidiKeyAction, BidiPointerAction } from '../bidi/bidi-types.js';
import { countInteractiveElementsExpression, type InteractiveElementsResult, type ButtonInfo } from '../automation/interactive-elements.js';
import { sleep } from '../utils/retry.js';
import { runWithClipboardLock } from './clipboard-lock.js';
import { writeHostClipboardText } from './host-clipboard.js';

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
const DEFAULT_TYPING_MIN_DELAY_MS = 35;
const DEFAULT_TYPING_MAX_DELAY_MS = 140;

type Point = { x: number; y: number };
type Viewport = { width: number; height: number };
type TargetPoint = Point & { viewport: Viewport };
type PathPoint = Point & { duration: number };

export type HumanTypingOptions = {
  minDelayMs?: number;
  maxDelayMs?: number;
};

export class PageAutomation {
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

  /** Wait for document.readyState === 'complete' */
  async waitForLoad(): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.bidi.evaluate(this.contextId, waitForLoadExpression);
  }

  /** Delay N milliseconds */
  async delay(ms: number): Promise<void> {
    await sleep(ms);
  }

  /** Execute arbitrary JS expression in page context */
  async evaluate<T = unknown>(expression: string): Promise<T> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    return this.bidi.evaluate(this.contextId, expression) as Promise<T>;
  }

  /** Get page title and URL */
  async info(): Promise<{ title: string; url: string }> {
    const str = String(await this.evaluate(getPageInfoExpression));
    return JSON.parse(str) as { title: string; url: string };
  }

  /** Check whether an XPath matches at least one element */
  async existsXPath(xpath: string): Promise<boolean> {
    return Boolean(await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      return Boolean(document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    })()`));
  }

  /** Wait until an XPath matches at least one element */
  async waitForXPath(xpath: string, timeoutMs = 10000): Promise<void> {
    const found = await this.evaluate<boolean>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const timeoutMs = ${JSON.stringify(timeoutMs)};
      return new Promise((resolve) => {
        const deadline = Date.now() + timeoutMs;
        const check = () => {
          const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (node) return resolve(true);
          if (Date.now() >= deadline) return resolve(false);
          setTimeout(check, 200);
        };
        check();
      });
    })()`);
    if (!found) throw new Error(`Timed out waiting for XPath: ${xpath}`);
  }

  /** Click first element matching XPath */
  async clickXPath(xpath: string): Promise<void> {
    const target = await this.resolveXPathTarget(xpath, 'clickable');
    await this.moveMouseTo(target);
    await this.clickCurrentMousePosition(target);
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
      await writeHostClipboardText(text);
      await this.clickAndFocusXPath(xpath, 'typeable');

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

  /** Backward-compatible alias for legacy TS scripts and .flow type command */
  async typeXPath(xpath: string, text: string): Promise<void> {
    await this.typeTextXPath(xpath, text);
  }

  /** Read text from first element matching XPath */
  async textXPath(xpath: string): Promise<string> {
    const text = await this.evaluate<string | null>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return node ? (node.textContent ?? '') : null;
    })()`);
    if (text === null) throw new Error(`XPath not found: ${xpath}`);
    return text;
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
    await this.moveMouseTo(target);
    await this.clickCurrentMousePosition(target);
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

      node.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      if (!visible) return JSON.stringify({ ok: false, reason: 'Element is not visible.' });

      const marginX = Math.min(Math.max(rect.width * 0.2, 1), 12);
      const marginY = Math.min(Math.max(rect.height * 0.2, 1), 12);
      const jitterX = rect.width > 8 ? (Math.random() * 2 - 1) * Math.max(0, rect.width / 2 - marginX) * 0.45 : 0;
      const jitterY = rect.height > 8 ? (Math.random() * 2 - 1) * Math.max(0, rect.height / 2 - marginY) * 0.45 : 0;
      const x = Math.min(Math.max(rect.left + rect.width / 2 + jitterX, 0), Math.max(0, viewport.width - 1));
      const y = Math.min(Math.max(rect.top + rect.height / 2 + jitterY, 0), Math.max(0, viewport.height - 1));
      return JSON.stringify({ ok: true, x, y, viewport });
    })()`);
    const result = JSON.parse(String(raw)) as ({ ok: true } & TargetPoint) | { ok: false; reason: string };
    if (!result.ok) throw new Error(`XPath not found or not ${actionName}: ${xpath}. ${result.reason}`);
    return { x: result.x, y: result.y, viewport: result.viewport };
  }

  private async moveMouseTo(target: TargetPoint): Promise<void> {
    if (!this.contextId) throw new Error('Page not initialized. Call init() first.');
    await this.ensureVirtualCursor();

    const start = this.clampPoint(this.mousePosition ?? this.randomStartPoint(target), target.viewport);
    const path = this.generateMousePath(start, target, target.viewport);
    await this.showVirtualCursor(start, 0);

    for (const point of path) {
      await this.showVirtualCursor(point, point.duration);
      await this.bidi.performActions(this.contextId, [
        {
          type: 'pointer',
          id: VIRTUAL_MOUSE_ID,
          parameters: { pointerType: 'mouse' },
          actions: [this.toPointerMove(point)],
        },
      ]);
    }

    this.mousePosition = { x: target.x, y: target.y };
    await this.showVirtualCursor(target, 0);
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
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: this.randomInt(35, 95) },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await this.bidi.releaseActions(this.contextId);
  }

  private generateMousePath(start: Point, target: Point, viewport: Viewport): PathPoint[] {
    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    if (distance < 1) return [{ ...target, duration: this.randomInt(20, 45) }];

    const duration = this.randomInt(Math.min(900, Math.max(220, Math.round(distance * 0.7))), Math.min(1300, Math.max(360, Math.round(distance * 1.2))));
    const steps = Math.max(10, Math.min(48, Math.ceil(distance / this.randomFloat(14, 24))));
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    const nx = -dy / distance;
    const ny = dx / distance;
    const curve = this.randomFloat(-0.35, 0.35) * Math.min(220, distance * 0.45);
    const p1 = {
      x: start.x + dx * this.randomFloat(0.2, 0.38) + nx * curve,
      y: start.y + dy * this.randomFloat(0.2, 0.38) + ny * curve,
    };
    const p2 = {
      x: start.x + dx * this.randomFloat(0.62, 0.82) - nx * curve * this.randomFloat(0.45, 0.9),
      y: start.y + dy * this.randomFloat(0.62, 0.82) - ny * curve * this.randomFloat(0.45, 0.9),
    };

    const points: PathPoint[] = [];
    const useOvershoot = distance > 120 && Math.random() < 0.25;
    const finalTarget = useOvershoot ? this.overshootPoint(start, target, viewport) : target;
    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const eased = easeInOutCubic(t);
      const base = cubicBezier(start, p1, p2, finalTarget, eased);
      const jitterScale = Math.sin(Math.PI * t) * Math.min(5, distance * 0.015);
      const jittered = this.clampPoint({
        x: base.x + this.randomFloat(-jitterScale, jitterScale),
        y: base.y + this.randomFloat(-jitterScale, jitterScale),
      }, viewport);
      points.push({ ...jittered, duration: Math.max(5, Math.round(duration / steps + this.randomFloat(-4, 8))) });
    }

    if (useOvershoot) {
      const settleSteps = this.randomInt(3, 6);
      const overshot = points[points.length - 1] ?? finalTarget;
      for (let i = 1; i <= settleSteps; i += 1) {
        const t = easeOutQuad(i / settleSteps);
        points.push({
          x: overshot.x + (target.x - overshot.x) * t,
          y: overshot.y + (target.y - overshot.y) * t,
          duration: this.randomInt(18, 42),
        });
      }
    }

    points.push({ x: target.x, y: target.y, duration: this.randomInt(10, 25) });
    return points;
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
      duration: point.duration,
      origin: 'viewport',
    };
  }

  private randomStartPoint(target: TargetPoint): Point {
    const nearTarget = Math.random() < 0.35;
    if (nearTarget) {
      return this.clampPoint({
        x: target.x + this.randomFloat(-180, 180),
        y: target.y + this.randomFloat(-140, 140),
      }, target.viewport);
    }
    return {
      x: this.randomFloat(target.viewport.width * 0.25, target.viewport.width * 0.75),
      y: this.randomFloat(target.viewport.height * 0.25, target.viewport.height * 0.75),
    };
  }

  private overshootPoint(start: Point, target: Point, viewport: Viewport): Point {
    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    if (distance < 1) return target;
    const amount = this.randomFloat(3, 12);
    return this.clampPoint({
      x: target.x + ((target.x - start.x) / distance) * amount + this.randomFloat(-3, 3),
      y: target.y + ((target.y - start.y) / distance) * amount + this.randomFloat(-3, 3),
    }, viewport);
  }

  private clampPoint(point: Point, viewport: Viewport): Point {
    return {
      x: Math.min(Math.max(point.x, 0), Math.max(0, viewport.width - 1)),
      y: Math.min(Math.max(point.y, 0), Math.max(0, viewport.height - 1)),
    };
  }

  private randomFloat(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(this.randomFloat(min, max + 1));
  }
}

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function splitGraphemes(text: string): string[] {
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;
  if (!segmenter) return Array.from(text);
  return Array.from(segmenter.segment(text), (item) => item.segment);
}
