import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  accountClientId,
  accountLogout,
  accountWebConfig,
  createAuthorizationRequest,
  discoverAccount,
  normalizeReturnTo,
  type OidcMetadata,
  silentAccountSignIn,
} from "./account-auth";

const issuer = "https://algorithco.trqsh.uz/account";
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
      "https://algorithco.trqsh.uz/auth/callback",
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
      redirectUri: "https://algorithco.trqsh.uz/auth/callback",
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
      "https://algorithco.trqsh.uz/auth/callback",
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
      new URL("https://algorithco.trqsh.uz/account/.well-known/openid-configuration"),
      expect.any(Object),
    );
  });

  describe("signing in without leaving the page", () => {
    /** A fetch whose trip through the Account service ends at `landedAt`. */
    function accountAnswering(landedAt: string) {
      return vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/.well-known/openid-configuration")) {
          return new Response(JSON.stringify(metadata));
        }
        if (url.startsWith(`${issuer}/auth?`)) {
          const response = new Response("<!doctype html>");
          Object.defineProperty(response, "url", { value: landedAt });
          return response;
        }
        return new Response(null, { status: 500 });
      });
    }
    const tokenRequests = (fetcher: ReturnType<typeof accountAnswering>) =>
      fetcher.mock.calls.filter(([input]) => String(input).endsWith("/token"));

    it("follows the flow in the background, with the browser's session", async () => {
      vi.stubGlobal("window", { location: { origin: "https://algorithco.trqsh.uz" } });
      const fetcher = accountAnswering(
        "https://algorithco.trqsh.uz/signin?reauth=1&continue=x",
      );

      // No Account session: the trip ends at the sign-in page, not at a code.
      await expect(
        silentAccountSignIn(fetcher as unknown as typeof fetch),
      ).resolves.toBeNull();
      const authorize = fetcher.mock.calls.find(([input]) =>
        String(input).startsWith(`${issuer}/auth?`),
      );
      expect(authorize?.[1]).toMatchObject({
        credentials: "include",
        redirect: "follow",
      });
      const asked = new URL(String(authorize?.[0]));
      expect(asked.searchParams.get("code_challenge_method")).toBe("S256");
      expect(asked.searchParams.get("state")).toBeTruthy();
      expect(asked.searchParams.get("nonce")).toBeTruthy();
      expect(tokenRequests(fetcher)).toHaveLength(0);
    });

    it("redeems nothing from a callback that is not its own", async () => {
      vi.stubGlobal("window", { location: { origin: "https://algorithco.trqsh.uz" } });
      // A code, but under a state this request never made.
      const forged = accountAnswering(
        "https://algorithco.trqsh.uz/auth/callback?code=stolen&state=someone-elses",
      );
      await expect(
        silentAccountSignIn(forged as unknown as typeof fetch),
      ).resolves.toBeNull();
      expect(tokenRequests(forged)).toHaveLength(0);

      // A page that is not the registered callback, however it is dressed.
      const elsewhere = accountAnswering(
        "https://algorithco.trqsh.uz/auth/other?code=x&state=y",
      );
      await expect(
        silentAccountSignIn(elsewhere as unknown as typeof fetch),
      ).resolves.toBeNull();
      expect(tokenRequests(elsewhere)).toHaveLength(0);
    });

    it("does not try when the Account service is on another origin", async () => {
      vi.stubGlobal("window", {
        location: { origin: "http://localhost:3000" },
      });
      const fetcher = accountAnswering("https://algorithco.trqsh.uz/auth/callback?code=x");
      await expect(
        silentAccountSignIn(fetcher as unknown as typeof fetch),
      ).resolves.toBeNull();
      expect(fetcher).not.toHaveBeenCalled();
    });
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
    expect(navigate).toHaveBeenCalledWith("https://algorithco.trqsh.uz/signin");
    expect(navigate).not.toHaveBeenCalledWith(
      metadataWithLogout.end_session_endpoint,
    );
  });
});
