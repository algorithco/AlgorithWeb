import { describe, expect, it } from "vitest";
import { formatBytes, parseVoiceRelease } from "./voice-release";

const base =
  "https://github.com/algorithco/algorithvoice-app/releases/download/v0.5.21";

describe("parseVoiceRelease", () => {
  it("keeps installers and drops updater files", () => {
    const release = parseVoiceRelease({
      tag_name: "v0.5.21",
      published_at: "2026-10-01T13:43:17Z",
      html_url:
        "https://github.com/algorithco/algorithvoice-app/releases/tag/v0.5.21",
      assets: [
        {
          name: "Algorith.Voice_0.5.21_x64-setup.exe",
          size: 10353078,
          browser_download_url: `${base}/Algorith.Voice_0.5.21_x64-setup.exe`,
        },
        {
          name: "Algorith.Voice_0.5.21_x64-setup.exe.sig",
          size: 428,
          browser_download_url: `${base}/x.sig`,
        },
        {
          name: "Algorith.Voice_0.5.21_amd64.AppImage",
          size: 99015160,
          browser_download_url: `${base}/Algorith.Voice_0.5.21_amd64.AppImage`,
        },
        {
          name: "Algorith.Voice_0.5.21_amd64.deb",
          size: 23138018,
          browser_download_url: `${base}/Algorith.Voice_0.5.21_amd64.deb`,
        },
        {
          name: "latest.json",
          size: 3371,
          browser_download_url: `${base}/latest.json`,
        },
      ],
    });
    expect(release?.version).toBe("0.5.21");
    expect(
      release?.installers.map((item) => [item.platform, item.kind]),
    ).toEqual([
      ["windows", "Installer (.exe)"],
      ["linux", "AppImage"],
      ["linux", "Debian package (.deb)"],
    ]);
  });

  it("ignores download links outside the release repository", () => {
    const release = parseVoiceRelease({
      tag_name: "v1",
      published_at: "2026-10-01T00:00:00Z",
      html_url: "https://github.com/x",
      assets: [
        {
          name: "evil.exe",
          size: 1,
          browser_download_url: "https://evil.example/evil.exe",
        },
      ],
    });
    expect(release?.installers).toEqual([]);
  });

  it("returns null for unexpected payloads", () => {
    expect(parseVoiceRelease({ message: "Not Found" })).toBeNull();
    expect(parseVoiceRelease(null)).toBeNull();
  });
});

describe("formatBytes", () => {
  it("rounds to megabytes", () => {
    expect(formatBytes(99015160)).toBe("99 MB");
    expect(formatBytes(1_234_000)).toBe("1.2 MB");
  });
});
