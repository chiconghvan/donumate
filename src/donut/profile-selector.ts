import { select, isCancel } from '@clack/prompts';
import { AppError, CliBackError } from '../utils/errors.js';
import { globalAbort } from '../utils/abort.js';
import type { ApiProfile } from './api-types.js';

export function camoufoxProfiles(profiles: ApiProfile[]): ApiProfile[] {
  return profiles.filter((profile) => profile.browser === 'camoufox');
}

export async function selectCamoufoxProfile(profiles: ApiProfile[], defaultProfileId?: string): Promise<ApiProfile> {
  if (process.stdin.isTTY) {
    process.stdin.resume();
  }
  const choices = camoufoxProfiles(profiles);
  if (choices.length === 0) {
    throw new AppError('No Camoufox profiles found. Create one in Donut Browser or check API at http://127.0.0.1:10108');
  }

  const selectChoices = [
    { label: 'Back', value: '__back__' },
    ...choices.map((profile) => ({
      label: `${profile.is_running ? '[Running]' : '[Stopped]'} ${profile.name} (${profile.version ?? '?'})`,
      value: profile.id,
    })),
  ];

  const selectedVal = await select({
    message: `Select Camoufox profile (${choices.length} found)`,
    options: selectChoices,
    initialValue: defaultProfileId ?? '__back__',
  });

  if (isCancel(selectedVal) || selectedVal === '__back__') {
    throw globalAbort.signal.aborted ? new AppError('Aborted') : new CliBackError();
  }

  const selected = choices.find((profile) => profile.id === selectedVal);
  if (!selected) throw new AppError(`Selected profile not found: ${selectedVal}`);
  return selected;
}

export function findProfileOrThrow(profiles: ApiProfile[], profileId: string): ApiProfile {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) {
    const available = profiles.filter((p) => p.browser === 'camoufox').map((p) => `  ${p.id} — ${p.name}`).join('\n');
    throw new AppError(`Profile not found: ${profileId}\nAvailable Camoufox profiles:\n${available || '  (none)'}`);
  }
  if (profile.browser !== 'camoufox') throw new AppError(`Profile is not Camoufox: ${profileId} (browser=${profile.browser})`);
  return profile;
}
