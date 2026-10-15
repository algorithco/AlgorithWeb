<!-- Copied from algorithvoice/CHANGELOG.md by `pnpm changelog:sync`. Edit the original, not this file. -->

# Changelog

What changed in AlgorithVoice, written for the people who use it. This file is
published at https://trqsh.uz/changelog. The rules for writing it are in
`AGENTS.md`, under "Changelog".

<!--
Format (read by algorithco-web/src/lib/changelog.ts):

  ## Unreleased                changes that have not shipped; never published
  ## 0.5.22 — 2026-10-20       a public release: its version, then its date
  ### Added | Changed | Fixed | Removed | Deprecated | Security
  - One line per change, in plain language, ending with a full stop.

Engineering detail (files, functions, measurements) belongs in
apps/desktop-tauri/CHANGELOG.md, not here.
-->

## Unreleased

### Security
- **Signing in takes a code.** The app shows six digits while it waits, and the page in your browser asks for them before it signs the app in. Only the app in front of you can be approved.

### Changed
- **The app starts with Windows.** A new installation turns this on; you can turn it off in Settings.
- Started with Windows, the app opens only the pill and keeps its window in the background. The window still opens if you need to sign in or finish setup.
- The sign-in page and your account's list of connected apps name the computer the app runs on.

## 0.5.24 — 2026-10-13

### Changed
- **Dictation starts sooner.** The pill answers the moment you press the key, and recording begins right after the start sound instead of after a pause.
- The microphone stays ready for 30 seconds after a dictation, so the next one starts at once. Nothing is recorded in that time, and your system's microphone indicator stays on until it closes.
- **Cloud transcription is part of the Pro plan.** A Free account dictates on its own computer, with no limit. With Cloud chosen on a plan without it, the pill says "Pro required" and does not record; choose Local and it works again.
- The pill tells you before it records when a dictation cannot be made: no cloud minutes left this month, no local model chosen, or no connection in Cloud mode. It used to record first and fail afterwards.
- A new installation starts in Local mode. Audio goes to the cloud only when you choose Cloud.
- When cloud transcription is unavailable, the app says so sooner: it no longer waits for a second model first.

### Fixed
- The Dictate page no longer stays on "Transcribing…" after a key press that was not recorded.
- A change of transcription mode always reaches the pill, and settings that cannot be read for a moment no longer put the pill back to its defaults.
- The dashboard no longer shows "BYOK" for a mode that older versions saved; it is Cloud.

## 0.5.23 — 2026-10-13

### Changed
- **Cloud mode runs on your Algorithco account.** It transcribes with Microsoft's MAI-Transcribe 2 and counts toward your plan's cloud minutes, with nothing to set up.
- Cloud mode works out the language you speak on its own.
- When cloud transcription cannot be used, the app says why: the month's cloud minutes are used up, the plan does not include it, or it is unavailable for a moment.

### Removed
- Cloud mode with your own Groq key. A key saved by an earlier version is deleted from your computer.

### Fixed
- In Settings, the model list fits the window at any size: status badges stay inside their card, and the Language filter is no longer squeezed into a column of letters.
- In a narrow window, the Settings menu becomes a row of tabs above the page instead of taking half of it.
- The model search says how many models there are, and a model for one language says "1 language".
- Cloud usage for compressed recordings, such as MP3, was counted lower than the real length of the recording.

## 0.5.22 — 2026-10-12

### Added
- **Sign in with your Algorithco account.** The app opens your browser to sign in, so your password is never typed into the app. A Free account is enough.
- **Choose your microphone.** Pick the microphone dictation records from in Settings, and test it before you speak. If it is unplugged, dictation uses the system default until it is back.
- **Custom words.** List names and terms spelled your way, and the Parakeet models prefer that spelling.
- **Three new on-device models:** Parakeet Unified EN for English, GigaAM v3 for Russian and FastConformer Uzbek for Uzbek.
- **A Usage page** with a calendar of your dictations, streaks and totals, for on-device and cloud transcription.
- **A Writing style setting.** Continuous lets one dictation carry on from the last; Full sentences keeps each one as it was transcribed.
- First-run setup in three steps: where transcription runs, your push-to-talk key, and a microphone check. It can be skipped and run again from Settings.

### Changed
- A new look in the Algorithco style, in light and dark, with the app's own title bar.
- Long dictations are transcribed in pieces: about twice as fast, without dropped sentences. The recording limit goes from 2 to 5 minutes.
- Short phrases are transcribed more accurately by the Parakeet and GigaAM models.
- Filler sounds such as "uh" and "um" are left out of the text.
- New, softer start and stop sounds.
- The floating pill is smaller and calmer.
- The push-to-talk key is recorded from your keyboard, and shortcuts that other apps rely on, such as `Ctrl+C`, are refused.
- Settings are grouped into Dictation, Models, Account and System.
- Text is pasted about a third of a second sooner.
- The Windows installer updates the app in place and keeps your settings, history and models.
- The Whisper models no longer list Uzbek, because they did not write Uzbek.

### Fixed
- Dictations made with the hotkey were not saved to History.
- The floating pill could open off-screen.
- The browser's microphone prompt no longer appears inside the pill, and a "Block" saved by an earlier version is undone.
- A recording at a sample rate other than 16 kHz was cut to its first 40 seconds.

### Removed
- Signing in with a password inside the app. The browser sign-in replaces it.
- The Pro-only gate. Free and Pro accounts both get the app.

## 0.5.21 — 2026-10-01

### Added
- Start and stop sounds mark the beginning and the end of a recording.
- A recording with no speech in it is reported as "No speech detected", and nothing is sent or pasted.
- Search in History: find a word or a phrase in what you dictated.

### Changed
- The app verifies your subscription when you sign in. If the check cannot be reached, it offers to retry instead of asking you to upgrade.
- Refined navigation and History page.

### Fixed
- On Windows, a signed-in account could appear signed out during the subscription check.

### Security
- The app's windows run with fewer privileges, and model downloads are checked more strictly.

## 0.5.20 — 2026-09-26

### Added
- A transcription language setting for on-device models.
- The floating pill shows Cancel and Stop buttons while it records.

### Changed
- You stay signed in: the session renews itself while you use the app.

### Fixed
- On-device transcription in languages other than English is reliable again.

## 0.5.17 — 2026-09-22

### Changed
- The app fits small windows: the sidebar becomes a drawer and the cards reflow.
- Hints and placeholders are easier to read.

### Fixed
- On-device transcription works again after the model runtime failed to start.
- A model no longer refuses to load on a computer with enough memory but little of it free.
- A failed model download shows the real error instead of "[object Object]".
- Deleting a model that is still downloading waits for the download to stop.
- A setting changed in one window reaches the other windows, and dictation no longer gets stuck.
- In local mode, a model that is already downloaded is selected automatically.

### Security
- Model files are downloaded from pinned versions and verified before they are used.

## 0.5.10 — 2026-09-21

### Fixed
- Deleting a model also unloads it from memory.
- Models that are already installed are reused instead of downloaded again.
- The floating pill picks up changed settings.

### Removed
- The demo sign-in.

## 0.5.9 — 2026-09-21

### Fixed
- Sign-in and cloud transcription reach the service at its new address.

## 0.5.8 — 2026-09-21

### Changed
- The Dictate panel shows what applies to the mode you chose, on-device or cloud.

### Fixed
- Signing in with GitHub works again.
- The floating pill follows a settings change right away, and its background is transparent again.

## 0.5.6 — 2026-09-21

### Added
- A usage meter for on-device transcription. It is kept on your computer and sends nothing.

### Changed
- First-run setup waits until the on-device model has finished downloading.

## 0.5.5 — 2026-09-20

### Added
- First-run setup recommends an on-device model for your hardware.
- The app updates itself when a new version ships.

### Fixed
- The Whisper models transcribe in the language you chose.
- The floating pill opens on the primary monitor.

### Removed
- The macOS build. A native macOS app is in development.

## 0.4.0 — 2026-09-17

### Added
- **Offline dictation with six on-device models:** Parakeet, Whisper Small, Whisper Large v3, Whisper Large v3 Turbo, Distil-Whisper and Qwen3-ASR. In local mode your audio never leaves your computer.
- A model manager in Settings: search, a hardware check, download progress and delete.

## 0.3.1 — 2026-09-16

### Added
- A dashboard, and a history of your dictations stored on your computer.

## 0.3.0 — 2026-09-16

### Added
- The floating push-to-talk pill: hold your hotkey in any app and speak.
- Sign in from the app.

## 0.2.6 — 2026-09-15

### Changed
- New app icons.

## 0.2.5 — 2026-09-15

### Added
- The first public release of the desktop app.
