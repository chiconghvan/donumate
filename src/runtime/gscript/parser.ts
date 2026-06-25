import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { AppError } from '../../utils/errors.js';
import type { InputDefinition } from '../input-types.js';
import type { GscriptActionNode, GscriptBlockNode, GscriptInputDefinition, GscriptNode, GscriptProgram, GscriptRawInput } from './types.js';

const SUPPORTED_ACTION_TYPES = new Set([
  1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 29, 30,
  36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 48, 50, 54, 55, 57, 58, 59, 60, 64, 65,
  68, 71, 72, 73, 74, 76, 81,
]);

type RawGscriptNode = {
  $type?: string;
  id?: string;
  comment?: string | null;
  raw_input?: string | null;
  nodes?: RawGscriptNode[];
  type?: number;
  element_xpath?: string | null;
  output_variable_name?: string | null;
  delay?: string | null;
  use_failed_block?: boolean;
  failed_block?: RawGscriptNode | null;
};

type RawGscriptEditor = {
  before_init?: RawGscriptNode;
  main_logic?: RawGscriptNode;
  after_quit?: RawGscriptNode;
};

export async function loadGscriptProgram(scriptPath: string): Promise<GscriptProgram> {
  const filePath = resolve(process.cwd(), scriptPath);
  const source = (await readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
  let parsed: RawGscriptEditor;
  try {
    parsed = JSON.parse(source) as RawGscriptEditor;
  } catch (error) {
    throw new AppError(`Invalid .gscript JSON: ${scriptPath}`, error);
  }

  const beforeInit = parseBlockRoot(parsed.before_init, 'before_init');
  const mainLogic = parseBlockRoot(parsed.main_logic, 'main_logic');
  const afterQuit = parseBlockRoot(parsed.after_quit, 'after_quit');
  const inputs = collectGscriptInputs([beforeInit, mainLogic, afterQuit]);
  return { beforeInit, mainLogic, afterQuit, inputs };
}

export function toInputDefinitions(inputs: GscriptInputDefinition[]): InputDefinition[] {
  return inputs.map((input) => ({ ...input }));
}

function parseBlockRoot(raw: RawGscriptNode | undefined, name: string): GscriptBlockNode {
  if (!raw) throw new AppError(`Missing ${name} block in .gscript file.`);
  const node = parseNode(raw);
  if (node.kind === 'action') throw new AppError(`${name} must be a block, got ActionNode.`);
  return node;
}

function parseNode(raw: RawGscriptNode): GscriptNode {
  const typeName = raw.$type ?? '';
  if (typeName.includes('ActionNode')) return parseActionNode(raw);
  return parseBlockNode(raw);
}

function parseBlockNode(raw: RawGscriptNode): GscriptBlockNode {
  const typeName = raw.$type ?? '';
  const kind =
    typeName.includes('ForBlockNode') ? 'for'
      : typeName.includes('WhileBlockNode') ? 'while'
        : typeName.includes('ElseIfBlockNode') ? 'elseif'
          : typeName.includes('ElseBlockNode') ? 'else'
            : typeName.includes('IfBlockNode') ? 'if'
              : typeName.includes('NormalBlockNode') ? 'normal'
                : undefined;
  if (!kind) throw new AppError(`Unsupported GPM block type ${typeName || '(missing)'} at node ${raw.id ?? '(unknown)'}.`);
  return {
    kind,
    id: raw.id ?? '(missing-id)',
    comment: raw.comment ?? null,
    rawInput: parseRawInput(raw),
    nodes: (raw.nodes ?? []).map(parseNode),
  };
}

function parseActionNode(raw: RawGscriptNode): GscriptActionNode {
  const actionType = Number(raw.type);
  if (!SUPPORTED_ACTION_TYPES.has(actionType)) {
    throw new AppError(`Unsupported GPM action type ${Number.isFinite(actionType) ? actionType : '(missing)'} at node ${raw.id ?? '(unknown)'}.`);
  }
  return {
    kind: 'action',
    id: raw.id ?? '(missing-id)',
    comment: raw.comment ?? null,
    rawInput: parseRawInput(raw),
    actionType,
    elementXPath: raw.element_xpath ?? null,
    outputVariableName: raw.output_variable_name ?? null,
    delay: raw.delay ?? null,
    useFailedBlock: Boolean(raw.use_failed_block),
    failedBlock: raw.failed_block ? parseFailedBlock(raw.failed_block, raw) : undefined,
  };
}

function parseFailedBlock(raw: RawGscriptNode, owner: RawGscriptNode): GscriptBlockNode {
  const node = parseNode(raw);
  if (node.kind === 'action') throw new AppError(`failed_block for action ${owner.type} at node ${owner.id ?? '(unknown)'} must be a block.`);
  return node;
}

function parseRawInput(raw: RawGscriptNode): GscriptRawInput {
  const text = raw.raw_input;
  if (!text) return {};
  try {
    const entries = JSON.parse(text) as Array<{ Key?: unknown; Value?: unknown }>;
    if (!Array.isArray(entries)) throw new Error('raw_input is not an array.');
    return Object.fromEntries(entries.map((entry) => [String(entry.Key ?? ''), String(entry.Value ?? '')]));
  } catch (error) {
    const label = raw.$type?.includes('ActionNode') ? `action type ${raw.type}` : 'block';
    throw new AppError(`Invalid raw_input at ${label}, node ${raw.id ?? '(unknown)'}, comment ${raw.comment ?? '(none)'}.`, error);
  }
}

function collectGscriptInputs(roots: GscriptBlockNode[]): GscriptInputDefinition[] {
  const seen = new Set<string>();
  const inputs: GscriptInputDefinition[] = [];
  for (const root of roots) {
    walk(root, (node) => {
      if (node.kind !== 'action' || node.actionType !== 1) return;
      if (!/^true$/i.test(node.rawInput.ALLOW_USER_INPUT ?? '')) return;
      const name = node.outputVariableName?.trim();
      if (!name || seen.has(name)) return;
      seen.add(name);
      const comboOptions = (node.rawInput.COMBOBOX_DATA ?? '').split(',').map((item) => item.trim()).filter(Boolean);
      inputs.push({
        name,
        type: mapInputType(node.rawInput.USER_INPUT_TYPE),
        defaultValue: node.rawInput.VALUE ?? '',
        options: comboOptions.length > 0 ? comboOptions : undefined,
        lineNumber: 0,
      });
    });
  }
  return inputs;
}

function walk(node: GscriptNode, visit: (node: GscriptNode) => void): void {
  visit(node);
  if (node.kind !== 'action') {
    for (const child of node.nodes) walk(child, visit);
  }
  if (node.kind === 'action' && node.failedBlock) walk(node.failedBlock, visit);
}

function mapInputType(type: string | undefined): GscriptInputDefinition['type'] {
  if (/^combobox$/i.test(type ?? '')) return 'comboBox';
  if (/^(checkbox|boolean|bool)$/i.test(type ?? '')) return 'checkbox';
  if (/^number$/i.test(type ?? '')) return 'number';
  return 'text';
}
