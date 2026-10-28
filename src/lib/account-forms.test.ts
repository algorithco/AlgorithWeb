import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  accountSessionActive,
  completeSocialEmailCode,
  confirmAccountDeletion,
  confirmPasswordChange,
  requestAccountDeletionCode,
  requestPasswordChangeCode,
  signInWithPassword,
  signUpWithPassword,
  socialEmailChallenge,
  socialStartUrl,
  takeSocialReturnTo,
  validateEmailCode,
  validateMfaCode,
  validateSignIn,
} from "./account-forms";

describe("embedded company sign-in", () => {
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

  it("sends the second factor to the pending-MFA endpoint", async () => {
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
      "https://algorithco.trqsh.uz/account/api/auth/csrf",
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "https://algorithco.trqsh.uz/account/api/auth/mfa",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      }),
    );
    const body = fetcher.mock.calls[1][1].body as URLSearchParams;
    expect(body.get("email")).toBeNull();
    expect(body.get("password")).toBeNull();
    expect(body.get("code")).toBe("123456");
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
      location: { origin: "https://algorithco.trqsh.uz" },
    });

    const start = new URL(socialStartUrl("github", "/app/guard"));
    expect(start.pathname).toBe("/account/auth/social/github");
    expect(start.searchParams.get("return_to")).toBe(
      "https://algorithco.trqsh.uz/signin?social=complete",
    );
    expect(takeSocialReturnTo()).toBe("/app/guard");
    expect(takeSocialReturnTo()).toBeNull();
  });

  it("loads the email-code challenge and submits it before social completion", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            provider: "github",
            email: "user@example.com",
            isNewAccount: false,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-token" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "mfa_required" }), {
          status: 401,
        }),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(socialEmailChallenge()).resolves.toEqual({
      provider: "github",
      email: "user@example.com",
      isNewAccount: false,
    });
    await expect(completeSocialEmailCode("123456")).resolves.toMatchObject({
      ok: false,
      mfaRequired: true,
    });
    expect(fetcher).toHaveBeenNthCalledWith(
      3,
      "https://algorithco.trqsh.uz/account/api/auth/social/code",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    const body = fetcher.mock.calls[2][1].body as URLSearchParams;
    expect(body.get("code")).toBe("123456");
  });

  it("submits structured profile names with the signup password", async () => {
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
      signUpWithPassword({
        firstName: " Ada ",
        lastName: " Lovelace ",
        email: " ADA@example.com ",
        password: "long enough password",
      }),
    ).resolves.toEqual({ ok: true });
    const body = fetcher.mock.calls[1][1].body as URLSearchParams;
    expect(body.get("firstName")).toBe("Ada");
    expect(body.get("lastName")).toBe("Lovelace");
    expect(body.get("email")).toBe("ada@example.com");
    expect(body.get("password")).toBe("long enough password");
  });

  it("requests and confirms a purpose-specific account deletion code", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-1" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            email: "user@example.com",
            expiresAt: "2026-10-07T18:00:00.000Z",
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-2" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(requestAccountDeletionCode()).resolves.toEqual({
      ok: true,
      email: "user@example.com",
      expiresAt: "2026-10-07T18:00:00.000Z",
    });
    await expect(confirmAccountDeletion(" 123456 ")).resolves.toEqual({
      ok: true,
    });
    expect(fetcher.mock.calls[1][0]).toBe(
      "https://algorithco.trqsh.uz/account/api/account/deletion/code",
    );
    expect(fetcher.mock.calls[3][0]).toBe(
      "https://algorithco.trqsh.uz/account/api/account/deletion/confirm",
    );
    const body = fetcher.mock.calls[3][1].body as URLSearchParams;
    expect(body.get("code")).toBe("123456");
    expect(body.get("csrf")).toBe("csrf-2");
  });

  it("emails a password-change code to the signed-in user's address", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-1" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            email: "user@example.com",
            expiresAt: "2026-10-08T18:00:00.000Z",
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(requestPasswordChangeCode()).resolves.toEqual({
      ok: true,
      email: "user@example.com",
      expiresAt: "2026-10-08T18:00:00.000Z",
    });
    expect(fetcher.mock.calls[1][0]).toBe(
      "https://algorithco.trqsh.uz/account/api/account/password/code",
    );
    expect(fetcher.mock.calls[1][1]).toEqual(
      expect.objectContaining({ credentials: "include", method: "POST" }),
    );
    expect((fetcher.mock.calls[1][1].body as URLSearchParams).get("csrf")).toBe(
      "csrf-1",
    );
  });

  it("asks for a fresh sign-in when the session ended or MFA is not satisfied", async () => {
    const respond = (status: number, error?: string) =>
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ csrf: "csrf" }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(error ? { error } : {}), { status }),
        );

    vi.stubGlobal("fetch", respond(401, "authentication_required"));
    await expect(requestPasswordChangeCode()).resolves.toMatchObject({
      ok: false,
      signInRequired: true,
    });

    vi.stubGlobal("fetch", respond(403, "authenticator_required"));
    await expect(requestPasswordChangeCode()).resolves.toMatchObject({
      ok: false,
      signInRequired: true,
    });

    vi.stubGlobal("fetch", respond(429));
    await expect(requestPasswordChangeCode()).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("Too many attempts"),
    });
  });

  it("accepts the longer emailed code and explains spent attempt budgets", async () => {
    expect(validateEmailCode("123456")).toBeNull();
    expect(validateEmailCode("abcde-fgh23")).toBeNull();
    expect(validateEmailCode("ABCDE-FGH10")).not.toBeNull();
    const limited = (error: string) =>
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ csrf: "csrf" }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error }), { status: 429 }),
        );
    vi.stubGlobal("fetch", limited("mfa_locked"));
    await expect(
      signInWithPassword("ada@example.test", "", "123456"),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("recovery code"),
    });
    vi.stubGlobal("fetch", limited("too_many_attempts"));
    await expect(
      confirmPasswordChange("123456", "a strong new password"),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("Request a new code"),
    });
  });

  it("explains a password rejected as common or breached", async () => {
    const weak = () =>
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ csrf: "csrf" }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "weak_password" }), {
            status: 400,
          }),
        );
    vi.stubGlobal("fetch", weak());
    await expect(
      signUpWithPassword({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.test",
        password: "password1234",
      }),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("data breach"),
    });
    vi.stubGlobal("fetch", weak());
    await expect(
      confirmPasswordChange("123456", "password1234"),
    ).resolves.toMatchObject({
      ok: false,
      error: expect.stringContaining("data breach"),
    });
  });

  it("confirms a password change with the code and maps the failures", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf: "csrf-2" }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);

    await expect(
      confirmPasswordChange(" 123456 ", "a brand new password"),
    ).resolves.toEqual({ ok: true });
    expect(fetcher.mock.calls[1][0]).toBe(
      "https://algorithco.trqsh.uz/account/api/account/password/confirm",
    );
    const body = fetcher.mock.calls[1][1].body as URLSearchParams;
    expect(body.get("code")).toBe("123456");
    expect(body.get("password")).toBe("a brand new password");
    expect(body.get("csrf")).toBe("csrf-2");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ csrf: "csrf-3" }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: "invalid_code" }), {
            status: 400,
          }),
        ),
    );
    await expect(
      confirmPasswordChange("000000", "a brand new password"),
    ).resolves.toEqual({
      ok: false,
      error: "The code is invalid, expired, or already used.",
    });
  });

  it("reports whether the Account service already holds a browser session", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: true, aal: 1 }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ authenticated: false }), { status: 200 }),
      )
      .mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetcher);

    await expect(accountSessionActive()).resolves.toBe(true);
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://algorithco.trqsh.uz/account/api/auth/session",
    );
    await expect(accountSessionActive()).resolves.toBe(false);
    await expect(accountSessionActive()).resolves.toBe(false);
  });
});
