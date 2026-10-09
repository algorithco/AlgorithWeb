/**
 * The latest public Algorith Voice desktop release, read from GitHub at
 * build time (the site is a static export). Visitors' browsers never call
 * GitHub for this page; they only reach github.com when they click a
 * download link.
 */

export const VOICE_RELEASES_REPO = "algorithco/algorithvoice-app";
export const VOICE_RELEASES_URL = `https://github.com/${VOICE_RELEASES_REPO}/releases`;

export type VoiceInstaller = {
  platform: "windows" | "linux";
  kind: string;
  fileName: string;
  url: string;
  sizeBytes: number;
};

export type VoiceRelease = {
  version: string;
  publishedAt: string;
  pageUrl: string;
  installers: VoiceInstaller[];
};

type GithubAsset = {
  name?: unknown;
  size?: unknown;
  browser_download_url?: unknown;
};

// Installer files only; .sig sidecars and latest.json serve the updater.
const KINDS: Array<{
  test: RegExp;
  platform: VoiceInstaller["platform"];
  kind: string;
}> = [
  { test: /\.exe$/i, platform: "windows", kind: "Installer (.exe)" },
  { test: /\.msi$/i, platform: "windows", kind: "MSI package" },
  { test: /\.AppImage$/i, platform: "linux", kind: "AppImage" },
  { test: /\.deb$/i, platform: "linux", kind: "Debian package (.deb)" },
];

export function parseVoiceRelease(body: unknown): VoiceRelease | null {
  const release = body as {
    tag_name?: unknown;
    published_at?: unknown;
    html_url?: unknown;
    assets?: unknown;
  } | null;
  if (
    typeof release?.tag_name !== "string" ||
    typeof release.published_at !== "string" ||
    typeof release.html_url !== "string" ||
    !Array.isArray(release.assets)
  ) {
    return null;
  }
  const installers: VoiceInstaller[] = [];
  for (const asset of release.assets as GithubAsset[]) {
    if (
      typeof asset.name !== "string" ||
      typeof asset.size !== "number" ||
      typeof asset.browser_download_url !== "string" ||
      !asset.browser_download_url.startsWith(
        `https://github.com/${VOICE_RELEASES_REPO}/`,
      )
    ) {
      continue;
    }
    const kind = KINDS.find((item) => item.test.test(asset.name as string));
    if (!kind) continue;
    installers.push({
      platform: kind.platform,
      kind: kind.kind,
      fileName: asset.name,
      url: asset.browser_download_url,
      sizeBytes: asset.size,
    });
  }
  return {
    version: release.tag_name.replace(/^v/, ""),
    publishedAt: release.published_at,
    pageUrl: release.html_url,
    installers,
  };
}

/** Build-time fetch; null when GitHub is unreachable so the page still builds. */
export async function fetchLatestVoiceRelease(): Promise<VoiceRelease | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${VOICE_RELEASES_REPO}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) return null;
    return parseVoiceRelease(await response.json());
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number): string {
  const mb = bytes / 1_000_000;
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}
