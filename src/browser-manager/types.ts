import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';

export type BrowserManagerKind = 'donut' | 'gpm' | 'gpmglobal';

export type BrowserLaunchOptions = {
  headless: boolean;
  winSize?: string;
};

export type BrowserLaunchResult = {
  run: RunProfileResponse;
  runtime?: 'bidi' | 'playwright';
  readyMessage?: string;
};

export type BrowserProfileManager = {
  kind: BrowserManagerKind;
  displayName: string;
  supportedBrowsers?: Set<string>;
  listProfiles(): Promise<ApiProfile[]>;
  getProfile(profileId: string): Promise<ApiProfile>;
  launchProfile(profileId: string, options: BrowserLaunchOptions): Promise<BrowserLaunchResult>;
  closeProfile(profileId: string): Promise<void>;
};
