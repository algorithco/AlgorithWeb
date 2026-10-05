"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { accountAuthError, handleAccountCallback } from "@/lib/account-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    void handleAccountCallback(window.location.href)
      .then((session) => router.replace(session.returnTo))
      .catch((reason) => {
        window.history.replaceState({}, "", "/auth/callback");
        setError(accountAuthError(reason));
      });
  }, [router]);

  return (
    <section className="auth-page">
      <div className="auth-card" aria-live="polite">
        <p className="eyebrow">Algorithco account</p>
        <h1>{error ? "Sign-in failed" : "Completing sign-in…"}</h1>
        {error ? (
          <>
            <p className="form-error">{error}</p>
            <a className="button button--primary" href="/signin">
              Try again
            </a>
          </>
        ) : (
          <p className="muted">Verifying the Account response securely.</p>
        )}
      </div>
    </section>
  );
}
