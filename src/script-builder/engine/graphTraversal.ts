import { getNodeDefinition } from '../nodeRegistry.js';
import type { RuntimeBlockDefinition, RuntimeCommandDefinition, ScriptBuilderBranch, ScriptBuilderEdge, ScriptBuilderFlow, ScriptBuilderNode, ScriptBuilderPosition } from '../types.js';

const ENTRY_POSITIONS: Record<string, ScriptBuilderPosition> = {
  'meta.entry.before': { x: 120, y: 120 },
  'meta.entry.running': { x: 620, y: 120 },
  'meta.entry.after': { x: 1120, y: 120 },
};

export function createNodeId(prefix: string): string {
  const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix.replace(/[^a-z0-9]+/gi, '-')}-${token}`;
}

export function createEntryNodes(): ScriptBuilderNode[] {
  return ['meta.entry.before', 'meta.entry.running', 'meta.entry.after'].map((type) => {
    const definition = getNodeDefinition(type);
    return {
      id: createNodeId(type),
      type,
      kind: definition?.kind ?? 'meta',
      position: ENTRY_POSITIONS[type],
      data: { ...(definition?.defaultData ?? {}) },
    };
  });
}

export function createBlankScriptBuilderFlow(path?: string): ScriptBuilderFlow {
  const now = new Date().toISOString();
  return {
    version: 1,
    name: path ? basenameWithoutExtension(path) : 'script-builder',
    sourceType: 'flow',
    sourcePath: path,
    nodes: createEntryNodes(),
    edges: [],
    variables: [],
    metadata: {
      createdAt: now,
      updatedAt: now,
      docsVersion: 'flow-scripting.md',
      parseWarnings: [],
    },
  };
}

export function createNodeFromDefinition(type: string, position: ScriptBuilderPosition): ScriptBuilderNode {
  const definition = getNodeDefinition(type);
  if (!definition) {
    return {
      id: createNodeId(type),
      type: 'raw.unknown',
      kind: 'raw',
      position,
      data: { source: '', nextId: '', useRawSource: true },
      raw: { source: '', parseStatus: 'unknown' },
    };
  }
  return {
    id: createNodeId(type),
    type,
    kind: definition.kind,
    position,
    data: { ...definition.defaultData },
  };
}

export function getEntryNode(flow: ScriptBuilderFlow, blockName: 'beforeRunProfile' | 'main' | 'afterKillProfile'): ScriptBuilderNode | undefined {
  return flow.nodes.find((node) => node.kind === 'meta' && node.data.blockName === blockName);
}

export function getNode(flow: ScriptBuilderFlow, nodeId: string): ScriptBuilderNode | undefined {
  return flow.nodes.find((node) => node.id === nodeId);
}

export function getNodeMap(flow: ScriptBuilderFlow): Map<string, ScriptBuilderNode> {
  return new Map(flow.nodes.map((node) => [node.id, node]));
}

export function updateNodeRelation(node: ScriptBuilderNode, branch: ScriptBuilderBranch, targetId: string | undefined): ScriptBuilderNode {
  const data = { ...node.data };
  if (branch === 'next' || branch === 'loop') data.nextId = targetId ?? '';
  if (branch === 'true') data.trueId = targetId ?? '';
  if (branch === 'false') data.falseId = targetId ?? '';
  if (branch === 'body') data.bodyId = targetId ?? '';
  return {
    ...node,
    data,
  };
}

export function rebuildEdges(flow: ScriptBuilderFlow): ScriptBuilderEdge[] {
  const edges: ScriptBuilderEdge[] = [];
  for (const node of flow.nodes) {
    const nextId = stringOrEmpty(node.data.nextId);
    if (nextId) {
      edges.push({
        id: `${node.id}:next:${nextId}`,
        source: node.id,
        target: nextId,
        sourceHandle: 'next',
        label: 'next',
        branch: 'next',
      });
    }
    const trueId = stringOrEmpty(node.data.trueId);
    if (trueId) {
      edges.push({
        id: `${node.id}:true:${trueId}`,
        source: node.id,
        target: trueId,
        sourceHandle: 'true',
        label: 'true',
        branch: 'true',
      });
    }
    const falseId = stringOrEmpty(node.data.falseId);
    if (falseId) {
      edges.push({
        id: `${node.id}:false:${falseId}`,
        source: node.id,
        target: falseId,
        sourceHandle: 'false',
        label: 'false',
        branch: 'false',
      });
    }
    const bodyId = stringOrEmpty(node.data.bodyId);
    if (bodyId) {
      edges.push({
        id: `${node.id}:body:${bodyId}`,
        source: node.id,
        target: bodyId,
        sourceHandle: 'body',
        label: 'body',
        branch: 'body',
      });
    }
  }
  return edges;
}

export function getDefinitionForNode(node: ScriptBuilderNode): RuntimeCommandDefinition | RuntimeBlockDefinition | undefined {
  return getNodeDefinition(node.type);
}

export function sortNodesForPanel(nodes: ScriptBuilderNode[]): ScriptBuilderNode[] {
  return [...nodes].sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y || a.id.localeCompare(b.id));
}

export function nodeSummary(node: ScriptBuilderNode): string {
  const definition = getDefinitionForNode(node);
  if (definition?.summary) return definition.summary(node.data);
  if (node.kind === 'raw') return stringOrEmpty(node.data.source);
  return '';
}

export function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function basenameWithoutExtension(value: string): string {
  const normalized = value.replace(/\\/g, '/');
  const name = normalized.split('/').pop() ?? normalized;
  return name.replace(/\.(flow|json)$/i, '');
}
