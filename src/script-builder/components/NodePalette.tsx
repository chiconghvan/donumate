import { ALL_NODE_DEFINITIONS, PALETTE_GROUPS } from '../nodeRegistry.js';

type NodePaletteProps = {
  onAddNode: (type: string) => void;
};

export function NodePalette({ onAddNode }: NodePaletteProps): JSX.Element {
  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, type: string): void {
    event.dataTransfer.setData('application/donumate-script-builder-node', type);
    event.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <section className="sb-panel">
      <div className="sb-panel-header">
        <h2>Palette</h2>
        <span>{ALL_NODE_DEFINITIONS.length} node types</span>
      </div>
      <div className="sb-palette">
        {PALETTE_GROUPS.map((group) => {
          const items = ALL_NODE_DEFINITIONS.filter((definition) => definition.category === group.id);
          if (items.length === 0) return null;
          return (
            <div className="sb-palette-group" key={group.id}>
              <div className="sb-palette-group-title">{group.title}</div>
              {items.map((definition) => (
                <button
                  className="sb-palette-item"
                  key={definition.type}
                  type="button"
                  draggable
                  onClick={() => onAddNode(definition.type)}
                  onDragStart={(event) => handleDragStart(event, definition.type)}
                >
                  <strong>{definition.label}</strong>
                  <span>{definition.description}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
