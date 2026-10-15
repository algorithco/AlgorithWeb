"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { DashboardIcon } from "@/components/dashboard-shell";
import { type Enrollment, MfaEnrollment } from "@/components/mfa-enrollment";
import { dashboardRoutes } from "@/config/dashboard";
import { getProduct } from "@/config/products";
import {
  createCheckoutSession,
  setSubscriptionCancellation,
} from "@/lib/account-api";
import {
  beginAccountLogin,
  clearAccountLocalSession,
} from "@/lib/account-auth";
import {
  type AccountOverview,
  type ActionResult,
  confirmMfaEnrollment,
  describeUserAgent,
  disableMfa,
  linkProviderUrl,
  REAUTH_URL,
  revokeApp,
  revokeSession,
  saveProfile,
  startMfaEnrollment,
  unlinkIdentity,
} from "@/lib/account-center";
import { validateMfaCode } from "@/lib/account-forms";
import {
  displayDate,
  displayDateTime,
  displayPlan,
} from "@/lib/dashboard-format";

export const SECURITY_CHANGED_KEY = "algorithco-security-changed";

const PROVIDER_NAMES: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

function useModal(open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

/** The server revoked app tokens; re-enter silently with the rotated session. */
async function reenterAccountCenter(notice: string) {
  clearAccountLocalSession();
  try {
    window.sessionStorage.setItem(SECURITY_CHANGED_KEY, notice);
  } catch {
    // The notice is optional.
  }
  try {
    await beginAccountLogin(dashboardRoutes.account);
  } catch {
    window.location.replace("/signin");
  }
}

function reauthenticate() {
  window.location.assign(REAUTH_URL);
}

function ErrorLine({
  result,
}: {
  result: { error: string; reauth?: boolean } | null;
}) {
  if (!result) return null;
  return (
    <p className="form-error" role="alert">
      {result.error}{" "}
      {result.reauth ? (
        <button
          type="button"
          className="auth-inline-action"
          onClick={reauthenticate}
        >
          Sign in again
        </button>
      ) : null}
    </p>
  );
}

type Failure = Extract<ActionResult, { ok: false }>;

/* ------------------------------------------------------------------------ */
/* Profile                                                                  */
/* ------------------------------------------------------------------------ */

export function ProfileEditor({
  profile,
  onSaved,
}: {
  profile: AccountOverview["profile"];
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);

  if (!editing)
    return (
      <button
        className="button button--secondary"
        type="button"
        onClick={() => {
          setFirstName(profile.firstName);
          setLastName(profile.lastName);
          setFailure(null);
          setEditing(true);
        }}
      >
        Edit name
      </button>
    );

  return (
    <form
      className="account-inline-form"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        const result = await saveProfile(firstName, lastName);
        setPending(false);
        if (!result.ok) {
          setFailure(result);
          return;
        }
        setEditing(false);
        onSaved();
      }}
    >
      <label htmlFor="account-first-name">First name</label>
      <input
        id="account-first-name"
        autoComplete="given-name"
        maxLength={100}
        value={firstName}
        disabled={pending}
        onChange={(event) => setFirstName(event.target.value)}
      />
      <label htmlFor="account-last-name">Last name</label>
      <input
        id="account-last-name"
        autoComplete="family-name"
        maxLength={100}
        value={lastName}
        disabled={pending}
        onChange={(event) => setLastName(event.target.value)}
      />
      <ErrorLine result={failure} />
      <div className="account-inline-form__actions">
        <button
          className="button button--secondary"
          type="button"
          disabled={pending}
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
        <button
          className="button button--primary"
          type="submit"
          disabled={pending || !firstName.trim() || !lastName.trim()}
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------ */
/* Two-step verification                                                    */
/* ------------------------------------------------------------------------ */

export function TwoStepControl({
  security,
}: {
  security: AccountOverview["security"];
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useModal(open);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [savedCodes, setSavedCodes] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const turningOff = security.mfaEnabled;

  const close = () => {
    if (pending) return;
    setOpen(false);
    setPassword("");
    setCode("");
    setEnrollment(null);
    setSavedCodes(false);
    setFailure(null);
  };

  const begin = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setFailure(null);
    const result = await startMfaEnrollment(
      security.hasPassword ? password : undefined,
    );
    setPending(false);
    if (!result.ok) {
      setFailure(result);
      return;
    }
    setPassword("");
    setEnrollment(result);
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = /^\d{6}$/.test(code.trim())
      ? null
      : "Enter the 6-digit code from your authenticator app.";
    if (invalid) {
      setFailure({ ok: false, error: invalid });
      return;
    }
    setPending(true);
    setFailure(null);
    const result = await confirmMfaEnrollment(code);
    if (!result.ok) {
      setPending(false);
      setFailure(result);
      return;
    }
    await reenterAccountCenter(
      "Two-step verification is on. Other devices were signed out.",
    );
  };

  const turnOff = async (event: React.FormEvent) => {
    event.preventDefault();
    const invalid = validateMfaCode(code);
    if (invalid) {
      setFailure({ ok: false, error: invalid });
      return;
    }
    setPending(true);
    setFailure(null);
    const result = await disableMfa(
      code,
      security.hasPassword ? password : undefined,
    );
    if (!result.ok) {
      setPending(false);
      setFailure(result);
      return;
    }
    await reenterAccountCenter(
      "Two-step verification is off. Other devices were signed out.",
    );
  };

  const needsFreshSignIn = !security.recentlyAuthenticated;
  const passwordField = security.hasPassword ? (
    <>
      <label htmlFor="account-mfa-password">Current password</label>
      <input
        id="account-mfa-password"
        type="password"
        autoComplete="current-password"
        value={password}
        disabled={pending}
        onChange={(event) => setPassword(event.target.value)}
      />
    </>
  ) : null;

  let body: ReactNode;
  if (needsFreshSignIn) {
    body = (
      <>
        <p>
          For your security, changes to two-step verification need a sign-in
          from the last 10 minutes.
        </p>
        <div className="dashboard-confirm-dialog__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="button button--primary dashboard-confirm-dialog__confirm"
            type="button"
            onClick={reauthenticate}
          >
            Sign in again
          </button>
        </div>
      </>
    );
  } else if (turningOff) {
    body = (
      <form onSubmit={turnOff} noValidate>
        {passwordField}
        <label htmlFor="account-mfa-code">Authenticator or recovery code</label>
        <input
          id="account-mfa-code"
          autoComplete="one-time-code"
          maxLength={64}
          value={code}
          disabled={pending}
          onChange={(event) => setCode(event.target.value)}
        />
        <ErrorLine result={failure} />
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
            className="button account-center__delete-button"
            type="submit"
            disabled={pending || (security.hasPassword && !password) || !code}
          >
            {pending ? "Turning off…" : "Turn off"}
          </button>
        </div>
      </form>
    );
  } else if (!enrollment) {
    body = (
      <form onSubmit={begin} noValidate>
        {passwordField ?? (
          <p className="account-mfa-note">
            Your account signs in with Google or GitHub, so no password is
            needed here.
          </p>
        )}
        <ErrorLine result={failure} />
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
            className="button button--primary dashboard-confirm-dialog__confirm"
            type="submit"
            disabled={pending || (security.hasPassword && !password)}
          >
            {pending ? "Preparing…" : "Continue"}
          </button>
        </div>
      </form>
    );
  } else {
    body = (
      <form onSubmit={confirm} noValidate>
        <MfaEnrollment
          enrollment={enrollment}
          code={code}
          onCodeChange={setCode}
          savedCodes={savedCodes}
          onSavedCodesChange={setSavedCodes}
          disabled={pending}
        />
        <ErrorLine result={failure} />
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
            className="button button--primary dashboard-confirm-dialog__confirm"
            type="submit"
            disabled={pending || code.length !== 6 || !savedCodes}
          >
            {pending ? "Verifying…" : "Turn on"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <button
        className="button button--secondary"
        type="button"
        onClick={() => setOpen(true)}
      >
        {turningOff ? "Turn off" : "Set up"}
      </button>
      <dialog
        ref={dialogRef}
        className="dashboard-confirm-dialog account-password-dialog account-mfa-dialog"
        aria-labelledby="account-mfa-title"
        // Typed codes must survive a stray click or Esc; only Cancel closes.
        onCancel={(event) => event.preventDefault()}
      >
        <div className="dashboard-confirm-dialog__content">
          <div className="dashboard-confirm-dialog__heading">
            <span className="dashboard-confirm-dialog__icon">
              <DashboardIcon name="guard" />
            </span>
            <div>
              <p className="eyebrow">Two-step verification</p>
              <h2 id="account-mfa-title">
                {turningOff
                  ? "Turn off two-step verification?"
                  : enrollment
                    ? "Connect your authenticator"
                    : "Protect your sign-in"}
              </h2>
            </div>
          </div>
          {open ? body : null}
        </div>
      </dialog>
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Connected accounts                                                       */
/* ------------------------------------------------------------------------ */

export function ConnectedAccounts({
  overview,
  onChanged,
}: {
  overview: AccountOverview;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const providers = Array.from(
    new Set([
      ...overview.providers,
      ...overview.identities.map((identity) => identity.provider),
    ]),
  );

  if (!providers.length)
    return <p className="account-empty">No sign-in providers are available.</p>;

  return (
    <>
      <ul className="account-security-list">
        {providers.map((provider) => {
          const linked = overview.identities.filter(
            (identity) => identity.provider === provider,
          );
          const name = PROVIDER_NAMES[provider] ?? provider;
          return (
            <li key={provider}>
              <div>
                <strong>{name}</strong>
                <small>
                  {linked.length
                    ? `Connected${linked[0]?.email ? ` as ${linked[0].email}` : ""}`
                    : `Sign in with your ${name} account.`}
                </small>
              </div>
              {linked.length ? (
                linked.map((identity) => (
                  <button
                    key={identity.id}
                    className="button button--secondary"
                    type="button"
                    disabled={pending !== null}
                    onClick={async () => {
                      setPending(identity.id);
                      setFailure(null);
                      const result = await unlinkIdentity(identity.id);
                      setPending(null);
                      if (!result.ok) {
                        setFailure(result);
                        return;
                      }
                      onChanged();
                    }}
                  >
                    {pending === identity.id ? "Disconnecting…" : "Disconnect"}
                  </button>
                ))
              ) : overview.providers.includes(
                  provider as "google" | "github",
                ) ? (
                <a
                  className="button button--secondary"
                  href={linkProviderUrl(provider as "google" | "github")}
                >
                  Connect
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
      <ErrorLine result={failure} />
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Sessions                                                                 */
/* ------------------------------------------------------------------------ */

export function ActiveSessions({
  overview,
  onChanged,
}: {
  overview: AccountOverview;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);

  return (
    <>
      <ul className="account-security-list">
        {overview.sessions.map((item) => (
          <li key={item.id}>
            <div>
              <strong>
                {describeUserAgent(item.userAgent)}
                {item.current ? (
                  <span className="account-badge">This device</span>
                ) : null}
              </strong>
              <small>
                Signed in {displayDateTime(item.createdAt)} · last active{" "}
                {displayDateTime(item.lastSeenAt)}
              </small>
            </div>
            <button
              className="button button--secondary"
              type="button"
              disabled={pending !== null}
              onClick={async () => {
                setPending(item.id);
                setFailure(null);
                const result = await revokeSession(item.id);
                setPending(null);
                if (!result.ok) {
                  setFailure(result);
                  return;
                }
                if (result.signedOut) {
                  clearAccountLocalSession();
                  window.location.replace("/signin");
                  return;
                }
                onChanged();
              }}
            >
              {pending === item.id
                ? "Signing out…"
                : item.current
                  ? "Sign out"
                  : "Sign out device"}
            </button>
          </li>
        ))}
      </ul>
      <ErrorLine result={failure} />
    </>
  );
}

/**
 * The apps signed in with the account (AlgorithVoice on a computer, the
 * command-line tools). Signing one out ends its sign-in there; the access it
 * already holds runs out within ten minutes.
 */
export function ConnectedApps({
  overview,
  onChanged,
}: {
  overview: AccountOverview;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const apps = overview.apps ?? [];

  if (!apps.length)
    return (
      <p className="account-empty">
        No app is signed in with your account. AlgorithVoice appears here once
        you sign in from it.
      </p>
    );

  return (
    <>
      <ul className="account-security-list">
        {apps.map((app) => (
          <li key={app.id}>
            <div>
              <strong>
                {app.name}
                {app.deviceName ? (
                  <span className="account-badge">{app.deviceName}</span>
                ) : null}
              </strong>
              <small>
                Signed in {displayDateTime(app.connectedAt)} · last used{" "}
                {displayDateTime(app.lastUsedAt)}
              </small>
            </div>
            <button
              className="button button--secondary"
              type="button"
              disabled={pending !== null}
              onClick={async () => {
                setPending(app.id);
                setFailure(null);
                const result = await revokeApp(app.id);
                setPending(null);
                if (!result.ok) {
                  setFailure(result);
                  return;
                }
                onChanged();
              }}
            >
              {pending === app.id ? "Signing out…" : "Sign out app"}
            </button>
          </li>
        ))}
      </ul>
      <ErrorLine result={failure} />
    </>
  );
}

/* ------------------------------------------------------------------------ */
/* Plans and subscriptions                                                  */
/* ------------------------------------------------------------------------ */

export function PlansAndSubscriptions({
  overview,
  token,
  onChanged,
}: {
  overview: AccountOverview;
  token: string;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const returnUrl = () => `${window.location.origin}${dashboardRoutes.billing}`;

  return (
    <div className="account-billing">
      {overview.subscriptions.length ? (
        <ul className="account-security-list">
          {overview.subscriptions.map((item) => (
            <li key={item.id}>
              <div>
                <strong>
                  {getProduct(item.product)?.name ?? item.product}{" "}
                  {displayPlan(item.plan)}
                  {item.org ? ` · ${item.org.name}` : ""}
                </strong>
                <small>
                  {displayPlan(item.status)}
                  {item.currentPeriodEnd
                    ? ` · ${item.cancelAtPeriodEnd ? "ends" : "renews"} ${displayDate(item.currentPeriodEnd)}`
                    : ""}
                  {item.seats ? ` · ${item.seats} seats` : ""}
                </small>
              </div>
              <button
                className="button button--secondary"
                type="button"
                disabled={pending !== null}
                onClick={async () => {
                  setPending(item.id);
                  setError("");
                  try {
                    await setSubscriptionCancellation(
                      item.id,
                      item.cancelAtPeriodEnd ? "resume" : "cancel",
                      token,
                    );
                    onChanged();
                  } catch {
                    setError(
                      "The subscription could not be updated. Try again shortly.",
                    );
                  } finally {
                    setPending(null);
                  }
                }}
              >
                {item.cancelAtPeriodEnd ? "Resume" : "Cancel renewal"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {overview.plans.length ? (
        <div className="account-plan-actions">
          {overview.plans.map((plan) => {
            const key = `${plan.product}:${plan.plan}:${plan.org?.id ?? ""}`;
            return (
              <button
                key={key}
                className="button button--secondary"
                type="button"
                disabled={pending !== null}
                onClick={async () => {
                  setPending(key);
                  setError("");
                  try {
                    const { url } = await createCheckoutSession(
                      {
                        product: plan.product,
                        plan: plan.plan,
                        ...(plan.org ? { org_id: plan.org.id } : {}),
                        success_url: returnUrl(),
                        cancel_url: returnUrl(),
                      },
                      token,
                    );
                    window.location.assign(url);
                  } catch {
                    setPending(null);
                    setError(
                      "This plan cannot be purchased right now. Try again later.",
                    );
                  }
                }}
              >
                {pending === key
                  ? "Opening checkout…"
                  : `Choose ${plan.productName} ${plan.planName}${plan.org ? ` for ${plan.org.name}` : ""}`}
              </button>
            );
          })}
        </div>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
