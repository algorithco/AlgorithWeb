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

export interface SocialEmailChallenge {
  provider: SocialProvider;
  email: string;
  isNewAccount: boolean;
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

export function issuerBase(): string {
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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): string | null {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName) return "Enter your first name.";
  if (!lastName) return "Enter your last name.";
  if (firstName.length > 100)
    return "First name must be at most 100 characters.";
  if (lastName.length > 100) return "Last name must be at most 100 characters.";
  if (`${firstName} ${lastName}`.length > 200)
    return "Full name must be at most 200 characters.";
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

/**
 * Emailed recovery/password codes: six digits, or the longer XXXXX-XXXXX code
 * the account service sends once an address has seen too many wrong guesses.
 */
export function validateEmailCode(code: string): string | null {
  const normalized = code.trim();
  if (
    !/^\d{6}$/.test(normalized) &&
    !/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{10}$/.test(
      normalized.toUpperCase().replace(/[\s-]/g, ""),
    )
  )
    return "Enter the code from your email.";
  return null;
}

/** Six-digit-only codes (social email check, account deletion). */
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

export async function postServiceForm(
  path: string,
  fields: Record<string, string>,
): Promise<{
  status: number;
  error?: string;
  body: Record<string, unknown> | null;
}> {
  const csrf = await fetchCsrfToken();
  const response = await fetch(`${issuerBase()}/${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ ...fields, csrf }),
    signal: timeoutSignal(),
  });
  const body = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  return {
    status: response.status,
    body,
    ...(typeof body?.error === "string" ? { error: body.error } : {}),
  };
}

async function postAuthForm(
  path: string,
  fields: Record<string, string>,
): Promise<{ status: number; error?: string }> {
  return postServiceForm(`api/auth/${path}`, fields);
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

const WEAK_PASSWORD_MESSAGE =
  "This password is too common or appeared in a data breach. Choose a different one.";

function weakPassword(): FormResult {
  return { ok: false, error: WEAK_PASSWORD_MESSAGE };
}

function rateLimited(error?: string): Extract<FormResult, { ok: false }> {
  if (error === "mfa_locked")
    return {
      ok: false,
      error:
        "Too many authenticator codes were tried for this account. Use a recovery code, or try again tomorrow.",
    };
  if (error === "too_many_attempts")
    return {
      ok: false,
      error:
        "Too many wrong codes were entered. Request a new code; it will be longer and will still work.",
    };
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
    result = totp?.trim()
      ? await postAuthForm("mfa", { code: totp.trim() })
      : await postForm("signin", {
          email: email.trim().toLowerCase(),
          password,
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
  if (result.status === 429) return rateLimited(result.error);
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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<FormResult> {
  let status: number;
  let error: string | undefined;
  try {
    ({ status, error } = await postForm("signup", {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }));
  } catch {
    return networkError();
  }
  if (status === 200) return { ok: true };
  if (status === 400 && error === "weak_password") return weakPassword();
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
  let result: { status: number; error?: string };
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
  if (result.status === 400 && result.error === "weak_password")
    return weakPassword();
  if (result.status === 400)
    return { ok: false, error: "This reset code is invalid or expired." };
  if (result.status === 429) return rateLimited(result.error);
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

const CONTINUE_KEY = "algorithco-signin-continue";

/**
 * A sign-in started by another Algorithco app (OIDC interaction) carries a
 * `continue` URL back to the Account service. Only interaction URLs on the
 * configured issuer are honoured, so the parameter cannot redirect elsewhere.
 */
export function safeContinueUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  try {
    const issuer = new URL(issuerBase());
    const target = new URL(value);
    const prefix = `${issuer.pathname.replace(/\/+$/, "")}/interaction/`;
    if (
      target.origin !== issuer.origin ||
      !target.pathname.startsWith(prefix) ||
      target.username ||
      target.password ||
      target.search ||
      target.hash
    )
      return null;
    return target.href;
  } catch {
    return null;
  }
}

/** Keep the continuation across a provider round-trip (same tab only). */
export function rememberContinue(value: string | null): void {
  try {
    if (value) sessionStorage.setItem(CONTINUE_KEY, value);
    else sessionStorage.removeItem(CONTINUE_KEY);
  } catch {
    // Storage is optional; the website falls back to its own dashboard.
  }
}

export function takeContinue(): string | null {
  try {
    const value = sessionStorage.getItem(CONTINUE_KEY);
    sessionStorage.removeItem(CONTINUE_KEY);
    return safeContinueUrl(value);
  } catch {
    return null;
  }
}

/** True when a provider sign-in is waiting for the authenticator step. */
export async function socialMfaPending(): Promise<boolean> {
  try {
    const response = await fetch(`${issuerBase()}/api/auth/social/mfa`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { pending?: unknown };
    return body.pending === true;
  } catch {
    return false;
  }
}

export function takeSocialReturnTo(): string | null {
  const value = sessionStorage.getItem(SOCIAL_RETURN_KEY);
  sessionStorage.removeItem(SOCIAL_RETURN_KEY);
  if (!value) return null;
  return normalizeReturnTo(value);
}

export async function socialEmailChallenge(): Promise<SocialEmailChallenge | null> {
  try {
    const response = await fetch(`${issuerBase()}/api/auth/social/pending`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as Partial<SocialEmailChallenge>;
    if (
      (body.provider !== "google" && body.provider !== "github") ||
      typeof body.email !== "string" ||
      typeof body.isNewAccount !== "boolean"
    ) {
      return null;
    }
    return {
      provider: body.provider,
      email: body.email,
      isNewAccount: body.isNewAccount,
    };
  } catch {
    return null;
  }
}

/**
 * Whether the Account service holds a signed-in browser session: "active",
 * "none" when it says there is none, "unknown" when it could not be asked.
 */
export async function accountSessionState(): Promise<
  "active" | "none" | "unknown"
> {
  try {
    const response = await fetch(`${issuerBase()}/api/auth/session`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      signal: timeoutSignal(),
    });
    if (!response.ok) return "unknown";
    const body = (await response.json()) as { authenticated?: unknown };
    return body.authenticated === true ? "active" : "none";
  } catch {
    return "unknown";
  }
}

/** True when the Account service already holds a signed-in browser session. */
export async function accountSessionActive(): Promise<boolean> {
  return (await accountSessionState()) === "active";
}

export async function completeSocialEmailCode(
  code: string,
): Promise<FormResult> {
  let result: { status: number; error?: string };
  try {
    result = await postAuthForm("social/code", { code: code.trim() });
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
  if (result.status === 401 && result.error === "invalid_code") {
    return { ok: false, error: "That email code is invalid or expired." };
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

export async function resendSocialEmailCode(): Promise<FormResult> {
  let result: { status: number };
  try {
    result = await postAuthForm("social/code/resend", {});
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 429) return rateLimited();
  if (result.status === 403)
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  return {
    ok: false,
    error: "The email-code challenge expired. Start again.",
  };
}

export type DeletionCodeResult =
  | { ok: true; email: string; expiresAt: string }
  | { ok: false; error: string; retryable?: boolean };

export async function requestAccountDeletionCode(): Promise<DeletionCodeResult> {
  try {
    const csrf = await fetchCsrfToken();
    const response = await fetch(`${issuerBase()}/api/account/deletion/code`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ csrf }),
      signal: timeoutSignal(),
    });
    type ResponseBody = {
      email?: unknown;
      expiresAt?: unknown;
      error?: unknown;
    } | null;
    const body = (await response.json().catch(() => null)) as ResponseBody;
    if (
      response.ok &&
      typeof body?.email === "string" &&
      typeof body.expiresAt === "string"
    ) {
      return { ok: true, email: body.email, expiresAt: body.expiresAt };
    }
    if (
      response.status === 401 ||
      (response.status === 403 && body?.error === "authenticator_required")
    )
      return {
        ok: false,
        error: "Sign in again before deleting your account.",
      };
    if (response.status === 403 && body?.error === "verified_email_required")
      return {
        ok: false,
        error: "Verify your email before deleting your account.",
      };
    if (response.status === 429)
      return {
        ok: false,
        error: "Too many attempts. Wait a little and try again.",
      };
    return { ok: false, error: "The deletion code could not be sent." };
  } catch {
    return {
      ok: false,
      retryable: true,
      error:
        "Could not reach the account service. Check your connection and try again.",
    };
  }
}

export type PasswordCodeResult =
  | { ok: true; email: string; expiresAt: string }
  | { ok: false; error: string; retryable?: boolean; signInRequired?: boolean };

function passwordChangeFailure(
  status: number,
  error: unknown,
): Extract<PasswordCodeResult, { ok: false }> {
  if (status === 401)
    return {
      ok: false,
      signInRequired: true,
      error: "Your session ended. Sign in again to change your password.",
    };
  if (status === 403 && error === "authenticator_required")
    return {
      ok: false,
      signInRequired: true,
      error:
        "Sign in again with your authenticator code before changing your password.",
    };
  if (status === 403 && error === "verified_email_required")
    return {
      ok: false,
      error: "Verify your email before changing your password.",
    };
  if (status === 403)
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  if (status === 429)
    return {
      ok: false,
      error: rateLimited(typeof error === "string" ? error : undefined).error,
    };
  return { ok: false, error: "The password could not be changed. Try again." };
}

/** Step 1: email a one-time code to the signed-in user's verified address. */
export async function requestPasswordChangeCode(): Promise<PasswordCodeResult> {
  try {
    const csrf = await fetchCsrfToken();
    const response = await fetch(`${issuerBase()}/api/account/password/code`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ csrf }),
      signal: timeoutSignal(),
    });
    const body = (await response.json().catch(() => null)) as {
      email?: unknown;
      expiresAt?: unknown;
      error?: unknown;
    } | null;
    if (
      response.ok &&
      typeof body?.email === "string" &&
      typeof body.expiresAt === "string"
    ) {
      return { ok: true, email: body.email, expiresAt: body.expiresAt };
    }
    return passwordChangeFailure(response.status, body?.error);
  } catch {
    return {
      ok: false,
      retryable: true,
      error:
        "Could not reach the account service. Check your connection and try again.",
    };
  }
}

/** Step 2: the emailed code authorises the new password. Ends every session. */
export async function confirmPasswordChange(
  code: string,
  password: string,
): Promise<FormResult & { signInRequired?: boolean }> {
  let result: { status: number; error?: string };
  try {
    result = await postServiceForm("api/account/password/confirm", {
      code: code.trim(),
      password,
    });
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 400 && result.error === "weak_password")
    return weakPassword();
  if (result.status === 400) {
    return {
      ok: false,
      error:
        result.error === "invalid_code"
          ? "The code is invalid, expired, or already used."
          : "Check the code and choose a password of 12–128 characters.",
    };
  }
  const failure = passwordChangeFailure(result.status, result.error);
  return failure;
}

export async function confirmAccountDeletion(
  code: string,
): Promise<FormResult> {
  let result: { status: number; error?: string };
  try {
    result = await postServiceForm("api/account/deletion/confirm", {
      code: code.trim(),
    });
  } catch {
    return networkError();
  }
  if (result.status === 200) return { ok: true };
  if (result.status === 400)
    return {
      ok: false,
      error: "The code is invalid, expired, or already used.",
    };
  if (result.status === 401)
    return { ok: false, error: "Sign in again before deleting your account." };
  if (result.status === 429) return rateLimited();
  if (result.status === 403)
    return {
      ok: false,
      retryable: true,
      error: "The form expired. Try again.",
    };
  return { ok: false, error: "Account deletion could not be confirmed." };
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
  if (result.status === 429) return rateLimited(result.error);
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
