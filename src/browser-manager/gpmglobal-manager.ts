import { AppError } from '../utils/errors.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { BrowserProfileManager, BrowserLaunchOptions, BrowserLaunchResult } from './types.js';

type GpmGlobalProfile = {
  id?: unknown;
  name?: unknown;
  raw_proxy?: unknown;
  browser?: unknown;
};

type GpmGlobalBrowser = {
  name?: unknown;
  version?: unknown;
};

type GpmGlobalProfilesPage = {
  data?: unknown;
};

type GpmGlobalStartData = {
  profile_id?: unknown;
  remote_debugging_port?: unknown;
  websocket_debugging_url?: unknown;
};

export class GpmGlobalManager implements BrowserProfileManager {
  readonly kind = 'gpmglobal' as const;
  readonly displayName = 'GPMGlobal';
  private readonly apiBaseUrl: string;

  constructor(
    baseUrl: string,
    private readonly signal?: AbortSignal,
  ) {
    this.apiBaseUrl = normalizeGpmGlobalBaseUrl(baseUrl);
  }

  async listProfiles(): Promise<ApiProfile[]> {
    const profiles: ApiProfile[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const data = await this.request(`/profiles?page=${page}&page_size=100`, { method: 'GET' });
      const pageData = this.unwrapData(data) as GpmGlobalProfilesPage;
      const rawProfiles = pageData?.data;
      if (!Array.isArray(rawProfiles)) {
        throw new AppError('Unexpected GPMGlobal profiles response: data.data is not an array');
      }
      profiles.push(...rawProfiles.map((profile) => this.normalizeProfile(profile)).filter((profile): profile is ApiProfile => profile !== null));

      const record = pageData as Record<string, unknown>;
      const parsedLastPage = Number(record.last_page);
      lastPage = Number.isInteger(parsedLastPage) && parsedLastPage > 0 ? parsedLastPage : page;
      page += 1;
    } while (page <= lastPage);

    return profiles;
  }

  async getProfile(profileId: string): Promise<ApiProfile> {
    const data = await this.request(`/profiles/${encodeURIComponent(profileId)}`, { method: 'GET' });
    const profile = this.normalizeProfile(this.unwrapData(data));
    if (!profile) {
      throw new AppError(`Failed to parse GPMGlobal profile response for ${profileId}`);
    }
    return profile;
  }

  async launchProfile(profileId: string, options: BrowserLaunchOptions): Promise<BrowserLaunchResult> {
    const query: string[] = [];
    if (options.headless) query.push('addition_args=--headless');
    if (options.winSize) query.push(`window_size=${encodeURIComponent(options.winSize)}`);

    const qs = query.join('&');
    const data = await this.request(`/profiles/start/${encodeURIComponent(profileId)}${qs ? `?${qs}` : ''}`, { method: 'GET' });
    const startData = this.unwrapData(data) as GpmGlobalStartData;
    const remoteDebuggingPort = this.remoteDebuggingPort(startData.remote_debugging_port);

    const run: RunProfileResponse = {
      profile_id: typeof startData.profile_id === 'string' ? startData.profile_id : profileId,
      remote_debugging_port: remoteDebuggingPort,
      ws_url: typeof startData.websocket_debugging_url === 'string' ? startData.websocket_debugging_url : null,
      headless: options.headless,
    };

    return {
      run,
      runtime: 'playwright',
      readyMessage: `  Browser ready (remote debugging port=${remoteDebuggingPort})`,
    };
  }

  async closeProfile(profileId: string): Promise<void> {
    await this.request(`/profiles/stop/${encodeURIComponent(profileId)}`, { method: 'GET' });
  }

  private normalizeProfile(raw: unknown): ApiProfile | null {
    if (!raw || typeof raw !== 'object') return null;
    const profile = raw as GpmGlobalProfile;
    if (typeof profile.id !== 'string' || typeof profile.name !== 'string') return null;

    const browser = profile.browser && typeof profile.browser === 'object' ? (profile.browser as GpmGlobalBrowser) : undefined;
    return {
      id: profile.id,
      name: profile.name,
      browser: typeof browser?.name === 'string' ? browser.name : 'chromium',
      version: typeof browser?.version === 'string' ? browser.version : 'unknown',
      proxy: typeof profile.raw_proxy === 'string' && profile.raw_proxy ? profile.raw_proxy : undefined,
    };
  }

  private remoteDebuggingPort(value: unknown): number {
    const port = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(port) || port <= 0) {
      throw new AppError(`Unexpected GPMGlobal remote_debugging_port: ${String(value)}`);
    }
    return port;
  }

  private unwrapData(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') return raw;
    const record = raw as Record<string, unknown>;
    if (record.success === false) {
      throw new AppError(typeof record.message === 'string' ? record.message : 'GPMGlobal API request failed');
    }
    return 'data' in record ? record.data : raw;
  }

  private throwIfAborted(): void {
    if (this.signal?.aborted) {
      throw new AppError('Aborted');
    }
  }

  private async request(path: string, init: RequestInit): Promise<unknown> {
    this.throwIfAborted();

    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    if (init.body) headers.set('content-type', 'application/json');

    let response: Response;
    try {
      response = await fetch(`${this.apiBaseUrl}${path}`, { ...init, headers, signal: this.signal });
    } catch (error) {
      if (this.signal?.aborted) throw new AppError('Aborted');
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
        throw new AppError(`Cannot connect to GPMGlobal API at ${this.apiBaseUrl}. Is GPMGlobal running?`, error);
      }
      throw new AppError(`GPMGlobal API request failed: ${msg}`, error);
    }

    if (!response.ok) {
      throw new AppError(await this.httpErrorMessage(response));
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  private async httpErrorMessage(response: Response): Promise<string> {
    const details = await response.text().catch(() => '');
    const suffix = details ? ` Response: ${details}` : '';
    switch (response.status) {
      case 404:
        return `GPMGlobal profile or endpoint not found (404).${suffix}`;
      case 500:
        return `GPMGlobal launch failed (500).${suffix}`;
      default:
        return `GPMGlobal API error ${response.status} ${response.statusText}.${suffix}`;
    }
  }
}

function normalizeGpmGlobalBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}
