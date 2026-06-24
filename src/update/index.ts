import { getUi } from '../ui/ui-provider.js';
import { checkForUpdate } from './github-release.js';
import { installWindowsUpdate } from './windows-self-update.js';

export type MaybeRunUpdateCheckOptions = {
  currentVersion: string;
  updateCheck?: boolean;
};

let updateCheckHasRun = false;

export async function maybeRunUpdateCheck({ currentVersion, updateCheck = true }: MaybeRunUpdateCheckOptions): Promise<void> {
  if (!updateCheck || updateCheckHasRun) return;
  updateCheckHasRun = true;

  const update = await checkForUpdate(currentVersion);
  if (!update) return;

  const ui = await getUi();
  const choice = await ui.runUpdatePrompt(update);
  if (choice !== 'install') return;

  try {
    const result = await installWindowsUpdate(update);
    if (!result.started) {
      if (result.message) console.log(result.message);
      return;
    }
    console.log('Update installer started. Donumate will restart now.');
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Update failed: ${message}`);
  }
}

export { CURRENT_VERSION } from './version.js';
