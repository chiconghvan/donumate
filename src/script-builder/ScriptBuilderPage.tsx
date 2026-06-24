import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  type OnNodeDrag,
  ReactFlow,
  type ReactFlowInstance,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuilderToolbar } from './components/BuilderToolbar.js';
import { NodeInspector } from './components/NodeInspector.js';
import { NodePalette } from './components/NodePalette.js';
import { OutputPanel } from './components/OutputPanel.js';
import { SamplePicker } from './components/SamplePicker.js';
import { scriptBuilderNodeTypes } from './components/nodes/index.js';
import { exportGraphToFlowSource } from './engine/exportGraphToFlowSource.js';
import { exportGraphToJson } from './engine/exportGraphToJson.js';
import { createBlankScriptBuilderFlow, createNodeFromDefinition, getDefinitionForNode, getEntryNode, getNode, nodeSummary, rebuildEdges, stringOrEmpty } from './engine/graphTraversal.js';
import { importFlowSourceToGraph } from './engine/importFlowSourceToGraph.js';
import { validateScriptBuilderFlow } from './engine/validateScriptBuilderFlow.js';
import { loadFlowSamples } from './samples/loadFlowSamples.js';
import type { FlowSample, RuntimeBlockDefinition, ScriptBuilderFlow, ScriptBuilderNode, ScriptBuilderVariable, ValidationIssue } from './types.js';

type BootstrapResponse = {
  flow?: ScriptBuilderFlow;
  source?: string;
  sourcePath?: string;
};

const DRAFT_KEY = 'donumate.scriptBuilder.draft';
const LAYOUT_KEY_PREFIX = 'donumate.scriptBuilder.layout:';

export function ScriptBuilderPage(): JSX.Element {
  const [flow, setFlow] = useState<ScriptBuilderFlow>(() => createBlankScriptBuilderFlow());
  const [samples, setSamples] = useState<FlowSample[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [isSamplePickerOpen, setSamplePickerOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);
  const [importSource, setImportSource] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<Node, Edge> | null>(null);

  useEffect(() => {
    void bootstrapBuilder();
    async function bootstrapBuilder(): Promise<void> {
      try {
        const sampleList = await loadFlowSamples();
        setSamples(sampleList);

        const response = await fetch('/api/bootstrap', { cache: 'no-store' });
        if (response.ok) {
          const bootstrap = await response.json() as BootstrapResponse;
          if (bootstrap.flow) {
            setFlow(withEdges(prepareFlow({ ...bootstrap.flow, edges: rebuildEdges(bootstrap.flow) })));
            return;
          }
          if (bootstrap.source) {
            setFlow(withEdges(prepareFlow(importFlowSourceToGraph(bootstrap.source, { sourcePath: bootstrap.sourcePath }))));
            return;
          }
        }

        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft) as ScriptBuilderFlow;
          setFlow(withEdges(prepareFlow(parsed)));
          return;
        }

      if (sampleList[0]) {
          setFlow(withEdges(prepareFlow(importFlowSourceToGraph(sampleList[0].source, { sourcePath: sampleList[0].path }))));
        }
      } catch {
        // keep blank builder when bootstrap fails
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, exportGraphToJson(flow));
    persistFlowLayout(flow);
  }, [flow]);

  const issues = useMemo(() => validateScriptBuilderFlow(flow), [flow]);
  const flowSource = useMemo(() => exportGraphToFlowSource(flow), [flow]);
  const jsonSource = useMemo(() => exportGraphToJson(flow), [flow]);
  const selectedNode = selectedNodeId ? getNode(flow, selectedNodeId) : undefined;
  const issueLevelByNode = useMemo(() => buildIssueMap(issues), [issues]);

  const reactFlowNodes = useMemo(() => flow.nodes.map((node): Node => {
    const definition = getDefinitionForNode(node);
    const handles = isBlockDefinition(definition) ? definition.handles ?? [] : [];
    const sourceHandles = [
      node.data.nextId !== undefined || definition?.nextHandle ? 'next' : '',
      handles.includes('true') ? 'true' : '',
      handles.includes('false') ? 'false' : '',
      handles.includes('body') ? 'body' : '',
    ].filter(Boolean) as string[];
    if (node.type === 'block.nextLoop' || node.type === 'block.exitLoop' || node.type === 'command.exit') {
      sourceHandles.splice(0, sourceHandles.length);
    }
    return {
      id: node.id,
      type: node.kind,
      position: node.position,
      data: {
        label: definition?.label ?? node.type,
        summary: nodeSummary(node),
        kind: node.kind,
        issueLevel: issueLevelByNode.get(node.id),
        sourceHandles,
      },
    };
  }), [flow.nodes, issueLevelByNode]);

  const reactFlowEdges = useMemo(() => flow.edges.map((edge): Edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    label: edge.label,
    animated: edge.branch === 'body',
  })), [flow.edges]);

  function updateFlow(updater: (current: ScriptBuilderFlow) => ScriptBuilderFlow): void {
    setFlow((current) => withEdges(syncInputNodes(updater(current))));
  }

  function handleAddNode(type: string): void {
    const selected = selectedNodeId ? getNode(flow, selectedNodeId) : undefined;
    const anchor = selected && selected.type !== 'variable.input' ? selected : getEntryNode(flow, 'main');
    const position = anchor ? { x: anchor.position.x, y: anchor.position.y + 120 } : { x: 620, y: 260 };
    const node = createNodeFromDefinition(type, position);
    const nodeId = node.id;

    updateFlow((current) => {
      if (type === 'variable.input') {
        const inputIndex = (current.variables?.length ?? 0) + 1;
        const variableId = nodeId;
        const variable: ScriptBuilderVariable = {
          id: variableId,
          name: `input_${inputIndex}`,
          type: 'input',
          lineNumber: inputIndex,
          defaultValue: '',
        };
        node.data = {
          ...node.data,
          variableId,
          name: variable.name,
          inputType: variable.type,
          defaultValue: '',
          options: [],
          description: '',
        };
        return {
          ...current,
          nodes: [...current.nodes, node],
          variables: [...(current.variables ?? []), variable],
        };
      }

      const nextNodes = [...current.nodes];
      nextNodes.push(node);
      if (selected && selected.type !== 'variable.input') {
        const nextId = stringOrEmpty(selected.data.nextId);
        const updatedNodes = nextNodes.map((candidate) => {
          if (candidate.id !== selected.id) return candidate;
          if (candidate.type === 'block.if' && !stringOrEmpty(candidate.data.trueId)) return candidate;
          if (candidate.type === 'block.if') return { ...candidate, data: { ...candidate.data, trueId: node.id } };
          if ((candidate.type === 'block.while' || candidate.type === 'block.for') && !stringOrEmpty(candidate.data.bodyId)) return candidate;
          if (candidate.type === 'block.while' || candidate.type === 'block.for') return { ...candidate, data: { ...candidate.data, bodyId: node.id } };
          return { ...candidate, data: { ...candidate.data, nextId: node.id } };
        }).map((candidate) => {
          if (candidate.id === node.id && nextId) {
            return { ...candidate, data: { ...candidate.data, nextId } };
          }
          return candidate;
        });
        return { ...current, nodes: updatedNodes };
      }

      return { ...current, nodes: nextNodes };
    });
    setSelectedNodeId(nodeId);
  }

  function handleNodeChanges(changes: NodeChange[]): void {
    updateFlow((current) => ({
      ...current,
      nodes: applyNodeChanges(changes, current.nodes as unknown as Node[]).map((item) => item as unknown as ScriptBuilderNode),
    }));
  }

  const handleNodeDragStop: OnNodeDrag<Node> = (_, draggedNode) => {
    updateFlow((current) => ({
      ...current,
      nodes: current.nodes.map((node) => node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node),
    }));
  };

  function handleConnect(connection: Connection): void {
    if (!connection.source || !connection.target) return;
    const branch = (connection.sourceHandle || 'next') as 'next' | 'true' | 'false' | 'body';
    updateFlow((current) => ({
      ...current,
      nodes: current.nodes.map((node) => {
        if (node.id !== connection.source) return node;
        const data: Record<string, unknown> = { ...node.data, useRawSource: false };
        if (branch === 'next') data.nextId = connection.target;
        if (branch === 'true') data.trueId = connection.target;
        if (branch === 'false') data.falseId = connection.target;
        if (branch === 'body') data.bodyId = connection.target;
        return { ...node, data };
      }),
      edges: addEdge(connection, current.edges as unknown as Edge[]) as unknown as ScriptBuilderFlow['edges'],
    }));
  }

  function handleUpdateNode(nodeId: string, key: string, value: unknown): void {
    updateFlow((current) => ({
      ...current,
      nodes: current.nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const updatedNode = { ...node, data: { ...node.data, [key]: value, useRawSource: false } };
        if (updatedNode.type !== 'variable.input') return updatedNode;
        const variableId = stringOrEmpty(updatedNode.data.variableId) || updatedNode.id;
        return {
          ...updatedNode,
          data: {
            ...updatedNode.data,
            variableId,
            name: key === 'name' ? value : updatedNode.data.name,
            inputType: key === 'inputType' ? value : updatedNode.data.inputType,
            defaultValue: key === 'defaultValue' ? value : updatedNode.data.defaultValue,
            options: key === 'options' ? value : updatedNode.data.options,
            description: key === 'description' ? value : updatedNode.data.description,
          },
        };
      }),
      variables: updateVariableListForNode(current.variables ?? [], current.nodes, nodeId, key, value),
    }));
  }

  function handleDeleteNode(nodeId: string): void {
    updateFlow((current) => ({
      ...current,
      nodes: current.nodes
        .filter((node) => node.id !== nodeId)
        .map((node) => ({
          ...node,
          data: {
            ...node.data,
            nextId: stringOrEmpty(node.data.nextId) === nodeId ? '' : node.data.nextId,
            trueId: stringOrEmpty(node.data.trueId) === nodeId ? '' : node.data.trueId,
            falseId: stringOrEmpty(node.data.falseId) === nodeId ? '' : node.data.falseId,
            bodyId: stringOrEmpty(node.data.bodyId) === nodeId ? '' : node.data.bodyId,
          },
        })),
      variables: (current.variables ?? []).filter((variable) => variable.id !== nodeId && variable.id !== getVariableIdForNode(current.nodes, nodeId)),
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(undefined);
  }

  function handleAddVariable(): void {
    handleAddNode('variable.input');
  }

  function handleUpdateVariable(index: number, key: string, value: unknown): void {
    updateFlow((current) => ({
      ...current,
      variables: (current.variables ?? []).map((variable, variableIndex) => variableIndex === index ? { ...variable, [key]: value } as ScriptBuilderVariable : variable),
      nodes: current.nodes.map((node) => {
        const variable = (current.variables ?? [])[index];
        if (!variable || node.type !== 'variable.input') return node;
        if (stringOrEmpty(node.data.variableId) !== variable.id && node.id !== variable.id) return node;
        const nextVariable = { ...variable, [key]: value } as ScriptBuilderVariable;
        return {
          ...node,
          data: {
            ...node.data,
            variableId: nextVariable.id,
            name: nextVariable.name,
            inputType: nextVariable.type,
            defaultValue: nextVariable.defaultValue ?? '',
            options: nextVariable.options ?? [],
            description: nextVariable.description ?? '',
            useRawSource: false,
          },
        };
      }),
    }));
  }

  function handleRemoveVariable(index: number): void {
    updateFlow((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => {
        if (node.type !== 'variable.input') return true;
        const variable = (current.variables ?? [])[index];
        return !variable || (stringOrEmpty(node.data.variableId) !== variable.id && node.id !== variable.id);
      }),
      variables: (current.variables ?? []).filter((_, variableIndex) => variableIndex !== index),
    }));
  }

  async function handleSave(): Promise<void> {
    const initial = flow.sourcePath || 'scripts/new-script.flow';
    const path = window.prompt('Save .flow path', initial);
    if (!path) return;
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, source: flowSource }),
    });
    if (!response.ok) {
      window.alert('Failed to save flow.');
      return;
    }
    updateFlow((current) => ({ ...current, sourcePath: path }));
  }

  async function handleLoad(): Promise<void> {
    const path = window.prompt('Load .flow path', flow.sourcePath || 'scripts/example.flow');
    if (!path) return;
    const response = await fetch(`/api/open?path=${encodeURIComponent(path)}`, { cache: 'no-store' });
    if (!response.ok) {
      window.alert('Failed to load flow.');
      return;
    }
    const payload = await response.json() as { source: string; path: string };
    setFlow(withEdges(prepareFlow(importFlowSourceToGraph(payload.source, { sourcePath: payload.path }))));
    setSelectedNodeId(undefined);
  }

  function handleNew(): void {
    setFlow(createBlankScriptBuilderFlow());
    setSelectedNodeId(undefined);
  }

  function handleImportFlow(): void {
    setImportSource('');
    setImportOpen(true);
  }

  function commitImportFlow(): void {
    if (!importSource.trim()) return;
    setFlow(withEdges(prepareFlow(importFlowSourceToGraph(importSource))));
    setImportOpen(false);
    setSelectedNodeId(undefined);
  }

  function handleExportFlow(): void {
    downloadText(`${flow.name || 'workflow'}.flow`, flowSource, 'text/plain;charset=utf-8');
  }

  function handleExportJson(): void {
    downloadText(`${flow.name || 'workflow'}.json`, jsonSource, 'application/json;charset=utf-8');
  }

  function handleFileLoad(): void {
    fileInputRef.current?.click();
  }

  function handleCanvasDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function handleCanvasDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/donumate-script-builder-node');
    if (!type || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const node = createNodeFromDefinition(type, position);
    updateFlow((current) => {
      if (type === 'variable.input') {
        const variableIndex = (current.variables?.length ?? 0) + 1;
        const variable: ScriptBuilderVariable = {
          id: node.id,
          name: `input_${variableIndex}`,
          type: 'input',
          lineNumber: variableIndex,
          defaultValue: '',
        };
        node.data = {
          ...node.data,
          variableId: node.id,
          name: variable.name,
          inputType: variable.type,
          defaultValue: '',
          options: [],
          description: '',
        };
        return {
          ...current,
          nodes: [...current.nodes, node],
          variables: [...(current.variables ?? []), variable],
        };
      }
      return {
        ...current,
        nodes: [...current.nodes, node],
      };
    });
    setSelectedNodeId(node.id);
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (file.name.toLowerCase().endsWith('.json')) {
      try {
        const parsed = JSON.parse(text) as ScriptBuilderFlow;
        setFlow(withEdges(prepareFlow(parsed)));
      } catch {
        window.alert('Invalid JSON file.');
      }
    } else {
      setFlow(withEdges(prepareFlow(importFlowSourceToGraph(text, { sourcePath: file.name }))));
    }
    event.target.value = '';
  }

  return (
    <div className="sb-app-shell">
      <BuilderToolbar
        sourcePath={flow.sourcePath}
        onNew={handleNew}
        onLoadSample={() => setSamplePickerOpen(true)}
        onSave={() => void handleSave()}
        onLoad={handleLoad}
        onValidate={() => setFlow((current) => ({ ...current }))}
        onImportFlow={handleImportFlow}
        onExportFlow={handleExportFlow}
        onExportJson={handleExportJson}
      />
      <div className="sb-main-grid">
        <NodePalette onAddNode={handleAddNode} />
        <section className="sb-canvas-panel">
          <div className="sb-canvas-head">
            <div>Canvas</div>
            <div className="sb-canvas-actions">
              <button type="button" onClick={handleFileLoad}>Load Local File</button>
            </div>
          </div>
          <div ref={reactFlowRef} className="sb-canvas" onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}>
            <ReactFlow
              fitView
              nodesDraggable
              nodes={reactFlowNodes}
              edges={reactFlowEdges}
              nodeTypes={scriptBuilderNodeTypes}
              onNodesChange={handleNodeChanges}
              onNodeDragStop={handleNodeDragStop}
              onConnect={handleConnect}
              onInit={setReactFlowInstance}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            >
              <MiniMap />
              <Controls />
              <Background gap={16} size={1} />
            </ReactFlow>
          </div>
        </section>
        <NodeInspector
          selectedNode={selectedNode}
          variables={flow.variables ?? []}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onAddVariable={handleAddVariable}
          onUpdateVariable={(index, key, value) => handleUpdateVariable(index, key, value)}
          onRemoveVariable={handleRemoveVariable}
        />
      </div>
      <OutputPanel
        issues={issues}
        flowSource={flowSource}
        jsonSource={jsonSource}
        parseWarnings={flow.metadata?.parseWarnings ?? []}
      />

      <SamplePicker
        isOpen={isSamplePickerOpen}
        samples={samples}
        onClose={() => setSamplePickerOpen(false)}
        onPick={(sample) => {
          setFlow(withEdges(prepareFlow(importFlowSourceToGraph(sample.source, { sourcePath: sample.path }))));
          setSamplePickerOpen(false);
          setSelectedNodeId(undefined);
        }}
      />

      {isImportOpen ? (
        <div className="sb-modal-backdrop" role="presentation" onClick={() => setImportOpen(false)}>
          <div className="sb-modal sb-import-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="sb-modal-head">
              <h3>Import .flow Source</h3>
              <button type="button" onClick={() => setImportOpen(false)}>Close</button>
            </div>
            <textarea value={importSource} onChange={(event) => setImportSource(event.target.value)} placeholder="Paste .flow source here" />
            <div className="sb-modal-actions">
              <button type="button" onClick={commitImportFlow}>Import</button>
            </div>
          </div>
        </div>
      ) : null}

      <input ref={fileInputRef} hidden accept=".flow,.txt,.json" type="file" onChange={(event) => void handleFileSelected(event)} />
    </div>
  );
}

function withEdges(flow: ScriptBuilderFlow): ScriptBuilderFlow {
  return {
    ...flow,
    edges: rebuildEdges(flow),
  };
}

function persistFlowLayout(flow: ScriptBuilderFlow): void {
  if (!flow.sourcePath) return;
  const layout = Object.fromEntries(
    flow.nodes.map((node) => [
      getNodeLayoutSignature(node),
      node.position,
    ]),
  );
  localStorage.setItem(`${LAYOUT_KEY_PREFIX}${flow.sourcePath}`, JSON.stringify(layout));
}

function applyStoredLayout(flow: ScriptBuilderFlow): ScriptBuilderFlow {
  if (!flow.sourcePath) return flow;
  const saved = localStorage.getItem(`${LAYOUT_KEY_PREFIX}${flow.sourcePath}`);
  if (!saved) return flow;
  try {
    const layout = JSON.parse(saved) as Record<string, { x: number; y: number }>;
    return {
      ...flow,
      nodes: flow.nodes.map((node) => {
        const position = layout[getNodeLayoutSignature(node)];
        return position ? { ...node, position } : node;
      }),
    };
  } catch {
    return flow;
  }
}

function getNodeLayoutSignature(node: ScriptBuilderNode): string {
  if (node.kind === 'meta' && node.data.blockName) {
    return `entry:${String(node.data.blockName)}`;
  }
  if (node.raw?.startLine !== undefined || node.raw?.endLine !== undefined) {
    return [
      node.type,
      node.raw.startLine ?? '',
      node.raw.endLine ?? '',
      (node.raw.source || '').trim(),
    ].join('|');
  }
  if (typeof node.data.source === 'string' && node.data.source.trim()) {
    return `${node.type}|${node.data.source.trim()}`;
  }
  return `${node.type}|${node.id}`;
}

function buildIssueMap(issues: ValidationIssue[]): Map<string, 'error' | 'warning'> {
  const map = new Map<string, 'error' | 'warning'>();
  for (const issue of issues) {
    if (!issue.nodeId) continue;
    const current = map.get(issue.nodeId);
    if (current === 'error') continue;
    map.set(issue.nodeId, issue.level);
  }
  return map;
}

function downloadText(fileName: string, text: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function prepareFlow(flow: ScriptBuilderFlow): ScriptBuilderFlow {
  return applyStoredLayout(syncInputNodes(flow));
}

function syncInputNodes(flow: ScriptBuilderFlow): ScriptBuilderFlow {
  const sourceVariables = flow.variables ?? [];
  const nextNodes: ScriptBuilderNode[] = [];
  const nextVariables: ScriptBuilderVariable[] = [];
  const matchedVariableIds = new Set<string>();

  for (const node of flow.nodes) {
    if (node.type !== 'variable.input') {
      nextNodes.push(node);
      continue;
    }

    const variableId = stringOrEmpty(node.data.variableId) || node.id;
    const existingVariable = sourceVariables.find((variable) => variable.id === variableId);
    const normalizedVariable = normalizeVariableFromNode(node, existingVariable, nextVariables.length, variableId);
    matchedVariableIds.add(variableId);
    nextVariables.push(normalizedVariable);
    nextNodes.push({
      ...node,
      id: variableId,
      data: {
        ...node.data,
        variableId,
        name: normalizedVariable.name,
        inputType: normalizedVariable.type,
        defaultValue: normalizedVariable.defaultValue ?? '',
        options: normalizedVariable.options ?? [],
        description: normalizedVariable.description ?? '',
        useRawSource: false,
      },
    });
  }

  const missingVariables = sourceVariables.filter((variable) => !matchedVariableIds.has(variable.id));
  for (const variable of missingVariables) {
    const node = createNodeFromDefinition('variable.input', getInputNodePosition(nextVariables.length));
    node.id = variable.id;
    node.data = {
      ...node.data,
      variableId: variable.id,
      name: variable.name,
      inputType: variable.type,
      defaultValue: variable.defaultValue ?? '',
      options: variable.options ?? [],
      description: variable.description ?? '',
      useRawSource: false,
    };
    nextNodes.push(node);
    nextVariables.push({ ...variable, lineNumber: nextVariables.length + 1 });
  }

  return {
    ...flow,
    nodes: nextNodes,
    variables: nextVariables,
  };
}

function normalizeVariableFromNode(
  node: ScriptBuilderNode,
  fallback: ScriptBuilderVariable | undefined,
  index: number,
  variableId: string,
): ScriptBuilderVariable {
  const inputType = normalizeInputType(node.data.inputType, fallback?.type);
  const options = normalizeInputOptions(node.data.options, fallback?.options);
  const defaultValue = normalizeInputDefaultValue(node.data.defaultValue, fallback?.defaultValue);
  return {
    id: variableId,
    name: stringOrEmpty(node.data.name) || fallback?.name || `input_${index + 1}`,
    type: inputType,
    lineNumber: fallback?.lineNumber ?? index + 1,
    defaultValue,
    options: options.length > 0 ? options : undefined,
    description: stringOrEmpty(node.data.description) || fallback?.description,
  };
}

function normalizeInputType(value: unknown, fallback?: ScriptBuilderVariable['type']): ScriptBuilderVariable['type'] {
  const allowed = new Set(['input', 'text', 'number', 'file', 'folder', 'checkbox', 'comboBox', 'inputExcelFile']);
  const candidate = typeof value === 'string' && allowed.has(value) ? value : fallback ?? 'input';
  return candidate as ScriptBuilderVariable['type'];
}

function normalizeInputOptions(value: unknown, fallback?: string[]): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }
  return fallback ? [...fallback] : [];
}

function normalizeInputDefaultValue(value: unknown, fallback?: ScriptBuilderVariable['defaultValue']): ScriptBuilderVariable['defaultValue'] {
  if (value === undefined || value === null) return fallback;
  return value as ScriptBuilderVariable['defaultValue'];
}

function getInputNodePosition(index: number): { x: number; y: number } {
  return { x: 240, y: 120 + index * 120 };
}

function getVariableIdForNode(nodes: ScriptBuilderNode[], nodeId: string): string {
  const node = nodes.find((candidate) => candidate.id === nodeId);
  return stringOrEmpty(node?.data.variableId) || nodeId;
}

function updateVariableListForNode(
  variables: ScriptBuilderVariable[],
  nodes: ScriptBuilderNode[],
  nodeId: string,
  key: string,
  value: unknown,
): ScriptBuilderVariable[] {
  const node = nodes.find((candidate) => candidate.id === nodeId);
  if (!node || node.type !== 'variable.input') return variables;
  const variableId = stringOrEmpty(node.data.variableId) || node.id;
  return variables.map((variable) => {
    if (variable.id !== variableId) return variable;
    const nextVariable = { ...variable } as ScriptBuilderVariable;
    if (key === 'name') nextVariable.name = String(value);
    if (key === 'inputType') nextVariable.type = normalizeInputType(value, nextVariable.type);
    if (key === 'defaultValue') nextVariable.defaultValue = value as ScriptBuilderVariable['defaultValue'];
    if (key === 'options') nextVariable.options = normalizeInputOptions(value, nextVariable.options);
    if (key === 'description') nextVariable.description = String(value);
    return nextVariable;
  });
}

function isBlockDefinition(value: unknown): value is RuntimeBlockDefinition {
  return Boolean(value) && typeof value === 'object' && 'handles' in (value as RuntimeBlockDefinition);
}
