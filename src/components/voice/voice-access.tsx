"use client";

import { useState } from "react";
import { useDashboardSession } from "@/components/dashboard-shell";
import { beginAccountLogin } from "@/lib/account-auth";
import { tokenHasScope, voiceErrorMessage } from "@/lib/voice-api";

/**
 * Whether this sign-in may read AlgorithVoice data. Tokens issued before
 * AlgorithVoice joined the account lack `voice:access`; the pages then offer
 * a fresh sign-in instead of failing.
 */
export function useVoiceAccess() {
  const session = useDashboardSession();
  const hasScope =
    session.signedIn && tokenHasScope(session.token, "voice:access");
  return {
    session,
    hasScope,
    ready: session.signedIn && hasScope,
    subject: session.profile?.subject,
  };
}

/** The permission prompt and the "data is unavailable" alert of every page. */
export function VoiceAlerts({
  error,
  returnTo,
}: {
  error?: unknown;
  /** Where the refreshed sign-in comes back to: the current page. */
  returnTo: string;
}) {
  const { session, hasScope } = useVoiceAccess();
  const [reauthError, setReauthError] = useState("");
  const needsScope = session.signedIn && !hasScope;
  if (!needsScope && !error) return null;
  return (
    <div className="dashboard-alerts">
      {needsScope ? (
        <div className="dashboard-alert voice-reauth" role="status">
          <strong>AlgorithVoice needs one more permission.</strong>
          <span>
            Your sign-in predates AlgorithVoice joining your Algorithco account.
            Refreshing it takes a second and does not ask for your password
            while your account session is active.
          </span>
          <button
            className="button button--primary"
            onClick={() => {
              setReauthError("");
              beginAccountLogin(returnTo).catch((failure: unknown) =>
                setReauthError(
                  failure instanceof Error
                    ? failure.message
                    : "Sign-in could not start.",
                ),
              );
            }}
            type="button"
          >
            Refresh sign-in
          </button>
          {reauthError ? <p className="form-error">{reauthError}</p> : null}
        </div>
      ) : null}
      {error ? (
        <p className="dashboard-alert" role="alert">
          <strong>AlgorithVoice data is unavailable.</strong>
          <span>{voiceErrorMessage(error)}</span>
        </p>
      ) : null}
    </div>
  );
}
