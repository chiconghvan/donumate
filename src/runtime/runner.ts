import { DonutApiClient } from '../donut/api-client.js';
import { findProfileOrThrow, selectCamoufoxProfile } from '../donut/profile-selector.js';
import { BidiClient } from '../bidi/bidi-client.js';
import { PageAutomation } from './page-automation.js';
import { loadScript } from './script-loader.js';
import { formatError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { WorkflowContext, WorkflowScript } from './types.js';

export type RunnerOptions = {
  apiBaseUrl: string;
  apiToken?: string;
  profileId?: string;
  headless: boolean;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
  scriptSpec: string;
};

export async function runWorkflow(options: RunnerOptions): Promise<void> {
  const donut = new DonutApiClient(options.apiBaseUrl, options.apiToken);

  // Step 1: Select/find profile
  logger.info(`[1/4] Loading profile...`);
  const profiles = await donut.listProfiles();
  const profile = options.profileId
    ? findProfileOrThrow(profiles, options.profileId)
    : await selectCamoufoxProfile(profiles);
  logger.info(`  ${profile.name} (${profile.id})`);

  // Step 2: Launch profile
  logger.info('[2/4] Launching profile...');
  const run = await donut.runProfile(profile.id, {
    url: 'about:blank',
    headless: options.headless,
  });
  logger.info(`  Remote debugging port: ${run.remote_debugging_port}`);

  // Step 3: Wait for profile to be ready
  logger.info('[3/4] Waiting for profile to be ready...');
  const readyProfile = await donut.waitForProfileReady(profile.id, { timeoutMs: 30000 });
  logger.info(`  Profile ready: is_running=${readyProfile.is_running}, process_id=${readyProfile.process_id}`);

  // Step 4: Connect BiDi + run script
  const wsUrl = run.ws_url ?? `ws://127.0.0.1:${run.remote_debugging_port}/session`;
  logger.info(`  BiDi WS: ${wsUrl}`);

  const bidi = new BidiClient(options.bidiConnectTimeoutMs, options.bidiCommandTimeoutMs);
  await bidi.connect(wsUrl);

  try {
    const page = new PageAutomation(bidi);
    await page.init();

    // Load user script
    let script: WorkflowScript;
    try {
      script = await loadScript(options.scriptSpec);
    } catch (error) {
      logger.error(formatError(error));
      return;
    }

    // Build context
    const ctx: WorkflowContext = {
      profile,
      run,
      page,
      bidi,
      log: (...args: unknown[]) => logger.info(args.join(' ')),
      sleep,
      args: {},
    };

    logger.info('[4/4] Running script...');
    await script(ctx);
    logger.info('Done.');
  } finally {
    await bidi.close().catch(() => {});
    await donut.killProfile(profile.id).catch(() => {});
    logger.info('Killed profile.');
  }
}
