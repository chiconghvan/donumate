import type { FlowInputValue } from '../types.js';
import type { WorkflowContext } from '../types.js';

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
  defaultValue?: FlowInputValue;
  options?: string[];
  lineNumber: number;
};

export type GscriptExecutionContext = Partial<WorkflowContext> & {
  inputs: Record<string, FlowInputValue>;
  args: Record<string, string>;
  log: (...args: unknown[]) => void;
  sleep: (ms: number) => Promise<void>;
};

export type GscriptSignal = 'next' | 'exit' | 'stop' | undefined;
