import { AppError, CliBackError } from '../utils/errors.js';
import { coerceAndValidateInputs, initialInputText, type FlowInputOverrides } from '../runtime/dsl/input-values.js';
import type { FlowInputDefinition, FlowInputValue } from '../runtime/dsl/types.js';
import { runListPicker, type ListPickerOption } from './list-picker.js';
import { runTextInputPrompt } from './text-input-prompt.js';
import { browsePath } from './path-browser.js';

export type FlowInputFormResult = {
  values: Record<string, FlowInputValue>;
  state: { values: Record<string, string>; cursor: number };
};

function displayInputValue(def: FlowInputDefinition, value: string): string {
  if (def.type === 'checkbox') {
    return /^(true|1|yes|on)$/i.test(value) ? '[x] Yes' : '[ ] No';
  }
  return value || '<empty>';
}

async function editFlowInput(def: FlowInputDefinition, currentVal: string): Promise<string> {
  if (def.type === 'checkbox') {
    const res = await runListPicker({
      title: `Set ${def.name}`,
      options: [
        { value: 'true', label: 'Yes (true)' },
        { value: 'false', label: 'No (false)' },
      ],
      initialValue: /^(true|1|yes|on)$/i.test(currentVal) ? 'true' : 'false',
      cancelHint: 'keep current',
    });
    return res ?? currentVal;
  }

  if (def.type === 'comboBox') {
    const options = (def.options ?? []).map((option) => ({ value: option, label: option }));
    const res = await runListPicker({
      title: `Pick ${def.name}`,
      options,
      initialValue: currentVal || def.options?.[0],
      cancelHint: 'keep current',
    });
    return res ?? currentVal;
  }

  if (def.type === 'file' || def.type === 'folder' || def.type === 'inputExcelFile') {
    const mode = def.type === 'folder' ? 'folder' : 'file';
    return browsePath(mode, currentVal);
  }

  const res = await runTextInputPrompt({
    title: `Enter value for ${def.name} (${def.type})`,
    defaultValue: currentVal,
    validate(value) {
      if (def.type === 'number') {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return 'Must be a finite number';
      }
      return undefined;
    },
  });
  return res ?? currentVal;
}

export async function runFlowInputForm(
  definitions: FlowInputDefinition[],
  overrides: FlowInputOverrides,
  initialState?: { values?: Record<string, string>; cursor?: number }
): Promise<FlowInputFormResult> {
  if (definitions.length === 0) return { values: {}, state: { values: {}, cursor: 0 } };

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    const missing = definitions.filter((d) => !overrides[d.name] && d.defaultValue === undefined && (d.type === 'file' || d.type === 'folder'));
    if (missing.length > 0) {
      process.stderr.write(`Warning: non-TTY mode — required fields not set: ${missing.map((d) => d.name).join(', ')}\n`);
    }
    const validated = await coerceAndValidateInputs(definitions, Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)])));
    return { values: validated, state: { values: {}, cursor: 0 } };
  }

  const values: Record<string, string> = initialState?.values
    ? { ...initialState.values }
    : Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)]));

  let cursor = initialState?.cursor ?? 0;
  let validationError: string | undefined;

  while (true) {
    const choices: ListPickerOption<string>[] = [
      { value: '__submit__', label: 'Run flow' },
      ...definitions.map((def) => ({
        value: def.name,
        label: `${def.name} (${def.type}): ${displayInputValue(def, values[def.name] || '')}`,
      })),
    ];

    const title = validationError
      ? `Flow Inputs Form\n\nValidation Error: ${validationError}\n\nEnter edits selected input. Direct picker opens for checkbox/comboBox/file/folder.`
      : 'Flow Inputs Form\n\nEnter edits selected input. Direct picker opens for checkbox/comboBox/file/folder.';
    const selection = await runListPicker({
      title,
      options: choices,
      initialValue: choices[cursor]?.value ?? '__submit__',
      submitHint: 'edit/run',
    });

    if (selection === undefined) {
      throw new CliBackError('Back', { inputsState: { values, cursor } });
    }
    if (selection === '__back__') {
      throw new CliBackError('Back', { inputsState: { values, cursor } });
    }

    if (selection === '__submit__') {
      try {
        const validated = await coerceAndValidateInputs(definitions, values);
        return { values: validated, state: { values, cursor } };
      } catch (error) {
        validationError = error instanceof Error ? error.message : String(error);
        continue;
      }
    }

    validationError = undefined;
    const selectedIdx = choices.findIndex((choice) => choice.value === selection);
    if (selectedIdx !== -1) cursor = selectedIdx;

    const def = definitions.find((item) => item.name === selection);
    if (!def) throw new AppError(`Unknown input: ${selection}`);

    const currentValue = values[def.name] ?? '';
    values[def.name] = await editFlowInput(def, currentValue);
  }
}
