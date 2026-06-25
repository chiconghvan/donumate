import { AppError } from '../../utils/errors.js';
import { executeGscriptAction } from './actions.js';
import { formatBlockTitle, logGscript } from './logging.js';
import { evaluateCondition } from './expressions.js';
import type { GscriptActionNode, GscriptBlockNode, GscriptExecutionContext, GscriptNode, GscriptSignal } from './types.js';
import { asNumber, parseLiteralOrInterpolated, setVariable } from './values.js';

const MAX_WHILE_ITERATIONS = 10000;

export async function executeGscriptBlock(ctx: GscriptExecutionContext, block: GscriptBlockNode): Promise<GscriptSignal> {
  switch (block.kind) {
    case 'normal':
      return executeLoggedBlock(ctx, formatBlockTitle('Normal Block', block.comment), () => executeNodes(ctx, block.nodes));
    case 'for':
      return executeForWithLogs(ctx, block);
    case 'while':
      return executeLoggedBlock(ctx, formatWhileStartLabel(block), () => executeWhile(ctx, block));
    case 'if':
    case 'elseif':
    case 'else':
      return executeLoggedBlock(ctx, formatConditionalStartLabel(block), () => executeNodes(ctx, block.nodes));
  }
}

export async function executeNodes(ctx: GscriptExecutionContext, nodes: GscriptNode[]): Promise<GscriptSignal> {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) continue;
    let signal: GscriptSignal;
    if (node.kind === 'action') {
      signal = await executeActionWithFailedBlock(ctx, node);
    } else if (node.kind === 'if') {
      const result = await executeIfChain(ctx, nodes, index);
      signal = result.signal;
      index = result.nextIndex;
    } else if (node.kind === 'elseif' || node.kind === 'else') {
      throw new AppError(`${node.kind} block used without a preceding If block at node ${node.id}.`);
    } else {
      signal = await executeGscriptBlock(ctx, node);
    }
    if (signal) return signal;
  }
  return undefined;
}

async function executeActionWithFailedBlock(ctx: GscriptExecutionContext, node: GscriptActionNode): Promise<GscriptSignal> {
  try {
    return await executeGscriptAction(ctx, node);
  } catch (error) {
    if (!node.useFailedBlock || !node.failedBlock) throw error;
    return executeGscriptBlock(ctx, node.failedBlock);
  }
}

async function executeForWithLogs(ctx: GscriptExecutionContext, block: GscriptBlockNode): Promise<GscriptSignal> {
  const { start, end, step } = resolveForRange(ctx, block);
  return executeLoggedBlock(
    ctx,
    formatForStartLabel(block, start, end, step),
    async () => {
  for (let i = start; step >= 0 ? i < end : i > end; i += step) {
        setVariable(ctx.inputs, 'loopIndex', i);
        if (!ctx.minimalLog) logGscript(ctx, `for iteration loopIndex=${i}`);
        const signal = await executeNodes(ctx, block.nodes);
        if (signal === 'next') continue;
        if (signal === 'exit') return undefined;
        if (signal) return signal;
      }
      return undefined;
    }
  );
}

async function executeWhile(ctx: GscriptExecutionContext, block: GscriptBlockNode): Promise<GscriptSignal> {
  for (let iteration = 0; iteration < MAX_WHILE_ITERATIONS; iteration += 1) {
    const matches = await evaluateCondition(block.rawInput.CONDITION, ctx);
    if (!matches) return undefined;
    if (!ctx.minimalLog) logGscript(ctx, `while iteration=${iteration}`);
    const signal = await executeNodes(ctx, block.nodes);
    if (signal === 'next') continue;
    if (signal === 'exit') return undefined;
    if (signal) return signal;
  }
  throw new AppError(`While loop exceeded ${MAX_WHILE_ITERATIONS} iterations at node ${block.id}.`);
}

async function executeIfChain(ctx: GscriptExecutionContext, nodes: GscriptNode[], startIndex: number): Promise<{ signal: GscriptSignal; nextIndex: number }> {
  let index = startIndex;
  let executed = false;
  let signal: GscriptSignal;
  while (index < nodes.length) {
    const node = nodes[index];
    if (!node) break;
    if (index > startIndex && node.kind === 'if') break;
    if (node.kind === 'action' || (node.kind !== 'if' && node.kind !== 'elseif' && node.kind !== 'else')) break;
    if (!executed) {
      const matches = node.kind === 'else' || await evaluateCondition(node.rawInput.CONDITION, ctx);
      if (matches) {
        executed = true;
        signal = await executeLoggedBlock(
          ctx,
          formatConditionalStartLabel(node),
          () => executeNodes(ctx, node.nodes)
        );
      }
    }
    index += 1;
  }
  return { signal, nextIndex: index - 1 };
}

async function executeLoggedBlock(
  ctx: GscriptExecutionContext,
  startLabel: string,
  runner: () => Promise<GscriptSignal>
): Promise<GscriptSignal> {
  logGscript(ctx, startLabel);
  try {
    return await runner();
  } finally {
    if (!ctx.minimalLog) {
      logGscript(ctx, formatBlockTitle(`End ${startLabel}`));
    }
  }
}

function formatForStartLabel(block: GscriptBlockNode, start: number, end: number, step: number): string {
  const comment = block.comment?.trim();
  const suffix = comment ? ` - ${comment}` : '';
  return `For Block${suffix}: start=${start}, end=${end}, step=${step}`;
}

function formatWhileStartLabel(block: GscriptBlockNode): string {
  const comment = block.comment?.trim();
  const suffix = comment ? ` - ${comment}` : '';
  return `While Block${suffix}: condition=${block.rawInput.CONDITION ?? ''}`;
}

function formatConditionalStartLabel(block: GscriptBlockNode): string {
  const base =
    block.kind === 'if' ? 'If Block'
      : block.kind === 'elseif' ? 'Else If Block'
        : 'Else Block';
  return formatBlockTitle(base, block.comment);
}

function resolveForRange(ctx: GscriptExecutionContext, block: GscriptBlockNode): { start: number; end: number; step: number } {
  const start = asNumber(parseLiteralOrInterpolated(block.rawInput.START ?? '0', ctx.inputs));
  const end = asNumber(parseLiteralOrInterpolated(block.rawInput.END ?? '0', ctx.inputs));
  const step = asNumber(parseLiteralOrInterpolated(block.rawInput.INCREASE_BY ?? '1', ctx.inputs)) || 1;
  return { start, end, step };
}
