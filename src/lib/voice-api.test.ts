import { describe, expect, it } from "vitest";
import { formatSeconds, formatUtcDay, tokenHasScope } from "./voice-api";

const token = (claims: object) =>
  `h.${btoa(JSON.stringify(claims)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}.s`;

describe("voice api helpers", () => {
  it("formats cloud time in the largest sensible unit", () => {
    expect(formatSeconds(0)).toBe("0 s");
    expect(formatSeconds(59.4)).toBe("59 s");
    expect(formatSeconds(60)).toBe("1 min");
    expect(formatSeconds(3600)).toBe("1 h");
    expect(formatSeconds(3900)).toBe("1 h 5 min");
    expect(formatSeconds(-5)).toBe("0 s");
  });

  it("keeps a backend UTC day on that day in any time zone", () => {
    expect(formatUtcDay("2026-10-01", { day: "numeric" })).toBe("1");
    expect(formatUtcDay("2026-09-30", { day: "numeric" })).toBe("30");
  });

  it("reads scopes from an access token without trusting its shape", () => {
    const withScope = token({ scope: "profile voice:access" });
    expect(tokenHasScope(withScope, "voice:access")).toBe(true);
    expect(tokenHasScope(withScope, "guard:access")).toBe(false);
    expect(tokenHasScope(token({ scope: 42 }), "voice:access")).toBe(false);
    expect(tokenHasScope("not-a-token", "voice:access")).toBe(false);
  });
});
