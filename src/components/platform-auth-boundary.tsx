"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  type PlatformSession,
  usePlatformSession,
} from "@/hooks/use-platform-session";
import {
  accountAuthError,
  beginAccountLogin,
  isAccountLogoutPending,
} from "@/lib/account-auth";

export function PlatformAuthBoundary({
  children,
}: {
  children: (session: PlatformSession) => ReactNode;
}) {
  const session = usePlatformSession();
  const [authError, setAuthError] = useState("");

  const restoreSession = useCallback(async () => {
    setAuthError("");
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    try {
      await beginAccountLogin(returnTo);
    } catch (reason) {
      setAuthError(accountAuthError(reason));
    }
  }, []);

  useEffect(() => {
    if (!session.ready || session.signedIn || isAccountLogoutPending()) return;
    void restoreSession();
  }, [restoreSession, session.ready, session.signedIn]);

  if (!session.signedIn) {
    return (
      <section className="auth-page">
        <div className="auth-card" aria-live="polite">
          <p className="eyebrow">Algorithco workspace</p>
          <h1>
            {authError
              ? "Could not restore your session"
              : "Opening your dashboard…"}
          </h1>
          <p className={authError ? "form-error" : "muted"}>
            {authError ||
              "Checking your central account. An active SSO session continues automatically."}
          </p>
          {authError ? (
            <button
              className="button button--primary"
              type="button"
              onClick={() => void restoreSession()}
            >
              Try again
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return children(session);
}
