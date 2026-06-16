import { select, text, isCancel, note, intro } from '@clack/prompts';
import { readdir } from 'fs/promises';
import { dirname, join, parse, resolve } from 'path';
import { AppError, CliBackError } from '../utils/errors.js';
import { coerceAndValidateInputs, initialInputText, type FlowInputOverrides } from '../runtime/dsl/input-values.js';
import type { FlowInputDefinition, FlowInputValue } from '../runtime/dsl/types.js';

export type FlowInputFormResult = {
  values: Record<string, FlowInputValue>;
  state: { values: Record<string, string>; cursor: number };
};

async function browsePathClack(mode: 'file' | 'folder', initialPath: string): Promise<string> {
  let cwd = resolve(process.cwd(), initialPath || '.');
  while (true) {
    let items: { name: string; isDirectory: boolean }[] = [];
    try {
      const dirents = await readdir(cwd, { withFileTypes: true });
      items = dirents
        .map((item) => ({ name: item.name, isDirectory: item.isDirectory() }))
        .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
    } catch (err) {
      // ignore or show warning inside select
    }

    const options: { value: string; label: string }[] = [];

    if (mode === 'folder') {
      options.push({ value: '__choose__', label: `Select current folder (${cwd})` });
    }

    options.push({ value: '__type__', label: 'Type/paste path manually' });

    const root = parse(cwd).root;
    if (cwd !== root) {
      options.push({ value: '__parent__', label: '.. (Parent Directory)' });
    }

    for (const item of items) {
      options.push({
        value: join(cwd, item.name),
        label: `${item.isDirectory ? '[Dir]' : '[File]'} ${item.name}`,
      });
    }

    options.push({ value: '__cancel__', label: 'Cancel (Back to Form)' });

    const choice = await select({
      message: `Browse ${mode} in ${cwd}`,
      options,
    });

    if (isCancel(choice) || choice === '__cancel__') {
      return initialPath;
    }

    if (choice === '__choose__') {
      return cwd;
    }

    if (choice === '__type__') {
      const manualPath = await text({
        message: `Enter ${mode} path`,
        defaultValue: cwd,
      });
      if (isCancel(manualPath)) continue;
      return resolve(cwd, manualPath);
    }

    if (choice === '__parent__') {
      cwd = cwd === root ? root : dirname(cwd);
      continue;
    }

    const selectedItem = items.find((item) => join(cwd, item.name) === choice);
    if (selectedItem?.isDirectory) {
      cwd = choice;
    } else {
      if (mode === 'file') {
        return choice;
      }
    }
  }
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

  intro('Flow Inputs Form');

  while (true) {
    const choices = [
      { value: '__submit__', label: 'Run flow' },
      { value: '__back__', label: 'Go Back' },
      ...definitions.map((def) => {
        const val = values[def.name] || '';
        const displayVal = def.type === 'checkbox'
          ? (/^(true|1|yes|on)$/i.test(val) ? '[x] Yes' : '[ ] No')
          : val || '<empty>';
        return {
          value: def.name,
          label: `${def.name} (${def.type}): ${displayVal}`,
        };
      }),
    ];

    const selection = await select({
      message: 'Select a field to edit, or run the flow',
      options: choices,
      initialValue: choices[cursor]?.value ?? '__submit__',
    });

    if (isCancel(selection) || selection === '__back__') {
      throw new CliBackError('Back', { inputsState: { values, cursor } });
    }

    if (selection === '__submit__') {
      try {
        const validated = await coerceAndValidateInputs(definitions, values);
        return { values: validated, state: { values, cursor } };
      } catch (error) {
        note(error instanceof Error ? error.message : String(error), 'Validation Error');
        continue;
      }
    }

    const selectedIdx = choices.findIndex((c) => c.value === selection);
    if (selectedIdx !== -1) {
      cursor = selectedIdx;
    }

    const def = definitions.find((d) => d.name === selection)!;
    const currentVal = values[def.name] ?? '';

    if (def.type === 'checkbox') {
      const res = await select({
        message: `Set ${def.name}`,
        options: [
          { value: 'true', label: 'Yes (true)' },
          { value: 'false', label: 'No (false)' },
        ],
        initialValue: /^(true|1|yes|on)$/i.test(currentVal) ? 'true' : 'false',
      });
      if (!isCancel(res)) {
        values[def.name] = res;
      }
    } else if (def.type === 'comboBox') {
      const res = await select({
        message: `Select value for ${def.name}`,
        options: (def.options ?? []).map((o) => ({ value: o, label: o })),
        initialValue: currentVal || def.options?.[0],
      });
      if (!isCancel(res)) {
        values[def.name] = res;
      }
    } else if (def.type === 'file' || def.type === 'folder') {
      const res = await browsePathClack(def.type, currentVal);
      values[def.name] = res;
    } else {
      const res = await text({
        message: `Enter value for ${def.name} (${def.type})`,
        defaultValue: currentVal,
        validate(val) {
          if (def.type === 'number') {
            const parsed = Number(val);
            if (!Number.isFinite(parsed)) return 'Must be a finite number';
          }
          return undefined;
        },
      });
      if (!isCancel(res)) {
        values[def.name] = res;
      }
    }
  }
}
