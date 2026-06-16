export type FlowInputKind = 'input' | 'text' | 'number' | 'file' | 'folder' | 'checkbox' | 'comboBox';

export type FlowInputValue = string | number | boolean;

export type FlowValue = FlowInputValue | null;

export type FlowInputDefinition = {
  name: string;
  type: FlowInputKind;
  lineNumber: number;
  defaultValue?: FlowInputValue;
  options?: string[];
};

export type FlowCommand = {
  command: string;
  args: string[];
  lineNumber: number;
  raw: string;
};

export type FlowBinaryOperator = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=' | '&&' | '||';

export type FlowExpression =
  | { type: 'literal'; value: FlowValue }
  | { type: 'variable'; name: string }
  | { type: 'unary'; operator: '!' | '-'; argument: FlowExpression }
  | { type: 'binary'; operator: FlowBinaryOperator; left: FlowExpression; right: FlowExpression }
  | { type: 'call'; name: string; args: FlowExpression[] };

export type FlowAssignmentStatement = {
  type: 'assignment';
  name: string;
  value: FlowExpression;
  lineNumber: number;
  raw: string;
};

export type FlowLoopControlStatement = {
  type: 'loopControl';
  control: 'next' | 'exit';
  lineNumber: number;
  raw: string;
};

export type FlowCommandStatement = FlowCommand & {
  type: 'command';
};

export type FlowIfStatement = {
  type: 'if';
  branches: Array<{ condition: FlowExpression; body: FlowStatement[]; lineNumber: number; raw: string }>;
  elseBody?: FlowStatement[];
  lineNumber: number;
  raw: string;
};

export type FlowWhileStatement = {
  type: 'while';
  condition: FlowExpression;
  body: FlowStatement[];
  lineNumber: number;
  raw: string;
};

export type FlowForStatement = {
  type: 'for';
  init: FlowAssignmentStatement;
  condition: FlowExpression;
  update: FlowAssignmentStatement;
  body: FlowStatement[];
  lineNumber: number;
  raw: string;
};

export type FlowStatement = FlowCommandStatement | FlowAssignmentStatement | FlowLoopControlStatement | FlowIfStatement | FlowWhileStatement | FlowForStatement;

export type FlowProgram = {
  inputs: FlowInputDefinition[];
  beforeRunProfile: FlowStatement[];
  main: FlowStatement[];
  afterKillProfile: FlowStatement[];
  legacyCommands?: FlowStatement[];
};

export type FlowBlockName = 'beforeRunProfile' | 'main' | 'afterKillProfile';
