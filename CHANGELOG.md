# Changelog

What changed on the Algorithco website and in the dashboard, written for the
people who use them. This file is published at https://trqsh.uz/changelog. The
rules for writing it are in `AGENTS.md`, under "Changelog".

<!--
Format (read by src/lib/changelog.ts, described in docs/changelog.md):

  ## Unreleased                changes that have not shipped; never published
  ## 2026-10-20 — Short title  a release: its day, then a title
  ### Added | Changed | Fixed | Removed | Deprecated | Security
  - One line per change, in plain language, ending with a full stop.

The site has no version numbers and ships continuously, so a release is a
day. Put a change under today's date, adding the heading at the top when it
is not there yet. Use `## Unreleased` only for work that will not go live
with the next deploy.
-->

## 2026-10-12 — Changelog and benchmarks

### Added
- **A changelog.** Every release of every product on one page, at [/changelog](/changelog).
- **AlgorithVoice benchmarks.** Every on-device speech model measured on the same recordings, at [/voice/benchmarks](/voice/benchmarks).

### Changed
- The benchmarks show the three new models as in the app: they arrived with AlgorithVoice 0.5.22.

### Fixed
- On a phone, the bar of a product section no longer cuts off the name of the page you are on.
- Approving a desktop app's sign-in now returns you to the app. Before, the page could stay where it was, and pressing Approve again showed an error.

## 2026-10-10 — AlgorithVoice documentation

### Added
- Documentation for AlgorithVoice, at [/voice/docs](/voice/docs).
- Set up two-step verification with an authenticator app from the dashboard.

### Changed
- The products are named AlgorithVoice and AlgorithGuard everywhere, with new logos and icons.

## 2026-10-09 — Product sections and legal pages

### Added
- AlgorithVoice and AlgorithGuard each have their own section of the site, with their own navigation.
- A download page for AlgorithVoice that always offers the newest release, at [/voice/download](/voice/download).
- An AlgorithVoice page in the dashboard, with your plan and cloud usage.
- An account center in the dashboard: your profile, security settings and account deletion.
- The [privacy policy](/privacy) and the [terms](/terms).

### Changed
- A new footer, and a menu for small screens.

## 2026-10-08 — Stay signed in

### Added
- Change your password from the dashboard: a code is emailed to you, and your other devices are signed out.

### Changed
- You stay signed in between visits while your account session lasts.
- Pages and sections move in as you navigate and scroll. The motion is switched off when your system asks for reduced motion.

### Fixed
- Signing in with Google or GitHub could end in "transaction is missing or expired".

## 2026-10-05 — One dashboard

### Added
- Sign in with your Algorithco account.
- One dashboard for your account, your plans and your products, at [/app](/app).
- The AlgorithGuard console and its documentation moved into this site.

## 2026-10-02 — A new website

### Added
- The Algorithco website: the company, its products and how to reach us.
