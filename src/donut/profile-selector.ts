import { select } from '@inquirer/prompts';
import { AppError } from '../utils/errors.js';
import type { ApiProfile } from './api-types.js';

export function camoufoxProfiles(profiles: ApiProfile[]): ApiProfile[] {
  return profiles.filter((profile) => profile.browser === 'camoufox');
}

export async function selectCamoufoxProfile(profiles: ApiProfile[]): Promise<ApiProfile> {
  const choices = camoufoxProfiles(profiles);
  if (choices.length === 0) {
    throw new AppError('No Camoufox profiles found in Donut API response.');
  }

  const id = await select({
    message: 'Select Camoufox profile',
    choices: choices.map((profile) => ({
      name: `${profile.name} | ${profile.id} | ${profile.version} | running=${Boolean(profile.is_running)}`,
      value: profile.id,
    })),
  });

  const selected = choices.find((profile) => profile.id === id);
  if (!selected) throw new AppError(`Selected profile not found: ${id}`);
  return selected;
}

export function findProfileOrThrow(profiles: ApiProfile[], profileId: string): ApiProfile {
  const profile = profiles.find((item) => item.id === profileId);
  if (!profile) throw new AppError(`Profile not found: ${profileId}`);
  if (profile.browser !== 'camoufox') throw new AppError(`Profile is not Camoufox: ${profileId} browser=${profile.browser}`);
  return profile;
}
