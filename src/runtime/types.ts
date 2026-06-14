import type { BidiClient } from '../bidi/bidi-client.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { PageAutomation } from './page-automation.js';

export type WorkflowContext = {
  /** Donut profile info */
  profile: ApiProfile;
  /** Launch response (debugging port, headless, etc.) */
  run: RunProfileResponse;
  /** High-level page automation */
  page: PageAutomation;
  /** Raw BiDi client for advanced use */
  bidi: BidiClient;
  /** Structured log output */
  log: (...args: unknown[]) => void;
  /** Sleep helper */
  sleep: (ms: number) => Promise<void>;
  /** CLI script arguments (--script-arg key=value) */
  args: Record<string, string>;
};

export type WorkflowScript = (ctx: WorkflowContext) => Promise<void> | void;
