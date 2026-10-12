import { describe, expect, it } from "vitest";
import {
  benchmarkLanguages,
  formatDownload,
  formatMemory,
  formatSpeed,
  formatWer,
  pickOf,
} from "./voice-benchmarks";

describe("voice benchmarks", () => {
  it("covers each language once", () => {
    const codes = benchmarkLanguages.map((language) => language.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("lists every model of a language once, most accurate first", () => {
    for (const language of benchmarkLanguages) {
      const ids = language.models.map((model) => model.id);
      expect(new Set(ids).size).toBe(ids.length);
      const errors = language.models.map((model) => model.wer);
      expect(errors).toEqual([...errors].sort((a, b) => a - b));
    }
  });

  it("has exactly one pick per language", () => {
    for (const language of benchmarkLanguages) {
      expect(language.models.filter((model) => "pick" in model)).toHaveLength(
        1,
      );
      expect(pickOf(language).name).not.toBe("");
    }
  });

  it("only holds figures that can have been measured", () => {
    for (const language of benchmarkLanguages) {
      for (const model of language.models) {
        expect(model.wer).toBeGreaterThan(0);
        expect(model.speed).toBeGreaterThan(0);
        expect(model.memoryGb).toBeGreaterThan(0);
        expect(model.downloadMb).toBeGreaterThan(0);
      }
    }
  });

  it("gives one model the same download size in every language", () => {
    const sizes = new Map<string, number>();
    for (const language of benchmarkLanguages) {
      for (const model of language.models) {
        expect(sizes.get(model.id) ?? model.downloadMb).toBe(model.downloadMb);
        sizes.set(model.id, model.downloadMb);
      }
    }
  });

  it("formats the figures the way the page shows them", () => {
    expect(formatWer(5.3)).toBe("5.3%");
    expect(formatWer(100.8)).toBe("100.8%");
    expect(formatSpeed(9.5)).toBe("9.5×");
    expect(formatSpeed(0.2)).toBe("0.2×");
    expect(formatSpeed(37)).toBe("37×");
    expect(formatDownload(663)).toBe("663 MB");
    expect(formatDownload(1780)).toBe("1.8 GB");
    expect(formatMemory(0.5)).toBe("0.5 GB");
  });
});
