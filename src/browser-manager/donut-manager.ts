import { DonutApiClient } from '../donut/api-client.js';
import { DONUT_SUPPORTED_BROWSER_TYPES } from '../donut/browser-types.js';
import type { BrowserProfileManager, BrowserLaunchOptions, BrowserLaunchResult } from './types.js';
import type { ApiProfile } from '../donut/api-types.js';

export class DonutBrowserManager implements BrowserProfileManager {
  readonly kind = 'donut' as const;
  readonly displayName = 'Donut Browser';
  readonly supportedBrowsers = DONUT_SUPPORTED_BROWSER_TYPES;

  constructor(private readonly client: DonutApiClient) {}

  listProfiles(): Promise<ApiProfile[]> {
    return this.client.listProfiles();
  }

  getProfile(profileId: string): Promise<ApiProfile> {
    return this.client.getProfile(profileId);
  }

  async launchProfile(profileId: string, options: BrowserLaunchOptions): Promise<BrowserLaunchResult> {
    const run = await this.client.runProfile(profileId, {
      url: 'about:blank',
      headless: options.headless,
    });
    const readyProfile = await this.client.waitForProfileReady(profileId, { timeoutMs: 30000 });
    return {
      run,
      readyMessage: `  Browser ready (pid=${readyProfile.process_id})`,
    };
  }

  async closeProfile(profileId: string): Promise<void> {
    await this.client.killProfile(profileId);
  }
}
