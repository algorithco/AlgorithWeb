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

## 2026-10-28 — Open-source license named in the terms

### Changed
- The terms now name the GNU Affero General Public License as the license of our open-source software; earlier releases keep the GNU General Public License.

## 2026-10-16 — Removing a computer signs it out

### Fixed
- **Removing a computer on the [AlgorithVoice page](/app/voice) signs AlgorithVoice out on it.** It used to free the seat only, and the app kept working. Now the app is signed out within half a minute (version 0.5.26 and later) and its seat is freed.

### Changed
- Signing AlgorithVoice out under Connected apps in the [account center](/app/account) frees that computer's seat on the AlgorithVoice page as well.

## 2026-10-15 — One documentation, staying signed in, a Billing page and corrected facts

### Added
- **One documentation for every product, at [/docs](/docs).** AlgorithVoice, AlgorithGuard and your Algorithco account are covered in detail in one place, with a search, a list of sections on every page, and copy buttons on commands.
- Each product page lists its documentation pages.
- The account page lists the apps signed in with your account, such as AlgorithVoice on your computer, and lets you sign any of them out.

### Changed
- **You stay signed in on the site.** The dashboard no longer drops back to the sign-in page after a few minutes, after a reload or in a new tab: it follows your Algorithco session, which lasts until you sign out.
- The top bar says "Dashboard" as soon as a page opens in a browser that is signed in.
- Signing out in one tab signs your other tabs out as well.
- **Billing has its own page.** Your plans, subscriptions and the billing portal are at [Billing](/app/billing) in the dashboard, and the account page keeps only your profile, security, sign-in methods and devices.
- The account page, the documentation, the [privacy policy](/privacy) and the [terms](/terms) say that a deleted account is erased 24 hours later, no longer 30 days.
- The footer groups its links into Products, Resources, Company and Legal, and links to the documentation, the AlgorithVoice download and the benchmarks.
- The old documentation addresses under /voice/docs and /guard/docs take you to the same page in the new documentation.

### Fixed
- The home and [About](/about) pages give the right number of on-device speech models in AlgorithVoice: nine, not six.
- The site no longer lists macOS among the systems AlgorithVoice runs on today; the macOS app is still in development.
- The [privacy policy](/privacy) and [terms](/terms) no longer describe cloud transcription with your own Groq key, which the app no longer has, and the privacy policy gives today's session lifetimes: 90 days without use, two years at most.
- The AlgorithGuard page says that anyone can install the preview, and calls the tools it works with coding agents rather than platforms.

### Removed
- The separate documentation of each product, the Docs tab in the product bar and the documentation links in the dashboard sidebar.

## 2026-10-13 — Brand page, a simpler dashboard, and AlgorithVoice cloud on Pro

### Added
- **A brand page.** The Algorithco and AlgorithVoice logos to download, our colors with their values, and the rules for using them, at [/brand](/brand). The link is in the footer.

### Changed
- **A simpler dashboard.** Every page is in the sidebar once, billing has its own link there, and signing out is at the bottom of it. The account, product and documentation buttons that were repeated on every page are gone.
- The dashboard overview shows what you use: your plan, cloud time and devices for AlgorithVoice, and your plan, workspaces and decisions for AlgorithGuard.
- The AlgorithGuard overview lists your latest decisions, and the account page has links that jump to each of its sections.
- The dashboard is easier to use on a phone, and its dates are written in English whatever the language of your browser.
- The AlgorithVoice pages and dashboard say that cloud transcription is part of the Pro plan and that local dictation is unlimited on every plan. The instructions for a Groq key, which the app no longer uses, are gone from the docs and the download page.

### Fixed
- The "Manage billing" button on the dashboard overview could not open billing. Billing is now managed from the account page, where it works.
- The [AlgorithVoice download page](/voice/download) offers a new version within minutes of its release. It used to keep the previous version until the site itself was next updated.

## 2026-10-12 — Changelog and benchmarks

### Added
- **A changelog.** Every release of every product on one page, at [/changelog](/changelog).
- **AlgorithVoice benchmarks.** Every on-device speech model measured on the same recordings, at [/voice/benchmarks](/voice/benchmarks).

### Changed
- The benchmarks show the three new models as in the app: they arrived with AlgorithVoice 0.5.22.
- The changelog link moved out of the top bar. It stays in the footer.

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
