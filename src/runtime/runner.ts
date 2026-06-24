import { DonutApiClient } from '../donut/api-client.js';
import { selectCamoufoxProfile } from '../donut/profile-selector.js';
import { BidiClient } from '../bidi/bidi-client.js';
import { PageAutomation } from './page-automation.js';
import { loadWorkflow } from './script-loader.js';
import { executeFlowBlock } from './dsl/executor.js';
import { stringifyInputValues, type FlowInputOverrides } from './dsl/input-values.js';
import { runFlowInputForm } from '../ui/run-flow-input-form.js';
import { CliBackError, formatError, isCliBackError } from '../utils/errors.js';
import { setCleaningUp } from '../utils/abort.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import { saveInputState, loadSavedInputState } from './input-state-store.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { FlowInputDefinition } from './dsl/types.js';
import type { WorkflowContext, FlowInputValue } from './types.js';

export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

export type RunnerOptions = {
  apiBaseUrl: string;
  apiToken?: string;
  profileId?: string;
  headless: boolean;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
  scriptSpec: string;
  scriptInputs?: FlowInputOverrides;
  signal?: AbortSignal;
  initialInputsState?: { values: Record<string, string>; cursor: number };
  initialProfileId?: string;
};

type BaseContext = {
  profile: ApiProfile;
  inputs: Record<string, FlowInputValue>;
  args: Record<string, string>;
  log: (...args: unknown[]) => void;
  sleep: (ms: number) => Promise<void>;
};

const PROFILE_LAUNCH_MAX_ATTEMPTS = 3;
const PROFILE_LAUNCH_RETRY_DELAY_MS = 10000;

const FLOW_SCRIPT_SETTING_INPUTS: FlowInputDefinition[] = [
  {
    name: 'hardless',
    type: 'checkbox',
    lineNumber: 0,
    defaultValue: false,
  },
  {
    name: 'threads',
    type: 'number',
    lineNumber: 0,
    defaultValue: 1,
  },
  {
    name: 'inputExcelFile',
    type: 'inputExcelFile',
    lineNumber: 0,
    defaultValue: '',
  },
  {
    name: 'mapProfileName',
    type: 'checkbox',
    lineNumber: 0,
    defaultValue: false,
  },
];

function withFlowScriptSettingInputs(definitions: FlowInputDefinition[]): FlowInputDefinition[] {
  const injected = FLOW_SCRIPT_SETTING_INPUTS.filter((setting) => !definitions.some((input) => input.name === setting.name));
  return [...injected, ...definitions];
}

function flowHeadlessValue(inputs: Record<string, FlowInputValue>, fallback: boolean): boolean {
  const value = inputs.hardless;
  return typeof value === 'boolean' ? value : fallback;
}

function profileRuntimeInputs(profile: ApiProfile, run?: RunProfileResponse): Record<string, FlowInputValue> {
  return {
    profileID: run?.profile_id ?? profile.id,
    profileName: run?.name ?? profile.name,
    profileProxy: run?.proxy ?? '',
  };
}

export async function runWorkflow(options: RunnerOptions): Promise<void> {
  const signal = options.signal;
  const donut = new DonutApiClient(options.apiBaseUrl, options.apiToken, signal);
  const log = (...args: unknown[]) => logger.info(args.join(' '));

  const workflow = await loadWorkflow(options.scriptSpec);

  let inputs: Record<string, FlowInputValue>;
  let args: Record<string, string>;
  let profile: ApiProfile;

  let currentInputsState = options.initialInputsState;
  let currentProfileId = options.initialProfileId;

  if (!currentInputsState && workflow.kind === 'flow') {
    currentInputsState = { values: await loadSavedInputState(options.scriptSpec) ?? {}, cursor: 0 };
  }

  if (options.profileId) {
    try {
      if (workflow.kind === 'flow') {
        const flowInputs = withFlowScriptSettingInputs(workflow.program.inputs);
        const formResult = await runFlowInputForm(flowInputs, options.scriptInputs ?? {}, currentInputsState);
        inputs = formResult.values;
        currentInputsState = formResult.state;
        await saveInputState(options.scriptSpec, formResult.state.values).catch((error: unknown) => logger.error(formatError(error)));
      } else {
        inputs = {};
      }
    } catch (error) {
      if (isCliBackError(error)) {
        throw new CliBackError('Back', { inputsState: currentInputsState });
      }
      throw error;
    }
    args = stringifyInputValues(inputs);

    profile = await donut.getProfile(options.profileId);
  } else {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        if (workflow.kind === 'flow') {
          const flowInputs = withFlowScriptSettingInputs(workflow.program.inputs);
          const formResult = await runFlowInputForm(flowInputs, options.scriptInputs ?? {}, currentInputsState);
          inputs = formResult.values;
          currentInputsState = formResult.state;
          await saveInputState(options.scriptSpec, formResult.state.values).catch((error: unknown) => logger.error(formatError(error)));
        } else {
          inputs = {};
        }
      } catch (error) {
        if (isCliBackError(error)) {
          throw new CliBackError('Back', { inputsState: currentInputsState });
        }
        throw error;
      }
      args = stringifyInputValues(inputs);

      const profiles = await donut.listProfiles();
      try {
        profile = await selectCamoufoxProfile(profiles, currentProfileId);
        currentProfileId = profile.id;
      } catch (error) {
        if (isCliBackError(error)) {
          if (workflow.kind === 'flow' && workflow.program.inputs.length > 0) {
            clearScreen();
            continue;
          }
          throw new CliBackError('Back', { inputsState: currentInputsState, profileId: currentProfileId });
        }
        throw error;
      }
      break;
    }
  }

  inputs = { ...inputs!, ...profileRuntimeInputs(profile) };
  args = stringifyInputValues(inputs);

  clearScreen();
  logger.info(`  Profile: ${profile.name}`);

  const baseCtx: BaseContext = { profile, inputs: inputs!, args: args!, log, sleep: (ms) => sleep(ms, signal) };

  if (workflow.kind === 'flow') {
    await executeFlowBlock(baseCtx, workflow.program, 'beforeRunProfile');
  }

  const shouldLaunchProfile = workflow.kind !== 'flow' || workflow.program.main.length > 0;
  let run: RunProfileResponse | undefined;
  let bidi: BidiClient | undefined;
  let launched = false;
  let mainError: unknown;
  let afterKillError: unknown;

  try {
    if (shouldLaunchProfile) {
      const session = await launchProfileWithRetry({
        donut,
        cleanupDonut: new DonutApiClient(options.apiBaseUrl, options.apiToken),
        profileId: profile.id,
        headless: workflow.kind === 'flow' ? flowHeadlessValue(inputs!, false) : options.headless,
        bidiConnectTimeoutMs: options.bidiConnectTimeoutMs,
        bidiCommandTimeoutMs: options.bidiCommandTimeoutMs,
        signal,
      });
      run = session.run;
      bidi = session.bidi;
      launched = true;

      inputs = { ...inputs!, ...profileRuntimeInputs(profile, run) };
      args = stringifyInputValues(inputs);
      baseCtx.inputs = inputs;
      baseCtx.args = args;

      const page = session.page;

      const ctx: WorkflowContext = {
        ...baseCtx,
        run,
        page,
        bidi,
      };

      clearScreen();
      if (workflow.kind === 'flow') {
        await executeFlowBlock(ctx, workflow.program, 'main');
      } else {
        await workflow.run(ctx);
      }
      logger.info('Done. Profile cleaned up.');
    } else {
      logger.info('  Running block empty, skip profile launch.');
    }
  } catch (error) {
    mainError = error;
  } finally {
    setCleaningUp(true);
    try {
      await bidi?.close().catch(() => {});
      if (launched) {
        const cleanupDonut = new DonutApiClient(options.apiBaseUrl, options.apiToken);
        await cleanupDonut.killProfile(profile.id).catch((error: unknown) => logger.error(formatError(error)));
      }

      if (workflow.kind === 'flow') {
        try {
          await executeFlowBlock(baseCtx, workflow.program, 'afterKillProfile');
        } catch (error) {
          afterKillError = error;
          logger.error(formatError(error));
        }
      }

      await workflow.cleanup().catch((error: unknown) => logger.error(formatError(error)));
    } finally {
      setCleaningUp(false);
    }
  }

  if (mainError) throw mainError;
  if (afterKillError) throw afterKillError;
}

type LaunchProfileOptions = {
  donut: DonutApiClient;
  cleanupDonut: DonutApiClient;
  profileId: string;
  headless: boolean;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
  signal?: AbortSignal;
};

type LaunchedProfileSession = {
  run: RunProfileResponse;
  bidi: BidiClient;
  page: PageAutomation;
};

export async function launchProfileWithRetry(options: LaunchProfileOptions): Promise<LaunchedProfileSession> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PROFILE_LAUNCH_MAX_ATTEMPTS; attempt++) {
    let bidi: BidiClient | undefined;
    let didLaunch = false;

    try {
      logger.info(`  Launch profile attempt ${attempt}/${PROFILE_LAUNCH_MAX_ATTEMPTS}...`);
      const run = await options.donut.runProfile(options.profileId, {
        url: 'about:blank',
        headless: options.headless,
      });
      didLaunch = true;

      const readyProfile = await options.donut.waitForProfileReady(options.profileId, { timeoutMs: 30000 });
      logger.info(`  Browser ready (pid=${readyProfile.process_id})`);

      const wsUrl = run.ws_url ?? `ws://127.0.0.1:${run.remote_debugging_port}/session`;
      bidi = new BidiClient(options.bidiConnectTimeoutMs, options.bidiCommandTimeoutMs, options.signal);
      await connectBidiWithRetry(bidi, wsUrl, options.signal);

      const page = new PageAutomation(bidi);
      await page.init();
      return { run, bidi, page };
    } catch (error) {
      lastError = error;
      await cleanupFailedLaunch(options.cleanupDonut, options.profileId, bidi, didLaunch);

      if (options.signal?.aborted || attempt === PROFILE_LAUNCH_MAX_ATTEMPTS) {
        throw error;
      }

      logger.info(`  Launch attempt ${attempt}/${PROFILE_LAUNCH_MAX_ATTEMPTS} failed, retrying in ${PROFILE_LAUNCH_RETRY_DELAY_MS}ms...`);
      await sleep(PROFILE_LAUNCH_RETRY_DELAY_MS, options.signal);
    }
  }

  throw lastError;
}

async function cleanupFailedLaunch(donut: DonutApiClient, profileId: string, bidi: BidiClient | undefined, didLaunch: boolean): Promise<void> {
  await bidi?.close().catch(() => {});
  if (didLaunch) {
    await donut.killProfile(profileId).catch((error: unknown) => logger.error(formatError(error)));
  }
}

async function connectBidiWithRetry(bidi: BidiClient, wsUrl: string, signal?: AbortSignal): Promise<void> {
  const maxRetries = 3;
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await bidi.connect(wsUrl);
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error as Error;
      if (signal?.aborted) break;
      if (attempt < maxRetries) {
        logger.info(`  BiDi attempt ${attempt}/${maxRetries} failed, retrying in 10s...`);
        await sleep(10000, signal);
      }
    }
  }
  if (lastError) throw lastError;
}
