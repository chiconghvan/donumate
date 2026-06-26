import { DonutApiClient } from '../donut/api-client.js';
import { DonutBrowserManager } from './donut-manager.js';
import { GpmLoginManager } from './gpm-manager.js';
import type { BrowserManagerKind, BrowserProfileManager } from './types.js';

export type CreateBrowserManagerOptions = {
  kind: BrowserManagerKind;
  apiBaseUrl: string;
  apiToken?: string;
  signal?: AbortSignal;
};

export function createBrowserManager(options: CreateBrowserManagerOptions): BrowserProfileManager {
  if (options.kind === 'gpm') {
    return new GpmLoginManager(options.apiBaseUrl, options.signal);
  }
  return new DonutBrowserManager(new DonutApiClient(options.apiBaseUrl, options.apiToken, options.signal));
}

export type { BrowserManagerKind, BrowserProfileManager } from './types.js';
