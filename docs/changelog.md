# Changelog

`/changelog` lists every release of every product, newest first, and
`/changelog/<product>` lists one product. Nobody edits those pages: they are
built from the `CHANGELOG.md` of each product.

| Piece | Where |
|---|---|
| The products that have a changelog | `src/config/changelog.ts` |
| This site's own changelog | `CHANGELOG.md` |
| Copies of the other products' changelogs | `src/content/changelog/<product>.md` |
| Where each copy comes from | `src/content/changelog/sources.json` |
| The copy step | `scripts/sync-changelog.mjs` (`pnpm changelog:sync`) |
| The parser | `src/lib/changelog.ts` |
| The pages | `src/app/changelog/`, `src/components/changelog/` |

## From a change to the page

1. Whoever makes a change a user can notice adds one line to the `CHANGELOG.md`
   of the repository they are in, in the same commit. The rule is in every
   repository's `AGENTS.md`.
2. A product with version numbers collects its lines under `## Unreleased`.
   Releasing the version renames that heading to `## <version> — <date>`.
   A product that ships continuously writes straight under a dated heading.
3. `pnpm changelog:sync` copies each `CHANGELOG.md` from the sibling
   repositories into `src/content/changelog/`. The deploy script runs it before
   it builds the site, so a deploy always publishes the newest changelogs.
4. The build reads the files and shows every section that has a date.

The copies are committed because the site is also built where the other
repositories are not: in CI and from the Docker context. Do not edit a copy.
When the sync changes one, commit it with your work; `pnpm changelog:check`
fails when a copy is behind its original.

## The format

```markdown
# Changelog

## Unreleased

### Added
- Not out yet, so not published.

## 0.5.21 — 2026-10-01

An optional paragraph that sums the release up.

### Added
- **A bold lead.** Then the rest of the sentence.

### Fixed
- One line per change, ending with a full stop.
```

- `## Unreleased` is never published. Neither is a version without a date.
- A release heading is `## <version> — <YYYY-MM-DD>`, optionally followed by
  `— <title>`. A product without versions uses `## <YYYY-MM-DD> — <title>`.
  The dash may be `—`, `–` or a spaced `-`, and `## [1.2.0] - 2026-10-01` is
  read too.
- The groups are `### Added`, `### Changed`, `### Fixed`, `### Removed`,
  `### Deprecated` and `### Security`.
- A line may use `` `code` ``, `**bold**` and `[links](/to-a-page)`. Links go to
  this site or to an `https://` address.
- HTML comments are ignored, which is where each file keeps its own notes.
- A line that gives a repository address (a code host, a clone URL) is never
  published: the pages are public and the source is not.

The parser does not stop the build on a file it cannot read in full. It skips
what it does not understand and reports it, and `pnpm test` fails on any such
report for the files in this repository. Check a changelog before a release
with `pnpm changelog:sync && pnpm test`.

## Add a product

1. Give the product's repository a `CHANGELOG.md` in this format, and the
   changelog rule in its `AGENTS.md`.
2. Add the path of that file to `src/content/changelog/sources.json`.
3. Add the product to `changelogStreams` in `src/config/changelog.ts`.
4. Run `pnpm changelog:sync`.

The filter, the pages, the sitemap and the tests read the list from there.
