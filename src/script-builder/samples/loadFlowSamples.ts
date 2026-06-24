import type { FlowSample } from '../types.js';

export async function loadFlowSamples(): Promise<FlowSample[]> {
  const response = await fetch('/api/samples', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load flow samples: ${response.status}`);
  return response.json() as Promise<FlowSample[]>;
}
