import type { BidiClient } from '../bidi/bidi-client.js';
import { countInteractiveElementsExpression, type InteractiveElementsResult, type ButtonInfo } from '../automation/interactive-elements.js';
import { sleep } from '../utils/retry.js';

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

export class PageAutomation {
  private contextId?: string;

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

  /** Count all interactive elements (a, button, input, etc.) */
  async countInteractiveElements(): Promise<InteractiveElementsResult> {
    return this.evaluate<InteractiveElementsResult>(countInteractiveElementsExpression);
  }

  /** Get only button/link elements with details */
  async getButtons(): Promise<ButtonInfo[]> {
    const result = await this.countInteractiveElements();
    return result.buttons;
  }
}
