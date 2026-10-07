import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  accountClientId,
  accountLogout,
  accountWebConfig,
  createAuthorizationRequest,
  discoverAccount,
  normalizeReturnTo,
  type OidcMetadata,
} from "./account-auth";

const issuer = "https://trqsh.uz/account";
const metadata: OidcMetadata = {
  issuer,
  authorization_endpoint: `${issuer}/auth`,
  token_endpoint: `${issuer}/token`,
  jwks_uri: `${issuer}/jwks`,
};

describe("platform Account client", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_CLIENT_ID", "algorithco-platform-web");
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_ISSUER", issuer);
    vi.stubEnv(
      "NEXT_PUBLIC_ACCOUNT_REDIRECT_URI",
      "https://trqsh.uz/auth/callback",
    );
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_BILLING_URL", issuer);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the unified platform callback", () => {
    expect(accountWebConfig()).toEqual({
      issuer,
      redirectUri: "https://trqsh.uz/auth/callback",
      billingUrl: issuer,
    });
  });

  it("defaults to the company platform client", () => {
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_CLIENT_ID", "algorithco-platform-web");
    expect(accountClientId()).toBe("algorithco-platform-web");
  });

  it("fails closed when the client id is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_CLIENT_ID", "");
    expect(() => accountClientId()).toThrow(
      "NEXT_PUBLIC_ACCOUNT_CLIENT_ID is required",
    );
  });

  it("creates a public PKCE authorization request", async () => {
    vi.stubEnv("NEXT_PUBLIC_ACCOUNT_CLIENT_ID", "algorithco-platform-web");
    const request = await createAuthorizationRequest(
      accountWebConfig(),
      metadata,
    );
    const url = new URL(request.url);
    expect(url.searchParams.get("client_id")).toBe("algorithco-platform-web");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://trqsh.uz/auth/callback",
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toContain("entitlements:read");
    expect(url.searchParams.get("scope")).toContain("billing:write");
    expect(url.searchParams.get("resource")).toBe(
      "urn:algorithco:platform-api",
    );
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(request.transaction.verifier.length).toBeGreaterThanOrEqual(43);
  });

  it("keeps a safe Guard return route in the OIDC transaction", async () => {
    const request = await createAuthorizationRequest(
      accountWebConfig(),
      metadata,
      Date.now(),
      "/app/guard/history?limit=20",
    );
    expect(request.transaction.returnTo).toBe("/app/guard/history?limit=20");
  });

  it("rejects external and non-app callback destinations", () => {
    expect(normalizeReturnTo("//evil.test/steal")).toBe("/app");
    expect(normalizeReturnTo("/contact")).toBe("/app");
    expect(normalizeReturnTo("https://evil.test/app/guard")).toBe("/app");
    expect(normalizeReturnTo("/app/account?tab=security")).toBe(
      "/app/account?tab=security",
    );
  });

  it("rejects discovery metadata from another issuer", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ ...metadata, issuer: "https://evil.test" }),
        ),
    ) as unknown as typeof fetch;
    await expect(discoverAccount(issuer, fetcher)).rejects.toThrow(
      "issuer mismatch",
    );
  });

  it("keeps the issuer path when loading discovery", async () => {
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify(metadata)),
    ) as unknown as typeof fetch;
    await discoverAccount(issuer, fetcher);
    expect(fetcher).toHaveBeenCalledWith(
      new URL("https://trqsh.uz/account/.well-known/openid-configuration"),
      expect.any(Object),
    );
  });

  it("finishes logout on the platform sign-in page", async () => {
    const metadataWithLogout = {
      ...metadata,
      end_session_endpoint: `${issuer}/session/end`,
    };
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/.well-known/openid-configuration")) {
        return new Response(JSON.stringify(metadataWithLogout));
      }
      if (url.endsWith("/api/auth/csrf")) {
        return new Response(JSON.stringify({ csrf: "logout-csrf" }));
      }
      if (url.endsWith("/api/auth/logout")) {
        return new Response(JSON.stringify({ ok: true }));
      }
      return new Response(null, { status: 404 });
    }) as unknown as typeof fetch;
    const navigate = vi.fn();
    vi.stubGlobal("sessionStorage", { removeItem: vi.fn() });

    await accountLogout(fetcher, navigate);

    expect(fetcher).toHaveBeenCalledWith(
      `${issuer}/api/auth/logout`,
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(navigate).toHaveBeenCalledWith("https://trqsh.uz/signin");
    expect(navigate).not.toHaveBeenCalledWith(
      metadataWithLogout.end_session_endpoint,
    );
  });
});
