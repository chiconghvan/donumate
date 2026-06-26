import { AppError, CliBackError } from '../utils/errors.js';
import { globalAbort } from '../utils/abort.js';
import { getUi } from '../ui/ui-provider.js';
import type { ApiProfile } from './api-types.js';
import { DONUT_SUPPORTED_BROWSER_TYPES } from './browser-types.js';

type ProfileSelectorOptions = {
  defaultProfileId?: string;
  managerName?: string;
  supportedBrowsers?: Set<string>;
};

export function runnableBrowserProfiles(profiles: ApiProfile[], supportedBrowsers?: Set<string>): ApiProfile[] {
  if (!supportedBrowsers) return profiles;
  return profiles.filter((profile) => supportedBrowsers.has(profile.browser.toLowerCase()));
}

function profileBrowserLabel(profile: ApiProfile): string {
  const browser = profile.browser.toLowerCase();
  return browser === 'wayfern' ? 'weyfern' : browser;
}

export async function selectRunnableBrowserProfile(profiles: ApiProfile[], options: ProfileSelectorOptions = {}): Promise<ApiProfile> {
  if (process.stdin.isTTY) {
    process.stdin.resume();
  }
  const choices = runnableBrowserProfiles(profiles, options.supportedBrowsers);
  const managerName = options.managerName ?? 'Donut Browser';
  if (choices.length === 0) {
    throw new AppError(`No runnable profiles found. Create one in ${managerName} or check its API.`);
  }

  const selectChoices = [
    { label: 'Back', value: '__back__' },
    ...choices.map((profile) => ({
      label: `${profile.name} | ${profileBrowserLabel(profile)}`,
      value: profile.id,
    })),
  ];

  const ui = await getUi();
  const selectedVal = await ui.runListPicker({
    title: `Select browser profile (${choices.length} found)`,
    options: selectChoices,
    initialValue: options.defaultProfileId ?? '__back__',
  });

  if (selectedVal === undefined || selectedVal === '__back__') {
    throw globalAbort.signal.aborted ? new AppError('Aborted') : new CliBackError();
  }

  const selected = choices.find((profile) => profile.id === selectedVal);
  if (!selected) throw new AppError(`Selected profile not found: ${selectedVal}`);
  return selected;
}

export function findProfileOrThrow(profiles: ApiProfile[], profileId: string): ApiProfile {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) {
    const available = runnableBrowserProfiles(profiles, DONUT_SUPPORTED_BROWSER_TYPES).map((p) => `  ${p.id} - ${p.name} | ${profileBrowserLabel(p)}`).join('\n');
    throw new AppError(`Profile not found: ${profileId}\nAvailable Camoufox/Weyfern profiles:\n${available || '  (none)'}`);
  }
  if (!DONUT_SUPPORTED_BROWSER_TYPES.has(profile.browser.toLowerCase())) throw new AppError(`Profile is not Camoufox/Weyfern: ${profileId} (browser=${profile.browser})`);
  return profile;
}
