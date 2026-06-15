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
    const clicked = await this.evaluate<boolean>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof HTMLElement)) return false;
      node.scrollIntoView({ block: 'center', inline: 'center' });
      node.focus();
      node.click();
      return true;
    })()`);
    if (!clicked) throw new Error(`XPath not found or not clickable: ${xpath}`);
  }

  /** Type text into first input-like element matching XPath */
  async typeXPath(xpath: string, text: string): Promise<void> {
    const typed = await this.evaluate<boolean>(`(() => {
      const xpath = ${JSON.stringify(xpath)};
      const text = ${JSON.stringify(text)};
      const node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (!(node instanceof HTMLElement)) return false;
      node.scrollIntoView({ block: 'center', inline: 'center' });
      node.focus();
      if ('value' in node) {
        node.value = text;
      } else {
        node.textContent = text;
      }
      node.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      node.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    if (!typed) throw new Error(`XPath not found or not typeable: ${xpath}`);
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
}
