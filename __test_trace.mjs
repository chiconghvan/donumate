import { parseFlowProgram } from './src/runtime/dsl/parser.js';
import { executeFlowBlock } from './src/runtime/dsl/executor.js';

const source = [
  'running() {',
  '  list = getFiles("E:\\Code\\donumate")',
  '  n = arrayLength(list)',
  '  a = n - 1',
  '  for i = 0; i < a; i = i + 1 {',
  '    log("body i=${i}")',
  '  }',
  '}',
].join('\n');
const program = parseFlowProgram(source);

const logs = [];
let writeCount = 0;
const traceLocals = {};
const handler = {
  set(target, prop, value) {
    writeCount++;
    if (writeCount <= 20 || String(prop) === 'i') {
      console.log(`  [WRITE#${writeCount}] locals["${String(prop)}"] =`, JSON.stringify(value), `(prev=${JSON.stringify(target[prop])})`);
    }
    target[prop] = value;
    return true;
  }
};
const traceRuntime = { locals: new Proxy(traceLocals, handler), loopIndexStack: [], excelInputs: new Set() };

// Monkey-patch: store original executeFlowBlock to get access to the runtime
const origBlock = executeFlowBlock;

const ctx = {
  log: (...args) => { const msg = args.join(' '); logs.push(msg); console.log('LOG:', msg); },
  sleep: async () => {},
  page: null, bidi: null, profile: {}, run: {}, inputs: {}, args: {},
};

// We need to make executeFlowBlock use our traced runtime
// Since we can't easily, let's just test via the actual runner

// Actually let's just patch the runtime.locals in a simpler way
// by calling the internal function via a wrapper

const origImport = await import('./src/runtime/dsl/executor.js');
// executeFlowBlock isn't directly patchable for internals
// Try monkey-patching at a different level

// Instead, let's just use the flow program directly and see what happens
// by wrapping the statements internals

console.log('Starting traced test...');

try {
  await executeFlowBlock(ctx, program, 'main');
} catch(e) {
  console.log('ERROR:', e.message);
}
console.log('\nDone - note: traceLocals shows values at time of proxy creation, not actual runtime');
console.log('(executeFlowBlock creates its own runtime internally)');
