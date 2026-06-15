import { stat } from 'fs/promises';
import { resolve } from 'path';
import { AppError } from '../../utils/errors.js';
import type { FlowInputDefinition, FlowInputValue } from './types.js';

const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

export type FlowInputOverrides = Record<string, string>;

export function stringifyInputValues(values: Record<string, FlowInputValue>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)]));
}

export function initialInputText(input: FlowInputDefinition, overrides: FlowInputOverrides): string {
  if (overrides[input.name] !== undefined) return overrides[input.name];
  if (input.defaultValue !== undefined) return String(input.defaultValue);
  if (input.type === 'checkbox') return 'false';
  if (input.type === 'comboBox') return input.options?.[0] ?? '';
  return '';
}

export async function coerceAndValidateInputs(
  definitions: FlowInputDefinition[],
  rawValues: FlowInputOverrides
): Promise<Record<string, FlowInputValue>> {
  const values: Record<string, FlowInputValue> = {};
  for (const input of definitions) {
    values[input.name] = await coerceAndValidateInput(input, rawValues[input.name] ?? initialInputText(input, {}));
  }
  return values;
}

export async function coerceAndValidateInput(input: FlowInputDefinition, rawValue: string): Promise<FlowInputValue> {
  const value = rawValue.trim();
  switch (input.type) {
    case 'input':
      return autodetectValue(value);
    case 'text':
      return rawValue;
    case 'number': {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) throw new AppError(`${input.name}: expected finite number.`);
      return parsed;
    }
    case 'checkbox':
      if (/^(true|1|yes|on)$/i.test(value)) return true;
      if (/^(false|0|no|off)$/i.test(value)) return false;
      throw new AppError(`${input.name}: expected checkbox boolean.`);
    case 'comboBox':
      if (!input.options?.includes(value)) throw new AppError(`${input.name}: expected one of ${input.options?.join(', ')}.`);
      return value;
    case 'file': {
      const filePath = resolvePath(value);
      const stats = await stat(filePath).catch(() => null);
      if (!stats?.isFile()) throw new AppError(`${input.name}: file not found: ${filePath}`);
      return filePath;
    }
    case 'folder': {
      const folderPath = resolvePath(value);
      const stats = await stat(folderPath).catch(() => null);
      if (!stats?.isDirectory()) throw new AppError(`${input.name}: folder not found: ${folderPath}`);
      return folderPath;
    }
  }
}

function autodetectValue(value: string): string | number {
  if (NUMBER_PATTERN.test(value)) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return value;
}

function resolvePath(value: string): string {
  if (value.startsWith('~')) {
    return resolve(process.env.USERPROFILE ?? process.env.HOME ?? process.cwd(), value.slice(1));
  }
  return resolve(process.cwd(), value);
}
