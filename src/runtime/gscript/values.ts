import type { InputValue } from '../input-types.js';

const VARIABLE_PATTERN = /\$([A-Za-z_][A-Za-z0-9_]*)(?:\[\$?([A-Za-z_][A-Za-z0-9_]*|-?\d+)\])?/g;

export function getVariable(vars: Record<string, InputValue>, name: string): InputValue {
  return vars[name] ?? '';
}

export function setVariable(vars: Record<string, InputValue>, name: string | null | undefined, value: InputValue): void {
  const key = name?.trim();
  if (key) vars[key] = value;
}

export function resolveToken(token: string, vars: Record<string, InputValue>): InputValue {
  const trimmed = token.trim();
  const match = /^\$([A-Za-z_][A-Za-z0-9_]*)(?:\[\$?([A-Za-z_][A-Za-z0-9_]*|-?\d+)\])?$/.exec(trimmed);
  if (match) {
    const value = getVariable(vars, match[1] ?? '');
    const indexToken = match[2];
    if (indexToken === undefined) return value;
    const rawIndex = /^-?\d+$/.test(indexToken) ? Number(indexToken) : Number(getVariable(vars, indexToken));
    return Array.isArray(value) ? value[rawIndex] ?? '' : '';
  }
  if (/^(true|false)$/i.test(trimmed)) return /^true$/i.test(trimmed);
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return Number(trimmed);
  return interpolate(token, vars);
}

export function interpolate(text: string | undefined | null, vars: Record<string, InputValue>): string {
  if (!text) return '';
  return text.replace(VARIABLE_PATTERN, (_full, name: string, indexToken: string | undefined) => {
    const value = getVariable(vars, name);
    if (indexToken !== undefined) {
      const index = /^-?\d+$/.test(indexToken) ? Number(indexToken) : Number(getVariable(vars, indexToken));
      return String(Array.isArray(value) ? value[index] ?? '' : '');
    }
    return Array.isArray(value) ? value.join(',') : String(value);
  });
}

export function asNumber(value: InputValue): number {
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(num) ? num : 0;
}

export function asBoolean(value: InputValue): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return /^(true|1|yes|on)$/i.test(String(value).trim());
}

export function stringifyValue(value: InputValue): string {
  return Array.isArray(value) ? value.join(',') : String(value);
}

export function parseLiteralOrInterpolated(text: string | undefined, vars: Record<string, InputValue>): InputValue {
  if (text === undefined) return '';
  if (/^\$[A-Za-z_][A-Za-z0-9_]*(?:\[\$?[A-Za-z_][A-Za-z0-9_]*|-?\d+\])?$/.test(text.trim())) return resolveToken(text, vars);
  return interpolate(text, vars);
}
