import type { BidiClient } from '../bidi/bidi-client.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { PageAutomation } from './page-automation.js';
import type { FlowInputValue } from './dsl/types.js';

export type { FlowInputValue };

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
  /** Flow/CLI input values */
  inputs: Record<string, FlowInputValue>;
  /** CLI script arguments (--input key=value), stringified for compatibility */
  args: Record<string, string>;
};

export type WorkflowScript = (ctx: WorkflowContext) => Promise<void> | void;
