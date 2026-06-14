import type { RemoteValue } from './bidi-types.js';

export function fromRemoteValue(value: RemoteValue): unknown {
  if (!value || typeof value !== 'object') return value;

  switch (value.type) {
    case 'undefined':
      return undefined;
    case 'null':
      return null;
    case 'string':
    case 'number':
    case 'boolean':
      return value.value;
    case 'array':
      return Array.isArray(value.value) ? value.value.map((item) => fromRemoteValue(item as RemoteValue)) : [];
    case 'object':
      return objectFromRemoteValue(value.value);
    default:
      return value.value;
  }
}

function objectFromRemoteValue(raw: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!Array.isArray(raw)) return result;

  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    const [key, entryValue] = entry;
    const name = typeof key === 'string' ? key : String(fromRemoteValue(key as RemoteValue));
    result[name] = fromRemoteValue(entryValue as RemoteValue);
  }

  return result;
}
