import packageJson from '../../package.json' with { type: 'json' };

export const CURRENT_VERSION = packageJson.version;

export function normalizeVersion(version: string): string | undefined {
  const cleaned = version.trim().replace(/^v/i, '');
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(cleaned) ? cleaned : undefined;
}

function parseStableParts(version: string): [number, number, number] | undefined {
  const normalized = normalizeVersion(version);
  if (!normalized) return undefined;
  const core = normalized.split(/[+-]/, 1)[0];
  const parts = core.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) return undefined;
  return [parts[0], parts[1], parts[2]];
}

export function isNewerVersion(latestVersion: string, currentVersion: string): boolean {
  const latest = parseStableParts(latestVersion);
  const current = parseStableParts(currentVersion);
  if (!latest || !current) return false;

  for (let index = 0; index < latest.length; index += 1) {
    if (latest[index] > current[index]) return true;
    if (latest[index] < current[index]) return false;
  }
  return false;
}
