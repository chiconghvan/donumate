import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { exportGraphToFlowSource } from '../src/script-builder/engine/exportGraphToFlowSource.ts';
import { importFlowSourceToGraph } from '../src/script-builder/engine/importFlowSourceToGraph.ts';
import { validateScriptBuilderFlow } from '../src/script-builder/engine/validateScriptBuilderFlow.ts';

const scriptsDir = join(process.cwd(), 'scripts');
const scriptFiles = (await readdir(scriptsDir)).filter((name) => name.toLowerCase().endsWith('.flow')).sort();

assert(scriptFiles.length > 0, 'Expected at least one .flow sample in scripts/.');

for (const fileName of scriptFiles) {
  const path = join(scriptsDir, fileName);
  const source = await readFile(path, 'utf8');
  const first = importFlowSourceToGraph(source, { sourcePath: path });
  const firstExport = exportGraphToFlowSource(first);
  const second = importFlowSourceToGraph(firstExport, { sourcePath: path });
  const secondExport = exportGraphToFlowSource(second);
  const issues = validateScriptBuilderFlow(first);

  assert(firstExport.trim().length > 0, `${fileName}: export should not be empty`);
  assert.equal(secondExport, firstExport, `${fileName}: second round-trip export must be stable`);

  const errorCount = issues.filter((issue) => issue.level === 'error').length;
  const warningCount = issues.filter((issue) => issue.level === 'warning').length;
  console.log(`${fileName}: stable round-trip, ${errorCount} error(s), ${warningCount} warning(s)`);
}
