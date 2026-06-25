import type { BidiClient } from '../bidi/bidi-client.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { BrowserPageAutomation } from './page-automation-types.js';
import type { InputValue } from './input-types.js';
import type { Browser } from 'playwright-core';

export type { InputValue };

export type AutomationContext = {
  profile: ApiProfile;
  run: RunProfileResponse;
  runtime: 'bidi' | 'playwright';
  page: BrowserPageAutomation;
  bidi?: BidiClient;
  playwrightBrowser?: Browser;
  log: (...args: unknown[]) => void;
  sleep: (ms: number) => Promise<void>;
  inputs: Record<string, InputValue>;
  args: Record<string, string>;
};
