import { FLOW_COMMAND_SPECS, FLOW_FUNCTION_SPECS } from './runtime-spec.js';

export type FlowCatalogItem = {
  name: string;
  aliases: string[];
  desc: string;
};

export type FlowCompletionKind = 'command' | 'function' | 'syntax';

export type FlowCompletionItem = FlowCatalogItem & {
  kind: FlowCompletionKind;
  snippet: string;
  pageOnly?: boolean;
};

export const FLOW_COMMANDS: FlowCompletionItem[] = FLOW_COMMAND_SPECS.map((item) => ({
  name: item.name,
  aliases: item.aliases,
  desc: item.desc,
  kind: 'command',
  snippet: `${item.aliases[0] ?? item.name}()`,
  pageOnly: item.pageOnly,
}));

export const FLOW_FUNCTIONS: FlowCompletionItem[] = FLOW_FUNCTION_SPECS.map((item) => ({
  name: item.name,
  aliases: item.aliases,
  desc: item.desc,
  kind: 'function',
  snippet: `${item.aliases[0] ?? item.name}()`,
  pageOnly: item.pageOnly,
}));

export const FLOW_SYNTAX_COMPLETIONS: FlowCompletionItem[] = [
  { name: 'inputs', aliases: [], desc: 'Declare script inputs', kind: 'syntax', snippet: 'inputs {\n  \n}' },
  { name: 'before', aliases: ['before()'], desc: 'Run before launching browser profile', kind: 'syntax', snippet: 'before() {\n  \n}' },
  { name: 'running', aliases: ['running()'], desc: 'Run after browser connects', kind: 'syntax', snippet: 'running() {\n  \n}' },
  { name: 'after', aliases: ['after()'], desc: 'Run after browser profile is killed', kind: 'syntax', snippet: 'after() {\n  \n}' },
  { name: 'if', aliases: [], desc: 'Conditional block', kind: 'syntax', snippet: 'if  {\n  \n}' },
  { name: 'else if', aliases: ['elseif'], desc: 'Conditional branch', kind: 'syntax', snippet: 'else if  {\n  \n}' },
  { name: 'else', aliases: [], desc: 'Fallback branch', kind: 'syntax', snippet: 'else {\n  \n}' },
  { name: 'while', aliases: [], desc: 'While loop', kind: 'syntax', snippet: 'while  {\n  \n}' },
  { name: 'for', aliases: [], desc: 'For loop', kind: 'syntax', snippet: 'for i = 0; i < ; i = i + 1\n  ' },
  { name: 'nextLoop', aliases: [], desc: 'Skip to next loop iteration', kind: 'syntax', snippet: 'nextLoop' },
  { name: 'exitLoop', aliases: [], desc: 'Exit current loop', kind: 'syntax', snippet: 'exitLoop' },
  { name: 'rDelay', aliases: ['rDelay()'], desc: 'Append random delay as last input', kind: 'syntax', snippet: 'rDelay()' },
];

export const FLOW_INPUT_COMPLETIONS: FlowCompletionItem[] = [
  { name: 'input', aliases: [], desc: 'Text or number input', kind: 'syntax', snippet: 'name: input = ""' },
  { name: 'text', aliases: [], desc: 'Text input', kind: 'syntax', snippet: 'name: text = ""' },
  { name: 'number', aliases: [], desc: 'Number input', kind: 'syntax', snippet: 'name: number = 0' },
  { name: 'file', aliases: [], desc: 'File picker', kind: 'syntax', snippet: 'name: file = ""' },
  { name: 'folder', aliases: [], desc: 'Folder picker', kind: 'syntax', snippet: 'name: folder = ""' },
  { name: 'checkbox', aliases: ['bool'], desc: 'Boolean input', kind: 'syntax', snippet: 'name: checkbox = false' },
  { name: 'comboBox', aliases: ['combo'], desc: 'Choice list', kind: 'syntax', snippet: 'name: comboBox ["fast", "safe"] = "fast"' },
  { name: 'inputExcelFile', aliases: ['excel'], desc: 'Excel file input', kind: 'syntax', snippet: 'name: inputExcelFile = ""' },
];

export const FLOW_COMPLETIONS: FlowCompletionItem[] = [
  ...FLOW_COMMANDS,
  ...FLOW_FUNCTIONS.filter((item) => !FLOW_COMMANDS.some((command) => command.name === item.name)),
  ...FLOW_SYNTAX_COMPLETIONS,
];

export const RDELAY_DESC = '  rDelay — append as last input of any command for random delay after execution (optional), e.g. nav("url", rDelay(3000,4000))';

export const COMMAND_LIST = FLOW_COMMANDS.map((c) => `  ${c.name}${c.aliases.length ? ` (${c.aliases.join('/')})` : ''} — ${c.desc}`).join('\n');
export const FUNCTION_LIST = FLOW_FUNCTIONS.map((f) => `  ${f.name}${f.aliases.length ? ` (${f.aliases.join('/')})` : ''} — ${f.desc}`).join('\n');

export const PAGE_COMMANDS = new Set(
  FLOW_COMMANDS
    .filter((item) => item.pageOnly)
    .flatMap((item) => [item.name, ...item.aliases])
    .map((item) => item.toLowerCase())
);

export const PAGE_FUNCTIONS = new Set(
  FLOW_FUNCTIONS
    .filter((item) => item.pageOnly)
    .flatMap((item) => [item.name, ...item.aliases])
    .map((item) => item.toLowerCase())
);
