import { defineConfig } from 'tsup';
import { resolve } from 'path';
import type { Plugin } from 'esbuild';

const isExe = process.env.DONUMATE_READLINE === '1';

console.log(`[tsup] DONUMATE_READLINE=${process.env.DONUMATE_READLINE}, isExe=${isExe}`);

// Plugin to redirect ink/react imports to empty stubs for exe builds
const inkStubPlugin: Plugin = {
  name: 'ink-stub',
  setup(build) {
    build.onResolve({ filter: /^ink$/ }, (args) => {
      console.log(`[plugin] Redirecting ${args.path}`);
      return { path: resolve('src/ui/stub-ink.ts'), namespace: 'file' };
    });

    build.onResolve({ filter: /^react$/ }, (args) => {
      console.log(`[plugin] Redirecting ${args.path}`);
      return { path: resolve('src/ui/stub-react.ts'), namespace: 'file' };
    });

    build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: resolve('src/ui/stub-ink.ts'),
      namespace: 'file',
    }));
  },
};

export default defineConfig({
  entry: ['src/cli.ts'],
  outDir: isExe ? 'dist-exe' : 'dist',
  format: 'esm',
  target: 'node22',
  platform: 'node',
  splitting: false,
  clean: true,
  dts: false,
  external: isExe ? ['playwright-core', 'xlsx'] : ['esbuild', 'playwright-core', 'react-devtools-core', 'xlsx'],
  esbuildOptions(options) {
    if (isExe) {
      options.plugins = [...(options.plugins ?? []), inkStubPlugin];
    }
  },
});
