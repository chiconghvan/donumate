import { parseFlowProgram } from './src/runtime/dsl/parser.js';
import { checkFlowProgram } from './src/runtime/dsl/checker.js';
import { executeFlowBlock } from './src/runtime/dsl/executor.js';

const source = `running() {
  a = 1
  for i = 0; i < a; i = i + 1 {
    log("inside i=$\{i\}")
  }
  log("after loop i=$\{i\}")
}`;

const program = parseFlowProgram(source);
const result = checkFlowProgram(program, 'test.flow');
for (const d of result.diagnostics) {
  console.log(`${d.severity}: ${d.message}`);
}

const logs = [];
const ctx = {
  log: (...args) => {
    const msg = args.join(' ');
    logs.push(msg);
    console.log('LOG:', msg);
  },
  sleep: async (ms) => {},
  page: null,
  bidi: null,
  profile: {},
  run: {},
  inputs: {},
  args: {},
};
await executeFlowBlock(ctx, program, 'main');
console.log('\nDone');
