import { FLOW_COMMAND_SPECS, FLOW_FUNCTION_SPECS, normalizeFlowCommandName } from '../runtime/dsl/runtime-spec.js';
import type { FlowCommandSpec, FlowFunctionSpec } from '../runtime/dsl/runtime-spec.js';
import type { NodeFieldDefinition, RuntimeBlockDefinition, RuntimeCommandDefinition } from './types.js';

const DOCS_SOURCE = 'docs/flow-scripting.md';

type FieldPreset = {
  category: string;
  syntax?: string;
  supportsDelay?: boolean;
  fields: NodeFieldDefinition[];
};

const COMMON_DELAY_FIELDS: NodeFieldDefinition[] = [
  {
    key: 'appendRandomDelay',
    label: 'Append rDelay',
    type: 'boolean',
    defaultValue: false,
    description: 'Appends rDelay(min,max) as the last command argument.',
  },
  {
    key: 'delayMinMs',
    label: 'Delay Min',
    type: 'number',
    defaultValue: 1000,
    placeholder: '1000',
  },
  {
    key: 'delayMaxMs',
    label: 'Delay Max',
    type: 'number',
    defaultValue: 2000,
    placeholder: '2000',
  },
];

const COMMAND_FIELD_PRESETS: Record<string, FieldPreset> = {
  goto: {
    category: 'Commands',
    syntax: 'goto("https://example.com")',
    supportsDelay: true,
    fields: [{ key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://example.com' }],
  },
  newTab: {
    category: 'Commands',
    syntax: 'newTab("https://example.com/docs")',
    supportsDelay: true,
    fields: [{ key: 'url', label: 'URL', type: 'string', placeholder: 'Optional URL' }],
  },
  closeTab: { category: 'Commands', syntax: 'closeTab()', supportsDelay: true, fields: [] },
  activeTab: {
    category: 'Commands',
    syntax: 'activeTab(0)',
    supportsDelay: true,
    fields: [{ key: 'target', label: 'Index / Context Id', type: 'string', required: true, placeholder: '0 or context-id' }],
  },
  backNav: {
    category: 'Commands',
    syntax: 'backNav(5000)',
    supportsDelay: true,
    fields: [{ key: 'timeoutMs', label: 'Timeout', type: 'number', placeholder: '5000' }],
  },
  reloadNav: { category: 'Commands', syntax: 'reloadNav()', supportsDelay: true, fields: [] },
  getUrl: { category: 'Commands', syntax: 'getUrl()', supportsDelay: true, fields: [] },
  waitUrlChange: {
    category: 'Commands',
    syntax: 'waitUrlChange("https://example.com", 10000)',
    supportsDelay: true,
    fields: [
      { key: 'oldUrl', label: 'Old URL', type: 'string', required: true, placeholder: 'https://example.com' },
      { key: 'timeoutMs', label: 'Timeout', type: 'number', placeholder: '10000' },
    ],
  },
  waitLoad: {
    category: 'Commands',
    syntax: 'waitLoad(3000)',
    supportsDelay: true,
    fields: [{ key: 'settleMs', label: 'Settle Ms', type: 'number', placeholder: '3000' }],
  },
  waitElement: {
    category: 'Commands',
    syntax: 'waitElement("//button", 10000)',
    supportsDelay: true,
    fields: [
      { key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//button' },
      { key: 'timeoutMs', label: 'Timeout', type: 'number', placeholder: '10000' },
    ],
  },
  getElementAttribute: {
    category: 'Commands',
    syntax: 'getElementAttribute("//a", "href")',
    supportsDelay: true,
    fields: [
      { key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//a' },
      { key: 'attributeName', label: 'Attribute', type: 'string', required: true, placeholder: 'href' },
    ],
  },
  getElementText: {
    category: 'Commands',
    syntax: 'getElementText("//h1")',
    supportsDelay: true,
    fields: [{ key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//h1' }],
  },
  countElement: {
    category: 'Commands',
    syntax: 'countElement("//button")',
    supportsDelay: true,
    fields: [{ key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//button' }],
  },
  click: {
    category: 'Commands',
    syntax: 'click("//button")',
    supportsDelay: true,
    fields: [{ key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//button' }],
  },
  typeText: {
    category: 'Commands',
    syntax: 'typeText("//input", "value")',
    supportsDelay: true,
    fields: [
      { key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//input[@name="email"]' },
      { key: 'text', label: 'Text', type: 'textarea', required: true, placeholder: 'user@example.com' },
    ],
  },
  pasteText: {
    category: 'Commands',
    syntax: 'pasteText("//textarea", "hello world")',
    supportsDelay: true,
    fields: [
      { key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//textarea' },
      { key: 'text', label: 'Text', type: 'textarea', required: true, placeholder: 'hello world' },
    ],
  },
  moveMouse: {
    category: 'Commands',
    syntax: 'moveMouse("//button")',
    supportsDelay: true,
    fields: [{ key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//button' }],
  },
  scroll: {
    category: 'Commands',
    syntax: 'scroll(600)',
    supportsDelay: true,
    fields: [{ key: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '600' }],
  },
  js: {
    category: 'Commands',
    syntax: 'js("document.title")',
    supportsDelay: true,
    fields: [{ key: 'script', label: 'Script', type: 'code', required: true, placeholder: 'document.title' }],
  },
  fileUpload: {
    category: 'Commands',
    syntax: 'fileUpload("C:\\Temp\\upload.png", "//input[@type=\'file\']")',
    supportsDelay: true,
    fields: [
      { key: 'filePath', label: 'File Path', type: 'string', required: true, placeholder: 'C:\\Temp\\upload.png' },
      { key: 'xpath', label: 'XPath', type: 'selector', required: true, placeholder: '//input[@type="file"]' },
    ],
  },
  info: { category: 'Commands', syntax: 'info()', supportsDelay: true, fields: [] },
  httpRequest: {
    category: 'Commands',
    syntax: 'httpRequest("https://api.example.com", POST, {}, {"ok":true})',
    supportsDelay: true,
    fields: [
      { key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://api.example.com' },
      { key: 'method', label: 'Method', type: 'select', required: true, options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], defaultValue: 'GET' },
      { key: 'headersJson', label: 'Headers JSON', type: 'json', placeholder: '{"Content-Type":"application/json"}', defaultValue: '{}' },
      { key: 'body', label: 'Body', type: 'code', placeholder: '{"ok":true}' },
    ],
  },
  httpDownload: {
    category: 'Commands',
    syntax: 'httpDownload("https://example.com/file.zip", "C:\\Temp\\file.zip")',
    supportsDelay: true,
    fields: [
      { key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://example.com/file.zip' },
      { key: 'savePath', label: 'Save Path', type: 'string', required: true, placeholder: 'C:\\Temp\\file.zip' },
    ],
  },
  fileWriteAllText: {
    category: 'Commands',
    syntax: 'fileWriteAllText("C:\\Temp\\note.txt", "hello world")',
    supportsDelay: true,
    fields: [
      { key: 'filePath', label: 'File Path', type: 'string', required: true, placeholder: 'C:\\Temp\\note.txt' },
      { key: 'text', label: 'Text', type: 'code', required: true, placeholder: 'hello world' },
    ],
  },
  fileAppendText: {
    category: 'Commands',
    syntax: 'fileAppendText("C:\\Temp\\note.txt", "hello world")',
    supportsDelay: true,
    fields: [
      { key: 'filePath', label: 'File Path', type: 'string', required: true, placeholder: 'C:\\Temp\\note.txt' },
      { key: 'text', label: 'Text', type: 'code', required: true, placeholder: 'hello world' },
    ],
  },
  sendKey: {
    category: 'Commands',
    syntax: 'sendKey("Escape")',
    supportsDelay: true,
    fields: [{ key: 'keys', label: 'Keys', type: 'textarea', required: true, placeholder: 'Escape or Control\nShift\nA' }],
  },
  exit: {
    category: 'Commands',
    syntax: 'exit("Stop flow")',
    supportsDelay: false,
    fields: [{ key: 'message', label: 'Message', type: 'string', placeholder: 'Optional exit reason' }],
  },
  writeExcel: {
    category: 'Commands',
    syntax: 'writeExcel("C:\\Temp\\data.xlsx", A, 2, "done")',
    supportsDelay: true,
    fields: [
      { key: 'filePath', label: 'File Path', type: 'string', required: true, placeholder: 'C:\\Temp\\data.xlsx' },
      { key: 'columnName', label: 'Column', type: 'string', required: true, placeholder: 'A' },
      { key: 'rowIndex', label: 'Row Index', type: 'number', required: true, placeholder: '2' },
      { key: 'text', label: 'Value', type: 'code', required: true, placeholder: 'done' },
    ],
  },
  delay: {
    category: 'Commands',
    syntax: 'delay(1000, 3000)',
    supportsDelay: false,
    fields: [
      { key: 'minMs', label: 'Min Ms', type: 'number', required: true, defaultValue: 1000, placeholder: '1000' },
      { key: 'maxMs', label: 'Max Ms', type: 'number', placeholder: '3000' },
    ],
  },
  log: {
    category: 'Commands',
    syntax: 'log("Start job")',
    supportsDelay: true,
    fields: [{ key: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Start job' }],
  },
  help: { category: 'Commands', syntax: 'help()', supportsDelay: false, fields: [] },
};

function stripTrailingDelay(args: string[]): { args: string[]; appendRandomDelay: boolean; delayMinMs: number; delayMaxMs: number } {
  const nextArgs = [...args];
  const last = nextArgs[nextArgs.length - 1]?.trim() ?? '';
  const withValues = last.match(/^rdelay\(\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (withValues) {
    nextArgs.pop();
    return {
      args: nextArgs,
      appendRandomDelay: true,
      delayMinMs: Number(withValues[1]),
      delayMaxMs: Number(withValues[2]),
    };
  }
  if (/^rdelay(?:\(\))?$/i.test(last)) {
    nextArgs.pop();
    return { args: nextArgs, appendRandomDelay: true, delayMinMs: 1000, delayMaxMs: 2000 };
  }
  return { args: nextArgs, appendRandomDelay: false, delayMinMs: 1000, delayMaxMs: 2000 };
}

function valueAsString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return '';
}

function buildDefaultData(fields: NodeFieldDefinition[]): Record<string, unknown> {
  const data: Record<string, unknown> = { useRawSource: false };
  for (const field of fields) {
    if (field.defaultValue !== undefined) data[field.key] = field.defaultValue;
    else if (field.type === 'boolean') data[field.key] = false;
    else data[field.key] = '';
  }
  return data;
}

function commandSummary(name: string, data: Record<string, unknown>): string {
  switch (name) {
    case 'goto':
    case 'httpRequest':
    case 'httpDownload':
      return valueAsString(data.url);
    case 'waitElement':
    case 'click':
    case 'typeText':
    case 'pasteText':
    case 'moveMouse':
    case 'getElementText':
    case 'getElementAttribute':
    case 'countElement':
    case 'fileUpload':
      return valueAsString(data.xpath);
    case 'delay':
      return `${valueAsString(data.minMs)}-${valueAsString(data.maxMs || data.minMs)}ms`;
    case 'log':
      return valueAsString(data.message);
    case 'assignment':
      return `${valueAsString(data.name)} = ${valueAsString(data.value)}`;
    case 'sendKey':
      return valueAsString(data.keys).replace(/\s+/g, ' + ');
    default:
      return valueAsString(data.filePath || data.oldUrl || data.target || data.script || data.amount || data.message);
  }
}

function commandFieldsWithDelay(preset: FieldPreset): NodeFieldDefinition[] {
  return preset.supportsDelay ? [...preset.fields, ...COMMON_DELAY_FIELDS] : preset.fields;
}

function commandFromArgs(spec: FlowCommandSpec, args: string[]): Record<string, unknown> {
  const preset = COMMAND_FIELD_PRESETS[spec.name];
  const delay = stripTrailingDelay(args);
  const values = delay.args;
  const data = buildDefaultData(commandFieldsWithDelay(preset));
  switch (spec.name) {
    case 'goto':
    case 'newTab':
      data.url = values[0] ?? '';
      break;
    case 'activeTab':
      data.target = values[0] ?? '';
      break;
    case 'backNav':
      data.timeoutMs = values[0] ?? '';
      break;
    case 'waitUrlChange':
      data.oldUrl = values[0] ?? '';
      data.timeoutMs = values[1] ?? '';
      break;
    case 'waitLoad':
      data.settleMs = values[0] ?? '';
      break;
    case 'waitElement':
      data.xpath = values[0] ?? '';
      data.timeoutMs = values[1] ?? '';
      break;
    case 'getElementAttribute':
      data.xpath = values[0] ?? '';
      data.attributeName = values[1] ?? '';
      break;
    case 'getElementText':
    case 'countElement':
    case 'click':
    case 'moveMouse':
      data.xpath = values[0] ?? '';
      break;
    case 'typeText':
    case 'pasteText':
      data.xpath = values[0] ?? '';
      data.text = values.slice(1).join(', ');
      break;
    case 'scroll':
      data.amount = values[0] ?? '';
      break;
    case 'js':
      data.script = values[0] ?? '';
      break;
    case 'fileUpload':
      data.filePath = values[0] ?? '';
      data.xpath = values[1] ?? '';
      break;
    case 'httpRequest':
      data.url = values[0] ?? '';
      data.method = values[1] ?? 'GET';
      data.headersJson = values[2] ?? '{}';
      data.body = values[3] ?? '';
      break;
    case 'httpDownload':
      data.url = values[0] ?? '';
      data.savePath = values[1] ?? '';
      break;
    case 'fileWriteAllText':
    case 'fileAppendText':
      data.filePath = values[0] ?? '';
      data.text = values.slice(1).join(', ');
      break;
    case 'sendKey':
      data.keys = values.join('\n');
      break;
    case 'exit':
      data.message = values[0] ?? '';
      break;
    case 'writeExcel':
      data.filePath = values[0] ?? '';
      data.columnName = values[1] ?? '';
      data.rowIndex = values[2] ?? '';
      data.text = values[3] ?? '';
      break;
    case 'delay':
      data.minMs = values[0] ?? '';
      data.maxMs = values[1] ?? '';
      break;
    case 'log':
      data.message = values.join(', ');
      break;
    default:
      break;
  }
  if (preset.supportsDelay) {
    data.appendRandomDelay = delay.appendRandomDelay;
    data.delayMinMs = delay.delayMinMs;
    data.delayMaxMs = delay.delayMaxMs;
  }
  return data;
}

function commandToArgs(spec: FlowCommandSpec, data: Record<string, unknown>): string[] {
  const args: string[] = [];
  switch (spec.name) {
    case 'goto':
    case 'newTab':
      if (valueAsString(data.url)) args.push(valueAsString(data.url));
      break;
    case 'activeTab':
      args.push(valueAsString(data.target));
      break;
    case 'backNav':
      if (valueAsString(data.timeoutMs)) args.push(valueAsString(data.timeoutMs));
      break;
    case 'waitUrlChange':
      args.push(valueAsString(data.oldUrl));
      if (valueAsString(data.timeoutMs)) args.push(valueAsString(data.timeoutMs));
      break;
    case 'waitLoad':
      if (valueAsString(data.settleMs)) args.push(valueAsString(data.settleMs));
      break;
    case 'waitElement':
      args.push(valueAsString(data.xpath));
      if (valueAsString(data.timeoutMs)) args.push(valueAsString(data.timeoutMs));
      break;
    case 'getElementAttribute':
      args.push(valueAsString(data.xpath), valueAsString(data.attributeName));
      break;
    case 'getElementText':
    case 'countElement':
    case 'click':
    case 'moveMouse':
      args.push(valueAsString(data.xpath));
      break;
    case 'typeText':
    case 'pasteText':
      args.push(valueAsString(data.xpath), valueAsString(data.text));
      break;
    case 'scroll':
      args.push(valueAsString(data.amount));
      break;
    case 'js':
      args.push(valueAsString(data.script));
      break;
    case 'fileUpload':
      args.push(valueAsString(data.filePath), valueAsString(data.xpath));
      break;
    case 'httpRequest':
      args.push(valueAsString(data.url), valueAsString(data.method || 'GET'));
      if (valueAsString(data.headersJson)) args.push(valueAsString(data.headersJson));
      if (valueAsString(data.body)) args.push(valueAsString(data.body));
      break;
    case 'httpDownload':
      args.push(valueAsString(data.url), valueAsString(data.savePath));
      break;
    case 'fileWriteAllText':
    case 'fileAppendText':
      args.push(valueAsString(data.filePath), valueAsString(data.text));
      break;
    case 'sendKey': {
      const keys = valueAsString(data.keys)
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
      args.push(...keys);
      break;
    }
    case 'exit':
      if (valueAsString(data.message)) args.push(valueAsString(data.message));
      break;
    case 'writeExcel':
      args.push(valueAsString(data.filePath), valueAsString(data.columnName), valueAsString(data.rowIndex), valueAsString(data.text));
      break;
    case 'delay':
      args.push(valueAsString(data.minMs));
      if (valueAsString(data.maxMs)) args.push(valueAsString(data.maxMs));
      break;
    case 'log':
      args.push(valueAsString(data.message));
      break;
    default:
      break;
  }
  if (COMMAND_FIELD_PRESETS[spec.name]?.supportsDelay && data.appendRandomDelay === true) {
    const min = valueAsString(data.delayMinMs) || '1000';
    const max = valueAsString(data.delayMaxMs) || min;
    args.push(`rDelay(${min},${max})`);
  }
  return args;
}

function buildCommandDefinition(spec: FlowCommandSpec): RuntimeCommandDefinition {
  const preset = COMMAND_FIELD_PRESETS[spec.name];
  const fields = commandFieldsWithDelay(preset);
  return {
    type: `command.${spec.name}`,
    kind: 'command',
    label: spec.name,
    description: spec.desc,
    category: preset.category,
    syntax: preset.syntax,
    docsSource: DOCS_SOURCE,
    aliases: spec.aliases,
    supportsDelay: preset.supportsDelay,
    nextHandle: spec.name !== 'exit',
    defaultData: {
      ...buildDefaultData(fields),
      commandName: spec.name,
      commandAliases: spec.aliases,
    },
    fields,
    summary: (data) => commandSummary(spec.name, data),
    fromArgs: (args) => commandFromArgs(spec, args),
    toArgs: (data) => commandToArgs(spec, data),
  };
}

export const COMMAND_DEFINITIONS: RuntimeCommandDefinition[] = FLOW_COMMAND_SPECS.map(buildCommandDefinition);

export const BLOCK_DEFINITIONS: RuntimeBlockDefinition[] = [
  {
    type: 'block.if',
    kind: 'block',
    label: 'if',
    description: 'Conditional block with true/false branches.',
    category: 'Blocks',
    syntax: 'if hasElement("//h1")',
    docsSource: DOCS_SOURCE,
    defaultData: { condition: 'true', nextId: '', trueId: '', falseId: '', useRawSource: false },
    fields: [{ key: 'condition', label: 'Condition', type: 'expression', required: true, defaultValue: 'true' }],
    handles: ['true', 'false'],
    nextHandle: true,
    summary: (data) => valueAsString(data.condition),
  },
  {
    type: 'block.while',
    kind: 'block',
    label: 'while',
    description: 'While loop.',
    category: 'Blocks',
    syntax: 'while n < 3',
    docsSource: DOCS_SOURCE,
    defaultData: { condition: 'true', nextId: '', bodyId: '', useRawSource: false },
    fields: [{ key: 'condition', label: 'Condition', type: 'expression', required: true, defaultValue: 'true' }],
    handles: ['body'],
    nextHandle: true,
    summary: (data) => valueAsString(data.condition),
  },
  {
    type: 'block.for',
    kind: 'block',
    label: 'for',
    description: 'For loop.',
    category: 'Blocks',
    syntax: 'for i = 0; i < 3; i = i + 1',
    docsSource: DOCS_SOURCE,
    defaultData: { init: 'i = 0', condition: 'i < 3', update: 'i = i + 1', nextId: '', bodyId: '', useRawSource: false },
    fields: [
      { key: 'init', label: 'Init', type: 'expression', required: true, defaultValue: 'i = 0' },
      { key: 'condition', label: 'Condition', type: 'expression', required: true, defaultValue: 'i < 3' },
      { key: 'update', label: 'Update', type: 'expression', required: true, defaultValue: 'i = i + 1' },
    ],
    handles: ['body'],
    nextHandle: true,
    summary: (data) => `${valueAsString(data.init)}; ${valueAsString(data.condition)}; ${valueAsString(data.update)}`,
  },
  {
    type: 'variable.input',
    kind: 'variable',
    label: 'input',
    description: 'Script input definition shown in the canvas.',
    category: 'Variables',
    syntax: 'name: input = ""',
    docsSource: DOCS_SOURCE,
    defaultData: { variableId: '', name: 'input_1', inputType: 'input', defaultValue: '', options: [], description: '', nextId: '', useRawSource: false },
    fields: [
      { key: 'name', label: 'Name', type: 'variable', required: true, placeholder: 'startUrl' },
      { key: 'inputType', label: 'Type', type: 'select', required: true, options: ['input', 'text', 'number', 'file', 'folder', 'checkbox', 'comboBox', 'inputExcelFile'], defaultValue: 'input' },
      { key: 'defaultValue', label: 'Default', type: 'textarea', placeholder: 'Default value' },
      { key: 'options', label: 'Options', type: 'textarea', placeholder: 'Option1\nOption2' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional helper text' },
    ],
    nextHandle: true,
    summary: (data) => `${String(data.name ?? '')}: ${String(data.inputType ?? 'input')}`,
  },
  {
    type: 'variable.assignment',
    kind: 'variable',
    label: 'assignment',
    description: 'Variable assignment.',
    category: 'Variables',
    syntax: 'set name = value',
    docsSource: DOCS_SOURCE,
    defaultData: { name: 'value', value: '""', assignmentStyle: 'set', nextId: '', useRawSource: false },
    fields: [
      { key: 'assignmentStyle', label: 'Style', type: 'select', required: true, options: ['set', 'plain'], defaultValue: 'set' },
      { key: 'name', label: 'Variable', type: 'variable', required: true, placeholder: 'username' },
      { key: 'value', label: 'Value', type: 'expression', required: true, placeholder: '"sample"' },
    ],
    nextHandle: true,
    summary: (data) => `${valueAsString(data.name)} = ${valueAsString(data.value)}`,
  },
  {
    type: 'block.nextLoop',
    kind: 'block',
    label: 'nextLoop',
    description: 'Continue current loop.',
    category: 'Blocks',
    syntax: 'nextLoop',
    docsSource: DOCS_SOURCE,
    defaultData: { control: 'next', useRawSource: false },
    fields: [],
    nextHandle: false,
    summary: () => 'Continue loop',
  },
  {
    type: 'block.exitLoop',
    kind: 'block',
    label: 'exitLoop',
    description: 'Break current loop.',
    category: 'Blocks',
    syntax: 'exitLoop',
    docsSource: DOCS_SOURCE,
    defaultData: { control: 'exit', useRawSource: false },
    fields: [],
    nextHandle: false,
    summary: () => 'Break loop',
  },
  {
    type: 'meta.comment',
    kind: 'meta',
    label: 'comment',
    description: 'Standalone source comment.',
    category: 'Meta',
    syntax: '# note',
    docsSource: DOCS_SOURCE,
    defaultData: { text: 'note', style: '#', nextId: '', useRawSource: false },
    fields: [
      { key: 'style', label: 'Style', type: 'select', options: ['#', '//'], defaultValue: '#' },
      { key: 'text', label: 'Text', type: 'textarea', required: true, placeholder: 'note' },
    ],
    nextHandle: true,
    summary: (data) => valueAsString(data.text),
  },
  {
    type: 'raw.command',
    kind: 'raw',
    label: 'raw command',
    description: 'Round-trip unknown or manual command source.',
    category: 'Raw',
    syntax: 'customCommand("x")',
    docsSource: DOCS_SOURCE,
    defaultData: { source: '', nextId: '', useRawSource: true },
    fields: [{ key: 'source', label: 'Raw Source', type: 'code', required: true, placeholder: 'customCommand("x")' }],
    nextHandle: true,
    summary: (data) => valueAsString(data.source),
  },
  {
    type: 'raw.block',
    kind: 'raw',
    label: 'raw block',
    description: 'Round-trip raw control-flow source.',
    category: 'Raw',
    syntax: 'if something',
    docsSource: DOCS_SOURCE,
    defaultData: { source: '', nextId: '', useRawSource: true },
    fields: [{ key: 'source', label: 'Raw Source', type: 'code', required: true, placeholder: 'if something' }],
    nextHandle: true,
    summary: (data) => valueAsString(data.source),
  },
  {
    type: 'meta.entry.before',
    kind: 'meta',
    label: 'before()',
    description: 'Before-run entry block.',
    category: 'Meta',
    syntax: 'before() { ... }',
    docsSource: DOCS_SOURCE,
    defaultData: { blockName: 'beforeRunProfile', nextId: '', locked: true },
    fields: [],
    nextHandle: true,
    summary: () => 'Before run profile',
  },
  {
    type: 'meta.entry.running',
    kind: 'meta',
    label: 'running()',
    description: 'Main run entry block.',
    category: 'Meta',
    syntax: 'running() { ... }',
    docsSource: DOCS_SOURCE,
    defaultData: { blockName: 'main', nextId: '', locked: true },
    fields: [],
    nextHandle: true,
    summary: () => 'Main workflow',
  },
  {
    type: 'meta.entry.after',
    kind: 'meta',
    label: 'after()',
    description: 'After-kill entry block.',
    category: 'Meta',
    syntax: 'after() { ... }',
    docsSource: DOCS_SOURCE,
    defaultData: { blockName: 'afterKillProfile', nextId: '', locked: true },
    fields: [],
    nextHandle: true,
    summary: () => 'After kill profile',
  },
  {
    type: 'raw.unknown',
    kind: 'raw',
    label: 'unknown',
    description: 'Unknown source fallback.',
    category: 'Raw',
    syntax: 'unknown',
    docsSource: DOCS_SOURCE,
    defaultData: { source: '', nextId: '', useRawSource: true },
    fields: [{ key: 'source', label: 'Raw Source', type: 'code', required: true, placeholder: 'source' }],
    nextHandle: true,
    summary: (data) => valueAsString(data.source),
  },
];

export const EXPRESSION_FUNCTIONS: FlowFunctionSpec[] = FLOW_FUNCTION_SPECS;

export const VARIABLE_SYNTAXES = [
  '${name}',
  '${expression}',
  '${inputExcelFile[B]}',
  'set name = value',
  'name = value',
  'a = b',
  'parts[0]',
  'inputExcelFile("B")',
  'log("value=${name}")',
];

export const ALL_NODE_DEFINITIONS = [...COMMAND_DEFINITIONS, ...BLOCK_DEFINITIONS];

export const NODE_DEFINITION_MAP = new Map(ALL_NODE_DEFINITIONS.map((item) => [item.type, item]));

export const COMMAND_DEFINITION_BY_NAME = new Map(
  COMMAND_DEFINITIONS.flatMap((item) => {
    const normalized = normalizeFlowCommandName(item.label);
    const entries: Array<[string, RuntimeCommandDefinition]> = [[normalized.toLowerCase(), item]];
    for (const alias of item.aliases ?? []) entries.push([alias.toLowerCase(), item]);
    return entries;
  }),
);

export function getNodeDefinition(type: string): RuntimeCommandDefinition | RuntimeBlockDefinition | undefined {
  return NODE_DEFINITION_MAP.get(type);
}

export function getCommandDefinitionByName(name: string): RuntimeCommandDefinition | undefined {
  return COMMAND_DEFINITION_BY_NAME.get(name.toLowerCase());
}

export const PALETTE_GROUPS = [
  { id: 'Commands', title: 'Commands' },
  { id: 'Blocks', title: 'Blocks' },
  { id: 'Variables', title: 'Variables' },
  { id: 'Raw', title: 'Raw' },
  { id: 'Meta', title: 'Meta' },
];
