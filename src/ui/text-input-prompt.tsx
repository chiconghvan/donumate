import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
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
};

type TextInputPromptProps = {
  title: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export function TextInputPrompt({ title, defaultValue = '', validate, onSubmit, onCancel }: TextInputPromptProps): React.ReactElement {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string>();

  useInput((input: string, key: InputKey) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (key.return) {
      const validationError = validate?.(value);
      if (validationError) {
        setError(validationError);
        return;
      }
      onSubmit(value);
      return;
    }
    if (key.backspace || key.delete) {
      setValue((current: string) => current.slice(0, -1));
      setError(undefined);
      return;
    }
    if (key.leftArrow || key.rightArrow || key.upArrow || key.downArrow || key.tab) return;
    if (input) {
      setValue((current: string) => current + input);
      setError(undefined);
    }
  });

  return (
    <Box flexDirection="column">
      <Text color={uiTheme.accent}>{title}</Text>
      <Text> </Text>
      <Text>&gt; {value}</Text>
      {error ? (
        <>
          <Text> </Text>
          <Text color={uiTheme.error}>{error}</Text>
        </>
      ) : null}
      <Text> </Text>
      <Text color={uiTheme.muted}>[Enter] save   [Esc] cancel</Text>
    </Box>
  );
}

export async function runTextInputPrompt(args: {
  title: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
}): Promise<string | undefined> {
  return runInkPrompt<string>((props) => <TextInputPrompt {...args} {...props} />);
}
