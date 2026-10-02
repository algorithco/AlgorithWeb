import { describe, expect, it } from "vitest";
import { absoluteUrl } from "./site";

describe("absoluteUrl", () => {
  it("resolves site paths against the configured origin", () => {
    expect(absoluteUrl("/products")).toMatch(/^https:\/\/[^/]+\/products$/);
  });
});
