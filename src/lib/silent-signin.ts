"use client";

import { beginAccountLogin, silentAccountSignIn } from "./account-auth";
import { accountSessionActive, accountSessionState } from "./account-forms";
import { hasSignedInHint, setSignedInHint } from "./platform-session";

const ATTEMPT_KEY = "algorithco-silent-signin-at";
const MIN_RETRY_MS = 20_000;

/**
 * The platform access token is short-lived (10 minutes) and the refresh token
 * only lives in memory, so a reload or a new tab loses it. The Account service
 * keeps its own browser session (90 days, sliding). When that session is still
 * alive, continuing the OIDC authorization flow signs the user straight back in
 * without showing a form. Returns true when the browser is being redirected.
 *
 * This is the fallback that navigates; restoreSession below does the same
 * without leaving the page and is tried first.
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

let restoreInFlight: { always: boolean; promise: Promise<boolean> } | null =
  null;

async function restore(always: boolean): Promise<boolean> {
  // A page anyone may read asks only in a browser that was signed in before;
  // the dashboard always asks.
  if (!always && !hasSignedInHint()) return false;
  const state = await accountSessionState();
  if (state === "none") {
    // The session ended elsewhere: stop saying "Dashboard" in every tab.
    setSignedInHint(false);
    return false;
  }
  if (state === "unknown") return false;
  return (await silentAccountSignIn()) !== null;
}

/**
 * Bring this page's sign-in back from the Account session, in the background.
 * Every caller on the page shares one attempt. True when the page is signed
 * in afterwards.
 */
export function restoreSession(always: boolean): Promise<boolean> {
  // The header's hinted attempt must not answer for the dashboard's: that one
  // asks even without the hint, so it runs after it instead of joining it.
  if (restoreInFlight && (restoreInFlight.always || !always)) {
    return restoreInFlight.promise;
  }
  const earlier = restoreInFlight?.promise ?? Promise.resolve(false);
  const promise = earlier
    .then((restored) => restored || restore(always))
    .catch(() => false)
    .finally(() => {
      if (restoreInFlight?.promise === promise) restoreInFlight = null;
    });
  restoreInFlight = { always, promise };
  return promise;
}
