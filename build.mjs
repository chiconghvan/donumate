#!/usr/bin/env node

/**
 * Build script for Donumate
 *
 * Usage:
 *   node build.mjs              # Build both dev + exe
 *   node build.mjs dev          # Build dev only (dist/)
 *   node build.mjs exe          # Build exe only (dist-exe/ + release/)
 *   node build.mjs typecheck    # Type-check only
 *   node build.mjs all          # Typecheck + dev + exe
 *   node build.mjs clean        # Remove dist/, dist-exe/, release/
 */

import { build } from 'esbuild';
import { execSync } from 'child_process';
import { rmSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

function log(msg) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${msg}`);
  console.log('='.repeat(50));
}

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

function clean() {
  log('Cleaning build output');
  for (const dir of ['dist', 'dist-exe', 'release']) {
    const target = resolve(ROOT, dir);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
      console.log(`  Removed ${dir}/`);
    } else {
      console.log(`  ${dir}/ not found, skipping`);
    }
  }
}

function typecheck() {
  log('Type-checking');
  run('pnpm typecheck');
}

async function buildDev() {
  log('Building dev (dist/ with ink)');
  run('pnpm tsup');
  console.log('  Output: dist/cli.js');
}

const inkStubPlugin = {
  name: 'ink-stub',
  setup(build) {
    const redirects = [
      { filter: /^ink$/, target: 'stub-ink.ts' },
      { filter: /^react$/, target: 'stub-react.ts' },
      { filter: /^react\//, target: 'stub-react.ts' },
      { filter: /^react-devtools-core$/, target: 'stub-ink.ts' },
    ];

    for (const { filter, target } of redirects) {
      build.onResolve({ filter }, (args) => {
        console.log(`  [esbuild] ${args.path} -> ${target}`);
        return { path: resolve(ROOT, 'src/ui', target), namespace: 'file' };
      });
    }
  },
};

async function buildExe() {
  log('Building exe bundle (dist-exe/ without ink)');

  const outdir = resolve(ROOT, 'dist-exe');
  if (!existsSync(outdir)) mkdirSync(outdir, { recursive: true });

  await build({
    entryPoints: [resolve(ROOT, 'src/cli.ts')],
    outfile: resolve(outdir, 'cli.js'),
    format: 'esm',
    target: 'node22',
    platform: 'node',
    bundle: true,
    splitting: false,
    external: ['playwright-core', 'xlsx'],
    plugins: [inkStubPlugin],
  });
  copyBuilderAssets('dist-exe');
  console.log('  Output: dist-exe/cli.js');
}

function packageExe() {
  log('Packaging exe (release/donumate-win-x64.exe)');

  const releaseDir = resolve(ROOT, 'release');
  if (!existsSync(releaseDir)) mkdirSync(releaseDir, { recursive: true });

  run('pnpm dlx @yao-pkg/pkg dist-exe/cli.js --targets node22-win-x64 --fallback-to-source --output release/donumate-win-x64.exe');

  const exePath = resolve(ROOT, 'release/donumate-win-x64.exe');
  if (existsSync(exePath)) {
    const size = statSync(exePath).size;
    const mb = (size / 1024 / 1024).toFixed(2);
    console.log(`  Exe size: ${mb} MB`);
  }
}

// --- Main ---

const command = process.argv[2] || 'all';

try {
  switch (command) {
    case 'clean':
      clean();
      break;

    case 'typecheck':
      typecheck();
      break;

    case 'dev':
      await buildDev();
      break;

    case 'exe':
      await buildExe();
      packageExe();
      break;

    case 'all':
      typecheck();
      await buildDev();
      await buildExe();
      packageExe();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Available: clean, typecheck, dev, exe, all');
      process.exit(1);
  }

  console.log('\nDone.');
} catch (err) {
  console.error('\nBuild failed:', err.message || err);
  process.exit(1);
}
