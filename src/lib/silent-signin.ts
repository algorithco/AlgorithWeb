"use client";

import { beginAccountLogin } from "./account-auth";
import { accountSessionActive } from "./account-forms";

const ATTEMPT_KEY = "algorithco-silent-signin-at";
const MIN_RETRY_MS = 20_000;

/**
 * The platform access token is short-lived (10 minutes) and the refresh token
 * only lives in memory, so a reload or a new tab loses it. The Account service
 * keeps its own browser session (14 days, sliding). When that session is still
 * alive, continuing the OIDC authorization flow signs the user straight back in
 * without showing a form. Returns true when the browser is being redirected.
 *
 * A recent-attempt guard prevents redirect loops if the flow ends in an error.
 */
export async function trySilentSignIn(returnTo: string): Promise<boolean> {
  try {
    const last = Number(window.sessionStorage.getItem(ATTEMPT_KEY) ?? "0");
    if (Date.now() - last < MIN_RETRY_MS) return false;
    if (!(await accountSessionActive())) return false;
    window.sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()));
    await beginAccountLogin(returnTo);
    return true;
  } catch {
    return false;
  }
}
