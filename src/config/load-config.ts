import 'dotenv/config';
import { z } from 'zod';
import { AppError } from '../utils/errors.js';
import type { AppConfig } from './types.js';
import type { BrowserManagerKind } from '../browser-manager/index.js';

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
  manager: z.enum(['donut', 'gpm']),
  apiBaseUrl: z.string().url(),
  apiToken: z.string().optional(),
  profileId: z.string().optional(),
  headless: booleanSchema,
  bidiConnectTimeoutMs: numberSchema,
  bidiCommandTimeoutMs: numberSchema,
});

export type ConfigOverrides = Partial<Record<'api' | 'token' | 'profile' | 'headless' | 'connectTimeout' | 'commandTimeout', string | boolean>> & {
  manager?: BrowserManagerKind;
};

export function loadConfig(overrides: ConfigOverrides = {}): AppConfig {
  const manager = overrides.manager ?? 'donut';
  const defaultApiBaseUrl = manager === 'gpm' ? 'http://127.0.0.1:19995' : 'http://127.0.0.1:10108';
  const envApiBaseUrl = manager === 'gpm' ? process.env.GPM_API_BASE_URL : process.env.DONUT_API_BASE_URL;
  let parsed;
  try {
    parsed = configSchema.parse({
      manager,
      apiBaseUrl: overrides.api ?? envApiBaseUrl ?? defaultApiBaseUrl,
      apiToken: (overrides.token ?? process.env.DONUT_API_TOKEN) || undefined,
      profileId: (overrides.profile ?? process.env.DONUT_PROFILE_ID) || undefined,
      headless: overrides.headless ?? process.env.DONUT_HEADLESS ?? process.env.CAMOUFOX_HEADLESS ?? false,
      bidiConnectTimeoutMs: overrides.connectTimeout ?? process.env.BIDI_CONNECT_TIMEOUT_MS ?? 30000,
      bidiCommandTimeoutMs: overrides.commandTimeout ?? process.env.BIDI_COMMAND_TIMEOUT_MS ?? 15000,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
      throw new AppError(`Invalid configuration:\n${issues}`);
    }
    throw error;
  }

  return {
    ...parsed,
    apiBaseUrl: parsed.apiBaseUrl.replace(/\/$/, ''),
  };
}
