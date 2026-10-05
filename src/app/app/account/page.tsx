"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DashboardIcon,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { dashboardRoutes } from "@/config/dashboard";
import { products } from "@/config/products";
import {
  type CompanyEntitlement,
  createPortalSession,
  getMyEntitlements,
} from "@/lib/account-api";
import { displayDate, displayPlan } from "@/lib/dashboard-format";

function entitlementFor(entitlements: CompanyEntitlement[], product: string) {
  return entitlements.find((item) => item.product === product);
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
  const items = entitlements.data?.entitlements ?? [];
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
          <p className="eyebrow">Account center</p>
          <h1>Your account, in the dashboard.</h1>
          <p>
            Review identity, product access, billing, and session controls
            without leaving the Algorithco workspace.
          </p>
        </div>
        <span
          className="dashboard-avatar dashboard-avatar--account"
          aria-hidden="true"
        >
          {initial}
        </span>
      </header>

      {entitlements.error ? (
        <p className="dashboard-alert" role="alert">
          <strong>Subscription data is unavailable.</strong>
          <span>Your identity and session controls remain available.</span>
        </p>
      ) : null}

      <div className="account-center__grid">
        <section className="dashboard-panel account-center__profile">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Profile</p>
              <h2>Identity details</h2>
              <p>Your shared identity across every Algorithco product.</p>
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
              <dd>{session.profile?.subject ?? "Not available"}</dd>
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
          <button
            className="button button--secondary"
            type="button"
            disabled={session.loggingOut}
            onClick={() => void session.logout().catch(() => undefined)}
          >
            {session.loggingOut ? "Signing out…" : "Sign out of this session"}
          </button>
          {session.logoutError ? (
            <p className="form-error" role="alert">
              {session.logoutError}
            </p>
          ) : null}
        </section>
      </div>

      <section className="dashboard-panel account-center__plans">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Plans & billing</p>
            <h2>Product access</h2>
            <p>Every entitlement connected to this account.</p>
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
    </div>
  );
}
