import { parseFlowProgram } from '../runtime/dsl/parser.js';
import { printFlowProgram } from '../runtime/dsl/printer.js';
import type { FlowProgram } from '../runtime/dsl/types.js';
import { exportGraphToFlowSource } from './engine/exportGraphToFlowSource.js';
import { exportGraphToJson } from './engine/exportGraphToJson.js';
import { createBlankScriptBuilderFlow, rebuildEdges } from './engine/graphTraversal.js';
import { importFlowSourceToGraph } from './engine/importFlowSourceToGraph.js';
import type { ScriptBuilderFlow } from './types.js';

export type FlowGraphDocument = ScriptBuilderFlow;
export type FlowGraphBlockName = 'beforeRunProfile' | 'main' | 'afterKillProfile';

export function createBlankGraphDocument(path?: string): FlowGraphDocument {
  return createBlankScriptBuilderFlow(path);
}

export function normalizeGraphDocument(document: FlowGraphDocument): FlowGraphDocument {
  return {
    ...document,
    edges: rebuildEdges(document),
  };
}

export function isGraphDocument(value: unknown): value is FlowGraphDocument {
  return Boolean(value) && typeof value === 'object' && Array.isArray((value as { nodes?: unknown }).nodes) && Array.isArray((value as { edges?: unknown }).edges);
}

export function parseGraphDocument(source: string, path?: string): FlowGraphDocument {
  const parsed = JSON.parse(source) as FlowGraphDocument;
  return normalizeGraphDocument({ ...parsed, sourcePath: path ?? parsed.sourcePath });
}

export function serializeGraphDocument(document: FlowGraphDocument): string {
  return exportGraphToJson(normalizeGraphDocument(document));
}

export function flowSourceToGraphDocument(source: string, path?: string): FlowGraphDocument {
  return normalizeGraphDocument(importFlowSourceToGraph(source, { sourcePath: path }));
}

export function flowProgramToGraphDocument(program: FlowProgram, path?: string): FlowGraphDocument {
  return flowSourceToGraphDocument(printFlowProgram(program), path);
}

export function graphDocumentToFlowProgram(document: FlowGraphDocument): FlowProgram {
  return parseFlowProgram(exportGraphToFlowSource(document));
}

export function graphDocumentToFlowSource(document: FlowGraphDocument): string {
  return exportGraphToFlowSource(document);
}

export function graphDocumentToJsSource(document: FlowGraphDocument): string {
  const source = exportGraphToFlowSource(document)
    .split(/\r?\n/)
    .map((line) => `// ${line}`)
    .join('\n');
  return `${source}\n`;
}
