export type AppConfig = {
  apiBaseUrl: string;
  apiToken?: string;
  profileId?: string;
  headless: boolean;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
};
