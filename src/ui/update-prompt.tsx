import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { runInkPrompt } from './ink-runner.js';
import { uiTheme } from './ui-theme.js';
import type { UpdateInfo } from '../update/types.js';

type UpdateChoice = 'install' | 'skip';

type UpdatePromptProps = {
  update: UpdateInfo;
  onSubmit: (value: UpdateChoice) => void;
  onCancel: () => void;
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return 'unknown size';
  const mib = bytes / 1024 / 1024;
  return `${mib.toFixed(1)} MiB`;
}

function UpdatePrompt({ update, onSubmit, onCancel }: UpdatePromptProps): React.ReactElement {
  const options: Array<{ label: string; value: UpdateChoice }> = [
    { label: 'Install update now', value: 'install' },
    { label: 'Skip', value: 'skip' },
  ];
  const [cursor, setCursor] = useState(0);

  useInput((input, key) => {
    if (key.upArrow || key.downArrow) {
      setCursor((current) => (current === 0 ? 1 : 0));
      return;
    }
    if (key.return) {
      onSubmit(options[cursor].value);
      return;
    }
    if (key.escape || input === 'q') {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column">
      <Text color={uiTheme.accent}>Update available: {update.currentVersion} → {update.latestVersion}</Text>
      <Text>Asset: {update.assetName} ({formatBytes(update.size)})</Text>
      <Text>Release: {update.releaseUrl}</Text>
      <Text> </Text>
      {options.map((option, index) => (
        <Text key={option.value} color={index === cursor ? uiTheme.accent : undefined} inverse={index === cursor}>
          {index === cursor ? '> ' : '  '}{option.label}
        </Text>
      ))}
      <Text> </Text>
      <Text color={uiTheme.muted}>[Enter] select   [Esc] skip   [↑↓] move</Text>
    </Box>
  );
}

export async function runUpdatePrompt(update: UpdateInfo): Promise<UpdateChoice | undefined> {
  return runInkPrompt<UpdateChoice>((props) => <UpdatePrompt update={update} {...props} />);
}
