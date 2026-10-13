"use client";

import {
  issuerBase,
  postServiceForm,
  type SocialProvider,
} from "./account-forms";

/**
 * Account center client. Same-origin calls to the Account service's
 * `/api/account/*` endpoints, authenticated by its session cookie and the
 * double-submit CSRF token (see algorithco-account/apps/api/src/http/routes.ts).
 */

export interface AccountOverview {
  profile: { email: string; name: string; firstName: string; lastName: string };
  security: {
    hasPassword: boolean;
    mfaEnabled: boolean;
    aal: number;
    recentlyAuthenticated: boolean;
  };
  identities: Array<{
    id: string;
    provider: string;
    email: string | null;
    linkedAt: string;
  }>;
  providers: SocialProvider[];
  sessions: Array<{
    id: string;
    userAgent: string | null;
    createdAt: string;
    lastSeenAt: string;
    current: boolean;
  }>;
  /** Native apps signed in with the account. Absent from an older service. */
  apps?: Array<{
    id: string;
    name: string;
    deviceName: string | null;
    connectedAt: string;
    lastUsedAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    product: string;
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    seats: number | null;
    org: { id: string; name: string } | null;
  }>;
  plans: Array<{
    product: string;
    productName: string;
    plan: string;
    planName: string;
    org: { id: string; name: string } | null;
  }>;
}

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string; reauth?: boolean };

/** Fresh sign-in on the website, then straight back to the account center. */
export const REAUTH_URL = "/signin?reauth=1&returnTo=/app/account";

export class AccountCenterError extends Error {
  constructor(readonly status: number) {
    super(
      status === 401
        ? "Your account session ended. Sign in again."
        : "Account settings are unavailable right now.",
    );
    this.name = "AccountCenterError";
  }
}

export async function getAccountOverview(): Promise<AccountOverview> {
  let response: Response;
  try {
    response = await fetch(`${issuerBase()}/api/account/overview`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new AccountCenterError(0);
  }
  if (!response.ok) throw new AccountCenterError(response.status);
  return (await response.json()) as AccountOverview;
}

function failure(status: number, error: string | undefined, fallback: string) {
  if (status === 401 || (status === 403 && error === "authenticator_required"))
    return {
      ok: false as const,
      reauth: true,
      error: "For your security, sign in again to make this change.",
    };
  if (status === 403)
    return { ok: false as const, error: "The form expired. Try again." };
  if (status === 429)
    return {
      ok: false as const,
      error: "Too many attempts. Wait a little and try again.",
    };
  return { ok: false as const, error: fallback };
}

async function post(
  path: string,
  fields: Record<string, string> = {},
): Promise<Awaited<ReturnType<typeof postServiceForm>> | null> {
  try {
    return await postServiceForm(path, fields);
  } catch {
    return null;
  }
}

const OFFLINE = {
  ok: false as const,
  error: "Could not reach the account service. Check your connection.",
};

export async function saveProfile(
  firstName: string,
  lastName: string,
): Promise<ActionResult> {
  const result = await post("api/account/profile", {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
  });
  if (!result) return OFFLINE;
  if (result.status === 200) return { ok: true };
  if (result.status === 400)
    return {
      ok: false,
      error: "Enter a first and last name (up to 100 characters each).",
    };
  return failure(
    result.status,
    result.error,
    "The profile could not be saved.",
  );
}

export async function startMfaEnrollment(
  currentPassword?: string,
): Promise<
  ActionResult<{ uri: string; key: string; recoveryCodes: string[] }>
> {
  const result = await post(
    "api/account/mfa/enroll",
    currentPassword ? { currentPassword } : {},
  );
  if (!result) return OFFLINE;
  const body = result.body ?? {};
  if (
    result.status === 200 &&
    typeof body.uri === "string" &&
    typeof body.key === "string" &&
    Array.isArray(body.recoveryCodes)
  )
    return {
      ok: true,
      uri: body.uri,
      key: body.key,
      recoveryCodes: body.recoveryCodes.filter(
        (code): code is string => typeof code === "string",
      ),
    };
  if (result.status === 401 && result.error === "invalid_password")
    return { ok: false, error: "The current password is incorrect." };
  if (result.status === 409)
    return { ok: false, error: "Two-step verification is already on." };
  return failure(result.status, result.error, "Setup could not be started.");
}

export async function confirmMfaEnrollment(
  code: string,
): Promise<ActionResult> {
  const result = await post("api/account/mfa/confirm", { code: code.trim() });
  if (!result) return OFFLINE;
  if (result.status === 200) return { ok: true };
  if (result.status === 400)
    return {
      ok: false,
      error:
        "That code did not match. Check the time on your device and try again.",
    };
  return failure(result.status, result.error, "Setup could not be completed.");
}

export async function disableMfa(
  code: string,
  currentPassword?: string,
): Promise<ActionResult> {
  const result = await post("api/account/mfa/disable", {
    code: code.trim(),
    ...(currentPassword ? { currentPassword } : {}),
  });
  if (!result) return OFFLINE;
  if (result.status === 200) return { ok: true };
  if (result.status === 401 && result.error === "invalid_credentials")
    return {
      ok: false,
      error: "The password or authenticator code is incorrect.",
    };
  if (result.status === 400)
    return { ok: false, error: "Enter an authenticator or recovery code." };
  return failure(
    result.status,
    result.error,
    "Two-step verification could not be turned off.",
  );
}

export async function unlinkIdentity(id: string): Promise<ActionResult> {
  const result = await post(
    `api/account/identities/${encodeURIComponent(id)}/unlink`,
  );
  if (!result) return OFFLINE;
  if (result.status === 200) return { ok: true };
  if (result.status === 400)
    return {
      ok: false,
      error:
        "Keep at least one way to sign in: add a password or another provider first.",
    };
  return failure(
    result.status,
    result.error,
    "The provider could not be disconnected.",
  );
}

export async function revokeSession(
  id: string,
): Promise<ActionResult<{ signedOut: boolean }>> {
  const result = await post(
    `api/account/sessions/${encodeURIComponent(id)}/revoke`,
  );
  if (!result) return OFFLINE;
  if (result.status === 200)
    return { ok: true, signedOut: result.body?.signedOut === true };
  return failure(
    result.status,
    result.error,
    "The session could not be signed out.",
  );
}

/** Sign a connected app out; its sign-in stops working on its computer. */
export async function revokeApp(id: string): Promise<ActionResult> {
  const result = await post(
    `api/account/apps/${encodeURIComponent(id)}/revoke`,
  );
  if (!result) return OFFLINE;
  // Already gone counts: the app is signed out either way.
  if (result.status === 200 || result.status === 404) return { ok: true };
  return failure(
    result.status,
    result.error,
    "The app could not be signed out.",
  );
}

export async function confirmEmailVerification(
  token: string,
): Promise<ActionResult> {
  const result = await post("api/auth/verify-email", { token });
  if (!result) return OFFLINE;
  if (result.status === 200) return { ok: true };
  if (result.status === 429)
    return {
      ok: false,
      error: "Too many attempts. Wait a little and try again.",
    };
  return {
    ok: false,
    error: "This verification link is invalid, expired, or was already used.",
  };
}

/** Start connecting a provider; the Account service returns to the account center. */
export function linkProviderUrl(provider: SocialProvider): string {
  const start = new URL(`${issuerBase()}/auth/social/${provider}`);
  start.searchParams.set("link", "1");
  start.searchParams.set(
    "return_to",
    new URL("/app/account", window.location.origin).href,
  );
  return start.href;
}

/** Short human label ("Chrome on Windows") for a session's user agent. */
export function describeUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Browser";
  const system = /Windows/.test(userAgent)
    ? "Windows"
    : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad/.test(userAgent)
        ? "iOS"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  if (browser === "Browser" && !system) return userAgent.slice(0, 60);
  return system ? `${browser} on ${system}` : browser;
}
