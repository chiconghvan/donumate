import type { FlowSample } from '../types.js';

type SamplePickerProps = {
  isOpen: boolean;
  samples: FlowSample[];
  onClose: () => void;
  onPick: (sample: FlowSample) => void;
};

export function SamplePicker({ isOpen, samples, onClose, onPick }: SamplePickerProps): JSX.Element | null {
  if (!isOpen) return null;
  return (
    <div className="sb-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="sb-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="sb-modal-head">
          <h3>Load Sample .flow</h3>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        <div className="sb-modal-list">
          {samples.length === 0 ? <div className="sb-empty">No .flow samples found in ./scripts</div> : null}
          {samples.map((sample) => (
            <button className="sb-sample-item" key={sample.path} type="button" onClick={() => onPick(sample)}>
              <strong>{sample.name}</strong>
              <span>{sample.path}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
