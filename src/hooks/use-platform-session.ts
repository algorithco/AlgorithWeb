"use client";

import { useCallback, useEffect, useState } from "react";
import {
  accountLogout,
  clearAccountLocalSession,
  isAccountLogoutPending,
  renewAccountSession,
} from "@/lib/account-auth";
import {
  hasSignedInHint,
  loadAccessToken,
  loadGuardOrgId,
  PLATFORM_SESSION_EVENT,
  profileFromAccessToken,
  SIGNED_IN_HINT_KEY,
  saveAccessToken,
  saveGuardOrgId,
} from "@/lib/platform-session";
import { restoreSession } from "@/lib/silent-signin";

function snapshot() {
  const token = loadAccessToken();
  const profile = profileFromAccessToken(token);
  const expired =
    profile?.expiresAt === null ||
    (profile?.expiresAt !== undefined &&
      profile.expiresAt <= Math.floor(Date.now() / 1000));
  return {
    token: profile && !expired ? token : "",
    profile: profile && !expired ? profile : null,
    orgId: loadGuardOrgId(),
  };
}

type SessionSnapshot = ReturnType<typeof snapshot> & {
  ready: boolean;
  /** The sign-in is being brought back from the Account session. */
  restoring: boolean;
  /** This browser was signed in before; see hasSignedInHint. */
  remembered: boolean;
};

const EMPTY_SESSION: SessionSnapshot = {
  token: "",
  profile: null,
  orgId: "",
  ready: false,
  restoring: false,
  remembered: false,
};

/** Renew this long before the access token runs out. */
const RENEW_AHEAD_MS = 60_000;
/** A second try, for when the first one found the network down. */
const RETRY_AHEAD_MS = 15_000;

/**
 * The page's sign-in. The access token lasts ten minutes and lives in this
 * tab only; what lasts is the Account service's browser session. So the hook
 * brings the token back from that session when a page opens without one, and
 * renews it before it runs out, both without leaving the page.
 *
 * `restore: "always"` is for the dashboard, which cannot show anything
 * without a sign-in. The default asks only in a browser that was signed in
 * before, so a first-time visitor's page makes no account request.
 */
export function usePlatformSession(
  options: { restore?: "always" | "remembered" } = {},
) {
  const always = options.restore === "always";
  const [session, setSession] = useState<SessionSnapshot>(EMPTY_SESSION);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let mounted = true;
    const sync = () =>
      setSession((current) => ({
        ...snapshot(),
        ready: true,
        restoring: current.restoring,
        remembered: hasSignedInHint(),
      }));
    const onStorage = (event: StorageEvent) => {
      // Another tab signed out: this one must not go on with its own token.
      if (event.key === SIGNED_IN_HINT_KEY && event.newValue === null) {
        clearAccountLocalSession();
      }
      sync();
    };
    const first = snapshot();
    const restore = first.token === "" && !isAccountLogoutPending();
    setSession({
      ...first,
      ready: true,
      restoring: restore,
      remembered: hasSignedInHint(),
    });
    if (restore) {
      void restoreSession(always).finally(() => {
        if (!mounted) return;
        setSession({
          ...snapshot(),
          ready: true,
          restoring: false,
          remembered: hasSignedInHint(),
        });
      });
    }
    window.addEventListener(PLATFORM_SESSION_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      mounted = false;
      window.removeEventListener(PLATFORM_SESSION_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [always]);

  useEffect(() => {
    const expiresAt = session.profile?.expiresAt;
    const token = session.token;
    if (!expiresAt || !token) return;
    const expiresAtMs = expiresAt * 1000;
    const stillCurrent = () => loadAccessToken() === token;
    const renew = async () => {
      if (!stillCurrent() || isAccountLogoutPending()) return;
      try {
        await renewAccountSession();
      } catch {
        // The current access token remains usable until its own expiry.
      }
    };
    const timers = [RENEW_AHEAD_MS, RETRY_AHEAD_MS].map((ahead) =>
      window.setTimeout(
        () => void renew(),
        Math.max(0, expiresAtMs - Date.now() - ahead),
      ),
    );
    // A computer that slept wakes up here with the token already expired:
    // one more try before the page shows itself signed out.
    timers.push(
      window.setTimeout(
        () =>
          void renew().finally(() => {
            if (stillCurrent()) saveAccessToken("");
          }),
        Math.max(0, expiresAtMs - Date.now() + 1_000),
      ),
    );
    // Timers are throttled in a background tab; catch up when it is shown.
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        expiresAtMs - Date.now() < RENEW_AHEAD_MS
      ) {
        void renew();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session.profile?.expiresAt, session.token]);

  const selectOrg = useCallback((orgId: string) => saveGuardOrgId(orgId), []);
  const logout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await accountLogout();
      saveGuardOrgId("");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Account sign out failed",
      );
      setLoggingOut(false);
      throw error;
    }
  }, [loggingOut]);

  return {
    ...session,
    signedIn: session.token !== "",
    selectOrg,
    logout,
    loggingOut,
    logoutError,
  };
}

export type PlatformSession = ReturnType<typeof usePlatformSession>;
