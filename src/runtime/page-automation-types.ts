import type { ButtonInfo, InteractiveElementsResult } from '../automation/interactive-elements.js';

export type HumanTypingOptions = {
  minDelayMs?: number;
  maxDelayMs?: number;
};

export type BrowserPageAutomation = {
  init(): Promise<void>;
  goto(url: string): Promise<void>;
  navUrl(url: string): Promise<void>;
  newTab(url?: string): Promise<void>;
  closeTab(): Promise<void>;
  activeTab(target: string): Promise<void>;
  closeAllTabs(): Promise<void>;
  waitForLoad(): Promise<void>;
  delay(ms: number): Promise<void>;
  evaluate<T = unknown>(expression: string): Promise<T>;
  info(): Promise<{ title: string; url: string }>;
  getUrl(): Promise<string>;
  waitUrlChange(previousUrl: string, timeoutMs?: number): Promise<string>;
  backNav(timeoutMs?: number): Promise<void>;
  reloadNav(): Promise<void>;
  existsXPath(xpath: string): Promise<boolean>;
  waitForXPath(xpath: string, timeoutMs?: number): Promise<boolean>;
  clickXPath(xpath: string): Promise<void>;
  typeTextXPath(xpath: string, text: string, options?: HumanTypingOptions): Promise<void>;
  pasteTextXPath(xpath: string, text: string): Promise<void>;
  typeXPath(xpath: string, text: string): Promise<void>;
  textXPath(xpath: string): Promise<string>;
  getElementText(xpath: string): Promise<string>;
  getElementAttribute(xpath: string, attribute: string): Promise<string>;
  countElement(xpath: string): Promise<number>;
  moveMouseXPath(xpath: string): Promise<void>;
  scroll(px: number): Promise<void>;
  executeJs<T = unknown>(script: string): Promise<T>;
  fileUpload(filePath: string, xpath: string): Promise<void>;
  countInteractiveElements(): Promise<InteractiveElementsResult>;
  getButtons(): Promise<ButtonInfo[]>;
  sendKey(...keys: string[]): Promise<void>;
};
