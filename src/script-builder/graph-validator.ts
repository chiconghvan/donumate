import { exportGraphToFlowSource } from './engine/exportGraphToFlowSource.js';
import { validateScriptBuilderFlow } from './engine/validateScriptBuilderFlow.js';
import type { FlowGraphDocument } from './graph-model.js';

export type GraphValidationResult = {
  diagnostics: Array<{ severity: 'error' | 'warning'; message: string }>;
  compiledSource: string;
};

export function validateGraphDocument(document: FlowGraphDocument): GraphValidationResult {
  const diagnostics = validateScriptBuilderFlow(document).map((issue) => ({
    severity: issue.level,
    message: issue.message,
  }));
  return {
    diagnostics,
    compiledSource: exportGraphToFlowSource(document),
  };
}
