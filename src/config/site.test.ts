import { describe, expect, it } from "vitest";
import { absoluteUrl, siteConfig } from "./site";

describe("absoluteUrl", () => {
  it("resolves site paths against the configured origin", () => {
    expect(absoluteUrl("/products")).toMatch(/^https:\/\/[^/]+\/products$/);
  });
});

describe("siteConfig", () => {
  it("links sign-in to the account service sign-in route", () => {
    expect(new URL(siteConfig.authUrl).pathname).toBe("/signin");
  });
});
