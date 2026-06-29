import { stat } from 'fs/promises';
import { resolve } from 'path';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { countInteractiveElementsExpression, type ButtonInfo, type InteractiveElementsResult } from '../automation/interactive-elements.js';
import { sleep } from '../utils/retry.js';
import { runWithClipboardLock } from './clipboard-lock.js';
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
const VIRTUAL_MOUSE_CURSOR_ID = '__donut_virtual_mouse_cursor__';
const DEFAULT_TYPING_MIN_DELAY_MS = 35;
const DEFAULT_TYPING_MAX_DELAY_MS = 140;

const KEY_NAMES: Record<string, string> = {
  backspace: 'Backspace',
  tab: 'Tab',
  return: 'Enter',
  enter: 'Enter',
  shift: 'Shift',
  control: 'Control',
  ctrl: 'Control',
  alt: 'Alt',
  escape: 'Escape',
  esc: 'Escape',
  space: ' ',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  end: 'End',
  home: 'Home',
  arrowleft: 'ArrowLeft',
  left: 'ArrowLeft',
  arrowup: 'ArrowUp',
  up: 'ArrowUp',
  arrowright: 'ArrowRight',
  right: 'ArrowRight',
  arrowdown: 'ArrowDown',
  down: 'ArrowDown',
  insert: 'Insert',
  delete: 'Delete',
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  meta: 'Meta',
  command: 'Meta',
};

type Point = { x: number; y: number };
type Viewport = { width: number; height: number };
type TargetPoint = Point & { viewport: Viewport; scrolled: boolean };
type PathPoint = Point & { duration: number };

export async function connectPlaywrightToCdp(remoteDebuggingPort: number, timeoutMs: number): Promise<Browser> {
  const { chromium } = await import('playwright-core');
  return chromium.connectOverCDP(`http://127.0.0.1:${remoteDebuggingPort}`, { timeout: timeoutMs });
}

export class PlaywrightPageAutomation implements BrowserPageAutomation {
  private context?: BrowserContext;
  private page?: Page;
  private mousePosition?: Point;

  constructor(private readonly browser: Browser) {}

  async init(): Promise<void> {
    this.context = this.browser.contexts()[0] ?? await this.browser.newContext();
    this.page = this.context.pages().find((page) => !page.isClosed()) ?? await this.context.newPage();
    await this.page.bringToFront().catch(() => {});
  }

  async goto(url: string): Promise<void> {
    await this.requirePage().goto(url);
  }

  async navUrl(url: string): Promise<void> {
    await this.goto(url);
  }

  async newTab(url?: string): Promise<void> {
    const context = this.requireContext();
    this.page = await context.newPage();
    this.mousePosition = undefined;
    if (url) await this.goto(url);
  }

  async closeTab(): Promise<void> {
    const page = this.requirePage();
    await page.close();
    const next = this.requireContext().pages().find((item) => !item.isClosed());
    this.page = next;
    this.mousePosition = undefined;
    if (!this.page) throw new Error('No browsing context remains after closing tab.');
    await this.page.bringToFront().catch(() => {});
  }

  async activeTab(target: string): Promise<void> {
    const pages = this.requireContext().pages().filter((page) => !page.isClosed());
    const index = Number(target);
    const page = Number.isInteger(index)
      ? pages[index]
      : pages.find((item) => item.url() === target);
    if (!page) throw new Error(`Tab not found: ${target}`);
    this.page = page;
    this.mousePosition = undefined;
    await page.bringToFront().catch(() => {});
  }

  async closeAllTabs(): Promise<void> {
    const pages = this.requireContext().pages().filter((page) => !page.isClosed());
    if (pages.length <= 1) return;
    const first = pages[0];
    for (const page of pages.slice(1)) await page.close().catch(() => {});
    if (!first) throw new Error('No browsing context remains after closing tabs.');
    this.page = first;
    this.mousePosition = undefined;
    await first.bringToFront().catch(() => {});
  }

  async waitForLoad(): Promise<void> {
    await this.evaluate(waitForLoadExpression);
  }

  async delay(ms: number): Promise<void> {
    await sleep(ms);
  }

  async evaluate<T = unknown>(expression: string): Promise<T> {
    return this.requirePage().evaluate(expression) as Promise<T>;
  }

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

  async existsXPath(xpath: string): Promise<boolean> {
    return Boolean(await this.evaluate(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      return Boolean(document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
    })()`));
  }

  async waitForXPath(xpath: string, timeoutMs = 10000): Promise<boolean> {
    return this.evaluate<boolean>(`(() => {
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
  }

  async clickXPath(xpath: string): Promise<void> {
    const target = await this.resolveXPathTarget(xpath, 'clickable');
    if (target.scrolled) await this.humanPause();
    await this.moveMouseTo(target);
    await this.humanPause();
    await this.clickCurrentMousePosition(target);
    await this.humanPause();
    this.mousePosition = { x: target.x, y: target.y };
  }

  async typeTextXPath(xpath: string, text: string, options: HumanTypingOptions = {}): Promise<void> {
    await this.clickAndFocusXPath(xpath, 'typeable');
    for (const chunk of splitGraphemes(text)) {
      await this.requirePage().keyboard.type(chunk);
      await sleep(this.typingDelay(chunk, options));
    }
  }

  async pasteTextXPath(xpath: string, text: string): Promise<void> {
    await runWithClipboardLock(async () => {
      await writeHostClipboardText(text);
      await this.clickAndFocusXPath(xpath, 'typeable');
      const keyboard = this.requirePage().keyboard;
      await keyboard.down('Control');
      await keyboard.press('v');
      await keyboard.up('Control');
    });
  }

  async typeXPath(xpath: string, text: string): Promise<void> {
    await this.typeTextXPath(xpath, text);
  }

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
    const absolutePath = resolve(filePath);
    const file = await stat(absolutePath);
    if (!file.isFile()) throw new Error(`Upload path is not a file: ${absolutePath}`);
    await this.requirePage().locator(`xpath=${xpath}`).first().setInputFiles(absolutePath);
  }

  async countInteractiveElements(): Promise<InteractiveElementsResult> {
    return this.evaluate<InteractiveElementsResult>(countInteractiveElementsExpression);
  }

  async getButtons(): Promise<ButtonInfo[]> {
    const result = await this.countInteractiveElements();
    return result.buttons;
  }

  async sendKey(...keys: string[]): Promise<void> {
    const keyboard = this.requirePage().keyboard;
    const mapped = keys.map((key) => KEY_NAMES[key.toLowerCase()] ?? key);
    for (const key of mapped) await keyboard.down(key);
    for (let i = mapped.length - 1; i >= 0; i -= 1) await keyboard.up(mapped[i] ?? '');
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
      const scrolled = !isInViewport(rectBefore);
      if (scrolled) node.scrollIntoView({ block: 'center', inline: 'center' });
      const rect = readRect();
      const stillVisible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0';
      const inViewport = isInViewport(rect);
      const ready = stillVisible && inViewport;
      if (!ready) return JSON.stringify({ ok: false, reason: 'Element is not visible or not in viewport.' });
      const marginX = Math.min(Math.max(rect.width * 0.2, 1), 12);
      const marginY = Math.min(Math.max(rect.height * 0.2, 1), 12);
      const jitterX = rect.width > 8 ? (Math.random() * 2 - 1) * Math.max(0, rect.width / 2 - marginX) * 0.45 : 0;
      const jitterY = rect.height > 8 ? (Math.random() * 2 - 1) * Math.max(0, rect.height / 2 - marginY) * 0.45 : 0;
      const x = Math.min(Math.max(rect.left + rect.width / 2 + jitterX, 0), Math.max(0, viewport.width - 1));
      const y = Math.min(Math.max(rect.top + rect.height / 2 + jitterY, 0), Math.max(0, viewport.height - 1));
      return JSON.stringify({ ok: true, x, y, viewport, scrolled });
    })()`);
    const result = JSON.parse(String(raw)) as ({ ok: true } & TargetPoint) | { ok: false; reason: string };
    if (!result.ok) throw new Error(`XPath not found or not ${actionName}: ${xpath}. ${result.reason}`);
    return { x: result.x, y: result.y, viewport: result.viewport, scrolled: result.scrolled };
  }

  private async moveMouseTo(target: TargetPoint): Promise<void> {
    await this.ensureVirtualCursor();
    const page = this.requirePage();
    const start = this.clampPoint(this.mousePosition ?? this.randomStartPoint(target), target.viewport);
    const path = this.generateMousePath(start, target, target.viewport);
    await this.showVirtualCursor(start, 0);

    for (const point of path) {
      await this.showVirtualCursor(point, point.duration);
      await page.mouse.move(Math.round(point.x), Math.round(point.y), { steps: 1 });
      await sleep(point.duration);
    }

    this.mousePosition = { x: target.x, y: target.y };
    await this.showVirtualCursor(target, 0);
  }

  private async clickCurrentMousePosition(point: Point): Promise<void> {
    const page = this.requirePage();
    await page.mouse.move(Math.round(point.x), Math.round(point.y), { steps: 1 });
    await page.mouse.down();
    await sleep(this.randomInt(35, 95));
    await page.mouse.up();
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

  private typingDelay(chunk: string, options: HumanTypingOptions): number {
    const minDelayMs = options.minDelayMs ?? DEFAULT_TYPING_MIN_DELAY_MS;
    const maxDelayMs = options.maxDelayMs ?? DEFAULT_TYPING_MAX_DELAY_MS;
    const lowerDelayMs = Math.max(0, Math.min(minDelayMs, maxDelayMs));
    const upperDelayMs = Math.max(lowerDelayMs, Math.max(minDelayMs, maxDelayMs));
    const base = lowerDelayMs === upperDelayMs ? lowerDelayMs : this.randomInt(lowerDelayMs, upperDelayMs);
    if (/\s/.test(chunk)) return base + this.randomInt(20, 90);
    if (/[.,!?;:]$/.test(chunk)) return base + this.randomInt(80, 180);
    return base;
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

  private async humanPause(minMs = 200, maxMs = 700): Promise<void> {
    await sleep(this.randomInt(minMs, maxMs));
  }

  private requireContext(): BrowserContext {
    if (!this.context) throw new Error('Page not initialized. Call init() first.');
    return this.context;
  }

  private requirePage(): Page {
    if (!this.page || this.page.isClosed()) throw new Error('Page not initialized. Call init() first.');
    return this.page;
  }
}

function wrapAsyncJs(script: string): string {
  return `(async () => {\n${script}\n})()`;
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
