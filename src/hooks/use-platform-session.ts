"use client";

import { useCallback, useEffect, useState } from "react";
import {
  accountLogout,
  canRefreshAccountSession,
  refreshAccountSession,
} from "@/lib/account-auth";
import {
  loadAccessToken,
  loadGuardOrgId,
  PLATFORM_SESSION_EVENT,
  profileFromAccessToken,
  saveAccessToken,
  saveGuardOrgId,
} from "@/lib/platform-session";

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

type SessionSnapshot = ReturnType<typeof snapshot> & { ready: boolean };

const EMPTY_SESSION: SessionSnapshot = {
  token: "",
  profile: null,
  orgId: "",
  ready: false,
};

export function usePlatformSession() {
  const [session, setSession] = useState<SessionSnapshot>(EMPTY_SESSION);

  useEffect(() => {
    const sync = () => setSession({ ...snapshot(), ready: true });
    sync();
    window.addEventListener(PLATFORM_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PLATFORM_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const expiresAt = session.profile?.expiresAt;
    if (!expiresAt) return;
    const expiresAtMs = expiresAt * 1000;
    const expiryTimer = window.setTimeout(
      () => {
        if (loadAccessToken() === session.token) saveAccessToken("");
      },
      Math.max(0, expiresAtMs - Date.now() + 1_000),
    );
    const refreshTimer = canRefreshAccountSession()
      ? window.setTimeout(
          () => {
            void refreshAccountSession().catch(() => {
              // The current access token remains usable until its own expiry.
            });
          },
          Math.max(0, expiresAtMs - Date.now() - 60_000),
        )
      : undefined;
    return () => {
      window.clearTimeout(expiryTimer);
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    };
  }, [session.profile?.expiresAt, session.token]);

  const selectOrg = useCallback((orgId: string) => saveGuardOrgId(orgId), []);
  const logout = useCallback(() => {
    saveGuardOrgId("");
    saveAccessToken("");
    void accountLogout().catch(() => undefined);
  }, []);

  return {
    ...session,
    signedIn: session.token !== "",
    selectOrg,
    logout,
  };
}

export type PlatformSession = ReturnType<typeof usePlatformSession>;
