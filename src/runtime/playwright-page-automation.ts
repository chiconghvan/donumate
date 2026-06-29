import { stat } from 'fs/promises';
import { resolve } from 'path';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { countInteractiveElementsExpression, type ButtonInfo, type InteractiveElementsResult } from '../automation/interactive-elements.js';
import { sleep } from '../utils/retry.js';
import { runWithClipboardLock } from './clipboard-lock.js';
import { clampPoint, generateHumanMousePath, overshootPoint, overshootRadiusForBox, randomInt, randomPointInBox, randomStartPoint, type Point, type TargetPoint } from './human-mouse.js';
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
const CURSOR_SPEED_SCALE = 1.7;

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
      const box = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
      return JSON.stringify({ ok: true, viewport, scrolled, box });
    })()`);
    const result = JSON.parse(String(raw)) as ({ ok: true } & TargetPoint) | { ok: false; reason: string };
    if (!result.ok) throw new Error(`XPath not found or not ${actionName}: ${xpath}. ${result.reason}`);
    const point = randomPointInBox(result.box, result.viewport, 30);
    return { ...point, viewport: result.viewport, scrolled: result.scrolled, box: result.box };
  }

  private async moveMouseTo(target: TargetPoint): Promise<void> {
    await this.ensureVirtualCursor();
    const page = this.requirePage();
    const start = clampPoint(this.mousePosition ?? randomStartPoint(target), target.viewport);
    await this.showVirtualCursor(start, 0);

    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    const overshot = distance > 500 ? overshootPoint(target, target.viewport, overshootRadiusForBox(target.box)) : undefined;
    const paths = overshot
      ? [
        generateHumanMousePath(start, overshot, { moveSpeed: CURSOR_SPEED_SCALE, targetWidth: target.box.width, viewport: target.viewport }),
        generateHumanMousePath(overshot, target, { moveSpeed: CURSOR_SPEED_SCALE, targetWidth: target.box.width, spreadOverride: 10, viewport: target.viewport }),
      ]
      : [generateHumanMousePath(start, target, { moveSpeed: CURSOR_SPEED_SCALE, targetWidth: target.box.width, viewport: target.viewport })];

    for (const path of paths) {
      for (const point of path) {
        const duration = Math.max(0, Math.round(point.duration));
        await this.showVirtualCursor(point, duration);
        await page.mouse.move(Math.round(point.x), Math.round(point.y), { steps: 1 });
        if (duration > 0) await sleep(duration);
      }
    }

    this.mousePosition = { x: target.x, y: target.y };
    await this.showVirtualCursor(target, 0);
  }

  private async clickCurrentMousePosition(point: Point): Promise<void> {
    const page = this.requirePage();
    await page.mouse.move(Math.round(point.x), Math.round(point.y), { steps: 1 });
    await sleep(randomInt(20, 120));
    await page.mouse.down();
    await sleep(randomInt(30, 140));
    await page.mouse.up();
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

  private randomInt(min: number, max: number): number {
    return randomInt(min, max);
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

function splitGraphemes(text: string): string[] {
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;
  if (!segmenter) return Array.from(text);
  return Array.from(segmenter.segment(text), (item) => item.segment);
}
