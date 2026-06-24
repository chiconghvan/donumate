import { useState } from 'react';
import type { ValidationIssue } from '../types.js';

type OutputPanelProps = {
  issues: ValidationIssue[];
  flowSource: string;
  jsonSource: string;
  parseWarnings: string[];
};

type TabId = 'validation' | 'source' | 'json' | 'warnings';

export function OutputPanel({ issues, flowSource, jsonSource, parseWarnings }: OutputPanelProps): JSX.Element {
  const [tab, setTab] = useState<TabId>('validation');

  return (
    <section className="sb-output">
      <div className="sb-output-tabs">
        <button className={tab === 'validation' ? 'is-active' : ''} type="button" onClick={() => setTab('validation')}>Validation</button>
        <button className={tab === 'source' ? 'is-active' : ''} type="button" onClick={() => setTab('source')}>.flow Source</button>
        <button className={tab === 'json' ? 'is-active' : ''} type="button" onClick={() => setTab('json')}>JSON</button>
        <button className={tab === 'warnings' ? 'is-active' : ''} type="button" onClick={() => setTab('warnings')}>Parse Warnings</button>
      </div>
      <div className="sb-output-body">
        {tab === 'validation' ? (
          issues.length === 0 ? (
            <div className="sb-ok">No validation issues.</div>
          ) : (
            <div className="sb-issues">
              {issues.map((issue, index) => (
                <div className={`sb-issue ${issue.level}`} key={`${issue.message}-${index}`}>
                  <strong>{issue.level}</strong>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )
        ) : null}
        {tab === 'source' ? <pre>{flowSource}</pre> : null}
        {tab === 'json' ? <pre>{jsonSource}</pre> : null}
        {tab === 'warnings' ? (
          parseWarnings.length === 0 ? <div className="sb-ok">No parse warnings.</div> : <pre>{parseWarnings.join('\n')}</pre>
        ) : null}
      </div>
    </section>
  );
}
