// Copies each product's CHANGELOG.md into src/content/changelog/, where the
// changelog pages read it (docs/changelog.md). The products live in sibling
// repositories; the site is built from this one alone (CI, the Docker image),
// so the copies are committed.
//
//   pnpm changelog:sync      copy what changed
//   pnpm changelog:check     exit 1 when a copy is behind its original
//
// A product whose repository is not next to this one is skipped and its
// committed copy is kept, so the script is safe to run anywhere.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "src", "content", "changelog");
const sources = JSON.parse(
  readFileSync(path.join(contentDir, "sources.json"), "utf8"),
);
const checkOnly = process.argv.includes("--check");

/** The first `##` heading that is a release, for the log line. */
function newestRelease(markdown) {
  const visible = markdown.replace(/<!--[\s\S]*?-->/g, "");
  for (const [, heading] of visible.matchAll(/^##\s+(.+)$/gm)) {
    if (!/^\[?unreleased\]?$/i.test(heading.trim())) return heading.trim();
  }
  return null;
}

let behind = 0;
for (const [slug, relative] of Object.entries(sources)) {
  const source = path.resolve(root, relative);
  const target = path.join(contentDir, `${slug}.md`);
  const name = path
    .relative(path.resolve(root, ".."), source)
    .replace(/\\/g, "/");

  if (!existsSync(source)) {
    console.log(`${slug}: ${name} is not here; kept the committed copy`);
    continue;
  }
  const original = readFileSync(source, "utf8").replace(/\r\n?/g, "\n");
  if (!/^##\s+\S/m.test(original)) {
    // An emptied or half-written file must not blank a published changelog.
    console.warn(`${slug}: ${name} has no sections; kept the committed copy`);
    continue;
  }
  const newest = newestRelease(original) ?? "nothing released yet";
  const copy = `<!-- Copied from ${name} by \`pnpm changelog:sync\`. Edit the original, not this file. -->\n\n${original}`;
  const current = existsSync(target) ? readFileSync(target, "utf8") : null;
  if (current === copy) {
    console.log(`${slug}: up to date (newest: ${newest})`);
  } else if (checkOnly) {
    behind += 1;
    console.error(`${slug}: behind ${name} (newest there: ${newest})`);
  } else {
    writeFileSync(target, copy);
    console.log(`${slug}: updated (newest: ${newest})`);
  }
}

if (behind > 0) {
  console.error("Run `pnpm changelog:sync` and commit the result.");
  process.exit(1);
}
