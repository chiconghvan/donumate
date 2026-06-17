import type { GitHubRelease, UpdateInfo } from './types.js';
import { isNewerVersion, normalizeVersion } from './version.js';

const UPDATE_REPO_OWNER = 'chiconghvan';
const UPDATE_REPO_NAME = 'donut-camoufox-bidi-cli';
const UPDATE_ASSET_PATTERN = /^donumate.*win.*x64.*\.exe$/i;
const LATEST_RELEASE_URL = `https://api.github.com/repos/${UPDATE_REPO_OWNER}/${UPDATE_REPO_NAME}/releases/latest`;

function isGitHubRelease(value: unknown): value is GitHubRelease {
  if (!value || typeof value !== 'object') return false;
  const release = value as Partial<GitHubRelease>;
  return typeof release.tag_name === 'string' && typeof release.html_url === 'string' && Array.isArray(release.assets);
}

export async function checkForUpdate(currentVersion: string): Promise<UpdateInfo | undefined> {
  let response: Response;
  try {
    response = await fetch(LATEST_RELEASE_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'donumate-update-check',
      },
    });
  } catch {
    return undefined;
  }

  if (!response.ok) return undefined;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return undefined;
  }

  if (!isGitHubRelease(payload)) return undefined;

  const latestVersion = normalizeVersion(payload.tag_name);
  if (!latestVersion || !isNewerVersion(latestVersion, currentVersion)) return undefined;

  const asset = payload.assets.find((candidate) => UPDATE_ASSET_PATTERN.test(candidate.name));
  if (!asset) return undefined;

  return {
    currentVersion,
    latestVersion,
    releaseUrl: payload.html_url,
    assetName: asset.name,
    downloadUrl: asset.browser_download_url,
    size: asset.size,
  };
}
