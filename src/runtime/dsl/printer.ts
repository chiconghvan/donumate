import type {
  FlowAssignmentStatement,
  FlowExpression,
  FlowInputDefinition,
  FlowInputValue,
  FlowProgram,
  FlowStatement,
} from './types.js';

export type PrintFlowProgramOptions = {
  indent?: string;
  legacy?: boolean;
};

export function printFlowProgram(program: FlowProgram, options: PrintFlowProgramOptions = {}): string {
  const indent = options.indent ?? '  ';
  const lines: string[] = [];

  if (program.inputs.length > 0) {
    lines.push('inputs {');
    for (const input of program.inputs) lines.push(`${indent}${printInputDefinition(input)}`);
    lines.push('}', '');
  }

  if (options.legacy && program.legacyCommands) {
    lines.push(...printStatements(program.legacyCommands, 0, indent));
    return `${lines.join('\n').trimEnd()}\n`;
  }

  lines.push('before() {');
  lines.push(...printStatements(program.beforeRunProfile, 1, indent));
  lines.push('}', '');

  lines.push('running() {');
  lines.push(...printStatements(program.main, 1, indent));
  lines.push('}', '');

  lines.push('after() {');
  lines.push(...printStatements(program.afterKillProfile, 1, indent));
  lines.push('}');

  return `${lines.join('\n').trimEnd()}\n`;
}

export function printStatements(statements: FlowStatement[], level = 0, indent = '  '): string[] {
  const lines: string[] = [];
  for (const statement of statements) printStatement(statement, level, indent, lines);
  return lines;
}

export function printExpression(expression: FlowExpression): string {
  switch (expression.type) {
    case 'literal':
      return printLiteral(expression.value);
    case 'variable':
      return expression.name;
    case 'unary':
      return `${expression.operator}${printExpressionWithParens(expression.argument)}`;
    case 'binary':
      return `${printExpressionWithParens(expression.left)} ${expression.operator} ${printExpressionWithParens(expression.right)}`;
    case 'call':
      return `${expression.name}(${expression.args.map(printExpression).join(', ')})`;
    case 'index':
      return `${printExpressionWithParens(expression.object)}[${printExpression(expression.index)}]`;
  }
}

export function printInputDefinition(input: FlowInputDefinition): string {
  const parts = [input.name];
  const typePart = input.type === 'input' && !input.options ? '' : `: ${input.type}${input.options ? ` [${input.options.map(quoteString).join(', ')}]` : ''}`;
  if (typePart) parts.push(typePart);
  if (input.defaultValue !== undefined) parts.push(` = ${printInputValue(input.defaultValue)}`);
  return parts.join('');
}

function printStatement(statement: FlowStatement, level: number, indent: string, lines: string[]): void {
  const prefix = indent.repeat(level);
  switch (statement.type) {
    case 'command':
      lines.push(`${prefix}${statement.command}(${statement.args.map(printCommandArg).join(', ')})`);
      return;
    case 'assignment':
      lines.push(`${prefix}${printAssignment(statement)}`);
      return;
    case 'loopControl':
      lines.push(`${prefix}${statement.control === 'next' ? 'nextLoop' : 'exitLoop'}`);
      return;
    case 'while':
      lines.push(`${prefix}while ${printExpression(statement.condition)} {`);
      lines.push(...printStatements(statement.body, level + 1, indent));
      lines.push(`${prefix}}`);
      return;
    case 'for':
      lines.push(`${prefix}for ${printAssignment(statement.init)}; ${printExpression(statement.condition)}; ${printAssignment(statement.update)} {`);
      lines.push(...printStatements(statement.body, level + 1, indent));
      lines.push(`${prefix}}`);
      return;
    case 'if':
      statement.branches.forEach((branch, index) => {
        lines.push(`${prefix}${index === 0 ? 'if' : 'else if'} ${printExpression(branch.condition)} {`);
        lines.push(...printStatements(branch.body, level + 1, indent));
        lines.push(`${prefix}}`);
      });
      if (statement.elseBody) {
        lines.push(`${prefix}else {`);
        lines.push(...printStatements(statement.elseBody, level + 1, indent));
        lines.push(`${prefix}}`);
      }
      return;
  }
}

function printAssignment(statement: FlowAssignmentStatement): string {
  return `${statement.name} = ${printExpression(statement.value)}`;
}

function printExpressionWithParens(expression: FlowExpression): string {
  if (expression.type === 'binary') return `(${printExpression(expression)})`;
  return printExpression(expression);
}

function printCommandArg(arg: string): string {
  if (/^rdelay\s*\(\s*\d+\s*,\s*\d+\s*\)$/i.test(arg.trim()) || /^rdelay\s*\(\s*\)$/i.test(arg.trim())) return arg.trim();
  return quoteString(arg);
}

function printLiteral(value: FlowInputValue | null): string {
  if (typeof value === 'string') return quoteString(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return `[${value.map(printLiteral).join(', ')}]`;
  return 'null';
}

function printInputValue(value: FlowInputValue): string {
  if (typeof value === 'string') return quoteString(value);
  if (Array.isArray(value)) return `[${value.map(printInputValue).join(', ')}]`;
  return String(value);
}

function quoteString(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
