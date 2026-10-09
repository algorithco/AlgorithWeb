import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import {
  fetchLatestVoiceRelease,
  formatBytes,
  VOICE_RELEASES_URL,
  type VoiceInstaller,
} from "@/lib/voice-release";

export const metadata: Metadata = {
  title: "Download Algorith Voice",
  description:
    "Download Algorith Voice for Windows and Linux. Push-to-talk dictation that runs on your device.",
  alternates: { canonical: "/voice/download" },
};

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

export default async function VoiceDownloadPage() {
  const release = await fetchLatestVoiceRelease();
  const published = release
    ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
        new Date(release.publishedAt),
      )
    : null;

  return (
    <>
      <PageHero
        eyebrow="Download"
        title="Get Algorith Voice."
        description={
          release
            ? `Version ${release.version}, released ${published}. Free to install; local dictation needs no account.`
            : "Free to install; local dictation needs no account."
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

        <div className="voice-download__next">
          <p className="eyebrow">After installing</p>
          <ol>
            <li>
              <span>
                Pick an on-device speech model. The app downloads it once and
                verifies it before use; the default model is about 670 MB.
              </span>
            </li>
            <li>
              <span>
                Hold <kbd>Ctrl</kbd> + <kbd>Space</kbd> in any app, speak, and
                release. The text appears where your cursor is.
              </span>
            </li>
            <li>
              <span>
                Cloud transcription is optional: add your own Groq API key in
                Settings and audio goes straight from your computer to Groq.
              </span>
            </li>
          </ol>
          <a className="text-link" href={VOICE_RELEASES_URL}>
            Release notes and older versions <span aria-hidden="true">→</span>
          </a>
        </div>
      </Section>
    </>
  );
}
