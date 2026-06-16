import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { AppError } from '../../utils/errors.js';
import type { WorkflowContext, WorkflowScript } from '../types.js';
import { parseFlowProgram } from './parser.js';
import type { FlowBinaryOperator, FlowBlockName, FlowExpression, FlowInputValue, FlowProgram, FlowStatement, FlowValue } from './types.js';

const DEFAULT_WAIT_TIMEOUT_MS = 10000;
const MAX_LOOP_ITERATIONS = 10000;

const ALL_COMMANDS = [
  { name: 'nav', aliases: ['goto'], desc: 'Navigate to URL' },
  { name: 'navurl', aliases: [], desc: 'Navigate to URL' },
  { name: 'newtab', aliases: [], desc: 'Open and activate a new tab, optionally with URL' },
  { name: 'closetab', aliases: [], desc: 'Close active tab' },
  { name: 'activetab', aliases: [], desc: 'Activate tab by zero-based index or context id' },
  { name: 'backnav', aliases: [], desc: 'Navigate browser history back' },
  { name: 'reloadnav', aliases: [], desc: 'Reload current page' },
  { name: 'geturl', aliases: [], desc: 'Store current URL in pageUrl' },
  { name: 'waiturlchange', aliases: [], desc: 'Wait until URL differs from given URL' },
  { name: 'waitload', aliases: [], desc: 'Wait for page load (2s settle + readyState)' },
  { name: 'waitelement', aliases: ['waitxpath'], desc: 'Wait for XPath match (default 10s)' },
  { name: 'getelementattribute', aliases: [], desc: 'Store XPath attribute in elementAttribute' },
  { name: 'getelementtext', aliases: [], desc: 'Store XPath text in elementText' },
  { name: 'countelement', aliases: [], desc: 'Store XPath match count in elementCount' },
  { name: 'click', aliases: [], desc: 'Click element by XPath' },
  { name: 'typetext', aliases: ['type'], desc: 'Type text into element' },
  { name: 'pastetext', aliases: [], desc: 'Paste text via clipboard' },
  { name: 'movemouse', aliases: [], desc: 'Move mouse to XPath element' },
  { name: 'scroll', aliases: [], desc: 'Scroll page by pixels' },
  { name: 'executejs', aliases: ['executeJS', 'js'], desc: 'Execute JavaScript and store result in jsResult' },
  { name: 'fileupload', aliases: [], desc: 'Upload file into input[type=file] XPath when supported' },
  { name: 'info', aliases: [], desc: 'Log page title and URL' },
  { name: 'httprequest', aliases: [], desc: 'Run HTTP request and store httpStatus/httpHeaders/httpBody/httpUrl' },
  { name: 'httpdownload', aliases: [], desc: 'Download URL to file and store downloadPath/downloadBytes' },
  { name: 'delay', aliases: ['sleep'], desc: 'Sleep N ms (or N-M for random range)' },
  { name: 'log', aliases: [], desc: 'Log message' },
  { name: 'help', aliases: [], desc: 'Show available commands' },
];
const PAGE_COMMANDS = new Set([
  'nav', 'goto', 'navurl', 'newtab', 'closetab', 'activetab', 'backnav', 'reloadnav', 'geturl', 'waiturlchange',
  'waitload', 'waitelement', 'waitxpath', 'getelementattribute', 'getelementtext', 'countelement', 'click', 'typetext',
  'type', 'pastetext', 'movemouse', 'scroll', 'executejs', 'executeJS', 'js', 'fileupload', 'info',
].map((item) => item.toLowerCase()));
const ALL_FUNCTIONS = [
  { name: 'hasElement', aliases: ['existsXPath'], desc: 'Check XPath exists' },
];
const PAGE_FUNCTIONS = new Set(ALL_FUNCTIONS.flatMap((f) => [f.name.toLowerCase(), ...f.aliases.map((a) => a.toLowerCase())]));
const COMMAND_LIST = ALL_COMMANDS.map((c) => `  ${c.name}${c.aliases.length ? ` (${c.aliases.join('/')})` : ''} — ${c.desc}`).join('\n');
const FUNCTION_LIST = ALL_FUNCTIONS.map((f) => `  ${f.name}${f.aliases.length ? ` (${f.aliases.join('/')})` : ''} — ${f.desc}`).join('\n');

type FlowExecutionContext = Partial<WorkflowContext> & {
  log: (...args: unknown[]) => void;
  sleep: (ms: number) => Promise<void>;
  inputs: Record<string, FlowInputValue>;
  args: Record<string, string>;
};

type FlowRuntime = {
  locals: Record<string, FlowValue>;
  loopIndexStack: number[];
};

type LoopSignal = 'next' | 'exit';

export async function loadFlowProgram(filePath: string): Promise<FlowProgram> {
  const source = await readFile(filePath, 'utf8');
  return parseFlowProgram(source);
}

export async function loadFlowScript(filePath: string): Promise<WorkflowScript> {
  const program = await loadFlowProgram(filePath);
  return (ctx) => executeFlowBlock(ctx, program, 'main');
}

export async function executeFlowBlock(ctx: FlowExecutionContext, program: FlowProgram, block: FlowBlockName): Promise<void> {
  const statements = program[block];
  validateStatementsForBlock(statements, block);
  const signal = await executeFlowStatements(ctx, statements, { locals: {}, loopIndexStack: [] });
  if (signal) throw new AppError(`${signal === 'next' ? 'nextLoop' : 'exitLoop'} used outside a loop.`);
}

async function executeFlowStatements(ctx: FlowExecutionContext, statements: FlowStatement[], runtime: FlowRuntime): Promise<LoopSignal | undefined> {
  for (const statement of statements) {
    ctx.log(`flow:${statement.lineNumber}`, statement.raw.trim());
    const signal = await executeFlowStatement(ctx, statement, runtime);
    if (signal) return signal;
  }
  return undefined;
}

async function executeFlowStatement(ctx: FlowExecutionContext, statement: FlowStatement, runtime: FlowRuntime): Promise<LoopSignal | undefined> {
  switch (statement.type) {
    case 'command':
      await executeFlowCommand(ctx, interpolateCommand(statement, valuesForInterpolation(ctx, runtime)), runtime);
      return undefined;

    case 'assignment':
      runtime.locals[statement.name] = await evaluateExpression(ctx, statement.value, runtime, statement);
      return undefined;

    case 'loopControl':
      if (runtime.loopIndexStack.length === 0) throw lineError(statement, `${statement.control === 'next' ? 'nextLoop' : 'exitLoop'} can only be used inside a loop.`);
      return statement.control;

    case 'if':
      for (const branch of statement.branches) {
        if (isTruthy(await evaluateExpression(ctx, branch.condition, runtime, statement))) {
          return executeFlowStatements(ctx, branch.body, runtime);
        }
      }
      if (statement.elseBody) return executeFlowStatements(ctx, statement.elseBody, runtime);
      return undefined;

    case 'while': {
      let iterations = 0;
      while (isTruthy(await evaluateExpression(ctx, statement.condition, runtime, statement))) {
        if (iterations >= MAX_LOOP_ITERATIONS) throw lineError(statement, `while exceeded ${MAX_LOOP_ITERATIONS} iterations.`);
        runtime.loopIndexStack.push(iterations);
        let signal: LoopSignal | undefined;
        try {
          signal = await executeFlowStatements(ctx, statement.body, runtime);
        } finally {
          runtime.loopIndexStack.pop();
        }
        iterations += 1;
        if (signal === 'exit') return undefined;
        if (signal === 'next') continue;
      }
      return undefined;
    }

    case 'for': {
      await executeFlowStatement(ctx, statement.init, runtime);
      let iterations = 0;
      while (isTruthy(await evaluateExpression(ctx, statement.condition, runtime, statement))) {
        if (iterations >= MAX_LOOP_ITERATIONS) throw lineError(statement, `for exceeded ${MAX_LOOP_ITERATIONS} iterations.`);
        runtime.loopIndexStack.push(iterations);
        let signal: LoopSignal | undefined;
        try {
          signal = await executeFlowStatements(ctx, statement.body, runtime);
        } finally {
          runtime.loopIndexStack.pop();
        }
        if (signal === 'exit') return undefined;
        await executeFlowStatement(ctx, statement.update, runtime);
        iterations += 1;
        if (signal === 'next') continue;
      }
      return undefined;
    }
  }
}

async function executeFlowCommand(ctx: FlowExecutionContext, item: Extract<FlowStatement, { type: 'command' }>, runtime: FlowRuntime): Promise<void> {
  const command = item.command.toLowerCase();

  switch (command) {
    case 'nav':
    case 'goto':
    case 'navurl': {
      const [url] = requireArgs(item, 1);
      await requirePage(ctx, item).goto(url);
      return;
    }

    case 'newtab': {
      const [url] = requireArgs(item, 0, 1);
      await requirePage(ctx, item).newTab(url);
      return;
    }

    case 'closetab': {
      requireArgs(item, 0);
      await requirePage(ctx, item).closeTab();
      return;
    }

    case 'activetab': {
      const [target] = requireArgs(item, 1);
      await requirePage(ctx, item).activeTab(target);
      return;
    }

    case 'backnav': {
      const [timeout] = requireArgs(item, 0, 1);
      await requirePage(ctx, item).backNav(parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, item));
      return;
    }

    case 'reloadnav': {
      requireArgs(item, 0);
      await requirePage(ctx, item).reloadNav();
      return;
    }

    case 'geturl': {
      requireArgs(item, 0);
      runtime.locals.pageUrl = await requirePage(ctx, item).getUrl();
      ctx.log(`pageUrl=${runtime.locals.pageUrl}`);
      return;
    }

    case 'waiturlchange': {
      const [url, timeout] = requireArgs(item, 1, 2);
      runtime.locals.pageUrl = await requirePage(ctx, item).waitUrlChange(url, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, item));
      ctx.log(`pageUrl=${runtime.locals.pageUrl}`);
      return;
    }

    case 'waitload': {
      const [settleMs] = requireArgs(item, 0, 1);
      const settle = settleMs === undefined ? 2000 : parseNumber(settleMs, item);
      if (settle > 0) await ctx.sleep(settle);
      await requirePage(ctx, item).waitForLoad();
      return;
    }

    case 'waitelement':
    case 'waitxpath': {
      const [xpath, timeout] = requireArgs(item, 1, 2);
      await requirePage(ctx, item).waitForXPath(xpath, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, item));
      return;
    }

    case 'getelementattribute': {
      const [xpath, attribute] = requireArgs(item, 2);
      runtime.locals.elementAttribute = await requirePage(ctx, item).getElementAttribute(xpath, attribute);
      ctx.log(`elementAttribute=${runtime.locals.elementAttribute}`);
      return;
    }

    case 'getelementtext': {
      const [xpath] = requireArgs(item, 1);
      runtime.locals.elementText = await requirePage(ctx, item).getElementText(xpath);
      ctx.log(`elementText=${runtime.locals.elementText}`);
      return;
    }

    case 'countelement': {
      const [xpath] = requireArgs(item, 1);
      runtime.locals.elementCount = await requirePage(ctx, item).countElement(xpath);
      ctx.log(`elementCount=${runtime.locals.elementCount}`);
      return;
    }

    case 'click': {
      const [xpath] = requireArgs(item, 1);
      await requirePage(ctx, item).clickXPath(xpath);
      return;
    }

    case 'type':
    case 'typetext': {
      const [xpath, ...textParts] = requireArgs(item, 2);
      await requirePage(ctx, item).typeTextXPath(xpath, textParts.join(' '));
      return;
    }

    case 'pastetext': {
      const [xpath, ...textParts] = requireArgs(item, 2);
      await requirePage(ctx, item).pasteTextXPath(xpath, textParts.join(' '));
      return;
    }

    case 'movemouse': {
      const [xpath] = requireArgs(item, 1);
      await requirePage(ctx, item).moveMouseXPath(xpath);
      return;
    }

    case 'scroll': {
      const [px] = requireArgs(item, 1);
      await requirePage(ctx, item).scroll(parseNumber(px, item));
      return;
    }

    case 'executejs':
    case 'js': {
      const [script] = requireArgs(item, 1);
      runtime.locals.jsResult = toFlowValue(await requirePage(ctx, item).executeJs(script));
      ctx.log(`jsResult=${String(runtime.locals.jsResult)}`);
      return;
    }

    case 'fileupload': {
      const [filePath, xpath] = requireArgs(item, 2);
      await requirePage(ctx, item).fileUpload(filePath, xpath);
      return;
    }

    case 'httprequest': {
      await executeHttpRequest(item, runtime);
      ctx.log(`httpStatus=${runtime.locals.httpStatus}`);
      return;
    }

    case 'httpdownload': {
      await executeHttpDownload(item, runtime);
      ctx.log(`downloadPath=${runtime.locals.downloadPath} downloadBytes=${runtime.locals.downloadBytes}`);
      return;
    }

    case 'delay':
    case 'sleep': {
      const [min, max] = requireArgs(item, 1, 2);
      const minMs = parseNumber(min, item);
      const maxMs = max === undefined ? minMs : parseNumber(max, item);
      if (maxMs < minMs) throw lineError(item, `delay max (${maxMs}) must be >= min (${minMs}).`);
      const ms = maxMs === minMs ? minMs : minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
      if (maxMs > minMs) ctx.log(`sleep ${ms}ms (random ${minMs}-${maxMs})`);
      await ctx.sleep(ms);
      return;
    }

    case 'log': {
      requireArgs(item, 1);
      const interpolated = interpolateCommand(item, valuesForInterpolation(ctx, runtime));
      ctx.log(interpolated.args.join(' '));
      return;
    }

    case 'info': {
      requireArgs(item, 0);
      const info = await requirePage(ctx, item).info();
      ctx.log(`${info.title} ${info.url}`);
      return;
    }

    case 'help': {
      ctx.log('Available commands:');
      ctx.log(COMMAND_LIST);
      ctx.log('Available functions:');
      ctx.log(FUNCTION_LIST);
      return;
    }

    default:
      throw lineError(item, `unknown command "${item.command}". Available commands:\n${COMMAND_LIST}`);
  }
}

async function executeHttpRequest(item: Extract<FlowStatement, { type: 'command' }>, runtime: FlowRuntime): Promise<void> {
  const [url, method, headersText, ...bodyParts] = requireArgs(item, 2);
  const headers = parseHeaders(headersText, item);
  const body = bodyParts.length ? bodyParts.join(' ') : undefined;
  const response = await fetch(url, { method: method.toUpperCase(), headers, body });
  const headerRecord: Record<string, string> = {};
  response.headers.forEach((value, key) => { headerRecord[key] = value; });
  runtime.locals.httpStatus = response.status;
  runtime.locals.httpHeaders = JSON.stringify(headerRecord);
  runtime.locals.httpBody = await response.text();
  runtime.locals.httpUrl = response.url;
}

async function executeHttpDownload(item: Extract<FlowStatement, { type: 'command' }>, runtime: FlowRuntime): Promise<void> {
  const [url, savePath] = requireArgs(item, 2);
  const response = await fetch(url);
  if (!response.ok) throw lineError(item, `download failed: HTTP ${response.status} ${response.statusText}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const outputPath = resolve(savePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);
  runtime.locals.downloadPath = outputPath;
  runtime.locals.downloadBytes = bytes.byteLength;
}

function parseHeaders(value: string | undefined, item: { lineNumber: number; raw: string }): Record<string, string> | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('headers must be an object');
    const headers: Record<string, string> = {};
    for (const [key, itemValue] of Object.entries(parsed)) headers[key] = String(itemValue);
    return headers;
  } catch (error) {
    throw lineError(item, `invalid headers JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function evaluateExpression(ctx: FlowExecutionContext, expression: FlowExpression, runtime: FlowRuntime, item: { lineNumber: number; raw: string }): Promise<FlowValue> {
  switch (expression.type) {
    case 'literal':
      return expression.value;

    case 'variable': {
      if (expression.name === 'loopIndex') return runtime.loopIndexStack[runtime.loopIndexStack.length - 1] ?? -1;
      if (expression.name in runtime.locals) return runtime.locals[expression.name] ?? null;
      if (expression.name in ctx.inputs) return ctx.inputs[expression.name] ?? null;
      const available = [...Object.keys(ctx.inputs), ...Object.keys(runtime.locals), 'loopIndex'].join(', ');
      throw lineError(item, `unknown variable "${expression.name}". Available: ${available || '(none)'}`);
    }

    case 'unary': {
      const value = await evaluateExpression(ctx, expression.argument, runtime, item);
      if (expression.operator === '!') return !isTruthy(value);
      return -toNumber(value, item);
    }

    case 'binary': {
      if (expression.operator === '&&') {
        const left = await evaluateExpression(ctx, expression.left, runtime, item);
        return isTruthy(left) && isTruthy(await evaluateExpression(ctx, expression.right, runtime, item));
      }
      if (expression.operator === '||') {
        const left = await evaluateExpression(ctx, expression.left, runtime, item);
        return isTruthy(left) || isTruthy(await evaluateExpression(ctx, expression.right, runtime, item));
      }
      const left = await evaluateExpression(ctx, expression.left, runtime, item);
      const right = await evaluateExpression(ctx, expression.right, runtime, item);
      return evaluateBinary(expression.operator, left, right, item);
    }

    case 'call': {
      const name = expression.name.toLowerCase();
      const args = [];
      for (const arg of expression.args) args.push(await evaluateExpression(ctx, arg, runtime, item));
      if (name === 'haselement' || name === 'existsxpath') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).existsXPath(String(args[0] ?? ''));
      }
      throw lineError(item, `unknown function "${expression.name}". Available functions:\n${FUNCTION_LIST}`);
    }
  }
}

function evaluateBinary(operator: FlowBinaryOperator, left: FlowValue, right: FlowValue, item: { lineNumber: number; raw: string }): FlowValue {
  switch (operator) {
    case '+':
      if (typeof left === 'string' || typeof right === 'string') return String(left ?? '') + String(right ?? '');
      return toNumber(left, item) + toNumber(right, item);
    case '-': return toNumber(left, item) - toNumber(right, item);
    case '*': return toNumber(left, item) * toNumber(right, item);
    case '/': return toNumber(left, item) / toNumber(right, item);
    case '%': return toNumber(left, item) % toNumber(right, item);
    case '==': return left === right;
    case '!=': return left !== right;
    case '<': return toNumber(left, item) < toNumber(right, item);
    case '<=': return toNumber(left, item) <= toNumber(right, item);
    case '>': return toNumber(left, item) > toNumber(right, item);
    case '>=': return toNumber(left, item) >= toNumber(right, item);
    case '&&':
    case '||': return false;
  }
  throw lineError(item, `unknown operator "${operator}".`);
}

function validateStatementsForBlock(statements: FlowStatement[], block: FlowBlockName): void {
  for (const statement of statements) validateStatementForBlock(statement, block);
}

function validateStatementForBlock(statement: FlowStatement, block: FlowBlockName): void {
  if (block === 'main') return;
  if (statement.type === 'command') {
    const command = statement.command.toLowerCase();
    if (command !== 'log' && PAGE_COMMANDS.has(command)) {
      throw lineError(statement, `${statement.command} can only be used inside run profile block.`);
    }
  }
  if (statement.type === 'if') {
    for (const branch of statement.branches) {
      validateExpressionForBlock(branch.condition, block, statement);
      validateStatementsForBlock(branch.body, block);
    }
    if (statement.elseBody) validateStatementsForBlock(statement.elseBody, block);
  } else if (statement.type === 'while') {
    validateExpressionForBlock(statement.condition, block, statement);
    validateStatementsForBlock(statement.body, block);
  } else if (statement.type === 'for') {
    validateExpressionForBlock(statement.init.value, block, statement);
    validateExpressionForBlock(statement.condition, block, statement);
    validateExpressionForBlock(statement.update.value, block, statement);
    validateStatementsForBlock(statement.body, block);
  } else if (statement.type === 'assignment') {
    validateExpressionForBlock(statement.value, block, statement);
  }
}

function validateExpressionForBlock(expression: FlowExpression, block: FlowBlockName, item: { lineNumber: number; raw: string }): void {
  if (block === 'main') return;
  if (expression.type === 'call') {
    const name = expression.name.toLowerCase();
    if (name !== 'log' && PAGE_FUNCTIONS.has(name)) throw lineError(item, `${expression.name} can only be used inside run profile block.`);
  }
  if (expression.type === 'unary') validateExpressionForBlock(expression.argument, block, item);
  if (expression.type === 'binary') {
    validateExpressionForBlock(expression.left, block, item);
    validateExpressionForBlock(expression.right, block, item);
  }
  if (expression.type === 'call') {
    for (const arg of expression.args) validateExpressionForBlock(arg, block, item);
  }
}

function valuesForInterpolation(ctx: FlowExecutionContext, runtime: FlowRuntime): Record<string, FlowInputValue> {
  const values: Record<string, FlowInputValue> = { ...ctx.inputs };
  for (const [key, value] of Object.entries(runtime.locals)) {
    if (value !== null) values[key] = value;
  }
  values.loopIndex = runtime.loopIndexStack[runtime.loopIndexStack.length - 1] ?? -1;
  return values;
}

function interpolateCommand(command: Extract<FlowStatement, { type: 'command' }>, values: Record<string, FlowInputValue>): Extract<FlowStatement, { type: 'command' }> {
  return {
    ...command,
    args: command.args.map((arg) => interpolate(arg, values, command)),
  };
}

function interpolate(value: string, values: Record<string, FlowInputValue>, item: { lineNumber: number; raw: string }): string {
  return value.replace(/\$\{([A-Za-z_][\w-]*)\}/g, (_match, name: string) => {
    if (!(name in values)) throw lineError(item, `unknown variable "${name}".`);
    return String(values[name]);
  });
}

function requirePage(ctx: FlowExecutionContext, item: { lineNumber: number; raw: string; command?: string }): WorkflowContext['page'] {
  if (!ctx.page) throw lineError(item, `${item.command ?? 'page function'} requires run profile block with an active page.`);
  return ctx.page;
}

function requireArgs(item: Extract<FlowStatement, { type: 'command' }>, min: number, max = Infinity): string[] {
  if (item.args.length < min || item.args.length > max) {
    const expected = max === Infinity ? `at least ${min}` : min === max ? `${min}` : `${min}-${max}`;
    throw lineError(item, `expected ${expected} args, got ${item.args.length}.`);
  }
  return item.args;
}

function parseOptionalNumber(value: string | undefined, fallback: number, item: { lineNumber: number; raw: string }): number {
  return value === undefined ? fallback : parseNumber(value, item);
}

function parseNumber(value: string, item: { lineNumber: number; raw: string }): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw lineError(item, `invalid number "${value}".`);
  return parsed;
}

function toNumber(value: FlowValue, item: { lineNumber: number; raw: string }): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw lineError(item, `expected number, got "${String(value)}".`);
  return parsed;
}

function toFlowValue(value: unknown): FlowValue {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.stringify(value);
}

function isTruthy(value: FlowValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  return false;
}

function lineError(item: { lineNumber: number; raw: string }, message: string): AppError {
  return new AppError(`Line ${item.lineNumber}: ${message}\n  ${item.raw}`);
}
