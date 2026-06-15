import { DonutApiClient } from '../donut/api-client.js';
import { findProfileOrThrow, selectCamoufoxProfile } from '../donut/profile-selector.js';
import { BidiClient } from '../bidi/bidi-client.js';
import { PageAutomation } from './page-automation.js';
import { loadWorkflow } from './script-loader.js';
import { executeFlowBlock } from './dsl/executor.js';
import { stringifyInputValues, type FlowInputOverrides } from './dsl/input-values.js';
import { runFlowInputForm } from '../ui/run-flow-input-form.js';
import { formatError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { ApiProfile, RunProfileResponse } from '../donut/api-types.js';
import type { WorkflowContext, FlowInputValue } from './types.js';

export type RunnerOptions = {
  apiBaseUrl: string;
  apiToken?: string;
  profileId?: string;
  headless: boolean;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
  scriptSpec: string;
  scriptInputs?: FlowInputOverrides;
};

type BaseContext = {
  profile: ApiProfile;
  inputs: Record<string, FlowInputValue>;
  args: Record<string, string>;
  log: (...args: unknown[]) => void;
  sleep: (ms: number) => Promise<void>;
};

export async function runWorkflow(options: RunnerOptions): Promise<void> {
  const donut = new DonutApiClient(options.apiBaseUrl, options.apiToken);
  const log = (...args: unknown[]) => logger.info(args.join(' '));

  logger.info('[1/6] Loading script...');
  const workflow = await loadWorkflow(options.scriptSpec);

  logger.info('[2/6] Collecting inputs...');
  const inputs = workflow.kind === 'flow'
    ? await runFlowInputForm(workflow.program.inputs, options.scriptInputs ?? {})
    : {};
  const args = stringifyInputValues(inputs);

  logger.info('[3/6] Loading profile...');
  const profiles = await donut.listProfiles();
  const profile = options.profileId
    ? findProfileOrThrow(profiles, options.profileId)
    : await selectCamoufoxProfile(profiles);
  logger.info(`  ${profile.name} (${profile.id})`);

  const baseCtx: BaseContext = { profile, inputs, args, log, sleep };

  if (workflow.kind === 'flow') {
    await executeFlowBlock(baseCtx, workflow.program, 'beforeRunProfile');
  }

  let run: RunProfileResponse | undefined;
  let bidi: BidiClient | undefined;
  let launched = false;
  let mainError: unknown;
  let afterKillError: unknown;

  try {
    logger.info('[4/6] Launching profile...');
    run = await donut.runProfile(profile.id, {
      url: 'about:blank',
      headless: options.headless,
    });
    launched = true;
    logger.info(`  Remote debugging port: ${run.remote_debugging_port}`);

    logger.info('[5/6] Waiting for profile to be ready...');
    await sleep(4000); // wait for browser process to start before polling
    const readyProfile = await donut.waitForProfileReady(profile.id, { timeoutMs: 30000 });
    logger.info(`  Profile ready: is_running=${readyProfile.is_running}, process_id=${readyProfile.process_id}`);

    const wsUrl = run.ws_url ?? `ws://127.0.0.1:${run.remote_debugging_port}/session`;
    logger.info(`  BiDi WS: ${wsUrl}`);

    bidi = new BidiClient(options.bidiConnectTimeoutMs, options.bidiCommandTimeoutMs);
    await connectBidiWithRetry(bidi, wsUrl);

    const page = new PageAutomation(bidi);
    await page.init();

    const ctx: WorkflowContext = {
      ...baseCtx,
      run,
      page,
      bidi,
    };

    logger.info('[6/6] Running script...');
    if (workflow.kind === 'flow') {
      await executeFlowBlock(ctx, workflow.program, 'main');
    } else {
      await workflow.run(ctx);
    }
    logger.info('Done.');
  } catch (error) {
    mainError = error;
  } finally {
    await bidi?.close().catch(() => {});
    if (launched) {
      await donut.killProfile(profile.id).catch((error: unknown) => logger.error(formatError(error)));
      logger.info('Killed profile.');
    }

    if (workflow.kind === 'flow') {
      try {
        await executeFlowBlock(baseCtx, workflow.program, 'afterKillProfile');
      } catch (error) {
        afterKillError = error;
        logger.error(formatError(error));
      }
    }
  }

  if (mainError) throw mainError;
  if (afterKillError) throw afterKillError;
}

async function connectBidiWithRetry(bidi: BidiClient, wsUrl: string): Promise<void> {
  const maxRetries = 5;
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await bidi.connect(wsUrl);
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        logger.info(`  BiDi connect attempt ${attempt}/${maxRetries} failed, retrying in 1s...`);
        await sleep(1000);
      }
    }
  }
  if (lastError) throw lastError;
}
