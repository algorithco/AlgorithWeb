import { describe, expect, it } from "vitest";
import { formatDay, parseChangelog, parseInline, plainText } from "./changelog";

const sample = `# Changelog

Text before the first section is ignored.

<!--
  ## 9.9.9 — 2030-01-01   an example inside a comment is not a release
-->

## Unreleased

### Added
- Work that has not shipped.

## 1.2.0 — 2026-10-01 — Faster dictation

The summary can run over
two lines.

A second paragraph.

### Added
- **Custom words.** Spelled your way,
  on a wrapped line.
- A second addition.

### Fixed
- A fix.

## [1.1.0] - 2026-09-20

### New
- Listed under an alias.

### Improved
- Another alias.
`;

describe("parseChangelog", () => {
  it("reads released sections and leaves Unreleased out", () => {
    const { releases, problems } = parseChangelog(sample);
    expect(problems).toEqual([]);
    expect(releases.map((release) => release.id)).toEqual(["1.2.0", "1.1.0"]);
  });

  it("reads the version, date, title, summary and groups of a release", () => {
    const [release] = parseChangelog(sample).releases;
    expect(release).toEqual({
      id: "1.2.0",
      version: "1.2.0",
      date: "2026-10-01",
      title: "Faster dictation",
      summary: ["The summary can run over two lines.", "A second paragraph."],
      groups: [
        {
          type: "added",
          items: [
            "**Custom words.** Spelled your way, on a wrapped line.",
            "A second addition.",
          ],
        },
        { type: "fixed", items: ["A fix."] },
      ],
    });
  });

  it("accepts Keep a Changelog headings and the usual aliases", () => {
    const release = parseChangelog(sample).releases[1];
    expect(release.version).toBe("1.1.0");
    expect(release.title).toBeNull();
    expect(release.groups.map((group) => group.type)).toEqual([
      "added",
      "changed",
    ]);
  });

  it("reads a dated release of a product without version numbers", () => {
    const { releases, problems } = parseChangelog(
      "## 2026-10-09 — New-device sign-in alerts\n\n### Security\n- An alert.\n",
    );
    expect(problems).toEqual([]);
    expect(releases[0]).toMatchObject({
      id: "2026-10-09",
      version: null,
      date: "2026-10-09",
      title: "New-device sign-in alerts",
    });
  });

  it("leaves no comment behind when one is wrapped around another", () => {
    const hidden = "## 9.9.9 — 2030-01-01\n\n### Added\n- Hidden.\n";
    const wrapped = `<!-<!-- inner -->-\n${hidden}-->\n\n${sample}`;
    const { releases } = parseChangelog(wrapped);
    expect(releases.map((release) => release.id)).toEqual(["1.2.0", "1.1.0"]);
  });

  it("reads Windows line endings", () => {
    const { releases } = parseChangelog(
      "## 1.0.0 — 2026-01-02\r\n\r\n### Added\r\n- One.\r\n",
    );
    expect(releases[0].groups[0].items).toEqual(["One."]);
  });

  it("does not publish a version that has no date", () => {
    const { releases, problems } = parseChangelog(
      "## 2.0.0\n\n### Added\n- Not out yet.\n",
    );
    expect(releases).toEqual([]);
    expect(problems).toEqual(['"## 2.0.0" has no release date']);
  });

  it("reports what it cannot read instead of throwing", () => {
    const { releases, problems } = parseChangelog(
      [
        "## Next week",
        "### Added",
        "- Skipped with its section.",
        "## 1.0.1 — 2026-02-30",
        "### Added",
        "- No such day.",
        "## 1.0.0 — 2026-01-02",
        "- Outside a group.",
        "### Polished",
        "- An unknown type.",
        "## 0.9.0 — 2026-01-01",
        "",
      ].join("\n"),
    );
    expect(releases.map((release) => release.id)).toEqual(["1.0.0"]);
    expect(releases[0].groups).toEqual([
      { type: "changed", items: ["Outside a group.", "An unknown type."] },
    ]);
    expect(problems).toEqual([
      '"## Next week" is neither a version nor a date',
      '"## 1.0.1 — 2026-02-30" has an invalid date "2026-02-30"',
      "1.0.0: a change is listed outside a ### group",
      '1.0.0: "### Polished" is not a change type',
      "0.9.0: the release lists no changes",
    ]);
  });

  it("never publishes a line that gives a repository address", () => {
    const { releases, problems } = parseChangelog(
      [
        "## 1.0.0 — 2026-01-01 — See github.com/acme/app",
        "",
        "Built from https://gitlab.com/acme/app.",
        "",
        "### Added",
        "- A change people can use.",
        "- Source: [the repository](https://github.com/acme/app).",
        "- Clone git@example.com:acme/app or https://example.com/acme/app.git.",
      ].join("\n"),
    );
    expect(releases[0]).toMatchObject({
      title: null,
      summary: [],
      groups: [{ type: "added", items: ["A change people can use."] }],
    });
    expect(problems).toEqual(
      new Array(4).fill("1.0.0: a line gives a repository address"),
    );
  });

  it("reports duplicates and sorts releases newest first", () => {
    const { releases, problems } = parseChangelog(
      [
        "## 1.0.0 — 2026-01-01",
        "### Added",
        "- First.",
        "## 1.1.0 — 2026-03-01",
        "### Added",
        "- Second.",
        "## 1.0.0 — 2026-01-01",
        "### Added",
        "- Again.",
      ].join("\n"),
    );
    expect(releases.map((release) => release.id)).toEqual([
      "1.1.0",
      "1.0.0",
      "1.0.0",
    ]);
    expect(problems).toEqual([
      "1.1.0: newer than 1.0.0, but listed below it",
      "1.0.0: listed twice",
    ]);
  });
});

describe("parseInline", () => {
  it("reads code, bold and links", () => {
    expect(
      parseInline("Run `algo login`, **then** read [the docs](/guard/docs)."),
    ).toEqual([
      { kind: "text", text: "Run " },
      { kind: "code", text: "algo login" },
      { kind: "text", text: ", " },
      { kind: "strong", children: [{ kind: "text", text: "then" }] },
      { kind: "text", text: " read " },
      {
        kind: "link",
        href: "/guard/docs",
        children: [{ kind: "text", text: "the docs" }],
      },
      { kind: "text", text: "." },
    ]);
  });

  it("reads code inside bold", () => {
    expect(parseInline("**Use `algo why`.**")).toEqual([
      {
        kind: "strong",
        children: [
          { kind: "text", text: "Use " },
          { kind: "code", text: "algo why" },
          { kind: "text", text: "." },
        ],
      },
    ]);
  });

  it("only links to this site or to https", () => {
    expect(parseInline("[x](https://example.com/a)")[0]).toMatchObject({
      kind: "link",
      href: "https://example.com/a",
    });
    for (const href of [
      "javascript:void0",
      "http://example.com",
      "//example.com",
      "data:text/html,x",
      "https://github.com/acme/app",
    ]) {
      expect(parseInline(`[label](${href})`)).toEqual([
        { kind: "text", text: "label" },
      ]);
    }
  });

  it("flattens a line to plain text", () => {
    expect(plainText("**Custom words.** Run `algo`, see [docs](/docs).")).toBe(
      "Custom words. Run algo, see docs.",
    );
  });
});

describe("formatDay", () => {
  it("writes the day out, the same in every time zone", () => {
    expect(formatDay("2026-10-01")).toBe("October 1, 2026");
    expect(formatDay("2026-12-31")).toBe("December 31, 2026");
  });
});
