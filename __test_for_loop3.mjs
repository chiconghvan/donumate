import { parseFlowProgram } from './src/runtime/dsl/parser.js';
import { executeFlowBlock } from './src/runtime/dsl/executor.js';

const source = [
  'running() {',
  '  mediaFileList = getFiles("E:\\Code\\donumate")',
  '  countMediaFile = arrayLength(mediaFileList)',
  '  a = countMediaFile - 1',
  '  for loopIndex = 0; loopIndex < a; loopIndex = loopIndex + 1 {',
  '    log("in loop ${loopIndex}")',
  '  }',
  '}',
].join('\n');

const program = parseFlowProgram(source);

// Dump for statement
for (const stmt of program.main) {
  if (stmt.type === 'for') {
    console.log('=== FOR statement ===');
    console.log('init name:', JSON.stringify(stmt.init.name));
    console.log('init value:', JSON.stringify(stmt.init.value));
    console.log('condition:', JSON.stringify(stmt.condition));
    console.log('update name:', JSON.stringify(stmt.update.name));
    console.log('update value:', JSON.stringify(stmt.update.value));
    console.log('body length:', stmt.body.length);
    console.log('raw:', JSON.stringify(stmt.raw));
  }
}

// Override executeFlowStatement to add debug
const origExecute = await import('./src/runtime/dsl/executor.js');

const logs = [];
const ctx = {
  log: (...args) => { const msg = args.join(' '); logs.push(msg); console.log('LOG:', msg); },
  sleep: async (ms) => {},
  page: null, bidi: null, profile: {}, run: {}, inputs: {}, args: {},
};
try {
  await origExecute.executeFlowBlock(ctx, program, 'main');
} catch (e) {
  console.log('ERROR:', e.message);
  console.log('Final locals would have been: COUNT X iterations');
}
