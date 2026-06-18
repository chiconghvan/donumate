import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import * as XLSX from 'xlsx';
import { AppError } from '../../utils/errors.js';
import type { WorkflowContext, WorkflowScript } from '../types.js';
import { parseExpression, parseFlowProgram } from './parser.js';
import type { FlowBinaryOperator, FlowBlockName, FlowExpression, FlowInputValue, FlowProgram, FlowStatement, FlowValue } from './types.js';

const DEFAULT_WAIT_TIMEOUT_MS = 10000;
const MAX_LOOP_ITERATIONS = 10000;
const RDELAY_MIN_MS = 1000;
const RDELAY_MAX_MS = 3000;

const ALL_COMMANDS = [
  { name: 'goto', aliases: ['nav', 'navUrl', 'navurl'], desc: 'Navigate to URL' },
  { name: 'newTab', aliases: [], desc: 'Open and activate a new tab, optionally with URL' },
  { name: 'closeTab', aliases: [], desc: 'Close active tab' },
  { name: 'activeTab', aliases: [], desc: 'Activate tab by zero-based index or context id' },
  { name: 'backNav', aliases: [], desc: 'Navigate browser history back' },
  { name: 'reloadNav', aliases: [], desc: 'Reload current page' },
  { name: 'getUrl', aliases: [], desc: 'Store current URL in pageUrl' },
  { name: 'waitUrlChange', aliases: [], desc: 'Wait until URL differs from given URL' },
  { name: 'waitLoad', aliases: [], desc: 'Wait for page load (2s settle + readyState)' },
  { name: 'waitElement', aliases: ['waitXPath'], desc: 'Wait for XPath match (default 10s)' },
  { name: 'getElementAttribute', aliases: [], desc: 'Store XPath attribute in elementAttribute' },
  { name: 'getElementText', aliases: [], desc: 'Store XPath text in elementText' },
  { name: 'countElement', aliases: [], desc: 'Store XPath match count in elementCount' },
  { name: 'click', aliases: [], desc: 'Click element by XPath' },
  { name: 'typeText', aliases: ['type'], desc: 'Type text into element' },
  { name: 'pasteText', aliases: [], desc: 'Paste text via clipboard' },
  { name: 'moveMouse', aliases: [], desc: 'Move mouse to XPath element' },
  { name: 'scroll', aliases: [], desc: 'Scroll page by pixels' },
  { name: 'js', aliases: ['executeJs', 'executeJS'], desc: 'Execute JavaScript and store result in jsResult' },
  { name: 'fileUpload', aliases: [], desc: 'Upload file into input[type=file] XPath when supported' },
  { name: 'info', aliases: [], desc: 'Log page title and URL' },
  { name: 'httpRequest', aliases: [], desc: 'Run HTTP request and store httpStatus/httpHeaders/httpBody/httpUrl' },
  { name: 'httpDownload', aliases: [], desc: 'Download URL to file and store downloadPath/downloadBytes' },
  { name: 'fileWriteAllText', aliases: [], desc: 'Overwrite a text file' },
  { name: 'writeExcel', aliases: [], desc: 'Write a value to an Excel cell' },
  { name: 'delay', aliases: ['sleep'], desc: 'Sleep N ms (or N-M for random range)' },
  { name: 'log', aliases: [], desc: 'Log message' },
  { name: 'help', aliases: [], desc: 'Show available commands' },
];
const RDELAY_DESC = '  rDelay — append to any command for random delay after execution (optional), e.g. rDelay or rDelay(3000,4000)';
const PAGE_COMMANDS = new Set([
  'goto', 'nav', 'navurl', 'newtab', 'closetab', 'activetab', 'backnav', 'reloadnav', 'geturl', 'waiturlchange',
  'waitload', 'waitelement', 'waitxpath', 'getelementattribute', 'getelementtext', 'countelement', 'click', 'typetext',
  'type', 'pastetext', 'movemouse', 'scroll', 'js', 'executejs', 'fileupload', 'info',
].map((item) => item.toLowerCase()));
const ALL_FUNCTIONS = [
  { name: 'getUrl', aliases: [], desc: 'Return current page URL' },
  { name: 'httpRequest', aliases: [], desc: 'Run HTTP request and return raw response text' },
  { name: 'js', aliases: ['executeJs', 'executeJS'], desc: 'Execute JavaScript and return result' },
  { name: 'getElementText', aliases: [], desc: 'Return XPath text' },
  { name: 'getElementAttribute', aliases: [], desc: 'Return XPath attribute' },
  { name: 'countElement', aliases: [], desc: 'Return XPath match count' },
  { name: 'hasElement', aliases: ['existsXPath'], desc: 'Check XPath exists' },
  { name: 'splitText', aliases: [], desc: 'Split text by delimiter and return an array' },
  { name: 'contains', aliases: [], desc: 'Check whether one string contains another, or check whether second string is empty when first is empty' },
  { name: 'readJson', aliases: [], desc: 'Read JSON value by dotted path' },
  { name: 'randomNum', aliases: [], desc: 'Return random integer between min and max' },
  { name: 'fileExist', aliases: [], desc: 'Check file exists' },
  { name: 'folderExist', aliases: [], desc: 'Check folder exists' },
  { name: 'readExcel', aliases: [], desc: 'Read value from Excel cell by header and row' },
  { name: 'fileReadAllText', aliases: [], desc: 'Read entire text file' },
];
const PAGE_FUNCTIONS = new Set([
  'haselement', 'existsxpath', 'geturl', 'js', 'executejs', 'getelementtext', 'getelementattribute', 'countelement',
]);
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
  excelInputs: Set<string>;
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
  const excelInputs = new Set(program.inputs.filter((input) => input.type === 'inputExcelFile').map((input) => input.name.toLowerCase()));
  const signal = await executeFlowStatements(ctx, statements, { locals: {}, loopIndexStack: [], excelInputs });
  if (signal) throw new AppError(`${signal === 'next' ? 'nextLoop' : 'exitLoop'} used outside a loop.`);
}

async function executeFlowStatements(ctx: FlowExecutionContext, statements: FlowStatement[], runtime: FlowRuntime): Promise<LoopSignal | undefined> {
  for (const statement of statements) {
    if (statement.type === 'command') {
      const interpolated = await interpolateCommand(ctx, statement, runtime);
      ctx.log(`flow:${statement.lineNumber}`, formatFlowCommand(interpolated));
      await executeFlowCommand(ctx, interpolated, runtime);
      continue;
    }

    ctx.log(`flow:${statement.lineNumber}`, statement.raw.trim());
    const signal = await executeFlowStatement(ctx, statement, runtime);
    if (signal) return signal;
  }
  return undefined;
}

async function executeFlowStatement(ctx: FlowExecutionContext, statement: FlowStatement, runtime: FlowRuntime): Promise<LoopSignal | undefined> {
  switch (statement.type) {
    case 'command':
      await executeFlowCommand(ctx, await interpolateCommand(ctx, statement, runtime), runtime);
      return undefined;

    case 'assignment':
      runtime.locals[statement.name] = await evaluateExpression(ctx, statement.value, runtime, statement);
      ctx.log(`${statement.name} = ${flowValueToString(runtime.locals[statement.name] ?? null)}`);
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
  // Extract optional rDelay from args: rDelay or rDelay(min,max)
  let hasRDelay = false;
  let rDelayMin = RDELAY_MIN_MS;
  let rDelayMax = RDELAY_MAX_MS;
  const args = [...item.args];
  if (args.length > 0) {
    const lastArg = args[args.length - 1] ?? '';
    const match = lastArg.match(/^rdelay\((\d+),(\d+)\)$/i);
    if (match) {
      hasRDelay = true;
      rDelayMin = parseInt(match[1], 10);
      rDelayMax = parseInt(match[2], 10);
      args.pop();
    } else if (lastArg.toLowerCase() === 'rdelay') {
      hasRDelay = true;
      args.pop();
    }
  }
  const cmd = { ...item, args };

  const runCmd = async (): Promise<void> => {
    const command = cmd.command.toLowerCase();

    switch (command) {
      case 'goto':
      case 'nav':
      case 'navurl': {
        const [url] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).goto(url);
        return;
      }

      case 'newtab': {
        const [url] = requireArgs(cmd, 0, 1);
        await requirePage(ctx, cmd).newTab(url);
        return;
      }

      case 'closetab': {
        requireArgs(cmd, 0);
        await requirePage(ctx, cmd).closeTab();
        return;
      }

      case 'activetab': {
        const [target] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).activeTab(target);
        return;
      }

      case 'backnav': {
        const [timeout] = requireArgs(cmd, 0, 1);
        await requirePage(ctx, cmd).backNav(parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, cmd));
        return;
      }

      case 'reloadnav': {
        requireArgs(cmd, 0);
        await requirePage(ctx, cmd).reloadNav();
        return;
      }

      case 'geturl': {
        requireArgs(cmd, 0);
        runtime.locals.pageUrl = await requirePage(ctx, cmd).getUrl();
        return;
      }

      case 'waiturlchange': {
        const [url, timeout] = requireArgs(cmd, 1, 2);
        runtime.locals.pageUrl = await requirePage(ctx, cmd).waitUrlChange(url, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, cmd));
        ctx.log(`pageUrl=${runtime.locals.pageUrl}`);
        return;
      }

      case 'waitload': {
        const [settleMs] = requireArgs(cmd, 0, 1);
        const settle = settleMs === undefined ? 2000 : parseNumber(settleMs, cmd);
        if (settle > 0) await ctx.sleep(settle);
        await requirePage(ctx, cmd).waitForLoad();
        return;
      }

      case 'waitelement':
      case 'waitxpath': {
        const [xpath, timeout] = requireArgs(cmd, 1, 2);
        await requirePage(ctx, cmd).waitForXPath(xpath, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, cmd));
        return;
      }

      case 'getelementattribute': {
        const [xpath, attribute] = requireArgs(cmd, 2);
        runtime.locals.elementAttribute = await requirePage(ctx, cmd).getElementAttribute(xpath, attribute);
        ctx.log(`elementAttribute=${runtime.locals.elementAttribute}`);
        return;
      }

      case 'getelementtext': {
        const [xpath] = requireArgs(cmd, 1);
        runtime.locals.elementText = await requirePage(ctx, cmd).getElementText(xpath);
        ctx.log(`elementText=${runtime.locals.elementText}`);
        return;
      }

      case 'countelement': {
        const [xpath] = requireArgs(cmd, 1);
        runtime.locals.elementCount = await requirePage(ctx, cmd).countElement(xpath);
        ctx.log(`elementCount=${runtime.locals.elementCount}`);
        return;
      }

      case 'click': {
        const [xpath] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).clickXPath(xpath);
        return;
      }

      case 'type':
      case 'typetext': {
        const [xpath, ...textParts] = requireArgs(cmd, 2);
        await requirePage(ctx, cmd).typeTextXPath(xpath, textParts.join(' '));
        return;
      }

      case 'pastetext': {
        const [xpath, ...textParts] = requireArgs(cmd, 2);
        await requirePage(ctx, cmd).pasteTextXPath(xpath, textParts.join(' '));
        return;
      }

      case 'movemouse': {
        const [xpath] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).moveMouseXPath(xpath);
        return;
      }

      case 'scroll': {
        const [px] = requireArgs(cmd, 1);
        await requirePage(ctx, cmd).scroll(parseNumber(px, cmd));
        return;
      }

      case 'executejs':
      case 'js': {
        const [script] = requireArgs(cmd, 1);
        runtime.locals.jsResult = toFlowValue(await requirePage(ctx, cmd).executeJs(script));
        return;
      }

      case 'fileupload': {
        const [filePath, xpath] = requireArgs(cmd, 2);
        await requirePage(ctx, cmd).fileUpload(filePath, xpath);
        return;
      }

      case 'httprequest': {
        await executeHttpRequest(cmd, runtime);
        return;
      }

      case 'httpdownload': {
        await executeHttpDownload(cmd, runtime);
        ctx.log(`downloadPath=${runtime.locals.downloadPath} downloadBytes=${runtime.locals.downloadBytes}`);
        return;
      }

      case 'filewritealltext': {
        const [filePath, ...textParts] = requireArgs(cmd, 2);
        const outputPath = resolve(filePath);
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, textParts.join(' '), 'utf8');
        return;
      }

      case 'writeexcel': {
        const [filePath, columnName, rowIndex, ...textParts] = requireArgs(cmd, 4);
        writeExcelCell(filePath, columnName, rowIndex, textParts.join(' '), cmd);
        return;
      }

      case 'delay':
      case 'sleep': {
        const [min, max] = requireArgs(cmd, 1, 2);
        const minMs = parseNumber(min, cmd);
        const maxMs = max === undefined ? minMs : parseNumber(max, cmd);
        if (maxMs < minMs) throw lineError(cmd, `delay max (${maxMs}) must be >= min (${minMs}).`);
        const ms = maxMs === minMs ? minMs : minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
        if (maxMs > minMs) ctx.log(`sleep ${ms}ms (random ${minMs}-${maxMs})`);
        await ctx.sleep(ms);
        return;
      }

      case 'log': {
        requireArgs(cmd, 1);
        const interpolated = await interpolateCommand(ctx, cmd, runtime);
        ctx.log(interpolated.args.join(' '));
        return;
      }

      case 'info': {
        requireArgs(cmd, 0);
        const info = await requirePage(ctx, cmd).info();
        ctx.log(`${info.title} ${info.url}`);
        return;
      }

      case 'help': {
        ctx.log('Available commands:');
        ctx.log(COMMAND_LIST);
        ctx.log(RDELAY_DESC);
        ctx.log('Available functions:');
        ctx.log(FUNCTION_LIST);
        return;
      }

      default:
        throw lineError(cmd, `unknown command "${cmd.command}". Available commands:\n${COMMAND_LIST}`);
    }
  };

  await runCmd();

  // Apply optional rDelay after command execution
  if (hasRDelay) {
    const min = Math.min(rDelayMin, rDelayMax);
    const max = Math.max(rDelayMin, rDelayMax);
    const ms = min + Math.floor(Math.random() * (max - min + 1));
    ctx.log(`rDelay ${ms}ms`);
    await ctx.sleep(ms);
  }
}

async function executeHttpRequest(item: Extract<FlowStatement, { type: 'command' }>, runtime: FlowRuntime): Promise<string> {
  const [url, method, headersText, ...bodyParts] = requireArgs(item, 2);
  const responseText = await runHttpRequest(url, method, headersText, bodyParts.join(' ') || undefined, item, runtime);
  return responseText;
}

async function runHttpRequest(url: string | undefined, method: string | undefined, headersText: string | undefined, body: string | undefined, item: { lineNumber: number; raw: string }, runtime: FlowRuntime): Promise<string> {
  if (!url || !method) throw lineError(item, 'httpRequest expects at least 2 arguments.');
  const headers = parseHeaders(headersText, item);
  const response = await fetch(url, { method: method.toUpperCase(), headers, body });
  const headerRecord: Record<string, string> = {};
  response.headers.forEach((value, key) => { headerRecord[key] = value; });
  const responseText = await response.text();
  runtime.locals.httpStatus = response.status;
  runtime.locals.httpHeaders = JSON.stringify(headerRecord);
  runtime.locals.httpBody = responseText;
  runtime.locals.httpUrl = response.url;
  return responseText;
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
      for (const arg of expression.args) {
        try {
          args.push(await evaluateExpression(ctx, arg, runtime, item));
        } catch (error) {
          if (arg.type === 'variable' && error instanceof AppError && error.message.includes(`unknown variable "${arg.name}"`)) {
            args.push(arg.name);
          } else {
            throw error;
          }
        }
      }
      if (name === 'haselement' || name === 'existsxpath') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).existsXPath(String(args[0] ?? ''));
      }
      if (name === 'geturl') {
        if (args.length !== 0) throw lineError(item, `${expression.name} expects 0 arguments.`);
        return requirePage(ctx, item).getUrl();
      }
      if (name === 'js' || name === 'executejs') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return toFlowValue(await requirePage(ctx, item).executeJs(String(args[0] ?? '')));
      }
      if (name === 'getelementtext') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).getElementText(String(args[0] ?? ''));
      }
      if (name === 'getelementattribute') {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        return requirePage(ctx, item).getElementAttribute(String(args[0] ?? ''), String(args[1] ?? ''));
      }
      if (name === 'countelement') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return requirePage(ctx, item).countElement(String(args[0] ?? ''));
      }
      if (name === 'httprequest') {
        if (args.length < 2 || args.length > 4) throw lineError(item, `${expression.name} expects 2-4 arguments.`);
        return runHttpRequest(String(args[0] ?? ''), String(args[1] ?? ''), args[2] === undefined ? undefined : String(args[2]), args[3] === undefined ? undefined : String(args[3]), item, runtime);
      }
      if (name === 'splittext') {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        return String(args[0] ?? '').split(String(args[1] ?? ''));
      }
      if (name === 'contains') {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        const left = String(args[0] ?? '');
        const right = String(args[1] ?? '');
        return left === '' ? right === '' : left.includes(right);
      }
      if (name === 'readjson') {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        return readJsonValue(String(args[0] ?? ''), String(args[1] ?? ''), item);
      }
      if (name === 'randomnum') {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        const min = toNumber(args[0], item);
        const max = toNumber(args[1], item);
        if (max < min) throw lineError(item, `randomNum max (${max}) must be >= min (${min}).`);
        return min + Math.floor(Math.random() * (max - min + 1));
      }
      if (name === 'fileexist') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return pathExists(String(args[0] ?? ''), 'file');
      }
      if (name === 'folderexist') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return pathExists(String(args[0] ?? ''), 'folder');
      }
      if (name === 'readexcel') {
        if (args.length !== 3) throw lineError(item, `${expression.name} expects 3 arguments.`);
        return readExcelCell(String(args[0] ?? ''), args[1], args[2], item);
      }
      if (name === 'filereadalltext') {
        if (args.length !== 1) throw lineError(item, `${expression.name} expects 1 argument.`);
        return await readFile(resolve(String(args[0] ?? '')), 'utf8');
      }
      if (runtime.excelInputs.has(name)) {
        if (args.length !== 2) throw lineError(item, `${expression.name} expects 2 arguments.`);
        const inputName = Object.keys(ctx.inputs).find((key) => key.toLowerCase() === name) ?? expression.name;
        return readExcelCell(String(ctx.inputs[inputName] ?? ''), args[0], args[1], item);
      }
      throw lineError(item, `unknown function "${expression.name}". Available functions:\n${FUNCTION_LIST}`);
    }

    case 'index': {
      const object = await evaluateExpression(ctx, expression.object, runtime, item);
      const indexValue = await evaluateExpression(ctx, expression.index, runtime, item);
      if (!Array.isArray(object)) throw lineError(item, `cannot index non-array value "${String(object)}".`);
      const index = toNumber(indexValue, item);
      if (!Number.isInteger(index)) throw lineError(item, `array index must be an integer, got "${String(indexValue)}".`);
      return object[index] ?? null;
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
      throw lineError(statement, `${statement.command} can only be used inside run profile block because it interacts with webpage.`);
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
  if (expression.type === 'index') {
    validateExpressionForBlock(expression.object, block, item);
    validateExpressionForBlock(expression.index, block, item);
  }
}

async function interpolateCommand(ctx: FlowExecutionContext, command: Extract<FlowStatement, { type: 'command' }>, runtime: FlowRuntime): Promise<Extract<FlowStatement, { type: 'command' }>> {
  const args = [];
  for (const arg of command.args) args.push(await interpolate(ctx, arg, runtime, command));
  return { ...command, args };
}

function formatFlowCommand(command: Extract<FlowStatement, { type: 'command' }>): string {
  return `${command.command}(${command.args.map(formatFlowArg).join(', ')})`;
}

function formatFlowArg(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

async function interpolate(ctx: FlowExecutionContext, value: string, runtime: FlowRuntime, item: { lineNumber: number; raw: string }): Promise<string> {
  let result = '';
  let lastIndex = 0;
  const pattern = /\$\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    result += value.slice(lastIndex, match.index);
    const expressionText = match[1] ?? '';
    const evaluated = await evaluateExpression(ctx, parseExpression(expressionText, item.lineNumber), runtime, item);
    result += flowValueToString(evaluated);
    lastIndex = pattern.lastIndex;
  }
  return result + value.slice(lastIndex);
}

async function pathExists(filePath: string, kind: 'file' | 'folder'): Promise<boolean> {
  const stats = await stat(resolve(filePath)).catch(() => null);
  return kind === 'file' ? stats?.isFile() ?? false : stats?.isDirectory() ?? false;
}

function readJsonValue(text: string, path: string, item: { lineNumber: number; raw: string }): FlowValue {
  let current: unknown;
  try {
    current = JSON.parse(text);
  } catch (error) {
    throw lineError(item, `readJson invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const key of path.split('.').filter(Boolean)) {
    if (current === null || typeof current !== 'object' || !(key in current)) return null;
    current = (current as Record<string, unknown>)[key];
  }
  return toFlowValue(current);
}

function readExcelCell(filePath: string, columnName: FlowValue, rowIndex: FlowValue, item: { lineNumber: number; raw: string }): FlowValue {
  const workbook = XLSX.readFile(resolve(filePath));
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return null;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet?.['!ref']) return null;

  const column = findExcelColumn(sheet, String(columnName ?? ''), item);
  const row = parseExcelDataRow(rowIndex, item);
  const cell = sheet[XLSX.utils.encode_cell({ c: column, r: row })];
  return toFlowValue(cell?.v);
}

function writeExcelCell(filePath: string, columnName: string, rowIndexText: string, value: string, item: { lineNumber: number; raw: string }): void {
  const outputPath = resolve(filePath);
  let workbook: XLSX.WorkBook;
  let sheetName: string;
  let sheet: XLSX.WorkSheet;

  try {
    workbook = XLSX.readFile(outputPath);
    sheetName = workbook.SheetNames[0] ?? 'Sheet1';
    sheet = workbook.Sheets[sheetName] ?? XLSX.utils.aoa_to_sheet([[columnName]]);
    if (!workbook.SheetNames.includes(sheetName)) XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  } catch {
    workbook = XLSX.utils.book_new();
    sheetName = 'Sheet1';
    sheet = XLSX.utils.aoa_to_sheet([[columnName]]);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }

  const column = findExcelColumn(sheet, columnName, item);
  const row = parseExcelDataRow(rowIndexText, item);
  XLSX.utils.sheet_add_aoa(sheet, [[value]], { origin: { c: column, r: row } });
  XLSX.writeFile(workbook, outputPath);
}

function findExcelColumn(sheet: XLSX.WorkSheet, columnName: string, item: { lineNumber: number; raw: string }): number {
  if (!sheet['!ref']) throw lineError(item, 'Excel sheet is empty.');
  const range = XLSX.utils.decode_range(sheet['!ref']);
  for (let column = range.s.c; column <= range.e.c; column += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ c: column, r: 0 })];
    if (String(cell?.v ?? '') === columnName) return column;
  }
  throw lineError(item, `Excel column not found: ${columnName}`);
}

function parseExcelDataRow(rowIndex: FlowValue, item: { lineNumber: number; raw: string }): number {
  const parsed = toNumber(rowIndex, item);
  if (!Number.isInteger(parsed) || parsed < 1) throw lineError(item, `Excel row index must be a positive integer, got "${String(rowIndex)}".`);
  return parsed;
}

function flowValueToString(value: FlowValue): string {
  if (value === null) return '';
  if (Array.isArray(value)) return value.map((item) => flowValueToString(item)).join(',');
  return String(value);
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
  if (Array.isArray(value)) return value.map((item) => toFlowValue(item)).filter((item) => item !== null);
  return JSON.stringify(value);
}

function isTruthy(value: FlowValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function lineError(item: { lineNumber: number; raw: string }, message: string): AppError {
  return new AppError(`Line ${item.lineNumber}: ${message}\n  ${item.raw}`);
}
