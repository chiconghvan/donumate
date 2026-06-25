import { z } from 'zod';

export const apiProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  browser: z.string(),
  version: z.string().optional(),
  proxy: z.string().nullable().optional(),
  process_id: z.number().nullable().optional(),
  is_running: z.boolean().optional(),
  camoufox_config: z.unknown().optional(),
});

export const apiProfilesResponseSchema = z.object({
  profiles: z.array(apiProfileSchema),
  total: z.number(),
});

export const runProfileResponseSchema = z.object({
  profile_id: z.string(),
  name: z.string().optional(),
  proxy: z.string().nullable().optional(),
  remote_debugging_port: z.number(),
  ws_url: z.string().nullable().optional(),
  headless: z.boolean(),
});

export type ApiProfile = {
  id: string;
  name: string;
  browser: string;
  version: string;
  proxy?: string | null;
  process_id?: number | null;
  is_running?: boolean;
  camoufox_config?: unknown;
};

export type ApiProfilesResponse = {
  profiles: ApiProfile[];
  total: number;
};

export type RunProfileResponse = z.infer<typeof runProfileResponseSchema>;

export function normalizeApiProfile(raw: unknown): ApiProfile | null {
  const parsed = apiProfileSchema.safeParse(raw);
  if (!parsed.success) return null;
  return {
    ...parsed.data,
    version: parsed.data.version ?? 'unknown',
  };
}

export function normalizeApiProfiles(raw: unknown): ApiProfile[] {
  const parsed = apiProfilesResponseSchema.safeParse(raw);
  if (!parsed.success) return [];
  return parsed.data.profiles.map((p) => ({
    ...p,
    version: p.version ?? 'unknown',
  }));
}
