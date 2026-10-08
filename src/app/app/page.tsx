"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AnimatedNumber } from "@/components/animated-number";
import { ButtonLink } from "@/components/button-link";
import {
  DashboardIcon,
  type DashboardIconName,
  SignOutButton,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { dashboardRoutes, productDetailsRoute } from "@/config/dashboard";
import { type Product, products } from "@/config/products";
import {
  type CompanyEntitlement,
  createPortalSession,
  getMyEntitlements,
} from "@/lib/account-api";
import { displayDate, displayPlan } from "@/lib/dashboard-format";
import { listGuardOrgs } from "@/lib/guard-api";

function entitlementFor(entitlements: CompanyEntitlement[], product: Product) {
  return entitlements.find((item) => item.product === product.slug);
}

function productDestination(product: Product) {
  if (product.slug === "guard") {
    return {
      href: dashboardRoutes.guard,
      external: false,
      label: "Open Guard",
    };
  }
  return {
    href: product.externalUrl,
    external: true,
    label: `Open ${product.shortName}`,
  };
}

export default function DashboardPage() {
  const session = useDashboardSession();
  const entitlements = useQuery({
    queryKey: ["account", "entitlements", session.profile?.subject],
    queryFn: () => getMyEntitlements(undefined, session.token),
  });
  const guardWorkspaces = useQuery({
    queryKey: ["guard", "orgs", session.profile?.subject],
    queryFn: () => listGuardOrgs(session.token),
  });
  const billingPortal = useMutation({
    mutationFn: () =>
      createPortalSession(
        { return_url: `${window.location.origin}${dashboardRoutes.overview}` },
        session.token,
      ),
    onSuccess: ({ url }) => window.location.assign(url),
  });
  const items = entitlements.data?.entitlements ?? [];
  const paidPlans = items.filter(
    (item) => item.plan !== "free" && item.status !== "expired",
  ).length;
  const workspaceCount = guardWorkspaces.data?.orgs.length ?? 0;
  const displayName =
    session.profile?.name ?? session.profile?.email ?? "Algorithco account";
  const firstName = displayName.split(/[\s@]/)[0] || "there";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const accountReady = !entitlements.isPending && !entitlements.error;

  return (
    <div className="platform-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>
            Monitor your products, workspaces, access, and subscriptions from
            one clear command center.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <ButtonLink href={dashboardRoutes.guard}>Open Guard</ButtonLink>
          <ButtonLink href={dashboardRoutes.account} variant="secondary">
            Account center
          </ButtonLink>
        </div>
      </header>

      {(entitlements.error || guardWorkspaces.error) && (
        <div className="dashboard-alerts" aria-label="Service notices">
          {entitlements.error ? (
            <p className="dashboard-alert" role="alert">
              <strong>Billing data is unavailable.</strong>
              <span>Product access remains available. Try again shortly.</span>
            </p>
          ) : null}
          {guardWorkspaces.error ? (
            <p className="dashboard-alert" role="alert">
              <strong>Guard workspaces are unavailable.</strong>
              <span>Account and subscription data remain available.</span>
            </p>
          ) : null}
        </div>
      )}

      <section className="dashboard-summary" aria-label="Account summary">
        <SummaryCard
          detail="Available in your workspace"
          icon="apps"
          label="Products"
          loading={false}
          value={String(products.length)}
        />
        <SummaryCard
          detail="Across all products"
          icon="billing"
          label="Paid plans"
          loading={entitlements.isPending}
          value={String(paidPlans)}
        />
        <SummaryCard
          detail="Active Guard organizations"
          icon="guard"
          label="Workspaces"
          loading={guardWorkspaces.isPending}
          value={String(workspaceCount)}
        />
        <SummaryCard
          detail={
            accountReady
              ? "Synced with central account"
              : "Checking account data"
          }
          icon="spark"
          label="Account health"
          loading={entitlements.isPending}
          value={accountReady ? "Healthy" : "Checking"}
          wideValue
        />
      </section>

      <section
        className="dashboard-section"
        id="products"
        aria-labelledby="products-title"
      >
        <div className="dashboard-section__heading">
          <div>
            <p className="eyebrow">Product suite</p>
            <h2 id="products-title">Your products</h2>
            <p>Everything connected to your Algorithco identity.</p>
          </div>
          <Link href={dashboardRoutes.productsCatalog}>
            View product catalog <span>→</span>
          </Link>
        </div>
        <div className="dashboard-products">
          {products.map((product, index) => (
            <DashboardProduct
              entitlement={entitlementFor(items, product)}
              index={index}
              key={product.slug}
              product={product}
            />
          ))}
        </div>
      </section>

      <div className="dashboard-detail-grid">
        <section
          className="dashboard-panel dashboard-panel--plans"
          id="subscriptions"
          aria-labelledby="plans-title"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Billing</p>
              <h2 id="plans-title">Subscriptions</h2>
              <p>Plans and renewal details across your product suite.</p>
            </div>
            <span className="dashboard-secure-badge">Secure billing</span>
          </div>
          <div className="dashboard-plan-list">
            {products.map((product) => {
              const entitlement = entitlementFor(items, product);
              return (
                <div key={product.slug}>
                  <span
                    className={`dashboard-plan-mark dashboard-plan-mark--${product.accent}`}
                  >
                    {product.shortName.charAt(0)}
                  </span>
                  <span>
                    <strong>{product.shortName}</strong>
                    <small>
                      {entitlement?.status ??
                        (entitlements.isPending ? "Loading" : "Included")}
                    </small>
                  </span>
                  <span>
                    <strong>{displayPlan(entitlement?.plan)}</strong>
                    <small>
                      {displayDate(entitlement?.validUntil ?? null)}
                    </small>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="dashboard-panel__actions">
            <button
              className="button button--primary"
              type="button"
              disabled={billingPortal.isPending}
              onClick={() => billingPortal.mutate()}
            >
              <span>
                {billingPortal.isPending ? "Opening…" : "Manage billing"}
              </span>
              <span aria-hidden="true" className="button__mark">
                ↗
              </span>
            </button>
            <ButtonLink
              href={dashboardRoutes.productsCatalog}
              variant="secondary"
            >
              Compare plans
            </ButtonLink>
          </div>
          {billingPortal.error ? (
            <p className="form-error" role="alert">
              Billing portal could not be opened. Try again shortly.
            </p>
          ) : null}
        </section>

        <section
          className="dashboard-panel dashboard-panel--account"
          id="account"
          aria-labelledby="account-title"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Identity</p>
              <h2 id="account-title">Your account</h2>
              <p>One secure identity for the complete suite.</p>
            </div>
            <span
              className="dashboard-avatar dashboard-avatar--large"
              aria-hidden="true"
            >
              {initial}
            </span>
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
          <div className="dashboard-panel__actions">
            <ButtonLink href={dashboardRoutes.account}>
              Open account center
            </ButtonLink>
            <SignOutButton />
          </div>
          {session.logoutError ? (
            <p className="form-error" role="alert">
              {session.logoutError}
            </p>
          ) : null}
        </section>
      </div>

      <section className="dashboard-help" aria-labelledby="help-title">
        <div className="dashboard-help__icon">
          <DashboardIcon name="spark" />
        </div>
        <div>
          <p className="eyebrow">Need a hand?</p>
          <h2 id="help-title">Start with the Guard quickstart.</h2>
          <p>
            Connect a coding agent, review its first decisions, and tune your
            policy in minutes.
          </p>
        </div>
        <ButtonLink href={dashboardRoutes.guardDocs} variant="secondary">
          Open documentation
        </ButtonLink>
      </section>
    </div>
  );
}

function SummaryCard({
  detail,
  icon,
  label,
  loading,
  value,
  wideValue = false,
}: {
  detail: string;
  icon: DashboardIconName;
  label: string;
  loading: boolean;
  value: string;
  wideValue?: boolean;
}) {
  return (
    <article className="dashboard-summary-card" aria-busy={loading}>
      <div>
        <span className="dashboard-summary-card__icon">
          <DashboardIcon name={icon} />
        </span>
        <span>{label}</span>
      </div>
      <strong className={wideValue ? "is-wide" : undefined}>
        {loading ? (
          "—"
        ) : /^\d+$/.test(value) ? (
          <AnimatedNumber value={Number(value)} />
        ) : (
          value
        )}
      </strong>
      <small>{detail}</small>
    </article>
  );
}

function DashboardProduct({
  entitlement,
  index,
  product,
}: {
  entitlement: CompanyEntitlement | undefined;
  index: number;
  product: Product;
}) {
  const destination = productDestination(product);
  const configuredLimits = entitlement
    ? Object.values(entitlement.limits).filter(
        (value) => value !== null && value !== false,
      ).length
    : 0;
  return (
    <article
      className={`dashboard-product dashboard-product--${product.accent}`}
    >
      <div className="dashboard-product__top">
        <span className="dashboard-product__index">0{index + 1}</span>
        <StatusBadge status={product.status} label={product.statusLabel} />
      </div>
      <div className="dashboard-product__identity">
        <span className="dashboard-product__logo" aria-hidden="true">
          {product.slug === "guard" ? (
            <DashboardIcon name="guard" />
          ) : (
            <DashboardIcon name="pulse" />
          )}
        </span>
        <div>
          <p>{product.name}</p>
          <h3>{product.tagline}</h3>
        </div>
      </div>
      <p className="dashboard-product__description">{product.description}</p>
      <dl className="dashboard-product__facts">
        <div>
          <dt>Current plan</dt>
          <dd>{displayPlan(entitlement?.plan)}</dd>
        </div>
        <div>
          <dt>Configured limits</dt>
          <dd>{configuredLimits || "—"}</dd>
        </div>
        <div>
          <dt>Platforms</dt>
          <dd>{product.platforms.length}</dd>
        </div>
      </dl>
      <div className="dashboard-product__actions">
        <ButtonLink
          href={destination.href}
          external={destination.external}
          variant={product.slug === "guard" ? "primary" : "secondary"}
        >
          {destination.label}
        </ButtonLink>
        <Link href={productDetailsRoute(product.slug)}>
          View details <span>→</span>
        </Link>
      </div>
    </article>
  );
}
