import { BidiClient } from '../bidi/bidi-client.js';
import { PageAutomation } from './page-automation.js';
import { connectPlaywrightToCdp, PlaywrightPageAutomation } from './playwright-page-automation.js';
import { formatError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sleep } from '../utils/retry.js';
import type { Browser } from 'playwright-core';
import type { RunProfileResponse } from '../donut/api-types.js';
import type { BrowserPageAutomation } from './page-automation-types.js';
import type { BrowserProfileManager } from '../browser-manager/index.js';

const PROFILE_LAUNCH_MAX_ATTEMPTS = 3;
const PROFILE_LAUNCH_RETRY_DELAY_MS = 10000;
const PROFILE_CONNECT_DELAY_MS = 6000;

export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

export type LaunchProfileOptions = {
  manager: BrowserProfileManager;
  cleanupManager: BrowserProfileManager;
  profileId: string;
  browser: string;
  headless: boolean;
  winSize?: string;
  bidiConnectTimeoutMs: number;
  bidiCommandTimeoutMs: number;
  signal?: AbortSignal;
};

export type LaunchedProfileSession = {
  run: RunProfileResponse;
  runtime: 'bidi' | 'playwright';
  bidi?: BidiClient;
  playwrightBrowser?: Browser;
  page: BrowserPageAutomation;
};

export async function launchProfileWithRetry(options: LaunchProfileOptions): Promise<LaunchedProfileSession> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PROFILE_LAUNCH_MAX_ATTEMPTS; attempt++) {
    let bidi: BidiClient | undefined;
    let playwrightBrowser: Browser | undefined;
    let didLaunch = false;

    try {
      logger.info(`  Launch profile attempt ${attempt}/${PROFILE_LAUNCH_MAX_ATTEMPTS}...`);
      const launch = await options.manager.launchProfile(options.profileId, {
        headless: options.headless,
        winSize: options.winSize,
      });
      const run = launch.run;
      didLaunch = true;

      if (launch.readyMessage) {
        logger.info(launch.readyMessage);
      }

      logger.info(`  Waiting ${PROFILE_CONNECT_DELAY_MS}ms for profile startup before connecting...`);
      await sleep(PROFILE_CONNECT_DELAY_MS, options.signal);

      if (launch.runtime === 'playwright' || !isCamoufoxBrowser(options.browser)) {
        playwrightBrowser = await connectPlaywrightWithRetry(run.remote_debugging_port, options.bidiConnectTimeoutMs, options.signal);
        const page = new PlaywrightPageAutomation(playwrightBrowser);
        await page.init();
        return { run, runtime: 'playwright', playwrightBrowser, page };
      }

      const wsUrl = run.ws_url ?? `ws://127.0.0.1:${run.remote_debugging_port}/session`;
      bidi = new BidiClient(options.bidiConnectTimeoutMs, options.bidiCommandTimeoutMs, options.signal);
      await connectBidiWithRetry(bidi, wsUrl, options.signal);
      const page = new PageAutomation(bidi);
      await page.init();
      return { run, runtime: 'bidi', bidi, page };
    } catch (error) {
      lastError = error;
      await cleanupFailedLaunch(options.cleanupManager, options.profileId, bidi, playwrightBrowser, didLaunch);

      if (options.signal?.aborted || attempt === PROFILE_LAUNCH_MAX_ATTEMPTS) {
        throw error;
      }

      logger.info(`  Launch attempt ${attempt}/${PROFILE_LAUNCH_MAX_ATTEMPTS} failed, retrying in ${PROFILE_LAUNCH_RETRY_DELAY_MS}ms...`);
      await sleep(PROFILE_LAUNCH_RETRY_DELAY_MS, options.signal);
    }
  }

  throw lastError;
}

async function cleanupFailedLaunch(
  manager: BrowserProfileManager,
  profileId: string,
  bidi: BidiClient | undefined,
  playwrightBrowser: Browser | undefined,
  didLaunch: boolean
): Promise<void> {
  await bidi?.close().catch(() => {});
  await playwrightBrowser?.close().catch(() => {});
  if (didLaunch) {
    await manager.closeProfile(profileId).catch((error: unknown) => logger.error(formatError(error)));
  }
}

async function connectPlaywrightWithRetry(remoteDebuggingPort: number, timeoutMs: number, signal?: AbortSignal): Promise<Browser> {
  const maxRetries = 3;
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) throw new Error('Aborted');
      return await connectPlaywrightToCdp(remoteDebuggingPort, timeoutMs);
    } catch (error) {
      lastError = error as Error;
      if (signal?.aborted) break;
      if (attempt < maxRetries) {
        logger.info(`  Playwright CDP attempt ${attempt}/${maxRetries} failed, retrying in 10s...`);
        await sleep(10000, signal);
      }
    }
  }
  throw lastError;
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

function isCamoufoxBrowser(browser: string): boolean {
  const normalized = browser.toLowerCase();
  return normalized === 'camoufox';
}
