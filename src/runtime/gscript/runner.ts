import { DonutApiClient } from '../../donut/api-client.js';
import { selectCamoufoxProfile } from '../../donut/profile-selector.js';
import { BidiClient } from '../../bidi/bidi-client.js';
import { PageAutomation } from '../page-automation.js';
import { coerceAndValidateInputs, stringifyInputValues, type FlowInputOverrides } from '../dsl/input-values.js';
import { runFlowInputForm } from '../../ui/run-flow-input-form.js';
import { CliBackError, formatError, isCliBackError } from '../../utils/errors.js';
import { setCleaningUp } from '../../utils/abort.js';
import { logger } from '../../utils/logger.js';
import { sleep } from '../../utils/retry.js';
import { saveInputState, loadSavedInputState } from '../input-state-store.js';
import { clearScreen, launchProfileWithRetry, type RunnerOptions } from '../runner.js';
import type { ApiProfile, RunProfileResponse } from '../../donut/api-types.js';
import type { FlowInputValue } from '../types.js';
import type { GscriptBlockNode, GscriptExecutionContext } from './types.js';
import { executeGscriptBlock } from './executor.js';
import { loadGscriptProgram, toFlowInputDefinitions } from './parser.js';

export type GscriptRunnerOptions = RunnerOptions;

function hasAllInputOverrides(definitions: { name: string }[], overrides: FlowInputOverrides): boolean {
  return definitions.every((definition) => overrides[definition.name] !== undefined);
}

async function resolveInputs(
  options: GscriptRunnerOptions,
  inputDefinitions: ReturnType<typeof toFlowInputDefinitions>,
  currentInputsState: { values: Record<string, string>; cursor: number }
): Promise<{
  inputs: Record<string, FlowInputValue>;
  nextState: { values: Record<string, string>; cursor: number };
}> {
  if (inputDefinitions.length === 0) {
    return { inputs: {}, nextState: currentInputsState };
  }

  const overrides = options.scriptInputs ?? {};
  if (hasAllInputOverrides(inputDefinitions, overrides)) {
    const inputs = await coerceAndValidateInputs(inputDefinitions, overrides);
    return { inputs, nextState: { values: overrides, cursor: 0 } };
  }

  const formResult = await runFlowInputForm(inputDefinitions, overrides, currentInputsState);
  return { inputs: formResult.values, nextState: formResult.state };
}

function profileRuntimeInputs(profile: ApiProfile): Record<string, FlowInputValue> {
  return {
    profileID: profile.id,
    profileId: profile.id,
    profileName: profile.name,
    profileProxy: profile.proxy ?? '',
  };
}

function hasExecutableNodes(block: GscriptBlockNode): boolean {
  return block.nodes.length > 0;
}

export async function runGscriptWorkflow(options: GscriptRunnerOptions): Promise<void> {
  const signal = options.signal;
  const donut = new DonutApiClient(options.apiBaseUrl, options.apiToken, signal);
  const log = (...args: unknown[]) => logger.info(args.join(' '));
  const program = await loadGscriptProgram(options.scriptSpec);
  const inputDefinitions = toFlowInputDefinitions(program.inputs);

  let currentInputsState = options.initialInputsState ?? { values: await loadSavedInputState(options.scriptSpec) ?? {}, cursor: 0 };
  let currentProfileId = options.initialProfileId;
  let inputs: Record<string, FlowInputValue>;
  let profile: ApiProfile;

  if (options.profileId) {
    try {
      const resolved = await resolveInputs(options, inputDefinitions, currentInputsState);
      inputs = resolved.inputs;
      currentInputsState = resolved.nextState;
      await saveInputState(options.scriptSpec, currentInputsState.values).catch((error: unknown) => logger.error(formatError(error)));
    } catch (error) {
      if (isCliBackError(error)) throw new CliBackError('Back', { inputsState: currentInputsState });
      throw error;
    }
    profile = await donut.getProfile(options.profileId);
  } else {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const resolved = await resolveInputs(options, inputDefinitions, currentInputsState);
        inputs = resolved.inputs;
        currentInputsState = resolved.nextState;
        await saveInputState(options.scriptSpec, currentInputsState.values).catch((error: unknown) => logger.error(formatError(error)));
      } catch (error) {
        if (isCliBackError(error)) throw new CliBackError('Back', { inputsState: currentInputsState });
        throw error;
      }

      const profiles = await donut.listProfiles();
      try {
        profile = await selectCamoufoxProfile(profiles, currentProfileId);
        currentProfileId = profile.id;
      } catch (error) {
        if (isCliBackError(error)) {
          if (inputDefinitions.length > 0) {
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

  profile = await donut.getProfile(profile!.id);
  inputs = { ...inputs!, ...profileRuntimeInputs(profile) };
  let args: Record<string, string> = stringifyInputValues(inputs);
  clearScreen();
  logger.info(`  Profile: ${profile.name}`);

  const baseCtx: GscriptExecutionContext = {
    profile,
    inputs,
    args,
    log,
    sleep: (ms) => sleep(ms, signal),
    minimalLog: options.minimalLog,
  };

  let run: RunProfileResponse | undefined;
  let bidi: BidiClient | undefined;
  let page: PageAutomation | undefined;
  let launched = false;
  let mainError: unknown;
  let afterQuitError: unknown;

  try {
    const beforeSignal = await executeGscriptBlock(baseCtx, program.beforeInit);
    if (beforeSignal && beforeSignal !== 'stop') throw new Error(`${beforeSignal} used outside a loop.`);

    const shouldLaunchProfile = beforeSignal !== 'stop' && hasExecutableNodes(program.mainLogic);
    if (shouldLaunchProfile) {
      const session = await launchProfileWithRetry({
        donut,
        cleanupDonut: new DonutApiClient(options.apiBaseUrl, options.apiToken),
        profileId: profile.id,
        headless: options.headless,
        bidiConnectTimeoutMs: options.bidiConnectTimeoutMs,
        bidiCommandTimeoutMs: options.bidiCommandTimeoutMs,
        signal,
      });
      run = session.run;
      bidi = session.bidi;
      page = session.page;
      launched = true;

      baseCtx.run = run;
      baseCtx.bidi = bidi;
      baseCtx.page = page;

      clearScreen();
      const signalResult = await executeGscriptBlock(baseCtx, program.mainLogic);
      if (signalResult && signalResult !== 'stop') throw new Error(`${signalResult} used outside a loop.`);
      logger.info('Done. Profile cleaned up.');
    } else if (beforeSignal !== 'stop') {
      logger.info('  Main logic empty, skip profile launch.');
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

      try {
        delete baseCtx.page;
        delete baseCtx.bidi;
        delete baseCtx.run;
        await executeGscriptBlock(baseCtx, program.afterQuit);
      } catch (error) {
        afterQuitError = error;
        logger.error(formatError(error));
      }
    } finally {
      setCleaningUp(false);
    }
  }

  if (mainError) throw mainError;
  if (afterQuitError) throw afterQuitError;
}
