"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useDashboardSession } from "@/components/dashboard-shell";
import { dashboardRoutes } from "@/config/dashboard";
import { products } from "@/config/products";
import {
  type CompanyEntitlement,
  createPortalSession,
  getMyEntitlements,
} from "@/lib/account-api";
import { getAccountOverview } from "@/lib/account-center";
import { displayDate, displayPlan } from "@/lib/dashboard-format";
import { PlansAndSubscriptions } from "../account/account-center-sections";

function entitlementFor(entitlements: CompanyEntitlement[], product: string) {
  return entitlements.find((item) => item.product === product);
}

export default function BillingPage() {
  const session = useDashboardSession();
  const entitlements = useQuery({
    queryKey: ["account", "entitlements", session.profile?.subject],
    queryFn: () => getMyEntitlements(undefined, session.token),
  });
  const overview = useQuery({
    queryKey: ["account", "overview", session.profile?.subject],
    queryFn: getAccountOverview,
  });
  // The Account service only returns to addresses on its own list, and of the
  // dashboard that is this page: billing opened from another one is refused.
  const billingPortal = useMutation({
    mutationFn: () =>
      createPortalSession(
        { return_url: `${window.location.origin}${dashboardRoutes.billing}` },
        session.token,
      ),
    onSuccess: ({ url }) => window.location.assign(url),
  });

  const items = entitlements.data?.entitlements ?? [];
  const account = overview.data;

  return (
    <div className="platform-dashboard account-center">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Plans and billing.</h1>
          <p>
            Your plan in each Algorithco product, and the subscriptions paid
            from this account.
          </p>
        </div>
      </header>

      {overview.error || entitlements.error ? (
        <div className="dashboard-alerts">
          {entitlements.error ? (
            <p className="dashboard-alert" role="alert">
              <strong>Plan details are unavailable.</strong>
              <span>Try again shortly.</span>
            </p>
          ) : null}
          {overview.error ? (
            <p className="dashboard-alert" role="alert">
              <strong>Subscriptions are unavailable.</strong>
              <span>{overview.error.message}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="dashboard-panel" aria-labelledby="plans-title">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Plans</p>
            <h2 id="plans-title">Your plans</h2>
            <p>What you can use in each product today.</p>
          </div>
        </div>
        <div className="account-center__plan-grid">
          {products.map((product) => {
            const entitlement = entitlementFor(items, product.slug);
            return (
              <article key={product.slug}>
                <span
                  className={`dashboard-plan-mark dashboard-plan-mark--${product.accent}`}
                  aria-hidden="true"
                >
                  {product.slug.charAt(0).toUpperCase()}
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
      </section>

      <section
        className="dashboard-panel"
        aria-labelledby="subscriptions-title"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Subscriptions</p>
            <h2 id="subscriptions-title">Subscriptions and payments</h2>
            <p>
              Upgrade, cancel a renewal, or change your payment method and see
              your invoices.
            </p>
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
        {account ? (
          <PlansAndSubscriptions
            overview={account}
            token={session.token}
            onChanged={() => {
              void overview.refetch();
              void entitlements.refetch();
            }}
          />
        ) : (
          <p className="account-empty">
            {overview.isPending ? "Loading…" : "Unavailable right now."}
          </p>
        )}
        {billingPortal.error ? (
          <p className="form-error" role="alert">
            Billing portal could not be opened. Try again shortly.
          </p>
        ) : null}
      </section>
    </div>
  );
}
