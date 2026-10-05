"use client";

import { useCallback, useEffect, useState } from "react";
import { accountAuthError, beginAccountLogin } from "@/lib/account-auth";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const signIn = useCallback(async () => {
    setPending(true);
    setError("");
    try {
      await beginAccountLogin("/app");
    } catch (reason) {
      setPending(false);
      setError(accountAuthError(reason));
    }
  }, []);

  useEffect(() => {
    void signIn();
  }, [signIn]);

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Algorithco account</p>
        <h1>One account for every Algorithco product.</h1>
        <p className="muted">
          Continue to the central Account service, then return securely to the
          platform.
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="button button--primary"
          type="button"
          onClick={signIn}
          disabled={pending}
        >
          {pending ? "Restoring your account…" : "Try sign in again"}
        </button>
      </div>
    </section>
  );
}
