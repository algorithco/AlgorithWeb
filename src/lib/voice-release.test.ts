import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchCurrentVoiceRelease,
  formatBytes,
  formatReleaseDay,
  parseVoiceRelease,
} from "./voice-release";

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

describe("fetchCurrentVoiceRelease", () => {
  afterEach(() => vi.unstubAllGlobals());

  const respond = (status: number, body: unknown) =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(body), { status })),
    );

  it("asks the gateway, not GitHub, and returns the release", async () => {
    respond(200, {
      tag_name: "v0.5.23",
      published_at: "2026-10-13T06:02:00Z",
      html_url:
        "https://github.com/algorithco/algorithvoice-app/releases/tag/v0.5.23",
      assets: [],
    });
    const release = await fetchCurrentVoiceRelease();
    expect(release.version).toBe("0.5.23");
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/releases/voice");
  });

  it("throws when the lookup fails, so the built release stays", async () => {
    respond(502, {});
    await expect(fetchCurrentVoiceRelease()).rejects.toThrow("502");
    respond(200, { message: "API rate limit exceeded" });
    await expect(fetchCurrentVoiceRelease()).rejects.toThrow("no release");
  });
});

describe("formatReleaseDay", () => {
  it("names the UTC day in any time zone", () => {
    expect(formatReleaseDay("2026-10-13T06:02:00Z")).toBe("October 13, 2026");
    expect(formatReleaseDay("2026-10-12T23:30:00Z")).toBe("October 12, 2026");
    expect(formatReleaseDay("2026-10-13T00:10:00Z")).toBe("October 13, 2026");
  });
});

describe("formatBytes", () => {
  it("rounds to megabytes", () => {
    expect(formatBytes(99015160)).toBe("99 MB");
    expect(formatBytes(1_234_000)).toBe("1.2 MB");
  });
});
