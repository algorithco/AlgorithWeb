<!-- Copied from algorithco-account/CHANGELOG.md by `pnpm changelog:sync`. Edit the original, not this file. -->

# Changelog

What changed in Algorithco Account, written for the people who use it. This
file is published at https://trqsh.uz/changelog. The rules for writing it are
in `AGENTS.md`, under "Changelog".

<!--
Format (read by algorithco-web/src/lib/changelog.ts):

  ## Unreleased                changes that have not shipped; never published
  ## 2026-10-20 — Short title  a release: its day, then a title
  ### Added | Changed | Fixed | Removed | Deprecated | Security
  - One line per change, in plain language, ending with a full stop.

Account has no version numbers and ships continuously, so a release is a
day. Put a change under today's date, adding the heading at the top when it
is not there yet. Use `## Unreleased` only for work that will not go live
with the next deploy.
-->

## 2026-10-13 — AlgorithVoice cloud transcription moves to Pro

### Changed
- AlgorithVoice cloud transcription is part of the Pro plan, with 70 hours a month. Free accounts keep unlimited transcription on their own computer.

## 2026-10-12 — Approve before an app is connected

### Security
- Signing in from a desktop app or a command-line tool always stops on a "Sign in to this app?" page with Approve and Deny, so no other program on your computer can be signed in silently.

### Changed
- The "Sign in to this app?" page names the app and your account in a clear layout, with Approve and Deny side by side.

### Fixed
- Your email address is shown on that page; it could appear as "[email protected]".

## 2026-10-10 — Product names on account pages

### Changed
- Account pages use the product names AlgorithVoice and AlgorithGuard, and carry the site icon.

## 2026-10-09 — New-device sign-in alerts

### Added
- An email tells you when your account is signed in to from a new device.

### Security
- A new password is refused when it is too common or has appeared in a known data breach.

## 2026-10-08 — One sign-in flow

### Added
- Change your password from the dashboard.

### Changed
- Password, email-code and social sign-in share one flow, and two-step verification is asked for on every one of them.

### Security
- An account whose email was never verified can no longer sign in with a password.

## 2026-10-07 — Safer account linking

### Security
- Linking a Google or GitHub sign-in to an existing account asks for that account's password first.
- Resetting a password with an emailed code is harder to abuse.

## 2026-10-05 — Two-step verification and email codes

### Added
- Two-step verification with an authenticator app, with recovery codes for when you lose it.
- Sign in with a code sent to your email.

## 2026-10-04 — Algorithco Account

### Added
- One account for every Algorithco product, on trqsh.uz: sign up with an email and a password, or continue with Google or GitHub.
- Your plan and billing in one place.
