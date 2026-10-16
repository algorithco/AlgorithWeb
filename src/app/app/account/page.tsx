"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  DashboardIcon,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { dashboardRoutes } from "@/config/dashboard";
import {
  beginAccountLogin,
  clearAccountLocalSession,
} from "@/lib/account-auth";
import { getAccountOverview } from "@/lib/account-center";
import {
  confirmAccountDeletion,
  confirmPasswordChange,
  requestAccountDeletionCode,
  requestPasswordChangeCode,
  validateEmailCode,
  validateNewPassword,
  validateResetCode,
} from "@/lib/account-forms";
import { displayTime } from "@/lib/dashboard-format";
import {
  ActiveSessions,
  ConnectedAccounts,
  ConnectedApps,
  ProfileEditor,
  SECURITY_CHANGED_KEY,
  TwoStepControl,
} from "./account-center-sections";

const PASSWORD_CHANGED_KEY = "algorithco-password-changed";

function DeleteAccountControl({ email }: { email: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"warning" | "code">("warning");
  const [code, setCode] = useState("");
  const [destination, setDestination] = useState(email);
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    if (pending) return;
    setOpen(false);
    setStep("warning");
    setCode("");
    setError("");
  };

  const sendCode = async () => {
    setPending(true);
    setError("");
    const result = await requestAccountDeletionCode();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDestination(result.email);
    setExpiresAt(result.expiresAt);
    setStep("code");
    setCode("");
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validateResetCode(code);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    setError("");
    const result = await confirmAccountDeletion(code);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }
    clearAccountLocalSession();
    window.location.replace("/signin?account=deletion-scheduled");
  };

  return (
    <>
      <button
        className="button account-center__delete-button"
        type="button"
        onClick={() => setOpen(true)}
      >
        Delete account
      </button>
      <dialog
        ref={dialogRef}
        className="dashboard-confirm-dialog account-delete-dialog"
        aria-labelledby="account-delete-title"
        aria-describedby="account-delete-description"
        // A half-typed code must survive a stray click or Esc; only the
        // explicit Cancel button dismisses this dialog.
        onCancel={(event) => event.preventDefault()}
      >
        <div className="dashboard-confirm-dialog__content">
          <p className="eyebrow">Danger zone</p>
          <h2 id="account-delete-title">
            {step === "warning" ? "Delete your account?" : "Verify it’s you"}
          </h2>
          <p id="account-delete-description">
            {step === "warning"
              ? "We’ll email a one-time code to verify this request. Confirming it immediately revokes every session and schedules permanent deletion after 24 hours."
              : `Enter the 6-digit code sent to ${destination}. It expires in 10 minutes.`}
          </p>
          {expiresAt && step === "code" ? (
            <p className="account-delete-dialog__expiry">
              Valid until {displayTime(expiresAt)}.
            </p>
          ) : null}
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          {step === "warning" ? (
            <div className="dashboard-confirm-dialog__actions">
              <button
                autoFocus
                className="button button--secondary"
                type="button"
                disabled={pending}
                onClick={close}
              >
                Cancel
              </button>
              <button
                className="button account-center__delete-button"
                type="button"
                disabled={pending}
                onClick={() => void sendCode()}
              >
                {pending ? "Sending…" : "Send verification code"}
              </button>
            </div>
          ) : (
            <form onSubmit={confirm}>
              <label htmlFor="account-delete-code">6-digit code</label>
              <input
                id="account-delete-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                minLength={6}
                maxLength={6}
                pattern="[0-9]{6}"
                required
                autoFocus
                value={code}
                disabled={pending}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <div className="dashboard-confirm-dialog__actions">
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={pending}
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={pending}
                  onClick={() => void sendCode()}
                >
                  Send new code
                </button>
                <button
                  className="button account-center__delete-button"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? "Scheduling…" : "Confirm deletion"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return (
    <span className="account-copy">
      <code title={value}>{value}</code>
      <button
        type="button"
        className="account-copy__button"
        aria-label={`Copy ${label}`}
        onClick={() => void copy()}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

function ChangePasswordControl({ email }: { email: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [destination, setDestination] = useState(email);
  const [expiresAt, setExpiresAt] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [signInRequired, setSignInRequired] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    if (pending) return;
    setOpen(false);
    setStep("intro");
    setCode("");
    setPassword("");
    setConfirmation("");
    setShowPassword(false);
    setError("");
    setSignInRequired(false);
  };

  const signInAgain = () => {
    clearAccountLocalSession();
    window.location.replace("/signin");
  };

  const sendCode = async () => {
    setPending(true);
    setError("");
    const result = await requestPasswordChangeCode();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      setSignInRequired(Boolean(result.signInRequired));
      return;
    }
    setDestination(result.email);
    setExpiresAt(result.expiresAt);
    setStep("form");
    setCode("");
  };

  const lengthOk = (() => {
    const length = Array.from(password).length;
    return length >= 12 && length <= 128;
  })();
  const matches = password.length > 0 && password === confirmation;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalidCode = validateEmailCode(code);
    const invalidPassword = validateNewPassword(password);
    if (invalidCode || invalidPassword) {
      setError(invalidCode ?? invalidPassword ?? "");
      return;
    }
    if (!matches) {
      setError("The two passwords do not match.");
      return;
    }
    setPending(true);
    setError("");
    const result = await confirmPasswordChange(code, password);
    if (!result.ok) {
      setPending(false);
      setError(result.error);
      setSignInRequired(Boolean(result.signInRequired));
      return;
    }
    // The server revoked every OIDC grant and other session but kept this
    // browser's Account session, so re-enter silently with fresh tokens.
    clearAccountLocalSession();
    try {
      window.sessionStorage.setItem(PASSWORD_CHANGED_KEY, "1");
    } catch {
      // The notice is optional.
    }
    try {
      await beginAccountLogin(dashboardRoutes.account);
    } catch {
      window.location.replace("/signin?password=changed");
    }
  };

  return (
    <>
      <button
        className="button button--secondary"
        type="button"
        onClick={() => setOpen(true)}
      >
        Change password
      </button>
      <dialog
        ref={dialogRef}
        className="dashboard-confirm-dialog account-password-dialog"
        aria-labelledby="account-password-title"
        aria-describedby="account-password-description"
        // Half-typed codes and passwords must survive a stray click or Esc;
        // only the explicit Cancel button dismisses this dialog.
        onCancel={(event) => event.preventDefault()}
      >
        <div className="dashboard-confirm-dialog__content">
          <div className="dashboard-confirm-dialog__heading">
            <span className="dashboard-confirm-dialog__icon">
              <DashboardIcon name="guard" />
            </span>
            <div>
              <p className="eyebrow">
                {step === "intro" ? "Step 1 of 2" : "Step 2 of 2"}
              </p>
              <h2 id="account-password-title">
                {step === "intro"
                  ? "Change your password"
                  : "Verify and update"}
              </h2>
            </div>
          </div>
          <p id="account-password-description">
            {step === "intro"
              ? `We’ll email a code to ${destination} to confirm it’s you. After the change, your other devices are signed out; you stay signed in here.`
              : `Enter the code sent to ${destination}${
                  expiresAt ? ` (valid until ${displayTime(expiresAt)})` : ""
                } and choose a new password.`}
          </p>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          {step === "intro" ? (
            <div className="dashboard-confirm-dialog__actions">
              <button
                className="button button--secondary"
                type="button"
                disabled={pending}
                onClick={close}
              >
                Cancel
              </button>
              {signInRequired ? (
                <button
                  className="button button--primary dashboard-confirm-dialog__confirm"
                  type="button"
                  onClick={signInAgain}
                >
                  Sign in again
                </button>
              ) : (
                <button
                  autoFocus
                  className="button button--primary dashboard-confirm-dialog__confirm"
                  type="button"
                  disabled={pending}
                  aria-busy={pending}
                  onClick={() => void sendCode()}
                >
                  {pending ? "Sending…" : "Email me a code"}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label htmlFor="account-password-code">
                Code from your email
              </label>
              <input
                id="account-password-code"
                className="account-password-dialog__code"
                type="text"
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={11}
                autoFocus
                value={code}
                disabled={pending}
                onChange={(event) =>
                  setCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^0-9A-Z-]/g, "")
                      .slice(0, 11),
                  )
                }
              />
              <label htmlFor="account-password-new">New password</label>
              <div className="account-password-dialog__field">
                <input
                  id="account-password-new"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  disabled={pending}
                  aria-describedby="account-password-rules"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="account-copy__button"
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <label htmlFor="account-password-confirm">
                Confirm new password
              </label>
              <input
                id="account-password-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmation}
                disabled={pending}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <ul
                id="account-password-rules"
                className="account-password-rules"
              >
                <li className={lengthOk ? "is-met" : undefined}>
                  12–128 characters
                </li>
                <li className={matches ? "is-met" : undefined}>
                  Both passwords match
                </li>
              </ul>
              <div className="dashboard-confirm-dialog__actions">
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={pending}
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={pending}
                  onClick={() => void sendCode()}
                >
                  Send new code
                </button>
                {signInRequired ? (
                  <button
                    className="button button--primary dashboard-confirm-dialog__confirm"
                    type="button"
                    onClick={signInAgain}
                  >
                    Sign in again
                  </button>
                ) : (
                  <button
                    className="button button--primary dashboard-confirm-dialog__confirm"
                    type="submit"
                    disabled={
                      pending ||
                      !lengthOk ||
                      !matches ||
                      validateEmailCode(code) !== null
                    }
                    aria-busy={pending}
                  >
                    {pending ? "Updating…" : "Update password"}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

const ACCOUNT_SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "connected-accounts", label: "Sign-in methods" },
  { id: "devices", label: "Devices" },
  { id: "delete-account", label: "Delete account" },
] as const;

export default function AccountPage() {
  const session = useDashboardSession();
  const overview = useQuery({
    queryKey: ["account", "overview", session.profile?.subject],
    queryFn: getAccountOverview,
  });
  const refreshOverview = () => void overview.refetch();
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(PASSWORD_CHANGED_KEY)) {
        window.sessionStorage.removeItem(PASSWORD_CHANGED_KEY);
        setPasswordChanged(true);
      }
      const security = window.sessionStorage.getItem(SECURITY_CHANGED_KEY);
      if (security) {
        window.sessionStorage.removeItem(SECURITY_CHANGED_KEY);
        setNotice({ ok: true, text: security });
      }
    } catch {
      // Storage is optional.
    }
    // Result of a Google/GitHub connection started from this page.
    const query = new URLSearchParams(window.location.search);
    const social = query.get("social");
    if (social) {
      setNotice(
        social === "linked"
          ? { ok: true, text: "Sign-in provider connected." }
          : social === "email_mismatch"
            ? {
                ok: false,
                text: "That provider account uses a different email address.",
              }
            : {
                ok: false,
                text: "The provider could not be connected. Try again.",
              },
      );
      query.delete("social");
      const rest = query.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`,
      );
    }
  }, []);

  // The sections fill in after the page opens, so a link to one of them (the
  // overview's Security) is followed again once the page has its full height.
  const settled = !overview.isPending;
  useEffect(() => {
    if (!settled) return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [settled]);

  const account = overview.data;
  const email = account?.profile.email ?? session.profile?.email;
  const displayName =
    account?.profile.name ??
    session.profile?.name ??
    email ??
    "Algorithco account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const pending = (
    <p className="account-empty">
      {overview.isPending ? "Loading…" : "Unavailable right now."}
    </p>
  );

  return (
    <div className="platform-dashboard account-center">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Manage your account.</h1>
          <p>
            One account for every Algorithco product: who you are, how you sign
            in and where you are signed in. Plans and payments are under{" "}
            <Link href={dashboardRoutes.billing}>Billing</Link>.
          </p>
        </div>
        <span
          className="dashboard-avatar dashboard-avatar--account"
          aria-hidden="true"
        >
          {initial}
        </span>
      </header>

      <nav className="account-sections" aria-label="Account sections">
        {ACCOUNT_SECTIONS.map((section) => (
          <a href={`#${section.id}`} key={section.id}>
            {section.label}
          </a>
        ))}
      </nav>

      {passwordChanged || notice || overview.error ? (
        <div className="dashboard-alerts">
          {passwordChanged ? (
            <p
              className="dashboard-alert dashboard-alert--success"
              role="status"
            >
              <strong>Password updated.</strong>
              <span>Your other devices were signed out.</span>
            </p>
          ) : null}
          {notice ? (
            <p
              className={`dashboard-alert${notice.ok ? " dashboard-alert--success" : ""}`}
              role={notice.ok ? "status" : "alert"}
            >
              <strong>{notice.text}</strong>
            </p>
          ) : null}
          {overview.error ? (
            <p className="dashboard-alert" role="alert">
              <strong>Account settings are unavailable.</strong>
              <span>{overview.error.message}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <section
        className="dashboard-panel"
        id="profile"
        aria-labelledby="profile-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Profile</p>
            <h2 id="profile-title">Personal details</h2>
            <p>This profile is shared across every Algorithco product.</p>
          </div>
          {account ? (
            <ProfileEditor
              key={`${account.profile.firstName}|${account.profile.lastName}`}
              profile={account.profile}
              onSaved={refreshOverview}
            />
          ) : null}
        </div>
        <dl className="dashboard-account-list">
          <div>
            <dt>Full name</dt>
            <dd>
              {account?.profile.name ?? session.profile?.name ?? "Not set"}
            </dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{email ?? "Not available"}</dd>
          </div>
          <div>
            <dt>Account ID</dt>
            <dd>
              {session.profile?.subject ? (
                <CopyValue label="account ID" value={session.profile.subject} />
              ) : (
                "Not available"
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="dashboard-panel"
        id="security"
        aria-labelledby="security-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Security</p>
            <h2 id="security-title">Password and two-step verification</h2>
            <p>Changes here are verified by a code sent to your email.</p>
          </div>
        </div>
        <ul className="account-security-list">
          <li>
            <div>
              <strong>Password</strong>
              <small>
                Confirm with an emailed code. Your other devices are signed out
                afterwards.
              </small>
            </div>
            <ChangePasswordControl email={email ?? "your verified email"} />
          </li>
          <li>
            <div>
              <strong>
                Two-step verification
                {account ? (
                  <span className="account-badge">
                    {account.security.mfaEnabled ? "On" : "Off"}
                  </span>
                ) : null}
              </strong>
              <small>
                {account?.security.mfaEnabled
                  ? "Sign-ins also need a code from your authenticator app or a recovery code."
                  : "Require a code from an authenticator app in addition to your password or provider."}
              </small>
            </div>
            {account ? <TwoStepControl security={account.security} /> : null}
          </li>
        </ul>
      </section>

      <section
        className="dashboard-panel"
        id="connected-accounts"
        aria-labelledby="connected-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Sign-in methods</p>
            <h2 id="connected-title">Connected accounts</h2>
            <p>Sign in with Google or GitHub in addition to your password.</p>
          </div>
        </div>
        {account ? (
          <ConnectedAccounts overview={account} onChanged={refreshOverview} />
        ) : (
          pending
        )}
      </section>

      <section
        className="dashboard-panel"
        id="devices"
        aria-labelledby="devices-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Devices</p>
            <h2 id="devices-title">Where you are signed in</h2>
            <p>
              Browsers and apps that are signed in with your account. Sign out
              any you do not recognise.
            </p>
          </div>
        </div>
        {account ? (
          <>
            <h3 className="account-list-title">Browsers</h3>
            <ActiveSessions overview={account} onChanged={refreshOverview} />
            <h3 className="account-list-title">Apps</h3>
            <ConnectedApps overview={account} onChanged={refreshOverview} />
          </>
        ) : (
          pending
        )}
      </section>

      <section
        className="dashboard-panel account-center__danger"
        id="delete-account"
        aria-labelledby="delete-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Danger zone</p>
            <h2 id="delete-title">Delete account</h2>
            <p>
              Revoke access now and permanently remove this account 24 hours
              later. A code sent to your email is required.
            </p>
          </div>
          <DeleteAccountControl email={email ?? "your verified email"} />
        </div>
      </section>
    </div>
  );
}
