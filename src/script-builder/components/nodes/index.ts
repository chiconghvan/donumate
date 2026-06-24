import type { NodeTypes } from '@xyflow/react';
import { BlockNode } from './BlockNode.js';
import { CommandNode } from './CommandNode.js';
import { RawNode } from './RawNode.js';
import { VariableNode } from './VariableNode.js';

export const scriptBuilderNodeTypes: NodeTypes = {
  command: CommandNode,
  block: BlockNode,
  variable: VariableNode,
  raw: RawNode,
  meta: BlockNode,
};
