import { AppError } from '../../utils/errors.js';
import { parseExpression, parseFlowProgram } from './parser.js';
import { getFlowCommandSpec, getFlowFunctionSpec } from './runtime-spec.js';
import type { FlowExpression, FlowProgram, FlowStatement } from './types.js';

export type FlowSeverity = 'error' | 'warning' | 'info';

export type FlowDiagnostic = {
  severity: FlowSeverity;
  code: string;
  filePath: string;
  lineNumber: number;
  message: string;
  raw?: string;
};

export type FlowCheckResult = { diagnostics: FlowDiagnostic[] };

export function formatFlowDiagnostic(diag: FlowDiagnostic, source?: string): string {
  const header = `${diag.filePath}:${diag.lineNumber}:1 - ${diag.severity} ${diag.code}: ${diag.message}`;
  if (!source) return header;
  const lines = source.split(/\r?\n/);
  const line = lines[diag.lineNumber - 1];
  if (line === undefined) return header;
  return `${header}\n\n${diag.lineNumber} | ${line}\n${' '.repeat(String(diag.lineNumber).length)} | ^`;
}

const BUILTIN_VARS = new Set(['profileid', 'profilename', 'profileproxy', 'hardless']);

type VarState = { defined: 'yes' | 'maybe'; lineNumber: number };
type Scope = Map<string, VarState>;
type BlockName = 'beforeRunProfile' | 'main' | 'afterKillProfile';

export function checkFlowSource(source: string, filePath: string): FlowCheckResult {
  try {
    return checkFlowProgram(parseFlowProgram(source), filePath);
  } catch (error) {
    return { diagnostics: [{ severity: 'error', code: 'FLOW_PARSE', filePath, lineNumber: 1, message: error instanceof AppError ? error.message : String(error) }] };
  }
}

export function checkFlowProgram(program: FlowProgram, filePath: string): FlowCheckResult {
  const diagnostics: FlowDiagnostic[] = [];
  const baseVars = new Set(BUILTIN_VARS);
  for (const input of program.inputs) baseVars.add(input.name.toLowerCase());
  const shared = new Map<string, VarState>();
  for (const name of baseVars) shared.set(name, { defined: 'yes', lineNumber: 0 });
  for (const input of program.inputs) {
    if (input.type === 'inputExcelFile') shared.set(`${input.name.toLowerCase()}totalrow`, { defined: 'yes', lineNumber: input.lineNumber });
  }
  checkStatements(program.beforeRunProfile, 'beforeRunProfile', filePath, diagnostics, shared);
  checkStatements(program.main, 'main', filePath, diagnostics, shared);
  checkStatements(program.afterKillProfile, 'afterKillProfile', filePath, diagnostics, shared);
  return { diagnostics };
}

function checkStatements(statements: FlowStatement[], block: BlockName, filePath: string, diagnostics: FlowDiagnostic[], vars: Scope): Scope {
  let scope = new Map(vars);
  for (const statement of statements) {
    if (statement.type === 'command') {
      const spec = getFlowCommandSpec(statement.command);
      const args = stripTrailingRDelay(statement.args);
      if (!spec) diagnostics.push(diag('error', 'FLOW_CMD_UNKNOWN', filePath, statement.lineNumber, `Unknown command "${statement.command}".`));
      else if (args.length < spec.minArgs || args.length > spec.maxArgs) diagnostics.push(diag('error', 'FLOW_CMD_ARGS', filePath, statement.lineNumber, `${spec.name} expected ${range(spec.minArgs, spec.maxArgs)} args, got ${args.length}.`));
      else if (block !== 'main' && spec.pageOnly) diagnostics.push(diag('error', 'FLOW_BLOCK_PAGE_ONLY', filePath, statement.lineNumber, `${statement.command} can only be used inside running() block.`));
      for (const arg of args) scanInterpolation(arg, filePath, statement.lineNumber, diagnostics, scope);
      for (const eff of spec?.sideEffects ?? []) scope.set(eff.toLowerCase(), { defined: 'yes', lineNumber: statement.lineNumber });
      continue;
    }
    if (statement.type === 'assignment') {
      scanExpression(statement.value, filePath, statement.lineNumber, diagnostics, scope);
      scope.set(statement.name.toLowerCase(), { defined: 'yes', lineNumber: statement.lineNumber });
      continue;
    }
    if (statement.type === 'if') {
      for (const branch of statement.branches) scanExpression(branch.condition, filePath, branch.lineNumber, diagnostics, scope);
      const branchScopes = statement.branches.map((branch) => checkStatements(branch.body, block, filePath, diagnostics, new Map(scope)));
      if (statement.elseBody) branchScopes.push(checkStatements(statement.elseBody, block, filePath, diagnostics, new Map(scope)));
      scope = mergeScopes(scope, branchScopes);
      continue;
    }
    if (statement.type === 'while') {
      scanExpression(statement.condition, filePath, statement.lineNumber, diagnostics, scope);
      const bodyScope = checkStatements(statement.body, block, filePath, diagnostics, new Map(scope));
      scope = mergeLoopScope(scope, bodyScope);
      continue;
    }
    if (statement.type === 'for') {
      scanExpression(statement.init.value, filePath, statement.lineNumber, diagnostics, scope);
      scope.set(statement.init.name.toLowerCase(), { defined: 'yes', lineNumber: statement.lineNumber });
      scanExpression(statement.condition, filePath, statement.lineNumber, diagnostics, scope);
      scanExpression(statement.update.value, filePath, statement.lineNumber, diagnostics, scope);
      scope.set(statement.update.name.toLowerCase(), { defined: 'yes', lineNumber: statement.lineNumber });
      const bodyScope = checkStatements(statement.body, block, filePath, diagnostics, new Map(scope));
      scope = mergeLoopScope(scope, bodyScope);
      continue;
    }
  }
  return scope;
}

function scanInterpolation(text: string, filePath: string, lineNumber: number, diagnostics: FlowDiagnostic[], vars: Scope): void {
  for (const match of text.matchAll(/\$\{([^}]+)\}/g)) scanExpression(parseExpression(match[1] ?? '', lineNumber), filePath, lineNumber, diagnostics, vars);
}


function scanExpression(expr: FlowExpression, filePath: string, lineNumber: number, diagnostics: FlowDiagnostic[], vars: Scope): void {
  switch (expr.type) {
    case 'variable':
      if (!vars.has(expr.name.toLowerCase())) diagnostics.push(diag('error', 'FLOW_VAR_UNDEFINED', filePath, lineNumber, `Variable "${expr.name}" is not defined.`));
      return;
    case 'call': {
      const spec = getFlowFunctionSpec(expr.name);
      if (!spec) diagnostics.push(diag('error', 'FLOW_FUNC_UNKNOWN', filePath, lineNumber, `Unknown function "${expr.name}".`));
      for (const arg of expr.args) scanExpression(arg, filePath, lineNumber, diagnostics, vars);
      return;
    }
    case 'binary':
      scanExpression(expr.left, filePath, lineNumber, diagnostics, vars);
      scanExpression(expr.right, filePath, lineNumber, diagnostics, vars);
      return;
    case 'unary':
      scanExpression(expr.argument, filePath, lineNumber, diagnostics, vars);
      return;
    case 'index':
      scanExpression(expr.object, filePath, lineNumber, diagnostics, vars);
      scanExpression(expr.index, filePath, lineNumber, diagnostics, vars);
      return;
    default:
      return;
  }
}

function mergeScopes(base: Scope, scopes: Scope[]): Scope {
  if (scopes.length === 0) return base;
  const merged = new Map(base);
  for (const [name, state] of base) {
    if (scopes.some((scope) => !scope.has(name))) merged.set(name, { ...state, defined: 'maybe' });
  }
  return merged;
}

function mergeLoopScope(base: Scope, body: Scope): Scope {
  const merged = new Map(base);
  for (const [name, state] of body) {
    if (!base.has(name)) merged.set(name, { ...state, defined: 'maybe' });
  }
  return merged;
}

function diag(severity: FlowSeverity, code: string, filePath: string, lineNumber: number, message: string): FlowDiagnostic {
  return { severity, code, filePath, lineNumber, message };
}

function range(min: number, max: number): string { return min === max ? `${min}` : max === Infinity ? `at least ${min}` : `${min}-${max}`; }

function stripTrailingRDelay(args: string[]): string[] {
  const last = args[args.length - 1] ?? '';
  if (/^rdelay(?:\(\))?$/i.test(last) || /^rdelay\(\d+,\d+\)$/i.test(last)) return args.slice(0, -1);
  return args;
}
