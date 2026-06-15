import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { AppError } from '../utils/errors.js';
import { coerceAndValidateInputs, initialInputText, type FlowInputOverrides } from '../runtime/dsl/input-values.js';
import type { FlowInputDefinition, FlowInputValue } from '../runtime/dsl/types.js';
import { FileBrowser } from './file-browser.js';

type FlowInputFormProps = {
  definitions: FlowInputDefinition[];
  overrides: FlowInputOverrides;
  onSubmit: (values: Record<string, FlowInputValue>) => void;
  onCancel: (error: Error) => void;
};

export function FlowInputForm({ definitions, overrides, onSubmit, onCancel }: FlowInputFormProps): React.ReactElement {
  const initialValues = useMemo(() => Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)])), [definitions, overrides]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [cursor, setCursor] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [browserInput, setBrowserInput] = useState<FlowInputDefinition | null>(null);

  const submitIndex = definitions.length;
  const focused = definitions[cursor];

  useInput((input, key) => {
    if (browserInput) return;
    if (key.escape) {
      onCancel(new AppError('Flow input cancelled.'));
      return;
    }
    if (key.tab || key.downArrow) {
      setCursor((value) => Math.min(submitIndex, value + 1));
      return;
    }
    if (key.shift && key.tab || key.upArrow) {
      setCursor((value) => Math.max(0, value - 1));
      return;
    }
    if (key.return) {
      if (cursor === submitIndex) {
        void submit();
        return;
      }
      if (focused?.type === 'file' || focused?.type === 'folder') setBrowserInput(focused);
      if (focused?.type === 'checkbox') toggleCheckbox(focused);
      return;
    }
    if (!focused) return;
    if (key.leftArrow || key.rightArrow) {
      if (focused.type === 'comboBox') cycleCombo(focused, key.rightArrow ? 1 : -1);
      else if (focused.type === 'checkbox') toggleCheckbox(focused);
      else if (focused.type === 'file' || focused.type === 'folder') setBrowserInput(focused);
      return;
    }
    if (key.backspace || key.delete) {
      setValues((current) => ({ ...current, [focused.name]: (current[focused.name] ?? '').slice(0, -1) }));
      return;
    }
    if (input && !key.ctrl && !key.meta && ['input', 'text', 'number', 'file', 'folder'].includes(focused.type)) {
      setValues((current) => ({ ...current, [focused.name]: `${current[focused.name] ?? ''}${input}` }));
    }
  });

  async function submit(): Promise<void> {
    try {
      const coerced = await coerceAndValidateInputs(definitions, values);
      setErrors([]);
      onSubmit(coerced);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : String(error)]);
    }
  }

  function toggleCheckbox(input: FlowInputDefinition): void {
    setValues((current) => {
      const now = /^(true|1|yes|on)$/i.test(current[input.name] ?? 'false');
      return { ...current, [input.name]: String(!now) };
    });
  }

  function cycleCombo(input: FlowInputDefinition, direction: 1 | -1): void {
    const options = input.options ?? [];
    if (options.length === 0) return;
    setValues((current) => {
      const index = Math.max(0, options.indexOf(current[input.name] ?? options[0] ?? ''));
      const next = (index + direction + options.length) % options.length;
      return { ...current, [input.name]: options[next] ?? '' };
    });
  }

  if (browserInput) {
    return (
      <FileBrowser
        mode={browserInput.type === 'folder' ? 'folder' : 'file'}
        initialPath={values[browserInput.name] ?? '.'}
        onChoose={(path) => {
          setValues((current) => ({ ...current, [browserInput.name]: path }));
          setBrowserInput(null);
        }}
        onCancel={() => setBrowserInput(null)}
      />
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text color="cyan">Flow inputs</Text>
      <Text dimColor>Tab/Arrows move · Left/Right toggle/cycle/open path · Enter submit/open · Esc cancel</Text>
      {definitions.map((definition, index) => (
        <Text key={definition.name} color={index === cursor ? 'green' : undefined}>
          {index === cursor ? '› ' : '  '}{definition.name} ({definition.type}): {renderValue(definition, values[definition.name] ?? '')}
        </Text>
      ))}
      <Text color={cursor === submitIndex ? 'green' : undefined}>{cursor === submitIndex ? '› ' : '  '}Run flow</Text>
      {errors.map((error) => <Text key={error} color="red">{error}</Text>)}
    </Box>
  );
}

function renderValue(definition: FlowInputDefinition, value: string): string {
  if (definition.type === 'checkbox') return /^(true|1|yes|on)$/i.test(value) ? '[x]' : '[ ]';
  if (definition.type === 'comboBox') return `${value} (${definition.options?.join(' | ') ?? ''})`;
  return value || '<empty>';
}
