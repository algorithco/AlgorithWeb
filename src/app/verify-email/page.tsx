"use client";

import { useEffect, useState } from "react";
import { confirmEmailVerification } from "@/lib/account-center";

/**
 * Target of the verification link in sign-up emails. The token is confirmed
 * only after an explicit click, so mail scanners that prefetch links cannot
 * consume it.
 */
export default function VerifyEmailPage() {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<"ready" | "pending" | "done">("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token");
    setToken(value && value.length >= 32 ? value : "");
    // Keep the single-use token out of history and referrers.
    window.history.replaceState({}, "", "/verify-email");
  }, []);

  const verify = async () => {
    if (!token) return;
    setState("pending");
    setError("");
    const result = await confirmEmailVerification(token);
    if (result.ok) {
      setState("done");
      return;
    }
    setState("ready");
    setError(result.error);
  };

  const invalid = token === "";

  return (
    <section className="auth-page">
      <div className="auth-card" aria-live="polite">
        <p className="eyebrow">Algorithco account</p>
        <h1>
          {state === "done"
            ? "Email verified"
            : invalid
              ? "Link not valid"
              : "Verify your email"}
        </h1>
        {state === "done" ? (
          <>
            <p className="muted">
              Your email is confirmed. You can sign in now.
            </p>
            <a className="button button--primary" href="/signin">
              Sign in
            </a>
          </>
        ) : invalid ? (
          <>
            <p className="form-error">
              This verification link is incomplete. Open the latest link from
              your email.
            </p>
            <a className="button button--primary" href="/signin">
              Go to sign in
            </a>
          </>
        ) : (
          <>
            <p className="muted">
              Confirm that this email address belongs to you.
            </p>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              className="button button--primary"
              type="button"
              disabled={!token || state === "pending"}
              onClick={() => void verify()}
            >
              {state === "pending" ? "Verifying…" : "Verify email"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
