#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig } from './config/load-config.js';
import { createFlowScript } from './runtime/create-flow-script.js';
import { checkFlowSource, formatFlowDiagnostic } from './runtime/dsl/checker.js';
import { clearScreen, runWorkflow, type RunnerOptions } from './runtime/runner.js';
import { runGscriptWorkflow } from './runtime/gscript/runner.js';
import { selectScript } from './runtime/script-loader.js';
import { launchScriptBuilder } from './script-builder/launch.js';
import { getUi } from './ui/ui-provider.js';
import { AppError, CliBackError, formatError, isCliBackError } from './utils/errors.js';
import { globalAbort, initAbortHandler } from './utils/abort.js';
import { CURRENT_VERSION, maybeRunUpdateCheck } from './update/index.js';

const program = new Command();

program
  .name('donumate')
  .description('Launch Donut Camoufox profiles and automate them over WebDriver BiDi')
  .version(CURRENT_VERSION);

type CliOptions = {
  api?: string;
  token?: string;
  profile?: string;
  headless?: boolean;
  connectTimeout?: string;
  commandTimeout?: string;
  script?: string;
  scriptBuilder?: boolean | string;
  input?: string[];
  updateCheck?: boolean;
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

type RootAction = 'run-scripts' | 'create-flow' | 'exit';
type CheckOptions = CliOptions & { script?: string };

async function selectRootAction(): Promise<RootAction | undefined> {
  const ui = await getUi();
  return ui.runListPicker<RootAction>({
    title: 'Donumate',
    options: [
      { label: 'Run Scripts', value: 'run-scripts' },
      { label: 'Create flow script', value: 'create-flow' },
      { label: 'Exit', value: 'exit' },
    ],
    cancelHint: 'exit',
  });
}

// Shared options helper
function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('--api <url>', 'Donut API base URL (default: http://127.0.0.1:10108)')
    .option('--token <token>', 'Donut API bearer token')
    .option('--profile <profile-id>', 'Skip interactive profile selection')
    .option('--headless', 'Launch profile headless')
    .option('--connect-timeout <ms>', 'BiDi connect timeout in ms (default: 30000)')
    .option('--command-timeout <ms>', 'BiDi command timeout in ms (default: 15000)')
    .option('--script-builder [path]', 'Launch visual .flow script builder, optionally opening a script')
    .option('--input <key=value>', 'Set workflow input; repeat for multiple (e.g. --input url=https://x --input count=5)', collectInput, [])
    .option('--no-update-check', 'Skip checking GitHub releases for updates');
}

// Register global SIGINT handler
initAbortHandler();

async function runWithOptions(options: CliOptions, scriptSpec?: string): Promise<void> {
  const config = loadConfig({
    api: options.api,
    token: options.token,
    profile: options.profile,
    headless: options.headless,
    connectTimeout: options.connectTimeout,
    commandTimeout: options.commandTimeout,
  });

  await maybeRunUpdateCheck({ currentVersion: CURRENT_VERSION, updateCheck: options.updateCheck });

  const fixedScript = scriptSpec ?? options.script;
  let lastSelectedScript: string | undefined = undefined;
  let savedInputsState: { values: Record<string, string>; cursor: number } | undefined = undefined;
  let lastSelectedProfileId: string | undefined = undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let selectedScript: string;
    try {
      if (fixedScript) {
        selectedScript = fixedScript;
      } else {
        const rootAction = await selectRootAction();
        if (rootAction === undefined || rootAction === 'exit') return;
        if (rootAction === 'create-flow') {
          const createdScript = await createFlowScript();
          if (createdScript) console.log(`Created ${createdScript}`);
          continue;
        }
        selectedScript = await selectScript(lastSelectedScript);
      }
      lastSelectedScript = selectedScript;
    } catch (error) {
      if (error instanceof AppError && error.message === 'Exit') {
        return;
      }
      throw error;
    }

    const runnerOptions: RunnerOptions = {
      apiBaseUrl: config.apiBaseUrl,
      apiToken: config.apiToken,
      profileId: config.profileId,
      headless: config.headless,
      bidiConnectTimeoutMs: config.bidiConnectTimeoutMs,
      bidiCommandTimeoutMs: config.bidiCommandTimeoutMs,
      scriptSpec: selectedScript,
      scriptInputs: parseInputOverrides(options.input),
      signal: globalAbort.signal,
      initialInputsState: savedInputsState,
      initialProfileId: lastSelectedProfileId,
    };

    try {
      await runWorkflow(runnerOptions);
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

async function handleAction(options: CliOptions, scriptSpec?: string): Promise<void> {
  try {
    if (options.scriptBuilder !== undefined) {
      const initialPath = typeof options.scriptBuilder === 'string' ? options.scriptBuilder : options.script ?? scriptSpec;
      await launchScriptBuilder({ initialPath, signal: globalAbort.signal });
      return;
    }
    await runWithOptions(options, scriptSpec);
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

async function handleGscriptAction(options: CliOptions): Promise<void> {
  try {
    if (!options.script) throw new AppError('--script is required.');
    const config = loadConfig({
      api: options.api,
      token: options.token,
      profile: options.profile,
      headless: options.headless,
      connectTimeout: options.connectTimeout,
      commandTimeout: options.commandTimeout,
    });
    await maybeRunUpdateCheck({ currentVersion: CURRENT_VERSION, updateCheck: options.updateCheck });
    await runGscriptWorkflow({
      apiBaseUrl: config.apiBaseUrl,
      apiToken: config.apiToken,
      profileId: config.profileId,
      headless: config.headless,
      bidiConnectTimeoutMs: config.bidiConnectTimeoutMs,
      bidiCommandTimeoutMs: config.bidiCommandTimeoutMs,
      scriptSpec: options.script,
      scriptInputs: parseInputOverrides(options.input),
      signal: globalAbort.signal,
    });
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

async function handleCheckAction(options: CheckOptions): Promise<void> {
  const script = options.script;
  if (!script) throw new AppError('--script is required.');
  const fs = await import('fs/promises');
  const source = await fs.readFile(script, 'utf8');
  const result = checkFlowSource(source, script);
  for (const diagnostic of result.diagnostics) {
    console.error(formatFlowDiagnostic(diagnostic, source));
  }
  const errorCount = result.diagnostics.filter((item) => item.severity === 'error').length;
  const warningCount = result.diagnostics.filter((item) => item.severity === 'warning').length;
  if (errorCount === 0 && warningCount === 0) {
    console.log('Check complete. No failures found.');
  } else {
    console.log(`Check complete. ${errorCount} error(s), ${warningCount} warning(s).`);
  }
  process.exitCode = errorCount > 0 ? 1 : 0;
}

// Interactive: choose script, then profile.
addCommonOptions(program).action((options) => handleAction(options));

// Generic run command
addCommonOptions(
  program
    .command('run')
    .description('Run a workflow script against a Camoufox profile')
    .option('--script <path-or-name>', 'Script path or built-in name (e.g. threads, ./scripts/my-task.ts)')
).action((options) => handleAction(options));

// Built-in threads command
addCommonOptions(
  program
    .command('threads')
    .description('Built-in Threads workflow')
).action((options) => handleAction(options, 'threads'));

addCommonOptions(
  program
    .command('gscript')
    .description('Run a GPM Automate .gscript workflow')
    .requiredOption('--script <path>', 'GPM Automate .gscript path')
).action((options) => handleGscriptAction(options));

program
  .command('check')
  .description('Check a .flow script without launching browser')
  .requiredOption('--script <path>', 'Flow script path')
  .action((options) => handleCheckAction(options));

program.parseAsync();
