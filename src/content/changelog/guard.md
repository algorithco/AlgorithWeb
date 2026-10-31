<!-- Copied from algorith-guard/CHANGELOG.md by `pnpm changelog:sync`. Edit the original, not this file. -->

# Changelog

What changed in AlgorithGuard, written for the people who use it. This file is
published at https://algorithco.trqsh.uz/changelog. The rules for writing it are in
`AGENTS.md`, under "Changelog".

<!--
Format (read by algorith-web/src/lib/changelog.ts):

  ## Unreleased                changes that have not shipped; never published
  ## 0.1.5 — 2026-10-20        a public release: its version, then its date
  ### Added | Changed | Fixed | Removed | Deprecated | Security
  - One line per change, in plain language, ending with a full stop.

The version is the one of the `@algorithco/algocli` package. Contract changes
stay in proto/CHANGELOG.md, not here.
-->

## Unreleased

### Added
- `algo login` signs the CLI in with your Algorithco account, and `algo logout` signs it out.
- `algo tui` opens the terminal viewer; running `algo` on its own does the same.
- **The optional Jev judge now ships with AlgorithGuard and really judges commands no rule settles.** It stays off until you choose the redacted or full privacy mode and set your own TypeSafe key; in the default local-only mode nothing leaves your computer.
- `algo doctor` now says whether the optional Jev judge is on and whether its key is set.
- AlgorithGuard's background service now runs on Windows and checks each command, so with enforcement on a dangerous command such as `rm -rf /` is blocked instead of every command ending in a question.

### Changed
- **`algo` now signs in through the new Algorithco address, algorithco.trqsh.uz.** Earlier versions look for the old address, so update the CLI to keep signing in.
- **AlgorithGuard is now released under the GNU Affero General Public License**, with a commercial license for those who need one. Earlier releases stay under the GNU General Public License.
- AlgorithGuard uses your Algorithco account: one sign-in for the CLI and the console.

### Fixed
- `algo uninstall` no longer fails on a computer without a system keyring when you never signed in.
- A command containing certain Unicode characters could crash the parser.
- When the background service is not running, a command now waits up to a second for it to start instead of giving up and asking right away.
- On Windows, `algo doctor` reports whether the background service is running and whether the hook program is installed.
- **`algo init` now connects AlgorithGuard to Claude Code where Claude Code actually looks for hooks.** Before, it wrote to a file Claude Code ignores, so no command was ever checked. Running `algo init` again moves an entry left by an older version.
- `algo uninstall` now removes only AlgorithGuard's own entry from your Claude Code settings, so changes you or Claude Code made after `algo init` are kept.
- `algo init` now stops with a message instead of overwriting a Claude Code settings file it cannot read.

## 0.1.4 — 2026-09-29

The first public preview.

### Added
- The `algo` command line: `algo init` connects AlgorithGuard to Claude Code in a repository and keeps a backup, `algo doctor` checks the installation, and `algo uninstall` restores what was there before.
- Shadow mode by default: AlgorithGuard records what it would have decided without blocking anything. `algo enforce on` turns enforcement on.
- `algo why`, `algo status` and `algo log` show each decision with its reason, confidence, source and latency, read from a local audit log.
- `algo pause` and `algo resume` step AlgorithGuard out of the way and bring it back, even when its background service is not running.
- Early adapters for Codex CLI and OpenCode.
- A read-only terminal viewer.
