import { checkFlowSource } from '../../runtime/dsl/checker.js';
import { getNodeDefinition } from '../nodeRegistry.js';
import type { ScriptBuilderFlow, ScriptBuilderNode, ValidationIssue } from '../types.js';
import { exportGraphToFlowSource } from './exportGraphToFlowSource.js';
import { getEntryNode, getNodeMap, stringOrEmpty } from './graphTraversal.js';

export function validateScriptBuilderFlow(flow: ScriptBuilderFlow): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeMap = getNodeMap(flow);

  validateEntries(flow, issues);
  validateEdges(flow, nodeMap, issues);
  validateNodes(flow.nodes, nodeMap, issues);
  validateCycles(flow, nodeMap, issues);

  try {
    const source = exportGraphToFlowSource(flow);
    const diagnostics = checkFlowSource(source, flow.sourcePath ?? 'builder.flow');
    for (const diagnostic of diagnostics.diagnostics) {
      issues.push({
        level: diagnostic.severity === 'error' ? 'error' : 'warning',
        message: `${diagnostic.code}: ${diagnostic.message}`,
      });
    }
  } catch (error) {
    issues.push({
      level: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return issues;
}

function validateEntries(flow: ScriptBuilderFlow, issues: ValidationIssue[]): void {
  if (!getEntryNode(flow, 'beforeRunProfile')) {
    issues.push({ level: 'error', message: 'Missing before() entry node.' });
  }
  if (!getEntryNode(flow, 'main')) {
    issues.push({ level: 'error', message: 'Missing running() entry node.' });
  }
  if (!getEntryNode(flow, 'afterKillProfile')) {
    issues.push({ level: 'error', message: 'Missing after() entry node.' });
  }
}

function validateEdges(flow: ScriptBuilderFlow, nodeMap: Map<string, ScriptBuilderNode>, issues: ValidationIssue[]): void {
  for (const edge of flow.edges) {
    if (!nodeMap.has(edge.source)) {
      issues.push({ level: 'error', edgeId: edge.id, message: `Edge source "${edge.source}" does not exist.` });
    }
    if (!nodeMap.has(edge.target)) {
      issues.push({ level: 'error', edgeId: edge.id, message: `Edge target "${edge.target}" does not exist.` });
    }
  }
}

function validateNodes(nodes: ScriptBuilderNode[], nodeMap: Map<string, ScriptBuilderNode>, issues: ValidationIssue[]): void {
  const variableNames = new Set<string>();
  for (const node of nodes) {
    const definition = getNodeDefinition(node.type);
    if (!definition) {
      issues.push({ level: 'warning', nodeId: node.id, message: `Unknown node definition "${node.type}".` });
      continue;
    }

    for (const field of definition.fields) {
      if (!field.required) continue;
      const value = node.data[field.key];
      const emptyString = typeof value === 'string' && value.trim().length === 0;
      const missing = value === undefined || value === null || emptyString;
      if (missing) {
        issues.push({ level: 'error', nodeId: node.id, message: `${definition.label}: "${field.label}" is required.` });
      }
    }

    if (node.type === 'block.if' && !stringOrEmpty(node.data.condition)) {
      issues.push({ level: 'error', nodeId: node.id, message: 'If condition cannot be empty.' });
    }
    if ((node.type === 'block.while' || node.type === 'block.for') && !stringOrEmpty(node.data.condition)) {
      issues.push({ level: 'error', nodeId: node.id, message: 'Loop condition cannot be empty.' });
    }
    if (node.type === 'block.for') {
      if (!stringOrEmpty(node.data.init)) issues.push({ level: 'error', nodeId: node.id, message: 'For loop init cannot be empty.' });
      if (!stringOrEmpty(node.data.update)) issues.push({ level: 'error', nodeId: node.id, message: 'For loop update cannot be empty.' });
    }
    if (node.type === 'block.if') {
      const trueId = stringOrEmpty(node.data.trueId);
      if (trueId && !nodeMap.has(trueId)) issues.push({ level: 'error', nodeId: node.id, message: 'If true branch points to a missing node.' });
      const falseId = stringOrEmpty(node.data.falseId);
      if (falseId && !nodeMap.has(falseId)) issues.push({ level: 'error', nodeId: node.id, message: 'If false branch points to a missing node.' });
    }
    if (node.type === 'block.while' || node.type === 'block.for') {
      const bodyId = stringOrEmpty(node.data.bodyId);
      if (bodyId && !nodeMap.has(bodyId)) issues.push({ level: 'error', nodeId: node.id, message: 'Loop body points to a missing node.' });
    }

    if (node.type === 'variable.assignment') {
      const name = stringOrEmpty(node.data.name).toLowerCase();
      if (name) {
        if (variableNames.has(name)) {
          issues.push({ level: 'warning', nodeId: node.id, message: `Variable "${name}" is assigned more than once.` });
        }
        variableNames.add(name);
      }
    }

    if (node.kind === 'raw' || node.raw?.parseStatus === 'unknown' || node.raw?.parseStatus === 'raw') {
      issues.push({ level: 'warning', nodeId: node.id, message: `${definition.label} is using raw source fallback.` });
    }
  }
}

function validateCycles(flow: ScriptBuilderFlow, nodeMap: Map<string, ScriptBuilderNode>, issues: ValidationIssue[]): void {
  const visited = new Set<string>();
  const stack = new Set<string>();

  function walk(nodeId: string): void {
    if (!nodeId || visited.has(nodeId)) return;
    if (stack.has(nodeId)) return;
    visited.add(nodeId);
    stack.add(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) {
      stack.delete(nodeId);
      return;
    }

    for (const edge of relationTargets(node)) {
      if (edge === node.id) continue;
      const target = nodeMap.get(edge);
      if (!target) continue;
      if (stack.has(edge) && target.type !== 'block.while' && target.type !== 'block.for') {
        issues.push({ level: 'error', nodeId: node.id, message: `Invalid cycle detected between "${node.id}" and "${edge}".` });
        continue;
      }
      walk(edge);
    }

    stack.delete(nodeId);
  }

  for (const blockName of ['beforeRunProfile', 'main', 'afterKillProfile'] as const) {
    const entry = getEntryNode(flow, blockName);
    walk(stringOrEmpty(entry?.data.nextId));
  }
}

function relationTargets(node: ScriptBuilderNode): string[] {
  return [
    stringOrEmpty(node.data.nextId),
    stringOrEmpty(node.data.trueId),
    stringOrEmpty(node.data.falseId),
    stringOrEmpty(node.data.bodyId),
  ].filter(Boolean);
}
