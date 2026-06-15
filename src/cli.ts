#!/usr/bin/env node
import { Command, Option } from 'commander';
import { loadConfig } from './config/load-config.js';
import { runWorkflow, type RunnerOptions } from './runtime/runner.js';
import { selectScript } from './runtime/script-loader.js';
import { formatError } from './utils/errors.js';

const program = new Command();

program
  .name('donut-camoufox')
  .description('Launch Donut Camoufox profiles and automate them over WebDriver BiDi')
  .version('0.1.0');

type CliOptions = {
  api?: string;
  token?: string;
  profile?: string;
  headless?: string;
  connectTimeout?: string;
  commandTimeout?: string;
  script?: string;
  input?: string[];
};

function collectInput(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function parseInputOverrides(values: string[] | undefined): Record<string, string> {
  const overrides: Record<string, string> = {};
  for (const value of values ?? []) {
    const separator = value.indexOf('=');
    if (separator <= 0) throw new Error(`Invalid --input value "${value}". Expected key=value.`);
    overrides[value.slice(0, separator)] = value.slice(separator + 1);
  }
  return overrides;
}

// Shared options helper
function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('--api <url>', 'Donut API base URL')
    .option('--token <token>', 'Donut API bearer token')
    .option('--profile <profile-id>', 'Donut profile id')
    .addOption(new Option('--headless <boolean>', 'Launch profile headless').default(undefined))
    .option('--connect-timeout <ms>', 'BiDi connect timeout in milliseconds')
    .option('--command-timeout <ms>', 'BiDi command timeout in milliseconds')
    .option('--input <key=value>', 'Set .flow input value; repeatable', collectInput, []);
}

async function runWithOptions(options: CliOptions, scriptSpec?: string): Promise<void> {
  const config = loadConfig({
    api: options.api,
    token: options.token,
    profile: options.profile,
    headless: options.headless,
    connectTimeout: options.connectTimeout,
    commandTimeout: options.commandTimeout,
  });

  const runnerOptions: RunnerOptions = {
    apiBaseUrl: config.apiBaseUrl,
    apiToken: config.apiToken,
    profileId: config.profileId,
    headless: config.headless,
    bidiConnectTimeoutMs: config.bidiConnectTimeoutMs,
    bidiCommandTimeoutMs: config.bidiCommandTimeoutMs,
    scriptSpec: scriptSpec ?? options.script ?? await selectScript(),
    scriptInputs: parseInputOverrides(options.input),
  };

  await runWorkflow(runnerOptions);
}

async function handleAction(options: CliOptions, scriptSpec?: string): Promise<void> {
  try {
    await runWithOptions(options, scriptSpec);
  } catch (error) {
    console.error(formatError(error));
    process.exitCode = 1;
  }
}

// Bare CLI: choose script, then profile.
addCommonOptions(program).action((options) => handleAction(options));

// Generic run command
addCommonOptions(
  program
    .command('run')
    .description('Run a workflow script against a Camoufox profile')
    .option('--script <path-or-name>', 'Script path or built-in name (e.g. threads, ./scripts/my-task.ts)')
).action((options) => handleAction(options));

// Built-in threads command (alias for run --script threads)
addCommonOptions(
  program
    .command('threads')
    .description('Open Threads in a Camoufox profile and count interactive elements (built-in script)')
).action((options) => handleAction(options, 'threads'));

program.parseAsync();
