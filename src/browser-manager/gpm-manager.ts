import { AppError } from '../utils/errors.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { BrowserProfileManager, BrowserLaunchOptions, BrowserLaunchResult } from './types.js';

type GpmProfile = {
  id?: unknown;
  name?: unknown;
  raw_proxy?: unknown;
  browser_type?: unknown;
  browser_version?: unknown;
};

type GpmStartData = {
  profile_id?: unknown;
  remote_debugging_address?: unknown;
};

export class GpmLoginManager implements BrowserProfileManager {
  readonly kind = 'gpm' as const;
  readonly displayName = 'GPMLogin';

  constructor(
    private readonly baseUrl: string,
    private readonly signal?: AbortSignal,
  ) {}

  async listProfiles(): Promise<ApiProfile[]> {
    const data = await this.request('/api/v3/profiles', { method: 'GET' });
    const rawProfiles = this.unwrapData(data);
    if (!Array.isArray(rawProfiles)) {
      throw new AppError('Unexpected GPMLogin profiles response: data is not an array');
    }
    return rawProfiles.map((profile) => this.normalizeProfile(profile)).filter((profile): profile is ApiProfile => profile !== null);
  }

  async getProfile(profileId: string): Promise<ApiProfile> {
    try {
      return await this.getProfileFromPath(`/api/v3/profiles/${encodeURIComponent(profileId)}`, profileId);
    } catch (error) {
      if (!this.isNotFoundError(error)) throw error;
      return await this.getProfileFromPath(`/api/v3/profile/${encodeURIComponent(profileId)}`, profileId);
    }
  }

  async launchProfile(profileId: string, options: BrowserLaunchOptions): Promise<BrowserLaunchResult> {
    const params = new URLSearchParams();
    if (options.headless) params.set('addination_args', '--headless');
    if (options.winSize) params.set('win_size', options.winSize);

    const qs = params.toString();
    const data = await this.request(`/api/v3/profiles/start/${encodeURIComponent(profileId)}${qs ? `?${qs}` : ''}`, { method: 'GET' });
    const startData = this.unwrapData(data) as GpmStartData;
    const remoteDebuggingPort = this.remoteDebuggingPort(startData.remote_debugging_address);

    const run: RunProfileResponse = {
      profile_id: typeof startData.profile_id === 'string' ? startData.profile_id : profileId,
      remote_debugging_port: remoteDebuggingPort,
      ws_url: null,
      headless: options.headless,
    };

    return {
      run,
      runtime: 'playwright',
      readyMessage: `  Browser ready (remote debugging port=${remoteDebuggingPort})`,
    };
  }

  async closeProfile(profileId: string): Promise<void> {
    await this.request(`/api/v3/profiles/close/${encodeURIComponent(profileId)}`, { method: 'GET' });
  }

  private async getProfileFromPath(path: string, profileId: string): Promise<ApiProfile> {
    const data = await this.request(path, { method: 'GET' });
    const profile = this.normalizeProfile(this.unwrapData(data));
    if (!profile) {
      throw new AppError(`Failed to parse GPMLogin profile response for ${profileId}`);
    }
    return profile;
  }

  private normalizeProfile(raw: unknown): ApiProfile | null {
    if (!raw || typeof raw !== 'object') return null;
    const profile = raw as GpmProfile;
    if (typeof profile.id !== 'string' || typeof profile.name !== 'string') return null;
    return {
      id: profile.id,
      name: profile.name,
      browser: typeof profile.browser_type === 'string' ? profile.browser_type : 'chromium',
      version: typeof profile.browser_version === 'string' ? profile.browser_version : 'unknown',
      proxy: typeof profile.raw_proxy === 'string' ? profile.raw_proxy : undefined,
    };
  }

  private remoteDebuggingPort(value: unknown): number {
    if (typeof value !== 'string') {
      throw new AppError('Unexpected GPMLogin start response: remote_debugging_address missing');
    }
    const portText = value.includes(':') ? value.split(':').pop() : value;
    const port = Number(portText);
    if (!Number.isInteger(port) || port <= 0) {
      throw new AppError(`Unexpected GPMLogin remote_debugging_address: ${value}`);
    }
    return port;
  }

  private unwrapData(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') return raw;
    const record = raw as Record<string, unknown>;
    if (record.success === false) {
      throw new AppError(typeof record.message === 'string' ? record.message : 'GPMLogin API request failed');
    }
    return 'data' in record ? record.data : raw;
  }

  private isNotFoundError(error: unknown): boolean {
    return error instanceof AppError && error.message.includes('GPMLogin profile or endpoint not found');
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
      response = await fetch(`${this.baseUrl}${path}`, { ...init, headers, signal: this.signal });
    } catch (error) {
      if (this.signal?.aborted) throw new AppError('Aborted');
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
        throw new AppError(`Cannot connect to GPMLogin API at ${this.baseUrl}. Is GPMLogin running?`, error);
      }
      throw new AppError(`GPMLogin API request failed: ${msg}`, error);
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
        return `GPMLogin profile or endpoint not found (404).${suffix}`;
      case 500:
        return `GPMLogin launch failed (500).${suffix}`;
      default:
        return `GPMLogin API error ${response.status} ${response.statusText}.${suffix}`;
    }
  }
}
