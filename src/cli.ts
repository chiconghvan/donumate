#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './config/load-config.js';
import { runGscriptWorkflow, type GscriptRunnerOptions } from './runtime/gscript/runner.js';
import { selectGscript } from './runtime/gscript/script-selector.js';
import { getUi } from './ui/ui-provider.js';
import { AppError, CliBackError, formatError, isCliBackError } from './utils/errors.js';
import { globalAbort, initAbortHandler } from './utils/abort.js';
import type { BrowserManagerKind } from './browser-manager/index.js';

const program = new Command();
const cliVersion = process.env.npm_package_version ?? '0.5.5';

program
  .name('donumate')
  .description('Launch Donut browser profiles and automate them with GPM Automate .gscript files over WebDriver BiDi')
  .version(cliVersion);

type CliOptions = {
  api?: string;
  token?: string;
  profile?: string;
  manager?: BrowserManagerKind;
  headless?: boolean;
  winSize?: string;
  connectTimeout?: string;
  commandTimeout?: string;
  script?: string;
  input?: string[];
  minimalLog?: boolean;
};

type RootAction = 'run-scripts' | 'exit';

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

function parseManager(value: string): BrowserManagerKind {
  if (value === 'donut' || value === 'gpm') return value;
  throw new Error(`Invalid --manager value "${value}". Expected donut or gpm.`);
}

function validateWinSize(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const match = value.trim().match(/^(\d+)[,\s]+(\d+)$/);
  if (!match) {
    throw new Error(`Invalid --win-size value "${value}". Expected width,height (e.g. 800,1000).`);
  }
  return `${match[1]},${match[2]}`;
}

async function selectRootAction(): Promise<RootAction | undefined> {
  const ui = await getUi();
  return ui.runListPicker<RootAction>({
    title: 'Donumate',
    options: [
      { label: 'Run Scripts', value: 'run-scripts' },
      { label: 'Exit', value: 'exit' },
    ],
    cancelHint: 'exit',
  });
}

function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('--manager <manager>', 'Browser manager: donut or gpm (default: donut)', parseManager)
    .option('--api <url>', 'Browser manager API base URL (default: Donut http://127.0.0.1:10108, GPM http://127.0.0.1:19995)')
    .option('--token <token>', 'Donut API bearer token')
    .option('--profile <profile-id>', 'Skip interactive profile selection')
    .option('--headless', 'Launch profile headless')
    .option('--win-size <width,height>', 'GPMLogin browser window size (e.g. 800,1000)')
    .option('--connect-timeout <ms>', 'BiDi connect timeout in ms (default: 30000)')
    .option('--command-timeout <ms>', 'BiDi command timeout in ms (default: 15000)')
    .option('--script <path>', 'GPM Automate .gscript path')
    .option('--input <key=value>', 'Set script input; repeat for multiple (e.g. --input url=https://x --input count=5)', collectInput, [])
    .option('--minimal-log', 'Show minimal runtime logs');
}

initAbortHandler();

async function runWithOptions(options: CliOptions): Promise<void> {
  const config = loadConfig({
    manager: options.manager,
    api: options.api,
    token: options.token,
    profile: options.profile,
    headless: options.headless,
    connectTimeout: options.connectTimeout,
    commandTimeout: options.commandTimeout,
  });

  const fixedScript = options.script;
  let lastSelectedScript: string | undefined = undefined;
  let savedInputsState: { values: Record<string, string>; cursor: number } | undefined = undefined;
  let lastSelectedProfileId: string | undefined = undefined;

  while (true) {
    let selectedScript: string;
    try {
      if (fixedScript) {
        selectedScript = fixedScript;
      } else {
        const rootAction = await selectRootAction();
        if (rootAction === undefined || rootAction === 'exit') return;
        selectedScript = await selectGscript(lastSelectedScript);
      }
      lastSelectedScript = selectedScript;
    } catch (error) {
      if (error instanceof AppError && error.message === 'Exit') {
        return;
      }
      throw error;
    }

    const runnerOptions: GscriptRunnerOptions = {
      apiBaseUrl: config.apiBaseUrl,
      apiToken: config.apiToken,
      manager: config.manager,
      profileId: config.profileId,
      headless: config.headless,
      winSize: validateWinSize(options.winSize),
      bidiConnectTimeoutMs: config.bidiConnectTimeoutMs,
      bidiCommandTimeoutMs: config.bidiCommandTimeoutMs,
      scriptSpec: selectedScript,
      scriptInputs: parseInputOverrides(options.input),
      minimalLog: options.minimalLog,
      signal: globalAbort.signal,
      initialInputsState: savedInputsState,
      initialProfileId: lastSelectedProfileId,
    };

    try {
      await runGscriptWorkflow(runnerOptions);
      return;
    } catch (error) {
      if (isCliBackError(error)) {
        const backErr = error as CliBackError;
        if (backErr.state?.inputsState) {
          savedInputsState = backErr.state.inputsState;
        }
        if (backErr.state?.profileId) {
          lastSelectedProfileId = backErr.state.profileId;
        }

        if (!fixedScript) {
          continue;
        }
      }
      throw error;
    }
  }
}

async function handleAction(options: CliOptions): Promise<void> {
  try {
    await runWithOptions(options);
  } catch (error) {
    if (isCliBackError(error)) return;
    if (globalAbort.signal.aborted) {
      process.exitCode = 130;
      return;
    }
    console.error(formatError(error));
    console.error('elifecycle command failed with exit code 1');
    process.exitCode = 1;
  }
}

addCommonOptions(program).action((options) => handleAction(options));

addCommonOptions(
  program
    .command('run')
    .description('Run a GPM Automate .gscript workflow')
).action((options) => handleAction(options));

program.parseAsync();
