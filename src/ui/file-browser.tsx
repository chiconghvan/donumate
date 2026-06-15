import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { readdir } from 'fs/promises';
import { resolve, dirname, join, parse } from 'path';

type Entry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

type FileBrowserProps = {
  mode: 'file' | 'folder';
  initialPath: string;
  onChoose: (path: string) => void;
  onCancel: () => void;
};

export function FileBrowser({ mode, initialPath, onChoose, onCancel }: FileBrowserProps): React.ReactElement {
  const [cwd, setCwd] = useState(resolve(process.cwd(), initialPath || '.'));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readdir(cwd, { withFileTypes: true })
      .then((items) => {
        if (!active) return;
        const next = items
          .map((item) => ({ name: item.name, path: join(cwd, item.name), isDirectory: item.isDirectory() }))
          .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
        setEntries(next);
        setCursor(0);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setEntries([]);
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      });
    return () => {
      active = false;
    };
  }, [cwd]);

  const rows: Array<{ label: string; path: string; action: 'parent' | 'chooseFolder' | 'entry'; entry?: Entry }> = [
    { label: '..', path: dirname(cwd), action: 'parent' },
    ...(mode === 'folder' ? [{ label: '[select current folder]', path: cwd, action: 'chooseFolder' as const }] : []),
    ...entries.map((entry) => ({
      label: `${entry.isDirectory ? '[dir] ' : '      '}${entry.name}`,
      path: entry.path,
      action: 'entry' as const,
      entry,
    })),
  ];

  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.upArrow) {
      setCursor((value) => Math.max(0, value - 1));
      return;
    }
    if (key.downArrow) {
      setCursor((value) => Math.min(rows.length - 1, value + 1));
      return;
    }
    if (key.leftArrow || key.backspace) {
      setCwd(parentPath(cwd));
      return;
    }
    if (key.return || key.rightArrow) {
      const row = rows[cursor];
      if (!row) return;
      if (row.action === 'parent') {
        setCwd(parentPath(cwd));
        return;
      }
      if (row.action === 'chooseFolder') {
        onChoose(cwd);
        return;
      }
      if (row.entry?.isDirectory) {
        setCwd(row.entry.path);
        return;
      }
      if (mode === 'file') onChoose(row.path);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text color="cyan">Select {mode}: {cwd}</Text>
      <Text dimColor>Up/Down move · Enter choose/open · Left parent · Esc cancel</Text>
      {error ? <Text color="red">{error}</Text> : null}
      {rows.slice(0, 15).map((row, index) => (
        <Text key={`${row.action}:${row.path}`} color={index === cursor ? 'green' : undefined}>
          {index === cursor ? '› ' : '  '}{row.label}
        </Text>
      ))}
    </Box>
  );
}

function parentPath(path: string): string {
  const root = parse(path).root;
  return path === root ? root : dirname(path);
}
