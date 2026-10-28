import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  describeUserAgent,
  getAccountOverview,
  revokeApp,
  revokeSession,
  startMfaEnrollment,
  unlinkIdentity,
} from "./account-center";
import { safeContinueUrl } from "./account-forms";

function respond(status: number, body: unknown) {
  return vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ csrf: "csrf" }), { status: 200 }),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

describe("account center client", () => {
  beforeEach(() => {
    vi.stubEnv(
      "NEXT_PUBLIC_ACCOUNT_ISSUER",
      "https://algorithco.trqsh.uz/account",
    );
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_CLIENT_ID", "algorithco-platform-web");
    vi.stubEnv(
      "NEXT_PUBLIC_ACCOUNT_REDIRECT_URI",
      "https://algorithco.trqsh.uz/auth/callback",
    );
    vi.stubEnv(
      "NEXT_PUBLIC_ACCOUNT_BILLING_URL",
      "https://algorithco.trqsh.uz/account",
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("continues only to OIDC interactions on the configured issuer", () => {
    expect(
      safeContinueUrl("https://algorithco.trqsh.uz/account/interaction/abc123"),
    ).toBe("https://algorithco.trqsh.uz/account/interaction/abc123");
    for (const value of [
      "https://evil.example/account/interaction/abc",
      "https://algorithco.trqsh.uz/app",
      "https://algorithco.trqsh.uz/account/interaction/abc?x=1",
      "https://user:pw@trqsh.uz/account/interaction/abc",
      "/account/interaction/abc",
      "javascript:alert(1)",
    ]) {
      expect(safeContinueUrl(value)).toBeNull();
    }
  });

  it("loads the overview with the Account session cookie", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ profile: { email: "a@b.c" } }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await expect(getAccountOverview()).resolves.toMatchObject({
      profile: { email: "a@b.c" },
    });
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://algorithco.trqsh.uz/account/api/account/overview",
    );
    expect(fetcher.mock.calls[0][1]).toMatchObject({ credentials: "include" });
  });

  it("returns the authenticator setup and asks for a fresh sign-in when needed", async () => {
    vi.stubGlobal(
      "fetch",
      respond(200, {
        ok: true,
        uri: "otpauth://totp/x",
        key: "ABC",
        recoveryCodes: ["one", "two"],
      }),
    );
    await expect(startMfaEnrollment("pw")).resolves.toEqual({
      ok: true,
      uri: "otpauth://totp/x",
      key: "ABC",
      recoveryCodes: ["one", "two"],
    });
    vi.stubGlobal(
      "fetch",
      respond(401, { error: "recent_authentication_required" }),
    );
    await expect(startMfaEnrollment()).resolves.toMatchObject({
      ok: false,
      reauth: true,
    });
    vi.stubGlobal("fetch", respond(403, { error: "authenticator_required" }));
    await expect(unlinkIdentity("id")).resolves.toMatchObject({
      ok: false,
      reauth: true,
    });
  });

  it("reports when revoking the current session signs this browser out", async () => {
    vi.stubGlobal("fetch", respond(200, { ok: true, signedOut: true }));
    await expect(revokeSession("s1")).resolves.toEqual({
      ok: true,
      signedOut: true,
    });
  });

  it("signs a connected app out, and treats one already gone as signed out", async () => {
    const fetcher = respond(200, { ok: true });
    vi.stubGlobal("fetch", fetcher);
    await expect(revokeApp("grant/1")).resolves.toEqual({ ok: true });
    expect(String(fetcher.mock.calls[1]?.[0])).toContain(
      "/api/account/apps/grant%2F1/revoke",
    );
    vi.stubGlobal("fetch", respond(404, { error: "not_found" }));
    await expect(revokeApp("gone")).resolves.toEqual({ ok: true });
    vi.stubGlobal("fetch", respond(401, { error: "authentication_required" }));
    await expect(revokeApp("x")).resolves.toMatchObject({
      ok: false,
      reauth: true,
    });
  });

  it("names devices from their user agent", () => {
    expect(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36",
      ),
    ).toBe("Chrome on Windows");
    expect(describeUserAgent(null)).toBe("Unknown device");
  });
});
