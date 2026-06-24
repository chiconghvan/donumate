import type { FlowInputDefinition } from '../runtime/dsl/types.js';

export type ScriptBuilderNodeKind = 'command' | 'block' | 'variable' | 'raw' | 'meta';
export type ScriptBuilderBranch = 'next' | 'true' | 'false' | 'body' | 'loop';
export type ScriptBuilderFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'textarea'
  | 'code'
  | 'json'
  | 'expression'
  | 'selector'
  | 'variable';

export type ScriptBuilderPosition = {
  x: number;
  y: number;
};

export type ScriptBuilderRawState = 'parsed' | 'partial' | 'raw' | 'unknown';

export type ScriptBuilderRawData = {
  source: string;
  startLine?: number;
  endLine?: number;
  parseStatus: ScriptBuilderRawState;
};

export type ScriptBuilderNode = {
  id: string;
  type: string;
  kind: ScriptBuilderNodeKind;
  position: ScriptBuilderPosition;
  data: Record<string, unknown>;
  raw?: ScriptBuilderRawData;
};

export type ScriptBuilderEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  branch?: ScriptBuilderBranch | 'catch' | 'finally' | 'case' | 'default';
};

export type ScriptBuilderVariable = FlowInputDefinition & {
  id: string;
  description?: string;
};

export type ScriptBuilderFlow = {
  version: number;
  name: string;
  sourceType: 'flow';
  sourcePath?: string;
  originalSource?: string;
  nodes: ScriptBuilderNode[];
  edges: ScriptBuilderEdge[];
  variables?: ScriptBuilderVariable[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    docsVersion?: string;
    parseWarnings?: string[];
  };
};

export type ValidationIssue = {
  level: 'error' | 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
};

export type FlowSample = {
  name: string;
  path: string;
  source: string;
};

export type NodeFieldDefinition = {
  key: string;
  label: string;
  type: ScriptBuilderFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: unknown;
  description?: string;
};

export type NodeDefinition = {
  type: string;
  kind: ScriptBuilderNodeKind;
  label: string;
  description?: string;
  category: string;
  syntax?: string;
  docsSource?: string;
  defaultData: Record<string, unknown>;
  fields: NodeFieldDefinition[];
};

export type RuntimeCommandDefinition = NodeDefinition & {
  aliases?: string[];
  supportsDelay?: boolean;
  nextHandle?: boolean;
  expressionOnly?: boolean;
  summary?: (data: Record<string, unknown>) => string;
  fromArgs?: (args: string[]) => Record<string, unknown>;
  toArgs?: (data: Record<string, unknown>) => string[];
};

export type RuntimeBlockDefinition = NodeDefinition & {
  handles?: ScriptBuilderBranch[];
  nextHandle?: boolean;
  summary?: (data: Record<string, unknown>) => string;
};

export type ScriptBuilderInputNodeData = {
  name: string;
  inputType: string;
  defaultValue?: string;
  options?: string[];
  description?: string;
  useRawSource?: boolean;
};
