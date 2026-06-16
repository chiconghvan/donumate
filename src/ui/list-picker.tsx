import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { runInkPrompt } from './ink-runner.js';
import { uiTheme } from './ui-theme.js';

export type ListPickerOption<T extends string> = {
  label: string;
  value: T;
};

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
};

type ListPickerProps<T extends string> = {
  title: string;
  options: ListPickerOption<T>[];
  initialValue?: T;
  submitHint?: string;
  cancelHint?: string;
  onSubmit: (value: T) => void;
  onCancel: () => void;
};

export function ListPicker<T extends string>({
  title,
  options,
  initialValue,
  submitHint = 'select',
  cancelHint = 'back',
  onSubmit,
  onCancel,
}: ListPickerProps<T>): React.ReactElement {
  const initialIndex = useMemo(() => {
    const idx = initialValue === undefined ? -1 : options.findIndex((option) => option.value === initialValue);
    return idx >= 0 ? idx : 0;
  }, [initialValue, options]);
  const [cursor, setCursor] = useState(initialIndex);

  useInput((input: string, key: InputKey) => {
    if (options.length === 0) {
      onCancel();
      return;
    }
    if (key.upArrow) {
      setCursor((current: number) => (current <= 0 ? options.length - 1 : current - 1));
      return;
    }
    if (key.downArrow) {
      setCursor((current: number) => (current >= options.length - 1 ? 0 : current + 1));
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
      <Text color={uiTheme.accent}>{title}</Text>
      <Text> </Text>
      {options.map((option, index) => (
        <Text key={option.value} color={index === cursor ? uiTheme.accent : undefined} inverse={index === cursor}>
          {index === cursor ? '> ' : '  '}{option.label}
        </Text>
      ))}
      <Text> </Text>
      <Text color={uiTheme.muted}>[Enter] {submitHint}   [Esc] {cancelHint}   [↑↓] move</Text>
    </Box>
  );
}

export async function runListPicker<T extends string>(args: {
  title: string;
  options: ListPickerOption<T>[];
  initialValue?: T;
  submitHint?: string;
  cancelHint?: string;
}): Promise<T | undefined> {
  return runInkPrompt<T>((props) => <ListPicker {...args} {...props} />);
}
