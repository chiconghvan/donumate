export type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
  size: number;
};

export type GitHubRelease = {
  tag_name: string;
  html_url: string;
  assets: GitHubReleaseAsset[];
};

export type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  releaseUrl: string;
  assetName: string;
  downloadUrl: string;
  size: number;
};

export type InstallUpdateResult = {
  started: boolean;
  message?: string;
};
