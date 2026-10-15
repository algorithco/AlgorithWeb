"use client";

export const PLATFORM_SESSION_EVENT = "algorithco-platform-session-change";
const ACCESS_TOKEN_KEY = "algorithco-platform-access-token";
const ORG_KEY = "algorithco-guard-org";
export const SIGNED_IN_HINT_KEY = "algorithco-signed-in";

let accessToken = "";

function announce(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PLATFORM_SESSION_EVENT));
  }
}

export function loadAccessToken(): string {
  if (accessToken) return accessToken;
  if (typeof window === "undefined") return "";
  try {
    const stored = window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? "";
    const profile = profileFromAccessToken(stored);
    if (
      !profile ||
      profile.expiresAt === null ||
      profile.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      return "";
    }
    accessToken = stored;
  } catch {
    // Storage is optional. The in-memory session still works when unavailable.
  }
  return accessToken;
}

export function saveAccessToken(token: string): void {
  accessToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      else window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // Storage is optional. Keep the short-lived token in memory instead.
    }
  }
  if (token) setSignedInHint(true);
  announce();
}

/**
 * Remembers, across tabs and restarts, that this browser was signed in. It
 * holds no credential: it only tells a page that it is worth asking the
 * Account service for the session, and lets the header say "Dashboard" at
 * once. The token above stays per tab and short-lived.
 */
export function hasSignedInHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIGNED_IN_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Clearing it reaches the other tabs as a storage event: they sign out too. */
export function setSignedInHint(signedIn: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (signedIn) window.localStorage.setItem(SIGNED_IN_HINT_KEY, "1");
    else window.localStorage.removeItem(SIGNED_IN_HINT_KEY);
  } catch {
    // Storage is optional; the page then asks the Account service each time.
  }
}

export function loadGuardOrgId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ORG_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveGuardOrgId(orgId: string): void {
  if (typeof window !== "undefined") {
    try {
      if (orgId) window.localStorage.setItem(ORG_KEY, orgId);
      else window.localStorage.removeItem(ORG_KEY);
    } catch {
      // Storage is optional; the active view still updates through the event.
    }
  }
  announce();
}

export type PlatformProfile = {
  subject: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  expiresAt: number | null;
};

/**
 * Decode display claims from an access token WITHOUT verifying its
 * signature. The result is UNTRUSTED: suitable for UI display (name/email)
 * and expiry checks only. Never use it for authorization decisions — the
 * backend must verify the signature, iss/aud/exp on every API call.
 * Callers must treat a null return (missing sub) as signed-out.
 */
export function profileFromAccessToken(token: string): PlatformProfile | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as Record<string, unknown>;
    if (typeof claims.sub !== "string" || !claims.sub) return null;
    return {
      subject: claims.sub,
      name: typeof claims.name === "string" ? claims.name : null,
      firstName:
        typeof claims.given_name === "string" ? claims.given_name : null,
      lastName:
        typeof claims.family_name === "string" ? claims.family_name : null,
      email: typeof claims.email === "string" ? claims.email : null,
      expiresAt: typeof claims.exp === "number" ? claims.exp : null,
    };
  } catch {
    return null;
  }
}
