import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  signInWithPassword,
  socialStartUrl,
  takeSocialReturnTo,
  validateMfaCode,
  validateSignIn,
} from "./account-forms";

describe("embedded company sign-in", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_ISSUER", "https://trqsh.uz/account");
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_CLIENT_ID", "algorithco-platform-web");
    vi.stubEnv(
      "NEXT_PUBLIC_ACCOUNT_REDIRECT_URI",
      "https://trqsh.uz/auth/callback",
    );
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_BILLING_URL", "https://trqsh.uz/account");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the stable Account API and sends an optional MFA code", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(
      signInWithPassword(" USER@example.com ", "password", " 123456 "),
    ).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "https://trqsh.uz/account/api/auth/csrf",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "https://trqsh.uz/account/api/auth/signin",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
    const body = fetcher.mock.calls[1][1].body as URLSearchParams;
    expect(body.get("email")).toBe("user@example.com");
    expect(body.get("totp")).toBe("123456");
    expect(body.get("csrf")).toBe("csrf-token");
  });

  it("validates MFA input before submitting", () => {
    expect(validateMfaCode("12")).toContain("authenticator");
    expect(
      validateSignIn({ email: "user@example.com", password: "password" }),
    ).toBeNull();
  });

  it("turns the account MFA challenge into a second sign-in step", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "mfa_required" }), {
          status: 401,
        }),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(
      signInWithPassword("user@example.com", "password"),
    ).resolves.toMatchObject({ ok: false, mfaRequired: true });
    const body = fetcher.mock.calls[1][1].body as URLSearchParams;
    expect(body.has("totp")).toBe(false);
  });

  it("binds social completion to the browser transaction", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    });
    vi.stubGlobal("window", {
      location: { origin: "https://trqsh.uz" },
    });

    const start = new URL(socialStartUrl("github", "/app/guard"));
    expect(start.pathname).toBe("/account/auth/social/github");
    expect(start.searchParams.get("return_to")).toBe(
      "https://trqsh.uz/signin?social=complete",
    );
    expect(takeSocialReturnTo()).toBe("/app/guard");
    expect(takeSocialReturnTo()).toBeNull();
  });
});
