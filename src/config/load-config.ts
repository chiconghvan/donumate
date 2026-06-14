import 'dotenv/config';
import { z } from 'zod';
import type { AppConfig } from './types.js';

const booleanSchema = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
});

const numberSchema = z.union([z.number(), z.string()]).transform((value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
});

const configSchema = z.object({
  apiBaseUrl: z.string().url(),
  apiToken: z.string().optional(),
  profileId: z.string().optional(),
  headless: booleanSchema,
  bidiConnectTimeoutMs: numberSchema,
  bidiCommandTimeoutMs: numberSchema,
});

export type ConfigOverrides = Partial<Record<'api' | 'token' | 'profile' | 'headless' | 'connectTimeout' | 'commandTimeout', string | boolean>>;

export function loadConfig(overrides: ConfigOverrides = {}): AppConfig {
  const parsed = configSchema.parse({
    apiBaseUrl: overrides.api ?? process.env.DONUT_API_BASE_URL ?? 'http://127.0.0.1:10108',
    apiToken: (overrides.token ?? process.env.DONUT_API_TOKEN) || undefined,
    profileId: (overrides.profile ?? process.env.DONUT_PROFILE_ID) || undefined,
    headless: overrides.headless ?? process.env.CAMOUFOX_HEADLESS ?? false,
    bidiConnectTimeoutMs: overrides.connectTimeout ?? process.env.BIDI_CONNECT_TIMEOUT_MS ?? 30000,
    bidiCommandTimeoutMs: overrides.commandTimeout ?? process.env.BIDI_COMMAND_TIMEOUT_MS ?? 15000,
  });

  return {
    ...parsed,
    apiBaseUrl: parsed.apiBaseUrl.replace(/\/$/, ''),
  };
}
