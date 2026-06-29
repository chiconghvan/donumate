import { appendFile, mkdir, readFile, readdir, rm, stat, writeFile } from 'fs/promises';
import { createHmac } from 'crypto';
import { dirname, join, resolve } from 'path';
import XLSX from 'xlsx';
import { AppError } from '../../utils/errors.js';
import type { InputValue } from '../input-types.js';
import type { GscriptActionNode, GscriptExecutionContext, GscriptSignal } from './types.js';
import { formatInputValue, formatRedactedValue, logGscript } from './logging.js';
import { asBoolean, asNumber, interpolate, parseLiteralOrInterpolated, setVariable, stringifyValue } from './values.js';

const XLSXApi = XLSX as typeof import('xlsx');

export async function executeGscriptAction(ctx: GscriptExecutionContext, node: GscriptActionNode): Promise<GscriptSignal> {
  try {
    logGscript(ctx, ctx.minimalLog ? minimalActionLabel(node, ctx) : `action ${formatActionLabel(node, ctx)}`);
    const result = await runAction(ctx, node);
    await runActionDelay(ctx, node.delay);
    return result;
  } catch (error) {
    throw new AppError(`GPM action failed: ${actionLabel(node)}.`, error);
  }
}

async function runAction(ctx: GscriptExecutionContext, node: GscriptActionNode): Promise<GscriptSignal> {
  const input = node.rawInput;
  const out = node.outputVariableName;
  switch (node.actionType) {
    case 1:
      if (/^true$/i.test(input.ALLOW_USER_INPUT ?? '') && out && ctx.inputs[out] !== undefined) {
        logVariableSet(ctx, out, ctx.inputs[out], 'from input');
        logMinimalVariableSet(ctx, out, ctx.inputs[out]);
        return undefined;
      }
      {
        const value = parseLiteralOrInterpolated(input.VALUE ?? '', ctx.inputs);
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
        logMinimalVariableSet(ctx, out, value);
      }
      return undefined;
    case 2:
      {
        const value = asNumber(parseLiteralOrInterpolated(input.CURRENT_VAL, ctx.inputs)) + asNumber(parseLiteralOrInterpolated(input.INCREASE_BY, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 3:
      {
        const value = asNumber(parseLiteralOrInterpolated(input.CURRENT_VAL, ctx.inputs)) - asNumber(parseLiteralOrInterpolated(input.DESCREASE_BY, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 4:
      {
        const value = countValue(parseLiteralOrInterpolated(input.INPUT_ARRAY, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 5:
      return 'exit';
    case 6:
      return 'next';
    case 7:
      await sleepRange(ctx, input.MIN, input.MAX);
      return undefined;
    case 9:
      {
        const value = stringifyValue(parseLiteralOrInterpolated(input.INPUT_TEXT, ctx.inputs)).split(interpolate(input.SPLIT_CHAR, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 10:
      {
        const value = readJsonPath(parseLiteralOrInterpolated(input.JSON, ctx.inputs), interpolate(input.NODES, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 11:
      {
        const value = randomInt(asNumber(parseLiteralOrInterpolated(input.MIN, ctx.inputs)), asNumber(parseLiteralOrInterpolated(input.MAX, ctx.inputs)));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 13:
      {
        const value = await pathIsFile(interpolate(input.FILE_PATH, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 16:
      await rm(resolvePath(interpolate(input.FILE_PATH, ctx.inputs)), { force: true });
      return undefined;
    case 17:
      {
        const value = await readFile(resolvePath(interpolate(input.FILE_PATH, ctx.inputs)), 'utf8');
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 18:
      {
        const value = (await readFile(resolvePath(interpolate(input.FILE_PATH, ctx.inputs)), 'utf8')).split(/\r?\n/);
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 19:
      await writeTextFile(interpolate(input.FILE_PATH, ctx.inputs), interpolate(input.TEXT, ctx.inputs));
      return undefined;
    case 20:
      await appendLine(interpolate(input.FILE_PATH, ctx.inputs), interpolate(input.TEXT, ctx.inputs));
      return undefined;
    case 21:
      {
        const value = readExcelCell(input, ctx);
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 22:
      writeExcelCell(input, ctx);
      return undefined;
    case 23:
      {
        const value = await pathIsFolder(interpolate(input.FOLDER_PATH, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 24:
      await mkdir(resolvePath(interpolate(input.FOLDER_PATH, ctx.inputs)), { recursive: true });
      return undefined;
    case 25:
      await rm(resolvePath(interpolate(input.FOLDER_PATH, ctx.inputs)), { recursive: true, force: true });
      return undefined;
    case 29:
      {
        const value = await httpRequest(input, ctx, node);
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 30:
      await httpDownload(input, ctx);
      return undefined;
    case 36:
      await requirePage(ctx, node).newTab();
      return undefined;
    case 37:
      await requirePage(ctx, node).activeTab(interpolate(input.TAB_INDEX, ctx.inputs));
      return undefined;
    case 38:
      await requirePage(ctx, node).closeTab();
      return undefined;
    case 39:
      {
        const url = interpolate(input.URL, ctx.inputs);
        if (ctx.minimalLog) logGscript(ctx, `url ${formatInputValue(url)}`);
        await requirePage(ctx, node).goto(url);
      }
      await requirePage(ctx, node).waitForLoad();
      return undefined;
    case 41:
      await requirePage(ctx, node).reloadNav();
      return undefined;
    case 42:
      {
        const value = await requirePage(ctx, node).getUrl();
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 43:
      {
        const value = await requirePage(ctx, node).waitUrlChange(interpolate(input.CURRENT_URL, ctx.inputs), secondsToMs(input.TIME_OUT, ctx, 10));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 44:
      {
        const xpath = requireXPath(ctx, node, input);
        logGscript(ctx, `wait xpath ${formatInputValue(xpath)} timeout=${secondsToMs(input.TIME_OUT, ctx, 10)}ms`);
        const found = await requirePage(ctx, node).waitForXPath(xpath, secondsToMs(input.TIME_OUT, ctx, 10));
        if (!found) logGscript(ctx, `wait xpath skipped node=${node.id}`);
      }
      return undefined;
    case 45:
      {
        const xpath = requireXPath(ctx, node, input);
        const attr = interpolate(input.ATTR_NAME, ctx.inputs);
        const value = await requirePage(ctx, node).getElementAttribute(xpath, attr);
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 46:
      {
        const value = await requirePage(ctx, node).textXPath(requireXPath(ctx, node, input));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 47:
      {
        const value = await requirePage(ctx, node).countElement(requireXPath(ctx, node, input));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 48:
      await requirePage(ctx, node).clickXPath(requireXPath(ctx, node, input));
      return undefined;
    case 50:
      await requirePage(ctx, node).moveMouseXPath(requireXPath(ctx, node, input));
      return undefined;
    case 54:
      await keyPress(ctx, node);
      return undefined;
    case 55:
      await requirePage(ctx, node).fileUpload(interpolate(input.FILE_PATH, ctx.inputs), requireXPath(ctx, node, input));
      return undefined;
    case 57:
      await requirePage(ctx, node).scroll(randomInt(-900, 900));
      return undefined;
    case 58:
      await requirePage(ctx, node).executeJs('window.scrollTo(0, 0)');
      return undefined;
    case 59:
      await requirePage(ctx, node).executeJs('window.scrollTo(0, document.body.scrollHeight)');
      return undefined;
    case 60:
      await requirePage(ctx, node).executeJs(`(() => {
        const xpath = ${JSON.stringify(requireXPath(ctx, node, input))};
        document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.scrollIntoView({ block: 'center' });
      })()`);
      return undefined;
    case 64:
      await importCookies(ctx, node, interpolate(input.FILE_PATH, ctx.inputs));
      return undefined;
    case 65:
      await exportCookies(ctx, node, interpolate(input.FILE_PATH, ctx.inputs));
      return undefined;
    case 68:
      {
        const code = interpolate(input.FILE_OR_CODE, ctx.inputs);
        if (!ctx.minimalLog) logGscript(ctx, `executeJs code=${formatInputValue(previewText(code))}`);
        const value = await requirePage(ctx, node).executeJs<InputValue>(code);
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
        logMinimalVariableSet(ctx, out, value);
      }
      return undefined;
    case 71:
      appendExcelLine(input, ctx);
      return undefined;
    case 72:
      {
        const value = await folderFileList(interpolate(input.FOLDER_PATH, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    case 73:
      await closeAllTabs(ctx, node);
      return undefined;
    case 74:
      await createEmptyExcel(interpolate(input.FILE_PATH, ctx.inputs));
      return undefined;
    case 76:
      return 'stop';
    case 81:
      {
        const value = totp(interpolate(input.SECRETE_KEY, ctx.inputs));
        setVariable(ctx.inputs, out, value);
        logVariableSet(ctx, out, value);
      }
      return undefined;
    default:
      throw new AppError(`Unsupported GPM action type ${node.actionType}.`);
  }
}

async function runActionDelay(ctx: GscriptExecutionContext, delay: string | null | undefined): Promise<void> {
  if (!delay) return;
  const [minText = '0', maxText = minText] = delay.split(',');
  const min = Number(minText.trim());
  const max = Number(maxText.trim());
  if (!Number.isFinite(min) || !Number.isFinite(max) || (min <= 0 && max <= 0)) return;
  await ctx.sleep(randomInt(Math.max(0, min), Math.max(0, max)));
}

async function sleepRange(ctx: GscriptExecutionContext, minText?: string, maxText?: string): Promise<void> {
  const min = asNumber(parseLiteralOrInterpolated(minText, ctx.inputs));
  const max = asNumber(parseLiteralOrInterpolated(maxText, ctx.inputs));
  await ctx.sleep(randomInt(Math.max(0, min), Math.max(0, max)));
}

function countValue(value: InputValue): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'string') return value === '' ? 0 : value.split(/\r?\n|,/).filter(Boolean).length;
  return 0;
}

function readJsonPath(source: InputValue, path: string): InputValue {
  const parsed = typeof source === 'string' ? JSON.parse(source) : source;
  let current: unknown = parsed;
  for (const part of path.split('.').filter(Boolean)) {
    if (current === null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[part];
  }
  return toInputValue(current);
}

function toInputValue(value: unknown): InputValue {
  if (Array.isArray(value)) return value.map(toInputValue);
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
}

async function pathIsFile(path: string): Promise<boolean> {
  return Boolean(await stat(resolvePath(path)).then((s) => s.isFile()).catch(() => false));
}

async function pathIsFolder(path: string): Promise<boolean> {
  return Boolean(await stat(resolvePath(path)).then((s) => s.isDirectory()).catch(() => false));
}

async function writeTextFile(path: string, text: string): Promise<void> {
  const fullPath = resolvePath(path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, text, 'utf8');
}

async function appendLine(path: string, text: string): Promise<void> {
  const fullPath = resolvePath(path);
  await mkdir(dirname(fullPath), { recursive: true });
  await appendFile(fullPath, `${text}\n`, 'utf8');
}

async function folderFileList(path: string): Promise<string[]> {
  const folder = resolvePath(path);
  const entries = await readdir(folder, { withFileTypes: true }).catch(() => []);
  return entries.filter((entry) => entry.isFile()).map((entry) => join(folder, entry.name));
}

async function httpRequest(input: Record<string, string>, ctx: GscriptExecutionContext, node: GscriptActionNode): Promise<string> {
  const method = interpolate(input.METHOD || 'GET', ctx.inputs).toUpperCase();
  const headers = parseHeaders(interpolate(input.HEADER, ctx.inputs));
  const body = method === 'GET' || method === 'HEAD' ? undefined : interpolate(input.DATA, ctx.inputs);
  const url = interpolate(input.URL, ctx.inputs);
  logGscript(ctx, `httpRequest method=${method} url=${formatInputValue(url)}`);
  if (Object.keys(headers).length > 0) logGscript(ctx, `httpRequest headers=${formatInputValue(headers)}`);
  if (body !== undefined) logGscript(ctx, `httpRequest body=${formatInputValue(body)}`);
  const response = await fetch(url, { method, headers, body });
  const responseText = await response.text();
  logGscript(ctx, `httpRequest response status=${response.status} ok=${response.ok} body=${formatInputValue(previewText(responseText))}`);
  return responseText;
}

async function httpDownload(input: Record<string, string>, ctx: GscriptExecutionContext): Promise<void> {
  const url = interpolate(input.URL, ctx.inputs);
  logGscript(ctx, `httpDownload url=${formatInputValue(url)} savePath=${formatInputValue(resolvePath(interpolate(input.SAVE_PATH, ctx.inputs)))}`);
  const response = await fetch(url, { headers: parseHeaders(interpolate(input.HEADER, ctx.inputs)) });
  if (!response.ok) throw new AppError(`HTTP download failed: ${response.status} ${response.statusText}`);
  const savePath = resolvePath(interpolate(input.SAVE_PATH, ctx.inputs));
  await mkdir(dirname(savePath), { recursive: true });
  await writeFile(savePath, Buffer.from(await response.arrayBuffer()));
}

function parseHeaders(text: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of text.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) {
    const separator = line.indexOf(':');
    if (separator > 0) headers[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return headers;
}

async function keyPress(ctx: GscriptExecutionContext, node: GscriptActionNode): Promise<void> {
  const page = requirePage(ctx, node);
  const key = interpolate(node.rawInput.KEY, ctx.inputs);
  const type = interpolate(node.rawInput.TYPE, ctx.inputs).toUpperCase();
  const xpath = node.elementXPath ? interpolate(node.elementXPath, ctx.inputs) : '';
  if (type === 'TEXT') {
    if (!xpath) throw new AppError(`Missing XPath for Key Press action at node ${node.id}.`);
    const delayPress = asNumber(parseLiteralOrInterpolated(node.rawInput.DELAY_PRESS, ctx.inputs));
    if (delayPress < 0) await page.pasteTextXPath(xpath, key);
    else await page.typeTextXPath(xpath, key);
    return;
  }
  await page.sendKey(key);
}

function requirePage(ctx: GscriptExecutionContext, node: GscriptActionNode) {
  if (!ctx.page) throw new AppError(`GPM action requires browser page: ${actionLabel(node)}.`);
  return ctx.page;
}

function requireXPath(ctx: GscriptExecutionContext, node: GscriptActionNode, input: Record<string, string>): string {
  const xpath = interpolate(input.XPATH ?? node.elementXPath ?? '', ctx.inputs);
  if (!xpath) throw new AppError(`Missing XPath for ${actionLabel(node)}.`);
  return xpath;
}

function secondsToMs(value: string | undefined, ctx: GscriptExecutionContext, fallbackSeconds: number): number {
  const seconds = asNumber(parseLiteralOrInterpolated(value ?? String(fallbackSeconds), ctx.inputs));
  return Math.max(0, seconds * 1000);
}

function readWorkbook(path: string): XLSX.WorkBook {
  return XLSXApi.readFile(resolvePath(path));
}

function sheetByInput(workbook: XLSX.WorkBook, sheetId: string): XLSX.WorkSheet {
  const index = Number(sheetId);
  const sheetName = Number.isInteger(index) ? workbook.SheetNames[index] : sheetId || workbook.SheetNames[0];
  if (!sheetName || !workbook.Sheets[sheetName]) throw new AppError(`Excel sheet not found: ${sheetId || '(first)'}`);
  return workbook.Sheets[sheetName];
}

function readExcelCell(input: Record<string, string>, ctx: GscriptExecutionContext): InputValue {
  const filePath = interpolate(input.FILE_PATH, ctx.inputs);
  const workbook = readWorkbook(filePath);
  const sheet = sheetByInput(workbook, interpolate(input.SHEET_ID, ctx.inputs));
  const address = excelAddress(input, ctx);
  return toInputValue(sheet[address]?.v);
}

function writeExcelCell(input: Record<string, string>, ctx: GscriptExecutionContext): void {
  const filePath = resolvePath(interpolate(input.FILE_PATH, ctx.inputs));
  const workbook = readWorkbook(filePath);
  const sheet = sheetByInput(workbook, interpolate(input.SHEET_ID, ctx.inputs));
  sheet[excelAddress(input, ctx)] = { t: 's', v: interpolate(input.DATA, ctx.inputs) };
  XLSXApi.writeFile(workbook, filePath);
}

function appendExcelLine(input: Record<string, string>, ctx: GscriptExecutionContext): void {
  const filePath = resolvePath(interpolate(input.FILE_PATH, ctx.inputs));
  const workbook = readWorkbook(filePath);
  const sheet = sheetByInput(workbook, interpolate(input.SHEET_ID, ctx.inputs));
  const range = XLSXApi.utils.decode_range(sheet['!ref'] ?? 'A1:A1');
  const row = range.e.r + 1;
  const col = colIndex(interpolate(input.COL_NAME_OR_INDEX, ctx.inputs));
  sheet[XLSXApi.utils.encode_cell({ r: row, c: col })] = { t: 's', v: interpolate(input.DATA, ctx.inputs) };
  sheet['!ref'] = XLSXApi.utils.encode_range({ s: range.s, e: { r: row, c: Math.max(range.e.c, col) } });
  XLSXApi.writeFile(workbook, filePath);
}

function excelAddress(input: Record<string, string>, ctx: GscriptExecutionContext): string {
  const row = Math.max(0, asNumber(parseLiteralOrInterpolated(input.ROW_INDEX ?? '0', ctx.inputs)));
  const col = colIndex(interpolate(input.COL_NAME_OR_INDEX, ctx.inputs));
  return XLSXApi.utils.encode_cell({ r: row, c: col });
}

function colIndex(value: string): number {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  let result = 0;
  for (const ch of trimmed.toUpperCase()) result = result * 26 + ch.charCodeAt(0) - 64;
  return Math.max(0, result - 1);
}

async function createEmptyExcel(path: string): Promise<void> {
  const fullPath = resolvePath(path);
  await mkdir(dirname(fullPath), { recursive: true });
  const workbook = XLSXApi.utils.book_new();
  XLSXApi.utils.book_append_sheet(workbook, XLSXApi.utils.aoa_to_sheet([]), 'Sheet1');
  XLSXApi.writeFile(workbook, fullPath);
}

async function importCookies(ctx: GscriptExecutionContext, node: GscriptActionNode, path: string): Promise<void> {
  const cookies = JSON.parse(await readFile(resolvePath(path), 'utf8')) as Array<{ name: string; value: string }>;
  await requirePage(ctx, node).executeJs(`(() => {
    for (const cookie of ${JSON.stringify(cookies)}) document.cookie = encodeURIComponent(cookie.name) + '=' + encodeURIComponent(cookie.value) + '; path=/';
  })()`);
}

async function exportCookies(ctx: GscriptExecutionContext, node: GscriptActionNode, path: string): Promise<void> {
  const cookies = await requirePage(ctx, node).executeJs<Array<{ name: string; value: string }>>(`document.cookie.split(';').filter(Boolean).map((item) => {
    const [name, ...rest] = item.trim().split('=');
    return { name: decodeURIComponent(name), value: decodeURIComponent(rest.join('=')) };
  })`);
  await writeTextFile(path, JSON.stringify(cookies, null, 2));
}

async function closeAllTabs(ctx: GscriptExecutionContext, node: GscriptActionNode): Promise<void> {
  await requirePage(ctx, node).closeAllTabs();
}

function resolvePath(path: string): string {
  if (path.startsWith('~')) return resolve(process.env.USERPROFILE ?? process.env.HOME ?? process.cwd(), path.slice(1));
  return resolve(process.cwd(), path);
}

function randomInt(min: number, max: number): number {
  const lower = Math.floor(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

function totp(secret: string, timeStepSeconds = 30, digits = 6): string {
  const key = base32Decode(secret.replace(/\s+/g, ''));
  const counter = Math.floor(Date.now() / 1000 / timeStepSeconds);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code = ((hmac[offset]! & 0x7f) << 24) | ((hmac[offset + 1]! & 0xff) << 16) | ((hmac[offset + 2]! & 0xff) << 8) | (hmac[offset + 3]! & 0xff);
  return String(code % 10 ** digits).padStart(digits, '0');
}

function base32Decode(secret: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of secret.toUpperCase().replace(/=+$/, '')) {
    const value = alphabet.indexOf(char);
    if (value < 0) continue;
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function actionLabel(node: GscriptActionNode): string {
  return `${node.comment ?? `type ${node.actionType}`} (type ${node.actionType}, node ${node.id})`;
}

function minimalActionLabel(node: GscriptActionNode, ctx: GscriptExecutionContext): string {
  const comment = node.comment?.trim();
  const type = formatActionType(node, ctx);
  return comment ? `${type} - ${comment}` : type;
}

function formatActionLabel(node: GscriptActionNode, ctx: GscriptExecutionContext): string {
  const parts = [`type=${formatActionType(node, ctx)}`];
  parts.push(...formatActionDetails(node, ctx));
  parts.push(`node=${node.id}`);
  const label = node.comment?.trim();
  if (label) parts.push(`comment=${JSON.stringify(label)}`);
  return parts.join(' | ');
}

function logVariableSet(ctx: GscriptExecutionContext, name: string | null | undefined, value: InputValue, source?: string): void {
  if (ctx.minimalLog) return;
  if (!name) return;
  const suffix = source ? ` (${source})` : '';
  logGscript(ctx, `set ${name} = ${formatInputValue(value)}${suffix}`);
}

function logMinimalVariableSet(ctx: GscriptExecutionContext, name: string | null | undefined, value: InputValue): void {
  if (!ctx.minimalLog || !name) return;
  logGscript(ctx, `set ${name} = ${formatInputValue(value)}`);
}

function formatActionType(node: GscriptActionNode, ctx: GscriptExecutionContext): string {
  switch (node.actionType) {
    case 54: {
      const type = interpolate(node.rawInput.TYPE, ctx.inputs).toUpperCase();
      if (type === 'TEXT') {
        const delayPress = asNumber(parseLiteralOrInterpolated(node.rawInput.DELAY_PRESS, ctx.inputs));
        return delayPress < 0 ? 'pasteText' : 'typeText';
      }
      return 'sendKey';
    }
    case 48:
      return 'click';
    case 29:
      return 'httpRequest';
    case 30:
      return 'httpDownload';
    case 39:
      return 'goto';
    case 44:
      return 'waitXPath';
    case 45:
      return 'getAttribute';
    case 46:
      return 'getText';
    case 47:
      return 'countElement';
    case 50:
      return 'moveMouse';
    case 55:
      return 'fileUpload';
    case 58:
      return 'scrollTop';
    case 59:
      return 'scrollBottom';
    case 60:
      return 'scrollIntoView';
    case 68:
      return 'executeJs';
    case 73:
      return 'closeAllTabs';
    case 74:
      return 'createEmptyExcel';
    case 81:
      return 'totp';
    default:
      return `action${node.actionType}`;
  }
}

function formatActionDetails(node: GscriptActionNode, ctx: GscriptExecutionContext): string[] {
  const input = node.rawInput;
  switch (node.actionType) {
    case 1:
      return input.VALUE ? [`value=${formatInputValue(parseLiteralOrInterpolated(input.VALUE, ctx.inputs))}`] : [];
    case 2:
      return [`current=${formatInputValue(parseLiteralOrInterpolated(input.CURRENT_VAL, ctx.inputs))}`, `increaseBy=${formatInputValue(parseLiteralOrInterpolated(input.INCREASE_BY, ctx.inputs))}`];
    case 3:
      return [`current=${formatInputValue(parseLiteralOrInterpolated(input.CURRENT_VAL, ctx.inputs))}`, `decreaseBy=${formatInputValue(parseLiteralOrInterpolated(input.DESCREASE_BY, ctx.inputs))}`];
    case 4:
      return [`input=${formatInputValue(parseLiteralOrInterpolated(input.INPUT_ARRAY, ctx.inputs))}`];
    case 7:
      return [`min=${formatInputValue(parseLiteralOrInterpolated(input.MIN, ctx.inputs))}`, `max=${formatInputValue(parseLiteralOrInterpolated(input.MAX, ctx.inputs))}`];
    case 9:
      return [`text=${formatInputValue(stringifyValue(parseLiteralOrInterpolated(input.INPUT_TEXT, ctx.inputs)))}`, `split=${formatInputValue(interpolate(input.SPLIT_CHAR, ctx.inputs))}`];
    case 10:
      return [`json=${formatInputValue(parseLiteralOrInterpolated(input.JSON, ctx.inputs))}`, `path=${formatInputValue(interpolate(input.NODES, ctx.inputs))}`, ...(node.outputVariableName ? [`output=${node.outputVariableName}`] : [])];
    case 11:
      return [`min=${formatInputValue(parseLiteralOrInterpolated(input.MIN, ctx.inputs))}`, `max=${formatInputValue(parseLiteralOrInterpolated(input.MAX, ctx.inputs))}`];
    case 13:
    case 17:
    case 18:
    case 19:
    case 20:
    case 23:
    case 24:
    case 25:
    case 30:
    case 55:
    case 64:
    case 65:
    case 71:
    case 72:
    case 74:
      return formatPathDetails(node, ctx);
    case 21:
      return [`file=${formatInputValue(interpolate(input.FILE_PATH, ctx.inputs))}`, `sheet=${formatInputValue(interpolate(input.SHEET_ID, ctx.inputs))}`, `cell=${formatInputValue(excelAddress(input, ctx))}`];
    case 22:
      return [`file=${formatInputValue(interpolate(input.FILE_PATH, ctx.inputs))}`, `sheet=${formatInputValue(interpolate(input.SHEET_ID, ctx.inputs))}`, `cell=${formatInputValue(excelAddress(input, ctx))}`, `text=${formatInputValue(interpolate(input.DATA, ctx.inputs))}`];
    case 29:
      return [`method=${interpolate(input.METHOD || 'GET', ctx.inputs).toUpperCase()}`, `url=${formatInputValue(interpolate(input.URL, ctx.inputs))}`];
    case 36:
      return [];
    case 37:
      return [`tabIndex=${formatInputValue(interpolate(input.TAB_INDEX, ctx.inputs))}`];
    case 38:
      return [];
    case 39:
      return [`url=${formatInputValue(interpolate(input.URL, ctx.inputs))}`];
    case 41:
      return [];
    case 42:
      return [];
    case 43:
      return [`currentUrl=${formatInputValue(interpolate(input.CURRENT_URL, ctx.inputs))}`, `timeout=${secondsToMs(input.TIME_OUT, ctx, 10)}ms`];
    case 44:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`, `timeout=${secondsToMs(input.TIME_OUT, ctx, 10)}ms`];
    case 45:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`, `attr=${formatInputValue(interpolate(input.ATTR_NAME, ctx.inputs))}`];
    case 46:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`];
    case 47:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`];
    case 48:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`];
    case 50:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`];
    case 54: {
      const type = interpolate(input.TYPE, ctx.inputs).toUpperCase();
      const key = interpolate(input.KEY, ctx.inputs);
      if (type === 'TEXT') {
        const xpath = node.elementXPath ? interpolate(node.elementXPath, ctx.inputs) : interpolate(input.XPATH ?? '', ctx.inputs);
        const delayPress = asNumber(parseLiteralOrInterpolated(input.DELAY_PRESS, ctx.inputs));
        return [`xpath=${formatInputValue(xpath)}`, `text=${formatInputValue(key)}`, `mode=${delayPress < 0 ? 'pasteText' : 'typeText'}`];
      }
      return [`text=${formatInputValue(key)}`];
    }
    case 57:
      return [];
    case 58:
      return [`code=${formatInputValue('window.scrollTo(0, 0)')}`];
    case 59:
      return [`code=${formatInputValue('window.scrollTo(0, document.body.scrollHeight)')}`];
    case 60:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`];
    case 68:
      return [`code=${formatInputValue(previewText(interpolate(input.FILE_OR_CODE, ctx.inputs)))}`];
    case 73:
      return [];
    case 76:
      return [];
    case 81:
      return [`secret=${formatRedactedValue()}`];
    default:
      return [];
  }
}

function formatPathDetails(node: GscriptActionNode, ctx: GscriptExecutionContext): string[] {
  const input = node.rawInput;
  switch (node.actionType) {
    case 13:
    case 17:
    case 18:
    case 19:
    case 20:
    case 23:
    case 24:
    case 25:
    case 64:
    case 65:
    case 71:
    case 72:
    case 74:
      return input.FILE_PATH ? [`path=${formatInputValue(interpolate(input.FILE_PATH, ctx.inputs))}`] : input.FOLDER_PATH ? [`path=${formatInputValue(interpolate(input.FOLDER_PATH, ctx.inputs))}`] : [];
    case 30:
      return [`url=${formatInputValue(interpolate(input.URL, ctx.inputs))}`, `savePath=${formatInputValue(interpolate(input.SAVE_PATH, ctx.inputs))}`];
    case 55:
      return [`xpath=${formatInputValue(optionalXPath(node, input, ctx))}`, `file=${formatInputValue(interpolate(input.FILE_PATH, ctx.inputs))}`];
    default:
      return [];
  }
}

function optionalXPath(node: GscriptActionNode, input: Record<string, string>, ctx: GscriptExecutionContext): string {
  return interpolate(input.XPATH ?? node.elementXPath ?? '', ctx.inputs);
}

function previewText(value: unknown, maxLength = 500): string {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  if (raw.length <= maxLength) return raw;
  return `${raw.slice(0, maxLength)}…`;
}
