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

const SCRIPT_SETTING_NAMES = new Set(['hardless', 'threads', 'inputExcelFile', 'windowWidth', 'windowHeight']);
const SCRIPT_SETTING_LABELS: Record<string, string> = {
  hardless: 'Không cửa sổ (hardless)',
  threads: 'Số luồng cùng lúc (threads)',
  inputExcelFile: 'File excel đầu vào (inputExcelFile)',
  windowWidth: 'Rộng window (windowWidth)',
  windowHeight: 'Cao window (windowHeight)',
};

function displayInputValue(def: FlowInputDefinition, value: string): string {
  if (def.type === 'checkbox') {
    return /^(true|1|yes|on)$/i.test(value) ? 'true' : 'false';
  }
  if (def.type === 'inputExcelFile' && value === '') return 'không có';
  return value || '<empty>';
}

function displayInputLabel(def: FlowInputDefinition, value: string): string {
  const label = SCRIPT_SETTING_LABELS[def.name] ?? `${def.name} (${def.type})`;
  return `${label} = ${displayInputValue(def, value)}`;
}

async function editFlowInput(def: FlowInputDefinition, currentVal: string): Promise<string> {
  if (def.type === 'checkbox') {
    const res = await runListPicker({
      title: `Set ${def.name}`,
      options: [
        { value: 'true', label: 'true' },
        { value: 'false', label: 'false' },
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

  if (def.type === 'inputExcelFile') {
    const action = await runListPicker({
      title: `Set ${def.name}`,
      options: [
        { value: 'browse', label: 'Browse file' },
        { value: 'manual', label: 'Enter path manually' },
        { value: 'clear', label: 'Không có file' },
      ],
      initialValue: currentVal ? 'browse' : 'clear',
      cancelHint: 'keep current',
    });
    if (action === 'clear') return '';
    if (action === 'manual') {
      const res = await runTextInputPrompt({
        title: `Enter value for ${def.name} (${def.type})`,
        defaultValue: currentVal,
      });
      return res ?? currentVal;
    }
    if (action === 'browse') return browsePath('file', currentVal);
    return currentVal;
  }

  if (def.type === 'file' || def.type === 'folder') {
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

function createInputChoices(
  definitions: FlowInputDefinition[],
  values: Record<string, string>,
  settingsExpanded: boolean
): ListPickerOption<string>[] {
  const settingDefs = definitions.filter((def) => SCRIPT_SETTING_NAMES.has(def.name));
  const userDefs = definitions.filter((def) => !SCRIPT_SETTING_NAMES.has(def.name));
  const choices: ListPickerOption<string>[] = [
    { value: '__submit__', label: 'Run flow' },
  ];

  if (settingDefs.length > 0) {
    choices.push({ value: '__settings__', label: `${settingsExpanded ? '▾' : '▸'} Scripts Setting` });
    if (settingsExpanded) {
      choices.push(...settingDefs.map((def) => ({
        value: def.name,
        label: `  ├─ ${displayInputLabel(def, values[def.name] || '')}`,
      })));
    }
  }

  choices.push(...userDefs.map((def) => ({
    value: def.name,
    label: displayInputLabel(def, values[def.name] || ''),
  })));

  return choices;
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
    ? { ...Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)])), ...initialState.values }
    : Object.fromEntries(definitions.map((item) => [item.name, initialInputText(item, overrides)]));

  let cursor = initialState?.cursor ?? 0;
  let validationError: string | undefined;
  let settingsExpanded = false;

  while (true) {
    const choices = createInputChoices(definitions, values, settingsExpanded);
    if (cursor >= choices.length) cursor = choices.length - 1;

    const title = validationError
      ? `Flow Inputs Form\n\nValidation Error: ${validationError}\n\nEnter opens/toggles selected item. Direct picker opens for checkbox/comboBox/file/folder.`
      : 'Flow Inputs Form\n\nEnter opens/toggles selected item. Direct picker opens for checkbox/comboBox/file/folder.';
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

    if (selection === '__settings__') {
      settingsExpanded = !settingsExpanded;
      const selectedIdx = choices.findIndex((choice) => choice.value === selection);
      if (selectedIdx !== -1) cursor = selectedIdx;
      continue;
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
