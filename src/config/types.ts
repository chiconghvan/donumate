export type AppConfig = {
  manager: 'donut' | 'gpm' | 'gpmglobal';
  apiBaseUrl: string;
  apiToken?: string;
  profileId?: string;
  headless: boolean;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
};
