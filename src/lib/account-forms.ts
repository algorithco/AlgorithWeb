"use client";

import { accountWebConfig, normalizeReturnTo } from "./account-auth";

/**
 * Headless client for the central Account service's same-origin auth API.
 *
 * No second auth architecture: every call hits the same same-origin routes,
 * the same zod validation, rate limits, and emails as the server-rendered
 * pages in algorithco-account/apps/api/src/http/routes.ts. The only
 * difference is transport (fetch instead of full-page forms) so the login
 * card can show inline loading, validation, and error states.
 *
 * CSRF is the service's double-submit cookie (__Host-csrf + matching `csrf`
 * body field). The API returns JSON and keeps HTML rendering details out of
 * this client.
 */

export type AccountFormPage =
  | "signin"
  | "signup"
  | "forgot-password"
  | "reset-password";

export type SocialProvider = "google" | "github";

export interface SocialPasswordChallenge {
  provider: SocialProvider;
  email: string;
  passwordMode: "create" | "verify";
}

export type FormResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      retryable?: boolean;
      mfaRequired?: boolean;
    };

const FORM_TIMEOUT_MS = 12_000;
const SOCIAL_RETURN_KEY = "algorithco-social-return-to";

function issuerBase(): string {
  return accountWebConfig().issuer.replace(/\/+$/, "");
}

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(FORM_TIMEOUT_MS);
}

function isValidEmailFormat(value: string): boolean {
  const normalized = value.trim();
  if (!normalized || normalized.length > 320) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function validateSignIn(input: {
  email: string;
  password: string;
}): string | null {
  if (!isValidEmailFormat(input.email)) return "Enter a valid email address.";
  if (!input.password) return "Enter your password.";
  if (input.password.length > 128)
    return "Password must be at most 128 characters.";
  return null;
}

export function validateMfaCode(code: string): string | null {
  const normalized = code.trim();
  if (normalized.length < 6 || normalized.length > 64)
    return "Enter a valid authenticator or recovery code.";
  return null;
}

export function validateSignUp(input: {
  name: string;
  email: string;
  password: string;
}): string | null {
  const name = input.name.trim();
  if (!name) return "Enter your name.";
  if (name.length > 200) return "Name must be at most 200 characters.";
  if (!isValidEmailFormat(input.email)) return "Enter a valid email address.";
  const length = Array.from(input.password).length;
  if (length < 12) return "Use a password with 12–128 characters.";
  if (length > 128) return "Use a password with 12–128 characters.";
  return null;
}

export function validateEmailOnly(email: string): string | null {
  if (!isValidEmailFormat(email)) return "Enter a valid email address.";
  return null;
}

export function validateResetCode(code: string): string | null {
  if (!/^\d{6}$/.test(code.trim()))
    return "Enter the 6-digit code from your email.";
  return null;
}

export function validateNewPassword(password: string): string | null {
  const length = Array.from(password).length;
  if (length < 12 || length > 128)
    return "Use a password with 12–128 characters.";
  return null;
}

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch(`${issuerBase()}/api/auth/csrf`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: timeoutSignal(),
  });
  if (!response.ok)
    throw new Error(`account service unavailable (${response.status})`);
  const body = (await response.json()) as { csrf?: unknown };
  if (typeof body.csrf !== "string" || !body.csrf)
    throw new Error("account CSRF response is invalid");
  return body.csrf;
}

async function postAuthForm(
  path: string,
  fields: Record<string, string>,
): Promise<{ status: number; error?: string }> {
  const csrf = await fetchCsrfToken();
  const submit = async (token: string) =>
    fetch(`${issuerBase()}/api/auth/${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ ...fields, csrf: token }),
      signal: timeoutSignal(),
    });
  let response = await submit(csrf);
  if (response.status === 403) {
    // CSRF cookie rotated between fetch and submit; retry once with a fresh token.
    response = await submit(await fetchCsrfToken());
    if (response.status === 403) {
      return { status: 403 };
    }
  }
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;
  return {
    status: response.status,
    ...(typeof body?.error === "string" ? { error: body.error } : {}),
  };
}

async function postForm(
  page: AccountFormPage,
  fields: Record<string, string>,
): Promise<{ status: number; error?: string }> {
  return postAuthForm(page, fields);
}

function networkError(): FormResult {
  return {
    ok: false,
    retryable: true,
    error:
      "Could not reach the account service. Check your connection and try again.",
  };
}

function rateLimited(): FormResult {
  return {
    ok: false,
    error: "Too many attempts. Wait a little and try again.",
  };
}

/** Email + password sign-in against POST /account/signin. */
export async function signInWithPassword(
  email: string,
  password: string,
  totp?: string,
): Promise<FormResult> {
  let result: { status: number; error?: string };
  try {
    result = await postForm("signin", {
      email: email.trim().toLowerCase(),
      password,
      ...(totp?.trim() ? { totp: totp.trim() } : {}),
    });
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 401) {
    if (result.error === "mfa_required") {
      return {
        ok: false,
        mfaRequired: true,
        error: "Enter your authenticator or recovery code.",
      };
    }
    return {
      ok: false,
      error: "Invalid email, password, authenticator code, or recovery code.",
    };
  }
  if (result.status === 400)
    return { ok: false, error: "Sign in could not be completed." };
  if (result.status === 429) return rateLimited();
  if (result.status === 403) {
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  }
  return { ok: false, error: "Sign in could not be completed." };
}

/** Registration against POST /account/signup (sends verification email). */
export async function signUpWithPassword(input: {
  name: string;
  email: string;
  password: string;
}): Promise<FormResult> {
  let status: number;
  try {
    ({ status } = await postForm("signup", {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }));
  } catch {
    return networkError();
  }
  if (status === 200) return { ok: true };
  if (status === 400)
    return { ok: false, error: "Check the form and try again." };
  if (status === 429) return rateLimited();
  if (status === 403)
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  return { ok: false, error: "Account creation could not be completed." };
}

/** Password-reset request against POST /account/forgot-password. */
export async function requestPasswordReset(email: string): Promise<FormResult> {
  let status: number;
  try {
    ({ status } = await postForm("forgot-password", {
      email: email.trim().toLowerCase(),
    }));
  } catch {
    return networkError();
  }
  if (status === 200) return { ok: true };
  if (status === 400)
    return { ok: false, error: "Enter a valid email address." };
  if (status === 429) return rateLimited();
  if (status === 403)
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  return { ok: false, error: "Reset request could not be completed." };
}

/** Step 2 of password recovery: 6-digit code + new password. */
export async function confirmPasswordReset(input: {
  email: string;
  code: string;
  password: string;
}): Promise<FormResult> {
  let result: { status: number };
  try {
    result = await postForm("reset-password", {
      email: input.email.trim().toLowerCase(),
      code: input.code.trim(),
      password: input.password,
    });
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 400)
    return { ok: false, error: "This reset code is invalid or expired." };
  if (result.status === 429) return rateLimited();
  if (result.status === 403)
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  return { ok: false, error: "Reset could not be completed." };
}

/** Direct entry points for the service's OAuth flows (GET navigation). */
export function socialStartUrl(
  provider: SocialProvider,
  returnTo = "/app",
): string {
  const safeReturnTo = normalizeReturnTo(returnTo);
  sessionStorage.setItem(SOCIAL_RETURN_KEY, safeReturnTo);
  const callback = new URL("/signin", window.location.origin);
  callback.searchParams.set("social", "complete");
  const start = new URL(`${issuerBase()}/auth/social/${provider}`);
  start.searchParams.set("return_to", callback.href);
  return start.href;
}

export function takeSocialReturnTo(): string | null {
  const value = sessionStorage.getItem(SOCIAL_RETURN_KEY);
  sessionStorage.removeItem(SOCIAL_RETURN_KEY);
  if (!value) return null;
  return normalizeReturnTo(value);
}

export async function socialPasswordChallenge(): Promise<SocialPasswordChallenge | null> {
  try {
    const response = await fetch(`${issuerBase()}/api/auth/social/pending`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as Partial<SocialPasswordChallenge>;
    if (
      (body.provider !== "google" && body.provider !== "github") ||
      typeof body.email !== "string" ||
      (body.passwordMode !== "create" && body.passwordMode !== "verify")
    ) {
      return null;
    }
    return {
      provider: body.provider,
      email: body.email,
      passwordMode: body.passwordMode,
    } as SocialPasswordChallenge;
  } catch {
    return null;
  }
}

export async function completeSocialPassword(
  password: string,
): Promise<FormResult> {
  let result: { status: number; error?: string };
  try {
    result = await postAuthForm("social/password", { password });
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 401 && result.error === "mfa_required") {
    return {
      ok: false,
      mfaRequired: true,
      error: "Enter your authenticator or recovery code.",
    };
  }
  if (result.status === 401 && result.error === "invalid_password") {
    return { ok: false, error: "The account password is incorrect." };
  }
  if (result.status === 429) return rateLimited();
  if (result.status === 403) {
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  }
  return {
    ok: false,
    error: "The social sign-in challenge expired. Start again.",
  };
}

export async function completeSocialMfa(code: string): Promise<FormResult> {
  let result: { status: number; error?: string };
  try {
    result = await postAuthForm("social/mfa", { code: code.trim() });
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 401) {
    return {
      ok: false,
      error: "The authenticator or recovery code is invalid.",
    };
  }
  if (result.status === 429) return rateLimited();
  if (result.status === 403) {
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  }
  return { ok: false, error: "Social sign-in could not be completed." };
}

/** Account-service page URLs reused as fallbacks (same flows, full pages). */
export function accountPageUrl(page: AccountFormPage): string {
  return `${issuerBase()}/${page}`;
}
