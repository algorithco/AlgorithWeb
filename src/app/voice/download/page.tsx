import type { Metadata } from "next";
import Link from "next/link";
import { VoiceDownloadRelease } from "@/components/voice/download-release";
import {
  fetchLatestVoiceRelease,
  VOICE_RELEASES_URL,
} from "@/lib/voice-release";

export const metadata: Metadata = {
  title: "Download AlgorithVoice",
  description:
    "Download AlgorithVoice for Windows and Linux. Push-to-talk dictation that runs on your device.",
  alternates: { canonical: "/voice/download" },
};

export default async function VoiceDownloadPage() {
  // The release at build time; the page replaces it with the current one.
  const builtRelease = await fetchLatestVoiceRelease();

  return (
    <VoiceDownloadRelease builtRelease={builtRelease}>
      <div className="voice-download__next">
        <p className="eyebrow">After installing</p>
        <ol>
          <li>
            <span>
              Sign in with your Algorithco account. The app opens your browser
              for it, and a Free account is enough.
            </span>
          </li>
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
              Cloud transcription is optional and part of the Pro plan. Local
              dictation is free on every plan, with no limit.
            </span>
          </li>
        </ol>
        <Link className="text-link" href="/changelog/voice">
          What changed in each version <span aria-hidden="true">→</span>
        </Link>
        <a className="text-link" href={VOICE_RELEASES_URL}>
          Release notes and older versions <span aria-hidden="true">→</span>
        </a>
      </div>
    </VoiceDownloadRelease>
  );
}
