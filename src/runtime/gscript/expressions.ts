import type { FlowInputValue } from '../types.js';
import type { GscriptExecutionContext } from './types.js';
import { asNumber, interpolate, resolveToken, stringifyValue } from './values.js';

export async function evaluateCondition(condition: string | undefined, ctx: GscriptExecutionContext): Promise<boolean> {
  const source = (condition ?? '').trim();
  if (!source) return false;

  const hasElementMatch = /^(!)?hasElement\(([\s\S]*?)\)\s*(?:(=|!=)\s*([\s\S]*))?$/.exec(source);
  if (hasElementMatch) {
    const xpath = interpolate(hasElementMatch[2] ?? '', ctx.inputs);
    const exists = await ctx.page?.existsXPath(xpath);
    const actual = hasElementMatch[1] ? !Boolean(exists) : Boolean(exists);
    if (!hasElementMatch[3]) return actual;
    const expected = Boolean(normalizeComparable(readValue(hasElementMatch[4] ?? '', ctx.inputs)));
    return hasElementMatch[3] === '=' ? actual === expected : actual !== expected;
  }

  const containsMatch = /^(!)?([\s\S]*?)\s+contains\s+([\s\S]*)$/i.exec(source) ?? /^(!)?contains\s+([\s\S]*)$/i.exec(source);
  if (containsMatch) {
    const negated = Boolean(containsMatch[1]);
    const left = containsMatch.length === 4 ? stringifyValue(readValue(containsMatch[2] ?? '', ctx.inputs)) : '';
    const right = stringifyValue(readValue(containsMatch[containsMatch.length === 4 ? 3 : 2] ?? '', ctx.inputs));
    const result = left.includes(right);
    return negated ? !result : result;
  }

  const comparison = splitComparison(source);
  if (comparison) {
    const left = readValue(comparison.left, ctx.inputs);
    const right = readValue(comparison.right, ctx.inputs);
    switch (comparison.operator) {
      case '=':
        return normalizeComparable(left) === normalizeComparable(right);
      case '!=':
        return normalizeComparable(left) !== normalizeComparable(right);
      case '>':
        return asNumber(left) > asNumber(right);
      case '<':
        return asNumber(left) < asNumber(right);
      case '>=':
        return asNumber(left) >= asNumber(right);
      case '<=':
        return asNumber(left) <= asNumber(right);
    }
  }

  return Boolean(normalizeComparable(readValue(source, ctx.inputs)));
}

function splitComparison(source: string): { left: string; operator: '=' | '!=' | '>' | '<' | '>=' | '<='; right: string } | undefined {
  const match = /^([\s\S]*?)\s*(>=|<=|!=|=|>|<)\s*([\s\S]*)$/.exec(source);
  if (!match) return undefined;
  return { left: match[1] ?? '', operator: match[2] as '=' | '!=' | '>' | '<' | '>=' | '<=', right: match[3] ?? '' };
}

function readValue(source: string, vars: Record<string, FlowInputValue>): FlowInputValue {
  const trimmed = source.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return resolveToken(trimmed, vars);
}

function normalizeComparable(value: FlowInputValue): string | number | boolean {
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  const text = stringifyValue(value).trim();
  if (/^(true|false)$/i.test(text)) return /^true$/i.test(text);
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(text)) return Number(text);
  return text;
}
