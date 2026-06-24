import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { parseFlowProgram } from '../runtime/dsl/parser.js';
import { FLOW_COMPLETIONS, FLOW_INPUT_COMPLETIONS, type FlowCompletionItem } from '../runtime/dsl/catalog.js';
import type { FlowInputDefinition, FlowStatement } from '../runtime/dsl/types.js';
import { runInkPrompt } from './ink-runner.js';
import { uiTheme } from './ui-theme.js';

type InputKey = {
  upArrow?: boolean;
  downArrow?: boolean;
  leftArrow?: boolean;
  rightArrow?: boolean;
  return?: boolean;
  escape?: boolean;
  tab?: boolean;
  backspace?: boolean;
  delete?: boolean;
  ctrl?: boolean;
  sequence?: string;
};

type Cursor = {
  line: number;
  column: number;
};

type FlowScriptEditorProps = {
  filePath: string;
  initialSource: string;
  onSubmit: (source: string) => void;
  onCancel: () => void;
};

type CompletionState = {
  open: boolean;
  forced: boolean;
  cursor: number;
};

const MAX_COMPLETIONS = 8;

function splitLines(source: string): string[] {
  const lines = source.split('\n');
  return lines.length === 0 ? [''] : lines;
}

function joinLines(lines: string[]): string {
  return lines.join('\n');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tokenStart(line: string, column: number): number {
  let index = column;
  while (index > 0 && /[A-Za-z0-9_-]/.test(line[index - 1] ?? '')) index -= 1;
  return index;
}

/** tokenStart that also recognizes `$` prefix for ${variable} completions */
function dollarTokenStart(line: string, column: number): number {
  let index = column;
  while (index > 0 && /[A-Za-z0-9_-]/.test(line[index - 1] ?? '')) index -= 1;
  // If preceding char is $, include it (but not if it's part of \${)
  if (index > 0 && line[index - 1] === '$' && line.substring(index, column).length > 0) {
    index -= 1;
  }
  return index;
}

function currentToken(line: string, column: number): { token: string; start: number } {
  const start = tokenStart(line, column);
  return { token: line.slice(start, column), start };
}

function matchesCompletion(item: FlowCompletionItem, token: string): boolean {
  const lowered = token.toLowerCase();
  if (!lowered) return true;
  return [item.name, ...item.aliases].some((value) => value.toLowerCase().startsWith(lowered));
}

function getActiveCompletions(token: string, isInputBlock: boolean): FlowCompletionItem[] {
  const source = isInputBlock ? FLOW_INPUT_COMPLETIONS : FLOW_COMPLETIONS;
  if (!token) return source;
  return source.filter((item) => matchesCompletion(item, token));
}

/** Check if the current position looks like inside ${...} — preceding text has `${` with no intervening `}` */
function isInsideInterpolation(line: string, column: number): boolean {
  return interpolationStart(line, column) >= 0;
}

/** Return variable-only completions for ${...} context */
function getInterpolationCompletions(source: string, rawToken: string): FlowCompletionItem[] {
  // Strip leading $ if present
  const token = rawToken.startsWith('$') ? rawToken.slice(1) : rawToken;
  const vars = extractVariableNames(source);
  if (!token) return vars;
  const lowered = token.toLowerCase();
  return vars.filter((v) => v.name.toLowerCase().startsWith(lowered));
}

function isInsideInputsBlock(lines: string[], cursor: Cursor): boolean {
  let block = false;
  for (let lineIndex = 0; lineIndex <= cursor.line; lineIndex += 1) {
    const line = (lines[lineIndex] ?? '').trim();
    if (/^inputs\s*\{$/i.test(line)) block = true;
    if (block && lineIndex === cursor.line) return true;
    if (block && line === '}') block = false;
  }
  return false;
}

/** Detect if cursor is inside ${ ... } interpolation (no `}` between `${` and cursor) */
function interpolationStart(line: string, column: number): number {
  let i = column;
  while (i > 0) {
    const c = line[i - 1] ?? '';
    if (c === '}') return -1;
    if (i >= 2 && line[i - 2] === '$' && c === '{') return i - 2;
    i -= 1;
  }
  return -1;
}

/** Extract variable names from parsed flow program (inputs + assignments) */
function extractVariableNames(source: string): FlowCompletionItem[] {
  try {
    const program = parseFlowProgram(source);
    const names = new Set<string>();
    for (const input of program.inputs) {
      if (input.name) names.add(input.name);
    }
    for (const block of [program.beforeRunProfile, program.main, program.afterKillProfile]) {
      for (const stmt of block) {
        if (stmt.type === 'assignment' && stmt.name) names.add(stmt.name);
      }
    }
    return Array.from(names).sort().map((name) => ({
      name,
      aliases: [],
      desc: 'variable',
      kind: 'syntax' as const,
      snippet: name + '}',
    }));
  } catch {
    return [];
  }
}

function firstEmptySlot(snippet: string): number {
  const quoted = snippet.search(/['"]{2}/);
  if (quoted >= 0) return quoted + 1;
  const comma = snippet.indexOf(',');
  if (comma >= 0) return comma;
  const paren = snippet.indexOf('()');
  if (paren >= 0) return paren + 1;
  return snippet.length;
}

function isBackspace(input: string, key: InputKey): boolean {
  return key.backspace === true || input === '\b' || input === '';
}

function isDelete(input: string, key: InputKey): boolean {
  return key.delete === true && !isBackspace(input, key);
}

function insertAt(lines: string[], cursor: Cursor, text: string): { lines: string[]; cursor: Cursor } {
  const current = lines[cursor.line] ?? '';
  const before = current.slice(0, cursor.column);
  const after = current.slice(cursor.column);
  const parts = text.split('\n');
  if (parts.length === 1) {
    const nextLine = before + (parts[0] ?? '') + after;
    return { lines: lines.map((line, index) => (index === cursor.line ? nextLine : line)), cursor: { line: cursor.line, column: before.length + text.length } };
  }

  const first = before + (parts[0] ?? '');
  const last = (parts[parts.length - 1] ?? '') + after;
  const middle = parts.slice(1, -1);
  const nextLines = [
    ...lines.slice(0, cursor.line),
    first,
    ...middle,
    last,
    ...lines.slice(cursor.line + 1),
  ];
  return { lines: nextLines, cursor: { line: cursor.line + parts.length - 1, column: (parts[parts.length - 1] ?? '').length } };
}

function replaceToken(lines: string[], cursor: Cursor, start: number, snippet: string): { lines: string[]; cursor: Cursor } {
  const current = lines[cursor.line] ?? '';
  const before = current.slice(0, start);
  const after = current.slice(cursor.column);
  const insert = insertAt(lines.map((line, index) => (index === cursor.line ? before + after : line)), { line: cursor.line, column: start }, snippet);
  const slot = firstEmptySlot(snippet);
  const beforeSlot = snippet.slice(0, slot);
  const lineOffset = beforeSlot.split('\n').length - 1;
  const slotColumn = lineOffset === 0 ? start + beforeSlot.length : (beforeSlot.split('\n').pop() ?? '').length;
  return { lines: insert.lines, cursor: { line: cursor.line + lineOffset, column: slotColumn } };
}

export function FlowScriptEditor({ filePath, initialSource, onSubmit, onCancel }: FlowScriptEditorProps): React.ReactElement {
  const [lines, setLines] = useState(() => splitLines(initialSource));
  const [cursor, setCursor] = useState<Cursor>({ line: 0, column: 0 });
  const [completion, setCompletion] = useState<CompletionState>({ open: false, forced: false, cursor: 0 });
  const [error, setError] = useState<string>();

  const lineText = lines[cursor.line] ?? '';
  const rawTokenInfo = currentToken(lineText, cursor.column);
  // Variable context: inside ${ ... } or cursor on/after a bare $ without { yet
  const insideInterp = isInsideInterpolation(lineText, cursor.column);
  const atDollar = rawTokenInfo.start > 0 && lineText[rawTokenInfo.start - 1] === '$';
  const varContext = insideInterp || atDollar;
  // In variable context, include $ prefix in the token so completions filter correctly
  const tokenInfo = varContext && atDollar
    ? { token: '$' + rawTokenInfo.token, start: rawTokenInfo.start - 1 }
    : rawTokenInfo;
  const isInputBlock = isInsideInputsBlock(lines, cursor);
  const source = joinLines(lines);
  const completions = useMemo(() => {
    if (!completion.open) return [];
    if (!completion.forced && tokenInfo.token.length === 0) return [];
    if (varContext) {
      const varToken = tokenInfo.token.startsWith('$') ? tokenInfo.token.slice(1).toLowerCase() : tokenInfo.token.toLowerCase();
      const vars = extractVariableNames(source);
      if (!varToken) return vars.slice(0, MAX_COMPLETIONS);
      return vars.filter((v) => v.name.toLowerCase().startsWith(varToken)).slice(0, MAX_COMPLETIONS);
    }
    return getActiveCompletions(tokenInfo.token, isInputBlock).slice(0, MAX_COMPLETIONS);
  }, [completion.open, completion.forced, tokenInfo.token, isInputBlock, varContext, source]);
  const completionOpen = completion.open && completions.length > 0;
  const completionCursor = clamp(completion.cursor, 0, Math.max(completions.length - 1, 0));

  const setCursorClamped = (next: Cursor, nextLines = lines) => {
    const line = clamp(next.line, 0, nextLines.length - 1);
    const column = clamp(next.column, 0, (nextLines[line] ?? '').length);
    setCursor({ line, column });
  };

  const mutate = (nextLines: string[], nextCursor: Cursor) => {
    setLines(nextLines);
    setCursorClamped(nextCursor, nextLines);
    setCompletion((current) => ({ ...current, open: false, cursor: 0 }));
    setError(undefined);
  };

  const acceptCompletion = () => {
    const item = completions[completionCursor];
    if (!item) return;
    const next = replaceToken(lines, cursor, tokenInfo.start, item.snippet);
    mutate(next.lines, next.cursor);
  };

  useInput((input: string, key: InputKey) => {
    if (key.ctrl && input.toLowerCase() === 's') {
      const source = joinLines(lines);
      try {
        parseFlowProgram(source);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return;
      }
      onSubmit(source);
      return;
    }

    if (key.ctrl && input === ' ') {
      setCompletion({ open: true, forced: true, cursor: 0 });
      return;
    }

    if (completionOpen && key.upArrow) {
      setCompletion((current) => ({ ...current, cursor: current.cursor <= 0 ? completions.length - 1 : current.cursor - 1 }));
      return;
    }
    if (completionOpen && key.downArrow) {
      setCompletion((current) => ({ ...current, cursor: current.cursor >= completions.length - 1 ? 0 : current.cursor + 1 }));
      return;
    }
    if (completionOpen && (key.return || key.tab)) {
      acceptCompletion();
      return;
    }

    if (key.escape) {
      if (completion.open) {
        setCompletion((current) => ({ ...current, open: false, forced: false, cursor: 0 }));
        return;
      }
      onCancel();
      return;
    }

    if (key.upArrow) {
      setCursorClamped({ line: cursor.line - 1, column: cursor.column });
      setCompletion((current) => ({ ...current, open: false }));
      return;
    }
    if (key.downArrow) {
      setCursorClamped({ line: cursor.line + 1, column: cursor.column });
      setCompletion((current) => ({ ...current, open: false }));
      return;
    }
    if (key.leftArrow) {
      if (cursor.column > 0) setCursorClamped({ line: cursor.line, column: cursor.column - 1 });
      else if (cursor.line > 0) setCursorClamped({ line: cursor.line - 1, column: (lines[cursor.line - 1] ?? '').length });
      setCompletion((current) => ({ ...current, open: false }));
      return;
    }
    if (key.rightArrow) {
      const current = lines[cursor.line] ?? '';
      if (cursor.column < current.length) setCursorClamped({ line: cursor.line, column: cursor.column + 1 });
      else if (cursor.line < lines.length - 1) setCursorClamped({ line: cursor.line + 1, column: 0 });
      setCompletion((currentState) => ({ ...currentState, open: false }));
      return;
    }

    const isDeleteKey = key.sequence === '[3~';
    const isBackspaceKey = key.backspace || input === '\b' || input === String.fromCharCode(127) || (key.delete && !isDeleteKey);

    if (isBackspaceKey) {
      if (cursor.column > 0) {
        const current = lines[cursor.line] ?? '';
        const nextLines = lines.map((line, index) => (index === cursor.line ? current.slice(0, cursor.column - 1) + current.slice(cursor.column) : line));
        mutate(nextLines, { line: cursor.line, column: cursor.column - 1 });
      } else if (cursor.line > 0) {
        const previous = lines[cursor.line - 1] ?? '';
        const current = lines[cursor.line] ?? '';
        const nextLines = [...lines.slice(0, cursor.line - 1), previous + current, ...lines.slice(cursor.line + 1)];
        mutate(nextLines, { line: cursor.line - 1, column: previous.length });
      }
      return;
    }

    if (isDeleteKey) {
      const current = lines[cursor.line] ?? '';
      if (cursor.column < current.length) {
        const nextLines = lines.map((line, index) => (index === cursor.line ? current.slice(0, cursor.column) + current.slice(cursor.column + 1) : line));
        mutate(nextLines, cursor);
      } else if (cursor.line < lines.length - 1) {
        const nextLines = [...lines.slice(0, cursor.line), current + (lines[cursor.line + 1] ?? ''), ...lines.slice(cursor.line + 2)];
        mutate(nextLines, cursor);
      }
      return;
    }

    if (key.return) {
      const current = lines[cursor.line] ?? '';
      const indent = current.match(/^\s*/)?.[0] ?? '';
      const extraIndent = current.trim().endsWith('{') ? '  ' : '';
      const nextLines = [...lines.slice(0, cursor.line), current.slice(0, cursor.column), indent + extraIndent + current.slice(cursor.column), ...lines.slice(cursor.line + 1)];
      mutate(nextLines, { line: cursor.line + 1, column: indent.length + extraIndent.length });
      return;
    }

    if (key.tab) {
      const next = insertAt(lines, cursor, '  ');
      mutate(next.lines, next.cursor);
      return;
    }

    if (input) {
      const next = insertAt(lines, cursor, input);
      setLines(next.lines);
      setCursorClamped(next.cursor, next.lines);
      setError(undefined);
      // Trigger autocomplete: $ opens variable picker, word chars continue current
      if (input === '$') setCompletion({ open: true, forced: true, cursor: 0 });
      else if (/^[A-Za-z0-9_-]+$/.test(input)) setCompletion({ open: true, forced: false, cursor: 0 });
      else setCompletion((current) => ({ ...current, open: false, cursor: 0 }));
    }
  });

  return (
    <Box flexDirection="column">
      <Text color={uiTheme.accent}>Create flow script: {filePath}</Text>
      <Text> </Text>
      {lines.map((line, index) => {
        const lineNo = String(index + 1).padStart(3, ' ');
        const isCursorLine = index === cursor.line;
        const before = isCursorLine ? line.slice(0, cursor.column) : line;
        const under = isCursorLine ? line[cursor.column] ?? ' ' : '';
        const after = isCursorLine ? line.slice(cursor.column + (line[cursor.column] ? 1 : 0)) : '';
        return (
          <Text key={`${index}-${line}`}>
            <Text color={uiTheme.muted}>{lineNo} │ </Text>
            {isCursorLine ? <>{before}<Text inverse>{under}</Text>{after}</> : line}
          </Text>
        );
      })}
      {completionOpen ? (
        <>
          <Text> </Text>
          <Text color={uiTheme.accent}>Autocomplete</Text>
          {completions.map((item, index) => (
            <Text key={`${item.kind}-${item.name}`} color={index === completionCursor ? uiTheme.accent : undefined} inverse={index === completionCursor}>
              {index === completionCursor ? '> ' : '  '}{item.name} <Text color={uiTheme.muted}>{item.desc}</Text>
            </Text>
          ))}
        </>
      ) : null}
      {error ? (
        <>
          <Text> </Text>
          <Text color={uiTheme.error}>{error}</Text>
        </>
      ) : null}
      <Text> </Text>
      <Text color={uiTheme.muted}>[Ctrl+S] save   [Esc] cancel/close autocomplete   [Tab/Enter] complete   [↑↓] move   [Ctrl+Space] suggestions</Text>
    </Box>
  );
}

export async function runFlowScriptEditor(args: {
  filePath: string;
  initialSource: string;
}): Promise<string | undefined> {
  return runInkPrompt<string>((props) => <FlowScriptEditor {...args} {...props} />);
}
