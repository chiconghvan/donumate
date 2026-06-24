import type { ScriptBuilderFlow } from '../types.js';

export function exportGraphToJson(flow: ScriptBuilderFlow): string {
  return `${JSON.stringify(flow, null, 2)}\n`;
}
