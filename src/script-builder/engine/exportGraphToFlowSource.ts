import { getNodeDefinition } from '../nodeRegistry.js';
import type { RuntimeCommandDefinition, ScriptBuilderFlow, ScriptBuilderNode } from '../types.js';
import { getEntryNode, getNodeMap, stringOrEmpty } from './graphTraversal.js';
import { quoteCommandArg, quoteFlowString } from './flowSyntax.js';

type ExportState = {
  nodeMap: Map<string, ScriptBuilderNode>;
  lines: string[];
  emitted: Set<string>;
  warnings: string[];
};

export function exportGraphToFlowSource(flow: ScriptBuilderFlow): string {
  if (canRoundTripOriginalSource(flow)) {
    return `${flow.originalSource?.trimEnd() ?? ''}\n`;
  }
  const state: ExportState = {
    nodeMap: getNodeMap(flow),
    lines: [],
    emitted: new Set<string>(),
    warnings: [],
  };

  emitInputs(flow, state);
  emitBlock(flow, 'beforeRunProfile', 'before()', state);
  emitBlock(flow, 'main', 'running()', state);
  emitBlock(flow, 'afterKillProfile', 'after()', state);

  return `${state.lines.join('\n').trimEnd()}\n`;
}

function emitInputs(flow: ScriptBuilderFlow, state: ExportState): void {
  if (!flow.variables || flow.variables.length === 0) return;
  state.lines.push('inputs {');
  for (const input of flow.variables) {
    const typeText = input.type === 'input' && !input.options?.length ? '' : `: ${input.type}${input.options?.length ? ` [${input.options.map(quoteFlowString).join(', ')}]` : ''}`;
    const defaultText = input.defaultValue === undefined ? '' : ` = ${printInputValue(input.defaultValue)}`;
    state.lines.push(`  ${input.name}${typeText}${defaultText}`);
  }
  state.lines.push('}', '');
}

function emitBlock(
  flow: ScriptBuilderFlow,
  blockName: 'beforeRunProfile' | 'main' | 'afterKillProfile',
  label: string,
  state: ExportState,
): void {
  const entry = getEntryNode(flow, blockName);
  state.lines.push(`${label} {`);
  emitSequence(stringOrEmpty(entry?.data.nextId), '', 1, state);
  state.lines.push('}');
  if (blockName !== 'afterKillProfile') state.lines.push('');
}

function emitSequence(currentId: string, stopId: string, depth: number, state: ExportState): void {
  let nextId = currentId;
  let guard = 0;
  const seen = new Set<string>();
  while (nextId && nextId !== stopId && guard < 10_000) {
    guard += 1;
    if (seen.has(nextId)) break;
    seen.add(nextId);
    const node = state.nodeMap.get(nextId);
    if (!node) break;
    if (state.emitted.has(`${depth}:${node.id}:${stopId}`)) break;
    state.emitted.add(`${depth}:${node.id}:${stopId}`);

    if (node.type === 'block.if') {
      emitIf(node, depth, state);
      nextId = stringOrEmpty(node.data.nextId);
      continue;
    }
    if (node.type === 'block.while' || node.type === 'block.for') {
      emitLoop(node, depth, state);
      nextId = stringOrEmpty(node.data.nextId);
      continue;
    }

    for (const line of renderLeafNode(node, depth)) state.lines.push(line);
    nextId = stringOrEmpty(node.data.nextId);
  }
}

function emitIf(node: ScriptBuilderNode, depth: number, state: ExportState): void {
  const indent = '  '.repeat(depth);
  const condition = stringOrEmpty(node.data.condition) || 'true';
  state.lines.push(`${indent}if ${condition} {`);
  emitSequence(stringOrEmpty(node.data.trueId), stringOrEmpty(node.data.nextId), depth + 1, state);
  state.lines.push(`${indent}}`);

  const falseId = stringOrEmpty(node.data.falseId);
  if (!falseId) return;

  const falseNode = state.nodeMap.get(falseId);
  if (falseNode?.type === 'block.if') {
    emitElseIf(falseNode, depth, stringOrEmpty(node.data.nextId), state);
    return;
  }

  state.lines.push(`${indent}else {`);
  emitSequence(falseId, stringOrEmpty(node.data.nextId), depth + 1, state);
  state.lines.push(`${indent}}`);
}

function emitElseIf(node: ScriptBuilderNode, depth: number, stopId: string, state: ExportState): void {
  const indent = '  '.repeat(depth);
  state.lines.push(`${indent}else if ${stringOrEmpty(node.data.condition) || 'true'} {`);
  emitSequence(stringOrEmpty(node.data.trueId), stringOrEmpty(node.data.nextId) || stopId, depth + 1, state);
  state.lines.push(`${indent}}`);
  const falseId = stringOrEmpty(node.data.falseId);
  if (!falseId) return;
  const falseNode = state.nodeMap.get(falseId);
  if (falseNode?.type === 'block.if') {
    emitElseIf(falseNode, depth, stopId, state);
    return;
  }
  state.lines.push(`${indent}else {`);
  emitSequence(falseId, stringOrEmpty(node.data.nextId) || stopId, depth + 1, state);
  state.lines.push(`${indent}}`);
}

function emitLoop(node: ScriptBuilderNode, depth: number, state: ExportState): void {
  const indent = '  '.repeat(depth);
  if (node.type === 'block.while') {
    state.lines.push(`${indent}while ${stringOrEmpty(node.data.condition) || 'true'} {`);
  } else {
    state.lines.push(`${indent}for ${stringOrEmpty(node.data.init) || 'i = 0'}; ${stringOrEmpty(node.data.condition) || 'true'}; ${stringOrEmpty(node.data.update) || 'i = i + 1'} {`);
  }
  emitSequence(stringOrEmpty(node.data.bodyId), node.id, depth + 1, state);
  state.lines.push(`${indent}}`);
}

function renderLeafNode(node: ScriptBuilderNode, depth: number): string[] {
  const indent = '  '.repeat(depth);
  if (node.data.useRawSource === true && node.raw?.source) {
    return node.raw.source
      .split(/\r?\n/)
      .map((line) => `${indent}${line.trim()}`.trimEnd());
  }

  if (node.kind === 'command') {
    const definition = getNodeDefinition(node.type);
    const commandName = node.type.replace(/^command\./, '');
    const commandDefinition = isCommandDefinition(definition) ? definition : undefined;
    const args = commandDefinition?.toArgs
      ? commandDefinition.toArgs(node.data)
      : [];
    return [`${indent}${commandName}(${args.map(quoteCommandArg).join(', ')})`];
  }

  if (node.type === 'variable.assignment') {
    const prefix = node.data.assignmentStyle === 'set' ? 'set ' : '';
    return [`${indent}${prefix}${stringOrEmpty(node.data.name)} = ${stringOrEmpty(node.data.value) || 'null'}`];
  }

  if (node.type === 'block.nextLoop') return [`${indent}nextLoop`];
  if (node.type === 'block.exitLoop') return [`${indent}exitLoop`];

  if (node.type === 'meta.comment') {
    const style = stringOrEmpty(node.data.style) || '#';
    return [`${indent}${style} ${stringOrEmpty(node.data.text)}`.trimEnd()];
  }

  if (node.kind === 'raw') {
    const raw = stringOrEmpty(node.data.source) || node.raw?.source || '';
    return raw.split(/\r?\n/).map((line) => `${indent}${line.trim()}`.trimEnd());
  }

  return [];
}

function printInputValue(value: unknown): string {
  if (typeof value === 'string') return quoteFlowString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => printInputValue(item)).join(', ')}]`;
  return 'null';
}

function isCommandDefinition(value: unknown): value is RuntimeCommandDefinition {
  return Boolean(value) && typeof value === 'object' && 'toArgs' in (value as RuntimeCommandDefinition);
}

function canRoundTripOriginalSource(flow: ScriptBuilderFlow): boolean {
  if (!flow.originalSource) return false;
  return flow.nodes.every((node) => node.kind === 'meta' || node.data.locked === true || node.data.useRawSource === true);
}
