import { describe, expect, it } from "vitest";
import { voiceDocs, voiceFaq, voiceModels } from "./voice-docs";

describe("voice docs content", () => {
  it("has URL-safe topics with a title, intro and sections", () => {
    for (const [slug, doc] of Object.entries(voiceDocs)) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(doc.title.trim()).not.toBe("");
      expect(doc.intro.trim()).not.toBe("");
      expect(doc.sections.length).toBeGreaterThan(0);
      const titles = doc.sections.map(([title]) => title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it("lists each on-device model once, with exactly one default", () => {
    const ids = voiceModels.map((model) => model.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(
      voiceModels.filter((model) => model.note === "Default"),
    ).toHaveLength(1);
  });

  it("has unique questions", () => {
    const questions = voiceFaq.map(([question]) => question);
    expect(new Set(questions).size).toBe(questions.length);
  });
});
