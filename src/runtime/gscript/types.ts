import type { BidiClient } from '../../bidi/bidi-client.js';
import type { ApiProfile, RunProfileResponse } from '../../donut/api-types.js';
import type { BrowserPageAutomation } from '../page-automation-types.js';
import type { InputValue } from '../input-types.js';
import type { Browser } from 'playwright-core';

export type GscriptRawInput = Record<string, string>;

export type GscriptNodeBase = {
  id: string;
  comment?: string | null;
  rawInput: GscriptRawInput;
};

export type GscriptBlockNode = GscriptNodeBase & {
  kind: 'normal' | 'for' | 'while' | 'if' | 'elseif' | 'else';
  nodes: GscriptNode[];
};

export type GscriptActionNode = GscriptNodeBase & {
  kind: 'action';
  actionType: number;
  elementXPath?: string | null;
  outputVariableName?: string | null;
  delay?: string | null;
  useFailedBlock: boolean;
  failedBlock?: GscriptBlockNode;
};

export type GscriptNode = GscriptBlockNode | GscriptActionNode;

export type GscriptProgram = {
  beforeInit: GscriptBlockNode;
  mainLogic: GscriptBlockNode;
  afterQuit: GscriptBlockNode;
  inputs: GscriptInputDefinition[];
};

export type GscriptInputDefinition = {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'comboBox';
  defaultValue?: InputValue;
  options?: string[];
  lineNumber: number;
};

export type GscriptExecutionContext = {
  profile?: ApiProfile;
  run?: RunProfileResponse;
  runtime?: 'bidi' | 'playwright';
  page?: BrowserPageAutomation;
  bidi?: BidiClient;
  playwrightBrowser?: Browser;
  inputs: Record<string, InputValue>;
  args: Record<string, string>;
  log: (...args: unknown[]) => void;
  sleep: (ms: number) => Promise<void>;
  minimalLog?: boolean;
};

export type GscriptSignal = 'next' | 'exit' | 'stop' | undefined;
