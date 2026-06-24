type BuilderToolbarProps = {
  sourcePath?: string;
  onNew: () => void;
  onLoadSample: () => void;
  onSave: () => void;
  onLoad: () => void;
  onValidate: () => void;
  onImportFlow: () => void;
  onExportFlow: () => void;
  onExportJson: () => void;
};

export function BuilderToolbar(props: BuilderToolbarProps): JSX.Element {
  return (
    <header className="sb-toolbar">
      <div className="sb-toolbar-brand">
        <div className="sb-toolbar-title">Script Builder</div>
        <div className="sb-toolbar-subtitle">{props.sourcePath || 'Unsaved workflow'}</div>
      </div>
      <div className="sb-toolbar-actions">
        <button type="button" onClick={props.onNew}>New</button>
        <button type="button" onClick={props.onLoadSample}>Load Sample .flow</button>
        <button type="button" onClick={props.onSave}>Save</button>
        <button type="button" onClick={props.onLoad}>Load</button>
        <button type="button" onClick={props.onValidate}>Validate</button>
        <button type="button" onClick={props.onImportFlow}>Import .flow</button>
        <button type="button" onClick={props.onExportFlow}>Export .flow</button>
        <button type="button" onClick={props.onExportJson}>Export JSON</button>
      </div>
    </header>
  );
}
