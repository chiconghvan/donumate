import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

type BuilderReactFlowNodeData = {
  label: string;
  summary: string;
  kind: string;
  issueLevel?: 'error' | 'warning';
  sourceHandles: string[];
};

type BuilderReactFlowNode = Node<BuilderReactFlowNodeData, string>;

export function BaseScriptNode({ data, selected }: NodeProps<BuilderReactFlowNode>): JSX.Element {
  return (
    <div
      className={`sb-node sb-node-${data.kind} ${selected ? 'is-selected' : ''} ${data.issueLevel ? `has-${data.issueLevel}` : ''}`}
    >
      <Handle className="sb-handle" id="target" type="target" position={Position.Left} />
      <div className="sb-node-kind">{data.kind}</div>
      <div className="sb-node-title">{data.label}</div>
      <div className="sb-node-summary">{data.summary || 'No configuration'}</div>
      {data.issueLevel ? <div className={`sb-node-badge ${data.issueLevel}`}>{data.issueLevel}</div> : null}
      <div className="sb-node-handles">
        {data.sourceHandles.includes('next') ? <Handle className="sb-handle sb-handle-next" id="next" type="source" position={Position.Right} style={{ top: '50%' }} /> : null}
        {data.sourceHandles.includes('true') ? <Handle className="sb-handle sb-handle-true" id="true" type="source" position={Position.Right} style={{ top: '28%' }} /> : null}
        {data.sourceHandles.includes('false') ? <Handle className="sb-handle sb-handle-false" id="false" type="source" position={Position.Right} style={{ top: '72%' }} /> : null}
        {data.sourceHandles.includes('body') ? <Handle className="sb-handle sb-handle-body" id="body" type="source" position={Position.Bottom} /> : null}
      </div>
    </div>
  );
}
