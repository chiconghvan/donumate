import type { InputValue } from '../input-types.js';
import type { GscriptExecutionContext } from './types.js';
import { asNumber, interpolate, resolveToken, stringifyValue } from './values.js';

export async function evaluateCondition(condition: string | undefined, ctx: GscriptExecutionContext): Promise<boolean> {
  const source = (condition ?? '').trim();
  if (!source) return false;

  const hasElementMatch = parseHasElement(source);
  if (hasElementMatch) {
    const xpath = interpolate(hasElementMatch.xpath, ctx.inputs);
    const exists = await ctx.page?.existsXPath(xpath);
    const actual = hasElementMatch.negated ? !Boolean(exists) : Boolean(exists);
    if (hasElementMatch.comparison === undefined) return actual;
    const expected = Boolean(normalizeComparable(readValue(hasElementMatch.comparison, ctx.inputs)));
    return hasElementMatch.equality ? actual === expected : actual !== expected;
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

function parseHasElement(source: string): { negated: boolean; xpath: string; comparison?: string; equality?: boolean } | undefined {
  const match = /^(!)?\s*hasElement\(/i.exec(source);
  if (!match) return undefined;
  const negated = Boolean(match[1]);
  let i = match[0].length;
  let depth = 1;
  let inQuote: string | undefined;
  while (i < source.length) {
    const ch = source[i];
    if (inQuote) {
      if (ch === inQuote && source[i - 1] !== '\\') inQuote = undefined;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) break;
    }
    i++;
  }
  if (depth !== 0) return undefined;
  const xpath = source.slice(match[0].length, i).trim();
  const rest = source.slice(i + 1).trim();
  if (!rest) return { negated, xpath };
  const compMatch = /^(=|!=)\s*([\s\S]*)$/.exec(rest);
  if (!compMatch) return { negated, xpath };
  return { negated, xpath, comparison: compMatch[2]?.trim(), equality: compMatch[1] === '=' };
}

function splitComparison(source: string): { left: string; operator: '=' | '!=' | '>' | '<' | '>=' | '<='; right: string } | undefined {
  const match = /^([\s\S]*?)\s*(>=|<=|!=|=|>|<)\s*([\s\S]*)$/.exec(source);
  if (!match) return undefined;
  return { left: match[1] ?? '', operator: match[2] as '=' | '!=' | '>' | '<' | '>=' | '<=', right: match[3] ?? '' };
}

function readValue(source: string, vars: Record<string, InputValue>): InputValue {
  const trimmed = source.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return resolveToken(trimmed, vars);
}

function normalizeComparable(value: InputValue): string | number | boolean {
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  const text = stringifyValue(value).trim();
  if (/^(true|false)$/i.test(text)) return /^true$/i.test(text);
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(text)) return Number(text);
  return text;
}
