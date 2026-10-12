<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Changelog (required)

`CHANGELOG.md` in the root of this repository is the public changelog of the
website and the dashboard. It is published at https://trqsh.uz/changelog, so
writing it is part of the change, not a follow-up.

1. **Every change a visitor can notice gets one line**, in the same commit as
   the change: a new page or feature, changed behaviour, a fix, a removal, a
   security fix.
2. **The site has no version numbers and ships continuously, so a release is a
   day.** Put the line under today's heading, `## <YYYY-MM-DD> — <Short title>`,
   and add that heading at the top of the file when it is not there yet. If
   today's heading exists, add to it and widen its title if needed. Use
   `## Unreleased` only for work that will not go live with the next deploy.
3. **Write for the person using the site.** Say what changed for them in one
   plain sentence that ends with a full stop. No file paths, component names,
   pull request numbers or internal terms. A link to a page of this site is
   written `[text](/path)`.
4. **Never give a repository address.** No GitHub links, repository names or
   clone URLs: the page is public and the source is not. The site drops any
   line that has one.
5. **Leave out what a visitor cannot see**: refactors, tests, CI, dependency
   updates, internal documentation. For those, no line is the right answer.
6. Put the line under `### Added`, `### Changed`, `### Fixed`, `### Removed`,
   `### Deprecated` or `### Security`.
7. Do not rewrite a published section, except to correct a mistake.

The changelogs of the other products (AlgorithVoice, AlgorithGuard, Algorithco
Account) live in their own repositories and are copied into
`src/content/changelog/` by `pnpm changelog:sync`. Never edit those copies; if
the sync changes them, commit the result with your work. `pnpm test` fails on a
changelog the pages cannot read. The format and the pipeline are described in
`docs/changelog.md`.
