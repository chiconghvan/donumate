import type { FlowInputKind } from '../../runtime/dsl/types.js';
import { getNodeDefinition } from '../nodeRegistry.js';
import type { ScriptBuilderNode, ScriptBuilderVariable } from '../types.js';

type NodeInspectorProps = {
  selectedNode?: ScriptBuilderNode;
  variables: ScriptBuilderVariable[];
  onUpdateNode: (nodeId: string, key: string, value: unknown) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddVariable: () => void;
  onUpdateVariable: (index: number, key: keyof ScriptBuilderVariable, value: unknown) => void;
  onRemoveVariable: (index: number) => void;
};

const INPUT_TYPES: FlowInputKind[] = ['input', 'text', 'number', 'file', 'folder', 'checkbox', 'comboBox', 'inputExcelFile'];

export function NodeInspector(props: NodeInspectorProps): JSX.Element {
  const definition = props.selectedNode ? getNodeDefinition(props.selectedNode.type) : undefined;

  if (!props.selectedNode || !definition) {
    return (
      <section className="sb-panel">
        <div className="sb-panel-header">
          <h2>Inspector</h2>
          <span>Script Inputs</span>
        </div>
        <div className="sb-inspector">
          <button className="sb-primary" type="button" onClick={props.onAddVariable}>Add Input</button>
          {props.variables.length === 0 ? <div className="sb-empty">No inputs defined.</div> : null}
          {props.variables.map((variable, index) => (
            <div className="sb-input-card" key={variable.id}>
              <div className="sb-input-card-head">
                <strong>{variable.name || `input_${index + 1}`}</strong>
                <button type="button" onClick={() => props.onRemoveVariable(index)}>Remove</button>
              </div>
              <label>
                <span>Name</span>
                <input value={variable.name} onChange={(event) => props.onUpdateVariable(index, 'name', event.target.value)} />
              </label>
              <label>
                <span>Type</span>
                <select value={variable.type} onChange={(event) => props.onUpdateVariable(index, 'type', event.target.value as FlowInputKind)}>
                  {INPUT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                <span>Default</span>
                <input value={variable.defaultValue === undefined ? '' : String(variable.defaultValue)} onChange={(event) => props.onUpdateVariable(index, 'defaultValue', event.target.value)} />
              </label>
              {variable.type === 'comboBox' ? (
                <label>
                  <span>Options</span>
                  <textarea
                    value={Array.isArray(variable.options) ? variable.options.join('\n') : ''}
                    onChange={(event) => props.onUpdateVariable(index, 'options', event.target.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))}
                  />
                </label>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="sb-panel">
      <div className="sb-panel-header">
        <h2>Inspector</h2>
        <span>{definition.label}</span>
      </div>
      <div className="sb-inspector">
        <div className="sb-inspector-meta">
          <div><strong>Type</strong> {definition.type}</div>
          <div><strong>Kind</strong> {definition.kind}</div>
        </div>
        {definition.fields.map((field) => (
          <label key={field.key}>
            <span>{field.label}</span>
            {renderField(props.selectedNode!, field.key, field.type, field.options, (value) => props.onUpdateNode(props.selectedNode!.id, field.key, value))}
          </label>
        ))}
        {props.selectedNode.kind === 'raw' && props.selectedNode.raw?.source ? (
          <label>
            <span>Imported Raw Source</span>
            <textarea readOnly value={props.selectedNode.raw.source} />
          </label>
        ) : null}
        {props.selectedNode.data.locked === true ? null : (
          <button className="sb-danger" type="button" onClick={() => props.onDeleteNode(props.selectedNode!.id)}>Delete Node</button>
        )}
      </div>
    </section>
  );
}

function renderField(
  node: ScriptBuilderNode,
  key: string,
  type: string,
  options: string[] | undefined,
  onChange: (value: unknown) => void,
): JSX.Element {
  const value = node.data[key];
  if (type === 'boolean') {
    return <input checked={Boolean(value)} type="checkbox" onChange={(event) => onChange(event.target.checked)} />;
  }
  if (type === 'select') {
    return (
      <select value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)}>
        {(options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }
  if (type === 'textarea' || type === 'code' || type === 'json' || type === 'expression' || type === 'selector' || type === 'variable') {
    return <textarea value={formatTextareaValue(value)} onChange={(event) => onChange(event.target.value)} />;
  }
  if (type === 'number') {
    return <input value={value === undefined ? '' : String(value)} type="number" onChange={(event) => onChange(event.target.value)} />;
  }
  return <input value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} />;
}

function formatTextareaValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).join('\n');
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value : String(value);
}
