import type { FlowInputValue } from '../types.js';

export const BLOCK_SEPARATOR = '==============';

export function logGscript(ctx: Pick<{ log: (...args: unknown[]) => void }, 'log'>, message: string): void {
  ctx.log(formatGscriptLine(message));
}

export function formatGscriptLine(message: string, date = new Date()): string {
  return `[${formatTimestamp(date)}] ${message}`;
}

export function formatBlockSeparator(): string {
  return BLOCK_SEPARATOR;
}

export function formatBlockTitle(label: string, comment?: string | null): string {
  return comment?.trim() ? `${label} - ${comment.trim()}` : label;
}

export function formatFlowValue(value: FlowInputValue | unknown, maxLength = 180): string {
  if (typeof value === 'string') return JSON.stringify(truncate(value, maxLength));
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return JSON.stringify(value);
  if (Array.isArray(value)) {
    const rendered = JSON.stringify(value.map((item) => summarizeValue(item, 40)));
    return truncate(rendered, maxLength);
  }
  return truncate(summarizeValue(value, maxLength), maxLength);
}

export function formatRedactedValue(label = '<redacted>'): string {
  return JSON.stringify(label);
}

function summarizeValue(value: unknown, maxLength: number): string {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  if (!raw) return '""';
  if (raw.length <= maxLength) return JSON.stringify(raw);
  return JSON.stringify(`${raw.slice(0, maxLength)}...`);
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function formatTimestamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}
