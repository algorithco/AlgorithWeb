"use client";

import { useEffect, useRef, useState } from "react";
import {
  accountAuthError,
  beginAccountLogin,
  normalizeReturnTo,
} from "@/lib/account-auth";
import {
  completeSocialMfa,
  completeSocialPassword,
  confirmPasswordReset,
  requestPasswordReset,
  type SocialPasswordChallenge,
  type SocialProvider,
  signInWithPassword,
  signUpWithPassword,
  socialPasswordChallenge,
  socialStartUrl,
  takeSocialReturnTo,
  validateEmailOnly,
  validateMfaCode,
  validateNewPassword,
  validateResetCode,
  validateSignIn,
  validateSignUp,
} from "@/lib/account-forms";

type Mode = "signin" | "signup" | "forgot";

const BENEFITS = [
  {
    title: "Faster access",
    body: "Get started in seconds.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Secure by design",
    body: "Your data stays yours.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"
          strokeLinejoin="round"
        />
        <path
          d="M9.3 12l2 2 3.4-4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "One account",
    body: "Use across all products.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" strokeLinecap="round" />
      </svg>
    ),
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="m4 4 16 16" strokeLinecap="round" /> : null}
    </svg>
  );
}

const CARD_COPY: Record<
  Mode,
  { eyebrow: string; title: string; subtitle: string }
> = {
  signin: {
    eyebrow: "Welcome back",
    title: "Sign in to Algorithco",
    subtitle: "Choose a method to continue to your account.",
  },
  signup: {
    eyebrow: "Get started",
    title: "Create your account",
    subtitle: "One account for every Algorithco product.",
  },
  forgot: {
    eyebrow: "Recovery",
    title: "Reset your password",
    subtitle: "Enter your email to receive a reset code.",
  },
};

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [signinStep, setSigninStep] = useState<"credentials" | "mfa">(
    "credentials",
  );
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(
    null,
  );
  const [socialChallenge, setSocialChallenge] =
    useState<SocialPasswordChallenge | null>(null);
  const [socialStep, setSocialStep] = useState<"password" | "mfa">("password");
  const [socialPassword, setSocialPassword] = useState("");
  const [socialMfa, setSocialMfa] = useState("");
  const [socialError, setSocialError] = useState("");
  const [socialCompleting, setSocialCompleting] = useState(false);
  const [socialReturnTo, setSocialReturnTo] = useState("/app");
  const [showSocialPassword, setShowSocialPassword] = useState(false);
  const socialDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("social") !== "complete") return;
    const returnTo = takeSocialReturnTo();
    if (!returnTo) {
      setError("The social sign-in transaction is missing or expired.");
      return;
    }
    setSocialReturnTo(returnTo);
    setPending(true);
    void socialPasswordChallenge().then((challenge) => {
      setPending(false);
      if (!challenge) {
        setError("The social sign-in transaction is missing or expired.");
        return;
      }
      setEmail(challenge.email);
      setSocialChallenge(challenge);
    });
  }, []);

  useEffect(() => {
    const dialog = socialDialogRef.current;
    if (socialChallenge && dialog && !dialog.open) dialog.showModal();
  }, [socialChallenge]);

  const requestedReturnTo = () => {
    const value = new URLSearchParams(window.location.search).get("returnTo");
    return normalizeReturnTo(value ?? undefined);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setSuccess("");
    setPending(false);
    setSocialPending(null);
    setSigninStep("credentials");
    setForgotStep(1);
    setPassword("");
    setTotp("");
    setResetCode("");
    setShowPassword(false);
  };

  const startSocial = (provider: SocialProvider) => {
    if (socialPending) return;
    setSocialPending(provider);
    setError("");
    window.location.assign(socialStartUrl(provider, requestedReturnTo()));
  };

  const finishSocialLogin = async () => {
    try {
      await beginAccountLogin(socialReturnTo);
    } catch (reason) {
      setSocialCompleting(false);
      setSocialError(accountAuthError(reason));
    }
  };

  const handleSocialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!socialChallenge || socialCompleting) return;
    setSocialError("");
    if (socialStep === "password") {
      const invalid =
        socialChallenge.passwordMode === "create"
          ? validateNewPassword(socialPassword)
          : !socialPassword || socialPassword.length > 128
            ? "Enter your Account password."
            : null;
      if (invalid) {
        setSocialError(invalid);
        return;
      }
      setSocialCompleting(true);
      const result = await completeSocialPassword(socialPassword);
      if (result.ok) {
        await finishSocialLogin();
        return;
      }
      setSocialCompleting(false);
      if (result.mfaRequired) {
        setSocialStep("mfa");
        setSocialPassword("");
        return;
      }
      setSocialError(result.error);
      return;
    }

    const invalid = validateMfaCode(socialMfa);
    if (invalid) {
      setSocialError(invalid);
      return;
    }
    setSocialCompleting(true);
    const result = await completeSocialMfa(socialMfa);
    if (result.ok) {
      await finishSocialLogin();
      return;
    }
    setSocialCompleting(false);
    setSocialError(result.error);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError("");
    setSuccess("");

    if (mode === "signin") {
      const invalid =
        signinStep === "mfa"
          ? validateMfaCode(totp)
          : validateSignIn({ email, password });
      if (invalid) {
        setError(invalid);
        return;
      }
      setPending(true);
      const result = await signInWithPassword(
        email,
        password,
        signinStep === "mfa" ? totp : undefined,
      );
      if (result.ok) {
        try {
          await beginAccountLogin(requestedReturnTo());
        } catch (reason) {
          setPending(false);
          setError(accountAuthError(reason));
        }
        return;
      }
      setPending(false);
      if (result.mfaRequired) {
        setSigninStep("mfa");
        setTotp("");
        setError("");
        return;
      }
      setError(result.error);
      return;
    }

    if (mode === "signup") {
      const invalid = validateSignUp({ name, email, password });
      if (invalid) {
        setError(invalid);
        return;
      }
      setPending(true);
      const result = await signUpWithPassword({ name, email, password });
      setPending(false);
      if (result.ok) {
        setSuccess(
          "Check your email. If the address can be registered, a verification message is on its way.",
        );
        return;
      }
      setError(result.error);
      return;
    }

    const invalid = validateEmailOnly(email);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (forgotStep === 1) {
      setPending(true);
      const result = await requestPasswordReset(email);
      setPending(false);
      if (result.ok) {
        setPassword("");
        setForgotStep(2);
        return;
      }
      setError(result.error);
      return;
    }
    const badCode = validateResetCode(resetCode);
    if (badCode) {
      setError(badCode);
      return;
    }
    const badPassword = validateNewPassword(password);
    if (badPassword) {
      setError(badPassword);
      return;
    }
    setPending(true);
    const result = await confirmPasswordReset({
      email,
      code: resetCode,
      password,
    });
    setPending(false);
    if (result.ok) {
      setPassword("");
      setResetCode("");
      setForgotStep(1);
      setSuccess("Password changed. Sign in with your new password.");
      return;
    }
    setError(result.error);
  };

  const busy = pending || socialPending !== null || socialChallenge !== null;
  const copy = CARD_COPY[mode];
  const isMfaStep = mode === "signin" && signinStep === "mfa";
  const eyebrow = isMfaStep ? "Security check" : copy.eyebrow;
  const title = isMfaStep ? "Verify it’s you" : copy.title;
  const subtitle = isMfaStep
    ? "Enter the code from your authenticator app or use a recovery code."
    : mode === "forgot" && forgotStep === 2
      ? "Enter the 6-digit code from your email, then choose a new password."
      : copy.subtitle;
  const showSocial = mode !== "forgot" && !isMfaStep;

  return (
    <section className="auth-page auth-page--signin">
      <div className="signin-hero">
        <div className="signin-hero__intro">
          <div className="signin-hero__heading">
            <p className="eyebrow">Algorithco / Account</p>
            <h1 className="signin-hero__title">
              <span className="signin-hero__line">One account</span>
              <span className="signin-hero__line">for every</span>
              <span className="signin-hero__line">Algorithco product.</span>
            </h1>
          </div>
          <p className="signin-hero__lead">
            Sign in to access Guard and all current and future Algorithco
            products. One account, full control.
          </p>
          <ul className="signin-benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title}>
                <span className="signin-benefits__icon">{benefit.icon}</span>
                <span>
                  <strong>{benefit.title}</strong>
                  <small>{benefit.body}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="login-card">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="login-card__subtitle">{subtitle}</p>

          {success ? (
            <div className="login-card__success" role="status">
              <p>{success}</p>
              <button
                className="login-card__ghost"
                type="button"
                onClick={() => switchMode("signin")}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {showSocial ? (
                <>
                  <div className="login-card__social">
                    <button
                      className="social-button social-button--google"
                      type="button"
                      disabled={busy}
                      onClick={() => startSocial("google")}
                    >
                      <GoogleIcon />
                      {socialPending === "google"
                        ? "Redirecting…"
                        : "Continue with Google"}
                    </button>
                    <button
                      className="social-button social-button--github"
                      type="button"
                      disabled={busy}
                      onClick={() => startSocial("github")}
                    >
                      <GitHubIcon />
                      {socialPending === "github"
                        ? "Redirecting…"
                        : "Continue with GitHub"}
                    </button>
                  </div>
                  <div className="login-card__divider" aria-hidden="true">
                    <span>or</span>
                  </div>
                </>
              ) : null}

              {error ? (
                <p className="form-error" role="alert">
                  {error}
                </p>
              ) : null}

              <form noValidate onSubmit={handleSubmit}>
                {mode === "signup" ? (
                  <div className="field">
                    <label htmlFor="login-name">Name</label>
                    <div className="field__control">
                      <UserIcon />
                      <input
                        id="login-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        maxLength={200}
                        placeholder="Ada Lovelace"
                        value={name}
                        disabled={busy}
                        aria-invalid={Boolean(error)}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}

                {isMfaStep ? (
                  <p className="field__hint">
                    Signing in as {email}.{" "}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setSigninStep("credentials");
                        setPassword("");
                        setTotp("");
                        setError("");
                      }}
                    >
                      Use a different account
                    </button>
                  </p>
                ) : mode === "forgot" && forgotStep === 2 ? (
                  <p className="field__hint">
                    Code sent to {email}.{" "}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setForgotStep(1);
                        setError("");
                      }}
                    >
                      Use a different email
                    </button>
                  </p>
                ) : (
                  <div className="field">
                    <label htmlFor="login-email">Email</label>
                    <div className="field__control">
                      <MailIcon />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={320}
                        placeholder="you@example.com"
                        value={email}
                        disabled={busy}
                        aria-invalid={Boolean(error)}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>
                )}

                {mode === "forgot" && forgotStep === 2 ? (
                  <>
                    <div className="field">
                      <label htmlFor="login-reset-code">6-digit code</label>
                      <div className="field__control">
                        <LockIcon />
                        <input
                          id="login-reset-code"
                          name="code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          minLength={6}
                          maxLength={6}
                          placeholder="123456"
                          value={resetCode}
                          disabled={busy}
                          aria-invalid={Boolean(error)}
                          onChange={(event) => setResetCode(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="login-new-password">New password</label>
                      <div className="field__control">
                        <LockIcon />
                        <input
                          id="login-new-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          maxLength={128}
                          placeholder="Use 12–128 characters"
                          value={password}
                          disabled={busy}
                          aria-invalid={Boolean(error)}
                          onChange={(event) => setPassword(event.target.value)}
                        />
                        <button
                          className="field__toggle"
                          type="button"
                          disabled={busy}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword((value) => !value)}
                        >
                          <EyeIcon off={showPassword} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                {mode !== "forgot" && !isMfaStep ? (
                  <div className="field">
                    <label htmlFor="login-password">Password</label>
                    <div className="field__control">
                      <LockIcon />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          mode === "signup"
                            ? "new-password"
                            : "current-password"
                        }
                        maxLength={128}
                        placeholder="Enter your password"
                        value={password}
                        disabled={busy}
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                          mode === "signup" ? "password-hint" : undefined
                        }
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <button
                        className="field__toggle"
                        type="button"
                        disabled={busy}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        <EyeIcon off={showPassword} />
                      </button>
                    </div>
                    {mode === "signup" ? (
                      <small id="password-hint" className="field__hint">
                        Use 12–128 characters.
                      </small>
                    ) : null}
                  </div>
                ) : null}

                {isMfaStep ? (
                  <div className="field">
                    <label htmlFor="login-totp">
                      Authenticator or recovery code
                    </label>
                    <div className="field__control">
                      <LockIcon />
                      <input
                        id="login-totp"
                        name="totp"
                        type="text"
                        autoComplete="one-time-code"
                        minLength={6}
                        maxLength={64}
                        placeholder="6-digit or recovery code"
                        autoFocus
                        value={totp}
                        disabled={busy}
                        aria-invalid={Boolean(error)}
                        onChange={(event) => setTotp(event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}

                {mode === "signin" && !isMfaStep ? (
                  <p className="login-card__forgot">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      disabled={busy}
                    >
                      Forgot password?
                    </button>
                  </p>
                ) : null}

                <button
                  className="login-card__submit"
                  type="submit"
                  disabled={busy}
                >
                  {pending
                    ? mode === "signup"
                      ? "Creating account…"
                      : mode === "forgot"
                        ? forgotStep === 2
                          ? "Changing password…"
                          : "Sending code…"
                        : isMfaStep
                          ? "Verifying…"
                          : "Signing in…"
                    : mode === "signup"
                      ? "Create account"
                      : mode === "forgot"
                        ? forgotStep === 2
                          ? "Change password"
                          : "Send reset code"
                        : isMfaStep
                          ? "Verify and sign in"
                          : "Sign in"}
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              {!isMfaStep ? (
                <p className="login-card__switch">
                  {mode === "signin" ? (
                    <>
                      Don&rsquo;t have an account?{" "}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => switchMode("signup")}
                      >
                        Create account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => switchMode("signin")}
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
      {socialChallenge ? (
        <dialog
          ref={socialDialogRef}
          className="social-completion"
          aria-labelledby="social-completion-title"
          aria-describedby="social-completion-description"
          onCancel={(event) => {
            event.preventDefault();
            window.location.assign("/signin");
          }}
        >
          <div className="social-completion__card">
            <p className="eyebrow">
              {socialChallenge.provider === "github" ? "GitHub" : "Google"}{" "}
              verified
            </p>
            <h2 id="social-completion-title">
              {socialStep === "mfa"
                ? "One last security check"
                : socialChallenge.passwordMode === "create"
                  ? "Secure your account"
                  : "Confirm your account"}
            </h2>
            <p
              id="social-completion-description"
              className="social-completion__copy"
            >
              {socialStep === "mfa"
                ? "Enter your authenticator or recovery code."
                : socialChallenge.passwordMode === "create"
                  ? `Create a password for ${socialChallenge.email}. Google, GitHub, and email will all open this same account.`
                  : `Enter the Account password for ${socialChallenge.email} to securely use the same account.`}
            </p>
            {socialError ? (
              <p className="form-error" role="alert">
                {socialError}
              </p>
            ) : null}
            <form noValidate onSubmit={handleSocialSubmit}>
              <div className="field">
                <label htmlFor="social-completion-secret">
                  {socialStep === "mfa"
                    ? "Authenticator or recovery code"
                    : socialChallenge.passwordMode === "create"
                      ? "Create password"
                      : "Account password"}
                </label>
                <div className="field__control">
                  <LockIcon />
                  <input
                    id="social-completion-secret"
                    name={socialStep === "mfa" ? "code" : "password"}
                    type={
                      socialStep === "mfa" || showSocialPassword
                        ? "text"
                        : "password"
                    }
                    inputMode={socialStep === "mfa" ? "numeric" : undefined}
                    autoComplete={
                      socialStep === "mfa"
                        ? "one-time-code"
                        : socialChallenge.passwordMode === "create"
                          ? "new-password"
                          : "current-password"
                    }
                    minLength={
                      socialStep === "mfa"
                        ? 6
                        : socialChallenge.passwordMode === "create"
                          ? 12
                          : 1
                    }
                    maxLength={socialStep === "mfa" ? 64 : 128}
                    autoFocus
                    required
                    value={socialStep === "mfa" ? socialMfa : socialPassword}
                    disabled={socialCompleting}
                    aria-invalid={Boolean(socialError)}
                    onChange={(event) =>
                      socialStep === "mfa"
                        ? setSocialMfa(event.target.value)
                        : setSocialPassword(event.target.value)
                    }
                  />
                  {socialStep === "password" ? (
                    <button
                      className="field__toggle"
                      type="button"
                      disabled={socialCompleting}
                      aria-label={
                        showSocialPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showSocialPassword}
                      onClick={() => setShowSocialPassword((value) => !value)}
                    >
                      <EyeIcon off={showSocialPassword} />
                    </button>
                  ) : null}
                </div>
                {socialStep === "password" &&
                socialChallenge.passwordMode === "create" ? (
                  <small className="field__hint">Use 12–128 characters.</small>
                ) : null}
              </div>
              <div className="social-completion__actions">
                <button
                  className="login-card__submit"
                  type="submit"
                  disabled={socialCompleting}
                >
                  {socialCompleting
                    ? "Checking…"
                    : socialStep === "mfa"
                      ? "Verify and sign in"
                      : "Continue"}
                  <span aria-hidden="true">→</span>
                </button>
                <a href="/signin">Cancel</a>
              </div>
            </form>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
