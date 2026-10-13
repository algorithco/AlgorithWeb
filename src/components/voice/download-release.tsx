"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import {
  fetchCurrentVoiceRelease,
  formatBytes,
  formatReleaseDay,
  VOICE_RELEASES_URL,
  type VoiceInstaller,
  type VoiceRelease,
} from "@/lib/voice-release";

const PLATFORMS: Array<{
  key: VoiceInstaller["platform"];
  name: string;
  note: string;
}> = [
  {
    key: "windows",
    name: "Windows",
    note: "64-bit installer. The app updates itself when a new version ships.",
  },
  {
    key: "linux",
    name: "Linux",
    note: "AppImage runs on most distributions; the .deb package suits Debian and Ubuntu.",
  },
];

/**
 * The version line and the installer links of the download page. They start
 * from the release the build knew (`builtRelease`) and move to the one the
 * gateway reports, so a new version needs no rebuild of the site. When the
 * lookup fails the built release stays.
 */
export function VoiceDownloadRelease({
  builtRelease,
  children,
}: {
  builtRelease: VoiceRelease | null;
  children: ReactNode;
}) {
  const { data: release = null } = useQuery({
    queryKey: ["voice", "release"],
    queryFn: fetchCurrentVoiceRelease,
    initialData: builtRelease ?? undefined,
    // As old as the build, not as this page view: look it up on every load.
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });

  return (
    <>
      <PageHero
        eyebrow="Download"
        title="Get AlgorithVoice."
        description={
          release
            ? `Version ${release.version}, released ${formatReleaseDay(release.publishedAt)}. Free to install; sign in with a free Algorithco account to start.`
            : "Free to install; sign in with a free Algorithco account to start."
        }
      />
      <Section className="voice-download">
        <div className="voice-download__grid" data-stagger>
          {PLATFORMS.map((platform) => {
            const files =
              release?.installers.filter(
                (item) => item.platform === platform.key,
              ) ?? [];
            return (
              <article className="voice-download__card" key={platform.key}>
                <p className="eyebrow">{platform.name}</p>
                <p className="voice-download__note">{platform.note}</p>
                {files.length ? (
                  <ul>
                    {files.map((file) => (
                      <li key={file.url}>
                        <a className="button button--primary" href={file.url}>
                          <span>{file.kind}</span>
                          <span aria-hidden="true" className="button__mark">
                            ↓
                          </span>
                        </a>
                        <small>
                          {file.fileName} · {formatBytes(file.sizeBytes)}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <a className="text-link" href={VOICE_RELEASES_URL}>
                    See all releases on GitHub <span aria-hidden="true">→</span>
                  </a>
                )}
              </article>
            );
          })}
          <article className="voice-download__card voice-download__card--muted">
            <p className="eyebrow">macOS</p>
            <p className="voice-download__note">
              A native macOS app is in development and has not been published
              yet.
            </p>
          </article>
        </div>
        {children}
      </Section>
    </>
  );
}
