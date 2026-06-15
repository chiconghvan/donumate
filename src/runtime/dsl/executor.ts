import { readFile } from 'fs/promises';
import { AppError } from '../../utils/errors.js';
import type { WorkflowContext, WorkflowScript } from '../types.js';
import { parseFlowProgram } from './parser.js';
import type { FlowBinaryOperator, FlowBlockName, FlowExpression, FlowInputValue, FlowProgram, FlowStatement, FlowValue } from './types.js';

const DEFAULT_WAIT_TIMEOUT_MS = 10000;
const MAX_LOOP_ITERATIONS = 10000;
const PAGE_COMMANDS = new Set(['nav', 'goto', 'waitload', 'waitelement', 'waitxpath', 'click', 'type', 'info']);
const PAGE_FUNCTIONS = new Set(['haselement', 'existsxpath']);

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
  await executeFlowStatements(ctx, statements, { locals: {}, loopIndexStack: [] });
}

async function executeFlowStatements(ctx: FlowExecutionContext, statements: FlowStatement[], runtime: FlowRuntime): Promise<void> {
  for (const statement of statements) {
    ctx.log(`flow:${statement.lineNumber}`, statement.raw.trim());
    await executeFlowStatement(ctx, statement, runtime);
  }
}

async function executeFlowStatement(ctx: FlowExecutionContext, statement: FlowStatement, runtime: FlowRuntime): Promise<void> {
  switch (statement.type) {
    case 'command':
      await executeFlowCommand(ctx, interpolateCommand(statement, valuesForInterpolation(ctx, runtime)));
      return;

    case 'assignment':
      runtime.locals[statement.name] = await evaluateExpression(ctx, statement.value, runtime, statement);
      return;

    case 'if':
      for (const branch of statement.branches) {
        if (isTruthy(await evaluateExpression(ctx, branch.condition, runtime, statement))) {
          await executeFlowStatements(ctx, branch.body, runtime);
          return;
        }
      }
      if (statement.elseBody) await executeFlowStatements(ctx, statement.elseBody, runtime);
      return;

    case 'while': {
      let iterations = 0;
      while (isTruthy(await evaluateExpression(ctx, statement.condition, runtime, statement))) {
        if (iterations >= MAX_LOOP_ITERATIONS) throw lineError(statement, `while exceeded ${MAX_LOOP_ITERATIONS} iterations.`);
        runtime.loopIndexStack.push(iterations);
        try {
          await executeFlowStatements(ctx, statement.body, runtime);
        } finally {
          runtime.loopIndexStack.pop();
        }
        iterations += 1;
      }
      return;
    }

    case 'for': {
      await executeFlowStatement(ctx, statement.init, runtime);
      let iterations = 0;
      while (isTruthy(await evaluateExpression(ctx, statement.condition, runtime, statement))) {
        if (iterations >= MAX_LOOP_ITERATIONS) throw lineError(statement, `for exceeded ${MAX_LOOP_ITERATIONS} iterations.`);
        runtime.loopIndexStack.push(iterations);
        try {
          await executeFlowStatements(ctx, statement.body, runtime);
        } finally {
          runtime.loopIndexStack.pop();
        }
        await executeFlowStatement(ctx, statement.update, runtime);
        iterations += 1;
      }
      return;
    }
  }
}

async function executeFlowCommand(ctx: FlowExecutionContext, item: Extract<FlowStatement, { type: 'command' }>): Promise<void> {
  const command = item.command.toLowerCase();

  switch (command) {
    case 'nav':
    case 'goto': {
      const [url] = requireArgs(item, 1);
      await requirePage(ctx, item).goto(url);
      return;
    }

    case 'waitload': {
      requireArgs(item, 0);
      await ctx.sleep(3000);
      await requirePage(ctx, item).waitForLoad();
      return;
    }

    case 'waitelement':
    case 'waitxpath': {
      const [xpath, timeout] = requireArgs(item, 1, 2);
      await requirePage(ctx, item).waitForXPath(xpath, parseOptionalNumber(timeout, DEFAULT_WAIT_TIMEOUT_MS, item));
      return;
    }

    case 'click': {
      const [xpath] = requireArgs(item, 1);
      await requirePage(ctx, item).clickXPath(xpath);
      return;
    }

    case 'type': {
      const [xpath, ...textParts] = requireArgs(item, 2);
      await requirePage(ctx, item).typeXPath(xpath, textParts.join(' '));
      return;
    }

    case 'delay':
    case 'sleep': {
      const [min, max] = requireArgs(item, 1, 2);
      const minMs = parseNumber(min, item);
      const maxMs = max === undefined ? minMs : parseNumber(max, item);
      if (maxMs < minMs) throw lineError(item, 'delay max must be greater than or equal to min.');
      const ms = maxMs === minMs ? minMs : minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
      await ctx.sleep(ms);
      return;
    }

    case 'log': {
      requireArgs(item, 1);
      ctx.log(item.args.join(' '));
      return;
    }

    case 'info': {
      requireArgs(item, 0);
      const info = await requirePage(ctx, item).info();
      ctx.log(`${info.title} ${info.url}`);
      return;
    }

    default:
      throw lineError(item, `unknown command "${item.command}".`);
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
      throw lineError(item, `unknown variable "${expression.name}".`);
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
      throw lineError(item, `unknown function "${expression.name}".`);
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
  if (statement.type === 'command' && PAGE_COMMANDS.has(statement.command.toLowerCase())) {
    throw lineError(statement, `${statement.command} can only be used inside run profile block.`);
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
  if (expression.type === 'call' && PAGE_FUNCTIONS.has(expression.name.toLowerCase())) throw lineError(item, `${expression.name} can only be used inside run profile block.`);
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

function isTruthy(value: FlowValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  return false;
}

function lineError(item: { lineNumber: number; raw: string }, message: string): AppError {
  return new AppError(`Line ${item.lineNumber}: ${message}\n  ${item.raw}`);
}
