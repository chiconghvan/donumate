import { stat } from 'fs/promises';
import { resolve } from 'path';
import XLSX from 'xlsx';
import { AppError } from '../utils/errors.js';
import type { InputDefinition, InputOverrides, InputValue } from './input-types.js';

const XLSXApi = XLSX as typeof import('xlsx');

const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

export function stringifyInputValues(values: Record<string, InputValue>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)]));
}

export function initialInputText(input: InputDefinition, overrides: InputOverrides): string {
  if (overrides[input.name] !== undefined) return overrides[input.name];
  if (input.defaultValue !== undefined) return String(input.defaultValue);
  if (input.type === 'checkbox') return 'false';
  if (input.type === 'comboBox') return input.options?.[0] ?? '';
  return '';
}

export async function coerceAndValidateInputs(
  definitions: InputDefinition[],
  rawValues: InputOverrides
): Promise<Record<string, InputValue>> {
  const values: Record<string, InputValue> = {};
  for (const input of definitions) {
    values[input.name] = await coerceAndValidateInput(input, rawValues[input.name] ?? initialInputText(input, {}));
    if (input.type === 'inputExcelFile') {
      const filePath = String(values[input.name]);
      values[`${input.name}TotalRow`] = filePath ? readExcelTotalRows(filePath) : 0;
    }
  }
  return values;
}

export async function coerceAndValidateInput(input: InputDefinition, rawValue: string): Promise<InputValue> {
  const value = rawValue.trim();
  switch (input.type) {
    case 'input':
      return autodetectValue(value);
    case 'text':
      return rawValue;
    case 'number': {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) throw new AppError(`${input.name}: expected a number, got "${rawValue || '(empty)'}".`);
      return parsed;
    }
    case 'checkbox':
      if (/^(true|1|yes|on)$/i.test(value)) return true;
      if (/^(false|0|no|off)$/i.test(value)) return false;
      throw new AppError(`${input.name}: expected true/false/1/0/yes/no, got "${rawValue}".`);
    case 'comboBox':
      if (!input.options?.includes(value)) throw new AppError(`${input.name}: expected one of [${input.options?.join(', ')}], got "${value}".`);
      return value;
    case 'file':
    case 'inputExcelFile': {
      if (input.type === 'inputExcelFile' && value === '' && input.defaultValue !== undefined) return '';
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

function readExcelTotalRows(filePath: string): number {
  const workbook = XLSXApi.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return 0;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet?.['!ref']) return 0;
  const range = XLSX.utils.decode_range(sheet['!ref']);
  return range.e.r + 1;
}
