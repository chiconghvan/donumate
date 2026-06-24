export type SourceLine = {
  raw: string;
  lineNumber: number;
};

export function splitSourceLines(source: string): SourceLine[] {
  return source.split(/\r?\n/).map((raw, index) => ({ raw, lineNumber: index + 1 }));
}

export function countIndent(line: string): number {
  let indent = 0;
  for (const char of line) {
    if (char === ' ') indent += 1;
    else if (char === '\t') indent += 2;
    else break;
  }
  return indent;
}

export function stripComment(line: string): string {
  let quote: '"' | "'" | null = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index] ?? '';
    if (char === '"' || char === "'") {
      if (quote === char && line[index + 1] === char) {
        index += 1;
        continue;
      }
      quote = quote === char ? null : quote ?? char;
      continue;
    }
    if (!quote && char === '#') return line.slice(0, index);
    if (!quote && char === '/' && line[index + 1] === '/') return line.slice(0, index);
  }
  return line;
}

export function extractStandaloneComment(line: string): { style: '#' | '//'; text: string } | null {
  const trimmed = line.trim();
  if (trimmed.startsWith('#')) return { style: '#', text: trimmed.slice(1).trim() };
  if (trimmed.startsWith('//')) return { style: '//', text: trimmed.slice(2).trim() };
  return null;
}

export function quoteFlowString(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function looksNumeric(value: string): boolean {
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim());
}

export function quoteCommandArg(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '""';
  if (/^rdelay(?:\(\))?$/i.test(trimmed) || /^rdelay\(\s*\d+\s*,\s*\d+\s*\)$/i.test(trimmed)) return trimmed;
  if (trimmed === 'true' || trimmed === 'false' || looksNumeric(trimmed)) return trimmed;
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) return trimmed;
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) return trimmed;
  if (/^[A-Z][A-Z0-9_]*$/.test(trimmed)) return trimmed;
  return quoteFlowString(trimmed);
}

export function normalizeLine(raw: string): string {
  return raw.replace(/\r/g, '');
}
