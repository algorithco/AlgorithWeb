"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  DashboardIcon,
  SignOutButton,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { dashboardRoutes } from "@/config/dashboard";
import { products } from "@/config/products";
import {
  type CompanyEntitlement,
  createPortalSession,
  getMyEntitlements,
} from "@/lib/account-api";
import {
  accountWebConfig,
  beginAccountLogin,
  clearAccountLocalSession,
} from "@/lib/account-auth";
import {
  confirmAccountDeletion,
  confirmPasswordChange,
  requestAccountDeletionCode,
  requestPasswordChangeCode,
  validateNewPassword,
  validateResetCode,
} from "@/lib/account-forms";
import { displayDate, displayPlan } from "@/lib/dashboard-format";

const PASSWORD_CHANGED_KEY = "algorithco-password-changed";

function entitlementFor(entitlements: CompanyEntitlement[], product: string) {
  return entitlements.find((item) => item.product === product);
}

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
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={close}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="dashboard-confirm-dialog__content">
          <p className="eyebrow">Danger zone</p>
          <h2 id="account-delete-title">
            {step === "warning" ? "Delete your account?" : "Verify it’s you"}
          </h2>
          <p id="account-delete-description">
            {step === "warning"
              ? "We’ll email a one-time code to verify this request. Confirming it immediately revokes every session and schedules permanent deletion after 30 days."
              : `Enter the 6-digit code sent to ${destination}. It expires in 10 minutes.`}
          </p>
          {expiresAt && step === "code" ? (
            <p className="account-delete-dialog__expiry">
              Valid until{" "}
              {new Intl.DateTimeFormat(undefined, {
                timeStyle: "short",
              }).format(new Date(expiresAt))}
              .
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
    new Date(value),
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
    const invalidCode = validateResetCode(code);
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
              ? `We’ll email a 6-digit code to ${destination} to confirm it’s you. After the change, your other devices are signed out; you stay signed in here.`
              : `Enter the code sent to ${destination}${
                  expiresAt ? ` (valid until ${formatTime(expiresAt)})` : ""
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
              <label htmlFor="account-password-code">6-digit code</label>
              <input
                id="account-password-code"
                className="account-password-dialog__code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                value={code}
                disabled={pending}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
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
                      pending || !lengthOk || !matches || code.length !== 6
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

export default function AccountPage() {
  const session = useDashboardSession();
  const entitlements = useQuery({
    queryKey: ["account", "entitlements", session.profile?.subject],
    queryFn: () => getMyEntitlements(undefined, session.token),
  });
  const billingPortal = useMutation({
    mutationFn: () =>
      createPortalSession(
        { return_url: `${window.location.origin}${dashboardRoutes.account}` },
        session.token,
      ),
    onSuccess: ({ url }) => window.location.assign(url),
  });
  const [passwordChanged, setPasswordChanged] = useState(false);
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(PASSWORD_CHANGED_KEY)) {
        window.sessionStorage.removeItem(PASSWORD_CHANGED_KEY);
        setPasswordChanged(true);
      }
    } catch {
      // Storage is optional.
    }
  }, []);
  const items = entitlements.data?.entitlements ?? [];
  const accountServiceUrl = (() => {
    try {
      return `${accountWebConfig().issuer}/`;
    } catch {
      return "/signin";
    }
  })();
  const displayName =
    session.profile?.name ?? session.profile?.email ?? "Algorithco account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const sessionExpiry = session.profile?.expiresAt
    ? new Date(session.profile.expiresAt * 1000)
    : null;

  return (
    <div className="platform-dashboard account-center">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Account settings</p>
          <h1>Manage your account.</h1>
          <p>
            One account for every Algorithco product. Update how you sign in,
            review billing, and control your data from here.
          </p>
        </div>
        <span
          className="dashboard-avatar dashboard-avatar--account"
          aria-hidden="true"
        >
          {initial}
        </span>
      </header>

      {passwordChanged ? (
        <p className="dashboard-alert dashboard-alert--success" role="status">
          <strong>Password updated.</strong>
          <span>Your other devices were signed out.</span>
        </p>
      ) : null}

      {entitlements.error ? (
        <p className="dashboard-alert" role="alert">
          <strong>Subscription data is unavailable.</strong>
          <span>
            Your profile, session, and deletion controls remain available.
          </span>
        </p>
      ) : null}

      <div className="account-center__grid">
        <section className="dashboard-panel account-center__profile">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Personal details</h2>
              <p>This profile is shared across every Algorithco product.</p>
            </div>
            <span className="dashboard-secure-badge">Authenticated</span>
          </div>
          <dl className="dashboard-account-list">
            <div>
              <dt>Full name</dt>
              <dd>{session.profile?.name ?? "Not set"}</dd>
            </div>
            <div>
              <dt>Email address</dt>
              <dd>{session.profile?.email ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd>
                {session.profile?.subject ? (
                  <CopyValue
                    label="account ID"
                    value={session.profile.subject}
                  />
                ) : (
                  "Not available"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="dashboard-panel account-center__session">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Security</p>
              <h2>Current session</h2>
              <p>Session status for this browser.</p>
            </div>
            <span className="account-center__icon">
              <DashboardIcon name="guard" />
            </span>
          </div>
          <dl className="account-center__session-list">
            <div>
              <dt>Status</dt>
              <dd>
                <i aria-hidden="true" /> Active
              </dd>
            </div>
            <div>
              <dt>Session expires</dt>
              <dd>
                {sessionExpiry
                  ? new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(sessionExpiry)
                  : "Not available"}
              </dd>
            </div>
          </dl>
          <SignOutButton>Sign out of this session</SignOutButton>
          {session.logoutError ? (
            <p className="form-error" role="alert">
              {session.logoutError}
            </p>
          ) : null}
        </section>
      </div>

      <section
        className="dashboard-panel account-center__security"
        id="security"
        aria-labelledby="security-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Sign-in & security</p>
            <h2 id="security-title">Protect your account</h2>
            <p>Changes here are verified by a code sent to your email.</p>
          </div>
          <span className="account-center__icon">
            <DashboardIcon name="settings" />
          </span>
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
            <ChangePasswordControl
              email={session.profile?.email ?? "your verified email"}
            />
          </li>
          <li>
            <div>
              <strong>Two-step verification</strong>
              <small>
                Add an authenticator app and recovery codes in the Account
                service.
              </small>
            </div>
            <a className="button button--secondary" href={accountServiceUrl}>
              Manage in Account
            </a>
          </li>
        </ul>
      </section>

      <section className="dashboard-panel account-center__plans">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Plans & billing</p>
            <h2>Product access</h2>
            <p>The plan available to this email in each product.</p>
          </div>
          <button
            className="button button--primary"
            type="button"
            disabled={billingPortal.isPending}
            onClick={() => billingPortal.mutate()}
          >
            {billingPortal.isPending ? "Opening…" : "Manage billing"}
          </button>
        </div>
        <div className="account-center__plan-grid">
          {products.map((product) => {
            const entitlement = entitlementFor(items, product.slug);
            return (
              <article key={product.slug}>
                <span
                  className={`dashboard-plan-mark dashboard-plan-mark--${product.accent}`}
                >
                  {product.shortName.charAt(0)}
                </span>
                <div>
                  <strong>{product.name}</strong>
                  <small>
                    {entitlement?.status ??
                      (entitlements.isPending ? "Loading" : "Included")}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>Plan</dt>
                    <dd>{displayPlan(entitlement?.plan)}</dd>
                  </div>
                  <div>
                    <dt>Valid until</dt>
                    <dd>{displayDate(entitlement?.validUntil)}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
        {billingPortal.error ? (
          <p className="form-error" role="alert">
            Billing portal could not be opened. Try again shortly.
          </p>
        ) : null}
      </section>

      <section
        className="dashboard-panel account-center__danger"
        id="delete-account"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Danger zone</p>
            <h2>Delete account</h2>
            <p>
              Revoke access now and permanently remove this account after a
              30-day grace period. A code sent to your email is required.
            </p>
          </div>
          <DeleteAccountControl
            email={session.profile?.email ?? "your verified email"}
          />
        </div>
      </section>
    </div>
  );
}
