import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import { normalizeApiProfiles, normalizeApiProfile, runProfileResponseSchema, type ApiProfile, type RunProfileResponse } from './api-types.js';

export type RunProfileOptions = {
  url?: string;
  headless: boolean;
};

export type WaitForReadyOptions = {
  pollIntervalMs?: number;
  timeoutMs?: number;
};

const DEFAULT_POLL_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30000;

export class DonutApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string,
    private readonly signal?: AbortSignal,
  ) {}

  async listProfiles(): Promise<ApiProfile[]> {
    const data = await this.request('/v1/profiles', { method: 'GET' });
    return normalizeApiProfiles(data);
  }

  async getProfile(profileId: string): Promise<ApiProfile> {
    const data = await this.request(`/v1/profiles/${encodeURIComponent(profileId)}`, { method: 'GET' });
    // API wraps in { profile: {...} } or returns flat object
    const raw = (data && typeof data === 'object' && 'profile' in data)
      ? (data as Record<string, unknown>).profile
      : data;
    const profile = normalizeApiProfile(raw);
    if (!profile) {
      throw new AppError(`Failed to parse profile response for ${profileId}`);
    }
    return profile;
  }

  async runProfile(profileId: string, options: RunProfileOptions): Promise<RunProfileResponse> {
    const params = new URLSearchParams();
    if (options.url) params.set('url', options.url);
    params.set('headless', String(options.headless));
    const qs = params.toString();
    const data = await this.request(`/v1/profiles/${encodeURIComponent(profileId)}/run${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    });
    const parsed = runProfileResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new AppError(`Unexpected Donut API response: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  async waitForProfileReady(profileId: string, options: WaitForReadyOptions = {}): Promise<ApiProfile> {
    const pollMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const deadline = Date.now() + timeoutMs;

    while (true) {
      this.throwIfAborted();
      const profile = await this.getProfile(profileId);
      if (profile.is_running === true && profile.process_id != null && profile.process_id > 0) {
        return profile;
      }
      if (Date.now() >= deadline) {
        throw new AppError(`Profile ${profileId} did not start within ${timeoutMs}ms. Last status: is_running=${profile.is_running}, process_id=${profile.process_id}`);
      }
      logger.info(`Waiting for profile ${profileId} to start... (is_running=${profile.is_running}, process_id=${profile.process_id})`);
      await sleep(pollMs, this.signal);
    }
  }

  async killProfile(profileId: string): Promise<void> {
    await this.request(`/v1/profiles/${encodeURIComponent(profileId)}/kill`, { method: 'POST' });
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
    if (this.token) headers.set('authorization', `Bearer ${this.token}`);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { ...init, headers, signal: this.signal });
    } catch (error) {
      if (this.signal?.aborted) throw new AppError('Aborted');
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
        throw new AppError(`Cannot connect to Donut API at ${this.baseUrl}. Is Donut Browser running?`, error);
      }
      throw new AppError(`Donut API request failed: ${msg}`, error);
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
      case 402:
        return `Donut automation entitlement missing (402).${suffix}`;
      case 403:
        return `Donut API forbidden (403). Accept terms or check API access/token.${suffix}`;
      case 404:
        return `Donut profile or endpoint not found (404).${suffix}`;
      case 500:
        return `Donut launch failed (500).${suffix}`;
      default:
        return `Donut API error ${response.status} ${response.statusText}.${suffix}`;
    }
  }
}
