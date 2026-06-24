import { parseFlowProgram } from '../../runtime/dsl/parser.js';
import type { FlowForStatement, FlowIfStatement, FlowProgram, FlowStatement } from '../../runtime/dsl/types.js';
import { AppError } from '../../utils/errors.js';
import { getCommandDefinitionByName } from '../nodeRegistry.js';
import type { ScriptBuilderFlow, ScriptBuilderNode, ScriptBuilderPosition, ScriptBuilderVariable } from '../types.js';
import { createBlankScriptBuilderFlow, createNodeFromDefinition, stringOrEmpty } from './graphTraversal.js';
import { extractStandaloneComment, splitSourceLines, stripComment } from './flowSyntax.js';

type CommentItem = {
  type: 'comment';
  lineNumber: number;
  raw: string;
  style: '#' | '//';
  text: string;
};

type SequenceItem = FlowStatement | CommentItem;

type ImportSequenceResult = {
  firstId?: string;
  fallthroughIds: string[];
};

type ImportContext = {
  nodes: ScriptBuilderNode[];
  warnings: string[];
};

const BLOCK_X: Record<'beforeRunProfile' | 'main' | 'afterKillProfile', number> = {
  beforeRunProfile: 120,
  main: 620,
  afterKillProfile: 1120,
};

const Y_STEP = 112;
const X_STEP = 250;

export function importFlowSourceToGraph(source: string, options?: { sourcePath?: string }): ScriptBuilderFlow {
  const flow = createBlankScriptBuilderFlow(options?.sourcePath);
  flow.originalSource = source;
  const warnings: string[] = [];
  const context: ImportContext = { nodes: [...flow.nodes], warnings };

  let program: FlowProgram;
  try {
    program = parseFlowProgram(source);
  } catch (error) {
    const raw = createNodeFromDefinition('raw.block', { x: BLOCK_X.main, y: 280 });
    raw.data.source = source.trim();
    raw.raw = { source, parseStatus: 'raw', startLine: 1, endLine: source.split(/\r?\n/).length };
    const runningEntry = context.nodes.find((node) => node.data.blockName === 'main');
    if (runningEntry) runningEntry.data.nextId = raw.id;
    context.nodes.push(raw);
    flow.nodes = context.nodes;
    flow.edges = [];
    flow.metadata = {
      ...flow.metadata,
      parseWarnings: [error instanceof Error ? error.message : String(error)],
    };
    return flow;
  }

  flow.variables = program.inputs.map((input, index): ScriptBuilderVariable => ({
    ...input,
    id: `input-${index + 1}-${input.name}`,
  }));

  const commentMap = extractTopLevelComments(source);
  importBlock(context, flow, 'beforeRunProfile', program.beforeRunProfile, commentMap.beforeRunProfile);
  importBlock(context, flow, 'main', program.main, commentMap.main);
  importBlock(context, flow, 'afterKillProfile', program.afterKillProfile, commentMap.afterKillProfile);

  flow.nodes = context.nodes;
  flow.metadata = {
    ...flow.metadata,
    updatedAt: new Date().toISOString(),
    parseWarnings: warnings,
  };
  return flow;
}

function importBlock(
  context: ImportContext,
  flow: ScriptBuilderFlow,
  blockName: 'beforeRunProfile' | 'main' | 'afterKillProfile',
  statements: FlowStatement[],
  comments: CommentItem[],
): void {
  const entry = context.nodes.find((node) => node.data.blockName === blockName);
  if (!entry) return;
  const items = mergeTopLevelItems(statements, comments);
  const result = importSequence(context, items, BLOCK_X[blockName], 240, 0);
  entry.data.nextId = result.firstId ?? '';
}

function mergeTopLevelItems(statements: FlowStatement[], comments: CommentItem[]): SequenceItem[] {
  const items: SequenceItem[] = [];
  let statementIndex = 0;
  let commentIndex = 0;
  while (statementIndex < statements.length || commentIndex < comments.length) {
    const statement = statements[statementIndex];
    const comment = comments[commentIndex];
    if (comment && (!statement || comment.lineNumber < statement.lineNumber)) {
      items.push(comment);
      commentIndex += 1;
      continue;
    }
    if (statement) {
      items.push(statement);
      statementIndex += 1;
      continue;
    }
  }
  return items;
}

function importSequence(
  context: ImportContext,
  items: SequenceItem[],
  x: number,
  yStart: number,
  depth: number,
): ImportSequenceResult {
  let firstId: string | undefined;
  let fallthroughIds: string[] = [];
  let y = yStart;

  for (const item of items) {
    const result = item.type === 'comment'
      ? importCommentNode(context, item, { x, y })
      : importStatementNode(context, item, { x, y }, depth);
    if (!firstId && result.firstId) firstId = result.firstId;
    if (result.firstId) {
      for (const terminalId of fallthroughIds) {
        const terminal = context.nodes.find((node) => node.id === terminalId);
        if (terminal) terminal.data.nextId = result.firstId;
      }
    }
    fallthroughIds = result.fallthroughIds;
    y += Y_STEP;
  }

  return { firstId, fallthroughIds };
}

function importCommentNode(context: ImportContext, item: CommentItem, position: ScriptBuilderPosition): ImportSequenceResult {
  const node = createNodeFromDefinition('meta.comment', position);
  node.data.style = item.style;
  node.data.text = item.text;
  node.data.useRawSource = true;
  node.raw = { source: item.raw, startLine: item.lineNumber, endLine: item.lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);
  return { firstId: node.id, fallthroughIds: [node.id] };
}

function importStatementNode(
  context: ImportContext,
  statement: FlowStatement,
  position: ScriptBuilderPosition,
  depth: number,
): ImportSequenceResult {
  switch (statement.type) {
    case 'command':
      return importCommandNode(context, statement.command, statement.args, statement.raw, statement.lineNumber, position);
    case 'assignment':
      return importAssignmentNode(context, statement.raw, statement.lineNumber, position);
    case 'loopControl':
      return importLoopControlNode(context, statement.control, statement.raw, statement.lineNumber, position);
    case 'while':
      return importWhileNode(context, statement.raw, statement.lineNumber, statement.condition ? StringExpression(statement.condition) : 'true', statement.body, position, depth);
    case 'for':
      return importForNode(context, statement, position, depth);
    case 'if':
      return importIfNode(context, statement, position, depth);
  }
}

function importCommandNode(
  context: ImportContext,
  commandName: string,
  args: string[],
  raw: string,
  lineNumber: number,
  position: ScriptBuilderPosition,
): ImportSequenceResult {
  const definition = getCommandDefinitionByName(commandName);
  if (!definition) {
    const rawNode = createNodeFromDefinition('raw.command', position);
    rawNode.data.source = stripComment(raw).trim();
    rawNode.raw = { source: raw, startLine: lineNumber, endLine: lineNumber, parseStatus: 'unknown' };
    context.warnings.push(`Line ${lineNumber}: kept unknown command "${commandName}" as raw node.`);
    context.nodes.push(rawNode);
    return { firstId: rawNode.id, fallthroughIds: [rawNode.id] };
  }
  const node = createNodeFromDefinition(definition.type, position);
  node.data = {
    ...node.data,
    ...definition.fromArgs?.(args),
    commandName: definition.label,
    useRawSource: true,
  };
  node.raw = { source: raw, startLine: lineNumber, endLine: lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);
  return {
    firstId: node.id,
    fallthroughIds: definition.nextHandle === false ? [] : [node.id],
  };
}

function importAssignmentNode(context: ImportContext, raw: string, lineNumber: number, position: ScriptBuilderPosition): ImportSequenceResult {
  const node = createNodeFromDefinition('variable.assignment', position);
  const trimmed = stripComment(raw).trim();
  const match = trimmed.match(/^(set\s+)?(?:\$\{([A-Za-z_][\w-]*)\}|([A-Za-z_][\w-]*))\s*=\s*(.+)$/i);
  node.data.name = match?.[2] ?? match?.[3] ?? '';
  node.data.value = match?.[4] ?? '';
  node.data.assignmentStyle = match?.[1] ? 'set' : 'plain';
  node.data.useRawSource = true;
  node.raw = { source: raw, startLine: lineNumber, endLine: lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);
  return { firstId: node.id, fallthroughIds: [node.id] };
}

function importLoopControlNode(
  context: ImportContext,
  control: 'next' | 'exit',
  raw: string,
  lineNumber: number,
  position: ScriptBuilderPosition,
): ImportSequenceResult {
  const node = createNodeFromDefinition(control === 'next' ? 'block.nextLoop' : 'block.exitLoop', position);
  node.data.useRawSource = true;
  node.raw = { source: raw, startLine: lineNumber, endLine: lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);
  return { firstId: node.id, fallthroughIds: [] };
}

function importWhileNode(
  context: ImportContext,
  raw: string,
  lineNumber: number,
  condition: string,
  body: FlowStatement[],
  position: ScriptBuilderPosition,
  depth: number,
): ImportSequenceResult {
  const node = createNodeFromDefinition('block.while', position);
  node.data.condition = condition;
  node.data.useRawSource = true;
  node.raw = { source: raw, startLine: lineNumber, endLine: lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);
  const bodyResult = importSequence(context, body, position.x + X_STEP, position.y + Y_STEP, depth + 1);
  node.data.bodyId = bodyResult.firstId ?? '';
  for (const terminalId of bodyResult.fallthroughIds) {
    const terminal = context.nodes.find((candidate) => candidate.id === terminalId);
    if (terminal) terminal.data.nextId = node.id;
  }
  return { firstId: node.id, fallthroughIds: [node.id] };
}

function importForNode(
  context: ImportContext,
  statement: FlowForStatement,
  position: ScriptBuilderPosition,
  depth: number,
): ImportSequenceResult {
  const node = createNodeFromDefinition('block.for', position);
  node.data.init = `${statement.init.name} = ${StringExpression(statement.init.value)}`;
  node.data.condition = StringExpression(statement.condition);
  node.data.update = `${statement.update.name} = ${StringExpression(statement.update.value)}`;
  node.data.useRawSource = true;
  node.raw = { source: statement.raw, startLine: statement.lineNumber, endLine: statement.lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);
  const bodyResult = importSequence(context, statement.body, position.x + X_STEP, position.y + Y_STEP, depth + 1);
  node.data.bodyId = bodyResult.firstId ?? '';
  for (const terminalId of bodyResult.fallthroughIds) {
    const terminal = context.nodes.find((candidate) => candidate.id === terminalId);
    if (terminal) terminal.data.nextId = node.id;
  }
  return { firstId: node.id, fallthroughIds: [node.id] };
}

function importIfNode(
  context: ImportContext,
  statement: FlowIfStatement,
  position: ScriptBuilderPosition,
  depth: number,
): ImportSequenceResult {
  return importIfChain(context, statement, 0, statement.elseBody, position, depth);
}

function importIfChain(
  context: ImportContext,
  statement: FlowIfStatement,
  branchIndex: number,
  finalElse: FlowStatement[] | undefined,
  position: ScriptBuilderPosition,
  depth: number,
): ImportSequenceResult {
  const branch = statement.branches[branchIndex];
  const node = createNodeFromDefinition('block.if', position);
  node.data.condition = StringExpression(branch?.condition);
  node.data.useRawSource = true;
  node.raw = { source: branch?.raw ?? statement.raw, startLine: branch?.lineNumber ?? statement.lineNumber, endLine: branch?.lineNumber ?? statement.lineNumber, parseStatus: 'parsed' };
  context.nodes.push(node);

  const trueResult = importSequence(context, branch?.body ?? [], position.x + X_STEP, position.y + Y_STEP, depth + 1);
  node.data.trueId = trueResult.firstId ?? '';

  let falseResult: ImportSequenceResult = { firstId: undefined, fallthroughIds: [node.id] };
  if (branchIndex < statement.branches.length - 1) {
    const nestedPosition = { x: position.x + X_STEP, y: Math.max(position.y + Y_STEP, position.y) };
    falseResult = importIfChain(context, statement, branchIndex + 1, finalElse, nestedPosition, depth + 1);
    node.data.falseId = falseResult.firstId ?? '';
  } else if (finalElse && finalElse.length > 0) {
    falseResult = importSequence(context, finalElse, position.x + X_STEP, position.y + Y_STEP + (depth * 8), depth + 1);
    node.data.falseId = falseResult.firstId ?? '';
  }

  const fallthroughIds = [...trueResult.fallthroughIds, ...falseResult.fallthroughIds];
  if (trueResult.firstId === undefined) fallthroughIds.push(node.id);
  if (!node.data.falseId) fallthroughIds.push(node.id);
  return { firstId: node.id, fallthroughIds: dedupe(fallthroughIds) };
}

function extractTopLevelComments(source: string): Record<'beforeRunProfile' | 'main' | 'afterKillProfile', CommentItem[]> {
  const result = {
    beforeRunProfile: [] as CommentItem[],
    main: [] as CommentItem[],
    afterKillProfile: [] as CommentItem[],
  };
  const lines = splitSourceLines(source);
  let currentBlock: 'beforeRunProfile' | 'main' | 'afterKillProfile' | null = null;
  let pendingBody = false;
  for (const line of lines) {
    const trimmed = stripComment(line.raw).trim();
    const rawTrimmed = line.raw.trim();
    if (/^before(?:\s*\(\s*\)|\s+run\s+profile)?\s*\{?\s*$/i.test(rawTrimmed)) {
      currentBlock = 'beforeRunProfile';
      pendingBody = true;
      continue;
    }
    if (/^(?:running\s*\(\s*\)|running|run\s+profile)\s*\{?\s*$/i.test(rawTrimmed)) {
      currentBlock = 'main';
      pendingBody = true;
      continue;
    }
    if (/^after(?:\s*\(\s*\)|\s+kill\s+profile)?\s*\{?\s*$/i.test(rawTrimmed)) {
      currentBlock = 'afterKillProfile';
      pendingBody = true;
      continue;
    }
    if (currentBlock && rawTrimmed === '}') {
      currentBlock = null;
      pendingBody = false;
      continue;
    }
    if (!currentBlock) continue;
    if (pendingBody && !rawTrimmed) continue;
    pendingBody = false;
    const comment = extractStandaloneComment(line.raw);
    if (comment) {
      result[currentBlock].push({
        type: 'comment',
        lineNumber: line.lineNumber,
        raw: line.raw,
        style: comment.style,
        text: comment.text,
      });
    } else if (!trimmed && rawTrimmed) {
      // noop
    }
  }
  return result;
}

function StringExpression(value: unknown): string {
  if (!value || typeof value !== 'object' || !('type' in value)) return 'true';
  const expression = value as unknown as { type: string };
  switch (expression.type) {
    case 'literal': {
      const literal = value as unknown as { value: unknown };
      if (typeof literal.value === 'string') return `"${literal.value.replace(/"/g, '""')}"`;
      if (typeof literal.value === 'number' || typeof literal.value === 'boolean') return String(literal.value);
      if (literal.value === null) return 'null';
      return 'null';
    }
    case 'variable':
      return String((value as unknown as { name: string }).name);
    case 'unary':
      return `${String((value as unknown as { operator: string }).operator)}${StringExpression((value as unknown as { argument: unknown }).argument)}`;
    case 'binary':
      return `${StringExpression((value as unknown as { left: unknown }).left)} ${String((value as unknown as { operator: string }).operator)} ${StringExpression((value as unknown as { right: unknown }).right)}`;
    case 'call': {
      const call = value as unknown as { name: string; args: unknown[] };
      return `${call.name}(${call.args.map((item) => StringExpression(item)).join(', ')})`;
    }
    case 'index': {
      const index = value as unknown as { object: unknown; index: unknown };
      return `${StringExpression(index.object)}[${StringExpression(index.index)}]`;
    }
    default:
      return 'true';
  }
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
