import { AppError } from '../../utils/errors.js';
import type {
  FlowAssignmentStatement,
  FlowBinaryOperator,
  FlowCommand,
  FlowExpression,
  FlowInputDefinition,
  FlowInputKind,
  FlowInputValue,
  FlowProgram,
  FlowStatement,
} from './types.js';

const BLOCK_PATTERNS: Array<{ key: keyof Pick<FlowProgram, 'beforeRunProfile' | 'main' | 'afterKillProfile'>; pattern: RegExp }> = [
  { key: 'beforeRunProfile', pattern: /^before\s+run\s+profile\s*\{\s*$/i },
  { key: 'main', pattern: /^run\s+profile\s*\{\s*$/i },
  { key: 'afterKillProfile', pattern: /^after\s+kill\s+profile\s*\{\s*$/i },
];

type ParsedLine = { raw: string; line: string; lineNumber: number; indent: number };
type ExprToken = { type: 'identifier' | 'number' | 'string' | 'operator' | 'paren' | 'comma' | 'boolean' | 'null'; value: string };

export type { FlowCommand, FlowInputDefinition, FlowInputKind, FlowInputValue, FlowProgram };

export function parseFlowScript(source: string): FlowStatement[] {
  const lines = toParsedLines(source.split(/\r?\n/).map((raw, index) => ({ raw, lineNumber: index + 1 })));
  return parseStatements(lines, 0, -1).statements;
}

export function parseFlowProgram(source: string): FlowProgram {
  const lines = source.split(/\r?\n/).map((raw, index) => ({ raw, lineNumber: index + 1 }));
  const hasBlocks = lines.some(({ raw }) => {
    const line = stripComment(raw).trim();
    return /^inputs\s*\{\s*$/i.test(line) || BLOCK_PATTERNS.some((item) => item.pattern.test(line));
  });

  if (!hasBlocks) {
    const legacyCommands = parseStatements(toParsedLines(lines), 0, -1).statements;
    return {
      inputs: [],
      beforeRunProfile: [],
      main: legacyCommands,
      afterKillProfile: [],
      legacyCommands,
    };
  }

  const program: FlowProgram = {
    inputs: [],
    beforeRunProfile: [],
    main: [],
    afterKillProfile: [],
  };

  let currentBlock: 'inputs' | 'beforeRunProfile' | 'main' | 'afterKillProfile' | null = null;
  let currentBlockIndent = -1;
  let blockLines: Array<{ raw: string; lineNumber: number }> = [];
  let sawMain = false;

  const flushBlock = () => {
    if (currentBlock === null) return;
    if (currentBlock === 'inputs') {
      for (const item of blockLines) {
        const line = stripComment(item.raw).trim();
        if (line) program.inputs.push(parseInputLine(line, item.lineNumber));
      }
    } else {
      program[currentBlock] = parseStatements(toParsedLines(blockLines), 0, currentBlockIndent).statements;
    }
    blockLines = [];
  };

  for (const item of lines) {
    const line = stripComment(item.raw).trim();
    if (!line) continue;
    const indent = countIndent(item.raw);

    if (line === '}' && currentBlock !== null && indent <= currentBlockIndent) {
      flushBlock();
      currentBlock = null;
      currentBlockIndent = -1;
      continue;
    }

    if (currentBlock === null) {
      if (/^inputs\s*\{\s*$/i.test(line)) {
        currentBlock = 'inputs';
        currentBlockIndent = indent;
        continue;
      }

      const block = BLOCK_PATTERNS.find((entry) => entry.pattern.test(line));
      if (block) {
        currentBlock = block.key;
        currentBlockIndent = indent;
        if (block.key === 'main') sawMain = true;
        continue;
      }

      throw new AppError(`Line ${item.lineNumber}: expected inputs, before run profile, run profile, or after kill profile block.`);
    }

    blockLines.push(item);
  }

  if (currentBlock !== null) flushBlock();
  if (!sawMain) throw new AppError('Flow script must include a run profile { ... } block.');

  return program;
}

function parseStatements(lines: ParsedLine[], startIndex: number, parentIndent: number): { statements: FlowStatement[]; nextIndex: number } {
  const statements: FlowStatement[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const item = lines[index];
    if (!item) break;
    if (item.line === '}') {
      index += 1;
      continue;
    }
    if (item.indent <= parentIndent) break;
    if (/^else\b/i.test(item.line)) break;

    if (/^if\b/i.test(item.line)) {
      const parsed = parseIfStatement(lines, index, parentIndent);
      statements.push(parsed.statement);
      index = parsed.nextIndex;
      continue;
    }

    if (/^while\b/i.test(item.line)) {
      const conditionText = stripOptionalOpenBrace(item.line.replace(/^while\s+/i, '').trim());
      const body = parseChildBlock(lines, index);
      statements.push({ type: 'while', condition: parseExpression(conditionText, item.lineNumber), body: body.statements, lineNumber: item.lineNumber, raw: item.raw });
      index = body.nextIndex;
      continue;
    }

    if (/^for\b/i.test(item.line)) {
      statements.push(parseForLine(item));
      const body = parseChildBlock(lines, index);
      const forStatement = statements[statements.length - 1];
      if (forStatement?.type === 'for') forStatement.body = body.statements;
      index = body.nextIndex;
      continue;
    }

    statements.push(parseSimpleStatement(item));
    index += 1;
  }

  return { statements, nextIndex: index };
}

function parseIfStatement(lines: ParsedLine[], startIndex: number, parentIndent: number): { statement: FlowStatement; nextIndex: number } {
  const first = lines[startIndex];
  if (!first) throw new AppError('Unexpected end of if statement.');
  const branches = [];
  const firstCondition = stripOptionalOpenBrace(first.line.replace(/^if\s+/i, '').trim());
  const firstBody = parseChildBlock(lines, startIndex);
  branches.push({ condition: parseExpression(firstCondition, first.lineNumber), body: firstBody.statements, lineNumber: first.lineNumber, raw: first.raw });

  let index = firstBody.nextIndex;
  let elseBody: FlowStatement[] | undefined;

  while (index < lines.length) {
    const item = lines[index];
    if (!item || item.indent !== first.indent || item.indent <= parentIndent) break;
    if (/^else\s+if\b/i.test(item.line)) {
      const conditionText = stripOptionalOpenBrace(item.line.replace(/^else\s+if\s+/i, '').trim());
      const body = parseChildBlock(lines, index);
      branches.push({ condition: parseExpression(conditionText, item.lineNumber), body: body.statements, lineNumber: item.lineNumber, raw: item.raw });
      index = body.nextIndex;
      continue;
    }
    if (/^else\b/i.test(item.line)) {
      const rest = stripOptionalOpenBrace(item.line.replace(/^else\b/i, '').trim());
      if (rest) throw new AppError(`Line ${item.lineNumber}: else cannot have a condition. Use else if.`);
      const body = parseChildBlock(lines, index);
      elseBody = body.statements;
      index = body.nextIndex;
    }
    break;
  }

  return { statement: { type: 'if', branches, elseBody, lineNumber: first.lineNumber, raw: first.raw }, nextIndex: index };
}

function parseChildBlock(lines: ParsedLine[], headerIndex: number): { statements: FlowStatement[]; nextIndex: number } {
  const header = lines[headerIndex];
  if (!header) throw new AppError('Unexpected end of block.');
  const next = lines[headerIndex + 1];
  if (!next || next.indent <= header.indent) throw new AppError(`Line ${header.lineNumber}: expected indented block after "${header.line}".`);
  return parseStatements(lines, headerIndex + 1, header.indent);
}

function parseForLine(item: ParsedLine): FlowStatement {
  const rest = stripOptionalOpenBrace(item.line.replace(/^for\s+/i, '').trim());
  const parts = splitTopLevel(rest, ';');
  if (parts.length !== 3) throw new AppError(`Line ${item.lineNumber}: for syntax: for i = 0; i < 3; i = i + 1 (note: i++ is not supported, use i = i + 1)`);
  return {
    type: 'for',
    init: parseAssignmentText(parts[0] ?? '', item)!,
    condition: parseExpression(parts[1] ?? '', item.lineNumber),
    update: parseAssignmentText(parts[2] ?? '', item)!,
    body: [],
    lineNumber: item.lineNumber,
    raw: item.raw,
  };
}

function parseSimpleStatement(item: ParsedLine): FlowStatement {
  if (/^nextLoop$/i.test(item.line)) {
    return { type: 'loopControl', control: 'next', lineNumber: item.lineNumber, raw: item.raw };
  }
  if (/^exitLoop$/i.test(item.line)) {
    return { type: 'loopControl', control: 'exit', lineNumber: item.lineNumber, raw: item.raw };
  }
  const assignment = parseAssignmentText(item.line, item, false);
  if (assignment) return assignment;
  const command = parseFlowLine(item.raw, item.lineNumber);
  if (!command) throw new AppError(`Line ${item.lineNumber}: invalid statement.`);
  return { ...command, type: 'command' };
}

function parseAssignmentText(text: string, item: ParsedLine, required = true): FlowAssignmentStatement | null {
  const match = text.trim().match(/^(?:set\s+)?(?:\$\{([A-Za-z_][\w-]*)\}|([A-Za-z_][\w-]*))\s*=\s*(.+)$/i);
  if (!match) {
    if (!required) return null;
    throw new AppError(`Line ${item.lineNumber}: expected assignment, got "${text.trim()}".`);
  }
  return { type: 'assignment', name: match[1] ?? match[2] ?? '', value: parseExpression(match[3] ?? '', item.lineNumber), lineNumber: item.lineNumber, raw: item.raw };
}

function parseFlowLine(raw: string, lineNumber: number): FlowCommand | null {
  const line = stripComment(raw).trim();
  if (!line) return null;

  const functionLike = line.match(/^([A-Za-z][\w-]*)\((.*)\)$/);
  if (functionLike) {
    return {
      command: functionLike[1] ?? '',
      args: splitArgs(functionLike[2] ?? '', lineNumber, ','),
      lineNumber,
      raw,
    };
  }

  const [command, ...args] = splitArgs(line, lineNumber);
  if (!command) return null;
  return { command, args, lineNumber, raw };
}

function parseExpression(text: string, lineNumber: number): FlowExpression {
  const parser = new ExpressionParser(tokenizeExpression(text, lineNumber), lineNumber);
  return parser.parse();
}

class ExpressionParser {
  private index = 0;

  constructor(private readonly tokens: ExprToken[], private readonly lineNumber: number) {}

  parse(): FlowExpression {
    const expression = this.parseBinary(0);
    if (this.peek()) throw new AppError(`Line ${this.lineNumber}: unexpected token "${this.peek()?.value}".`);
    return expression;
  }

  private parseBinary(minPrecedence: number): FlowExpression {
    let left = this.parseUnary();
    while (true) {
      const token = this.peek();
      if (!token || token.type !== 'operator') break;
      const precedence = getPrecedence(token.value);
      if (precedence < minPrecedence) break;
      this.next();
      const right = this.parseBinary(precedence + 1);
      left = { type: 'binary', operator: token.value as FlowBinaryOperator, left, right };
    }
    return left;
  }

  private parseUnary(): FlowExpression {
    const token = this.peek();
    if (token?.type === 'operator' && (token.value === '!' || token.value === '-')) {
      this.next();
      return { type: 'unary', operator: token.value, argument: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): FlowExpression {
    const token = this.next();
    if (!token) throw new AppError(`Line ${this.lineNumber}: expected expression.`);
    if (token.type === 'number') return { type: 'literal', value: Number(token.value) };
    if (token.type === 'string') return { type: 'literal', value: token.value };
    if (token.type === 'boolean') return { type: 'literal', value: token.value === 'true' };
    if (token.type === 'null') return { type: 'literal', value: null };
    if (token.type === 'identifier') {
      if (this.peek()?.value === '(') {
        this.next();
        const args: FlowExpression[] = [];
        if (this.peek()?.value !== ')') {
          while (true) {
            args.push(this.parseBinary(0));
            if (this.peek()?.type !== 'comma') break;
            this.next();
          }
        }
        this.expect(')');
        return { type: 'call', name: token.value, args };
      }
      return { type: 'variable', name: token.value };
    }
    if (token.value === '(') {
      const expression = this.parseBinary(0);
      this.expect(')');
      return expression;
    }
    throw new AppError(`Line ${this.lineNumber}: unexpected token "${token.value}".`);
  }

  private peek(): ExprToken | undefined {
    return this.tokens[this.index];
  }

  private next(): ExprToken | undefined {
    const token = this.tokens[this.index];
    this.index += 1;
    return token;
  }

  private expect(value: string): void {
    const token = this.next();
    if (token?.value !== value) throw new AppError(`Line ${this.lineNumber}: expected "${value}".`);
  }
}

function tokenizeExpression(text: string, lineNumber: number): ExprToken[] {
  const tokens: ExprToken[] = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index] ?? '';
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      let value = '';
      index += 1;
      while (index < text.length) {
        const current = text[index] ?? '';
        if (current === '\\') {
          value += text[index + 1] ?? '';
          index += 2;
          continue;
        }
        if (current === quote) break;
        value += current;
        index += 1;
      }
      if (text[index] !== quote) throw new AppError(`Line ${lineNumber}: unterminated quote.`);
      index += 1;
      tokens.push({ type: 'string', value });
      continue;
    }
    if (/\d/.test(char) || (char === '.' && /\d/.test(text[index + 1] ?? ''))) {
      let value = char;
      index += 1;
      while (index < text.length && /[\d.]/.test(text[index] ?? '')) {
        value += text[index] ?? '';
        index += 1;
      }
      tokens.push({ type: 'number', value });
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let value = char;
      index += 1;
      while (index < text.length && /[A-Za-z0-9_-]/.test(text[index] ?? '')) {
        value += text[index] ?? '';
        index += 1;
      }
      if (value === 'true' || value === 'false') tokens.push({ type: 'boolean', value });
      else if (value === 'null') tokens.push({ type: 'null', value });
      else tokens.push({ type: 'identifier', value });
      continue;
    }
    const two = text.slice(index, index + 2);
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) {
      tokens.push({ type: 'operator', value: two });
      index += 2;
      continue;
    }
    if (['+', '-', '*', '/', '%', '<', '>', '!'].includes(char)) {
      tokens.push({ type: 'operator', value: char });
      index += 1;
      continue;
    }
    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      index += 1;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'comma', value: char });
      index += 1;
      continue;
    }
    throw new AppError(`Line ${lineNumber}: unexpected character "${char}".`);
  }
  return tokens;
}

function getPrecedence(operator: string): number {
  switch (operator) {
    case '||': return 1;
    case '&&': return 2;
    case '==':
    case '!=': return 3;
    case '<':
    case '<=':
    case '>':
    case '>=': return 4;
    case '+':
    case '-': return 5;
    case '*':
    case '/':
    case '%': return 6;
    default: return -1;
  }
}

function toParsedLines(lines: Array<{ raw: string; lineNumber: number }>): ParsedLine[] {
  return lines
    .map((item) => ({ raw: item.raw, line: stripComment(item.raw).trim(), lineNumber: item.lineNumber, indent: countIndent(item.raw) }))
    .filter((item) => item.line.length > 0);
}

function countIndent(line: string): number {
  let indent = 0;
  for (const char of line) {
    if (char === ' ') indent += 1;
    else if (char === '\t') indent += 2;
    else break;
  }
  return indent;
}

function stripOptionalOpenBrace(line: string): string {
  return line.endsWith('{') ? line.slice(0, -1).trim() : line;
}

function splitTopLevel(input: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: string | null = null;
  let depth = 0;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index] ?? '';
    if ((char === '"' || char === "'") && input[index - 1] !== '\\') quote = quote === char ? null : quote ?? char;
    if (quote === null && char === '(') depth += 1;
    if (quote === null && char === ')') depth -= 1;
    if (quote === null && depth === 0 && char === delimiter) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current.trim());
  return parts;
}

function parseInputLine(line: string, lineNumber: number): FlowInputDefinition {
  const match = line.match(/^([A-Za-z_][\w-]*)\s*(?::\s*([A-Za-z][\w-]*)(?:\s*(\[[^\]]*\]))?)?\s*(?:=\s*(.+))?$/);
  if (!match) throw new AppError(`Line ${lineNumber}: invalid input declaration.`);

  const name = match[1] ?? '';
  const rawType = match[2] ?? 'input';
  const type = normalizeInputType(rawType, lineNumber);
  const optionsText = match[3];
  const defaultText = match[4]?.trim();
  const options = optionsText ? parseOptions(optionsText, lineNumber) : undefined;

  if (type === 'comboBox' && (!options || options.length === 0)) throw new AppError(`Line ${lineNumber}: comboBox input requires options, e.g. comboBox ["a", "b"].`);
  if (type !== 'comboBox' && options) throw new AppError(`Line ${lineNumber}: only comboBox inputs can declare options.`);

  const defaultValue = defaultText === undefined ? undefined : parseDefaultValue(type, defaultText, options, lineNumber);
  return { name, type, lineNumber, defaultValue, options };
}

function normalizeInputType(value: string, lineNumber: number): FlowInputKind {
  const normalized = value.toLowerCase();
  if (normalized === 'string') return 'text';
  if (normalized === 'boolean' || normalized === 'bool') return 'checkbox';
  if (normalized === 'combobox' || normalized === 'combo') return 'comboBox';
  if (['input', 'text', 'number', 'file', 'folder', 'checkbox'].includes(normalized)) return normalized as FlowInputKind;
  throw new AppError(`Line ${lineNumber}: unknown input type "${value}".`);
}

function parseOptions(optionsText: string, lineNumber: number): string[] {
  const inner = optionsText.slice(1, -1);
  const options = splitArgs(inner, lineNumber, ',');
  if (options.some((option) => option.length === 0)) throw new AppError(`Line ${lineNumber}: comboBox options cannot be empty.`);
  return options;
}

function parseDefaultValue(type: FlowInputKind, text: string, options: string[] | undefined, lineNumber: number): FlowInputValue {
  const unquoted = unquote(text, lineNumber);
  switch (type) {
    case 'number': {
      const numberValue = Number(unquoted);
      if (!Number.isFinite(numberValue)) throw new AppError(`Line ${lineNumber}: invalid number default "${text}".`);
      return numberValue;
    }
    case 'checkbox': {
      if (/^(true|1|yes|on)$/i.test(unquoted)) return true;
      if (/^(false|0|no|off)$/i.test(unquoted)) return false;
      throw new AppError(`Line ${lineNumber}: invalid checkbox default "${text}".`);
    }
    case 'comboBox': {
      if (!options?.includes(unquoted)) throw new AppError(`Line ${lineNumber}: comboBox default must be one declared option.`);
      return unquoted;
    }
    case 'input': return autodetectValue(unquoted);
    case 'text':
    case 'file':
    case 'folder': return unquoted;
  }
}

function autodetectValue(value: string): string | number {
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return value;
}

function unquote(value: string, lineNumber: number): string {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === '"' || quote === "'") && trimmed[trimmed.length - 1] === quote) return trimmed.slice(1, -1).replace(/\\(["'])/g, '$1');
  if ((quote === '"' || quote === "'") || trimmed.endsWith('"') || trimmed.endsWith("'")) throw new AppError(`Line ${lineNumber}: unterminated quote.`);
  return trimmed;
}

function stripComment(line: string): string {
  let quote: string | null = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if ((char === '"' || char === "'") && line[index - 1] !== '\\') {
      quote = quote === char ? null : quote ?? char;
      continue;
    }
    if (char === '#' && quote === null) return line.slice(0, index);
    if (char === '/' && line[index + 1] === '/' && quote === null) return line.slice(0, index);
  }
  return line;
}

function splitArgs(input: string, lineNumber: number, delimiter?: string): string[] {
  const args: string[] = [];
  let current = '';
  let quote: string | null = null;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const previous = input[index - 1];

    if ((char === '"' || char === "'") && previous !== '\\') {
      quote = quote === char ? null : quote ?? char;
      continue;
    }

    const isDelimiter = delimiter ? char === delimiter : /\s/.test(char ?? '');
    if (isDelimiter && quote === null) {
      pushArg(args, current);
      current = '';
      continue;
    }

    current += char;
  }

  if (quote !== null) throw new AppError(`Line ${lineNumber}: unterminated quote.`);
  pushArg(args, current);
  return args.map((arg) => arg.replace(/\\(["'])/g, '$1'));
}

function pushArg(args: string[], value: string): void {
  const trimmed = value.trim();
  if (trimmed) args.push(trimmed);
}
