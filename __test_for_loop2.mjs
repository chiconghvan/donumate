import { parseFlowProgram } from './src/runtime/dsl/parser.js';
import { executeFlowBlock } from './src/runtime/dsl/executor.js';

const source = [
  'running() {',
  '  mediaFileList = getFiles("E:\\Code\\donumate")',
  '  countMediaFile = arrayLength(mediaFileList)',
  '  a = countMediaFile - 1',
  '  for loopIndex = 0; loopIndex < a; loopIndex = loopIndex + 1 {',
  '    log("body loopIndex=${loopIndex}")',
  '  }',
  '  log("after loop loopIndex=${loopIndex}")',
  '}',
].join('\n');

const program = parseFlowProgram(source);
const logs = [];
const ctx = {
  log: (...args) => { const msg = args.join(' '); logs.push(msg); console.log('LOG:', msg); },
  sleep: async (ms) => {},
  page: null, bidi: null, profile: {}, run: {}, inputs: {}, args: {},
};
await executeFlowBlock(ctx, program, 'main');
console.log('\n=== All logs ===');
logs.forEach(l => console.log(l));
