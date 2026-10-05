"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { PlatformAuthBoundary } from "@/components/platform-auth-boundary";
import { StatusBadge } from "@/components/status-badge";
import { type Product, products } from "@/config/products";
import { siteConfig } from "@/config/site";
import type { PlatformSession } from "@/hooks/use-platform-session";
import {
  type CompanyEntitlement,
  createPortalSession,
  getMyEntitlements,
} from "@/lib/account-api";

function entitlementFor(entitlements: CompanyEntitlement[], product: Product) {
  return entitlements.find((item) => item.product === product.slug);
}

function displayPlan(value: string | undefined) {
  if (!value) return "Free";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function displayDate(value: string | null) {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function productDestination(product: Product) {
  if (product.slug === "guard") {
    return { href: "/app/guard", external: false, label: "Manage Guard" };
  }
  return {
    href: product.externalUrl,
    external: true,
    label: `Open ${product.shortName}`,
  };
}

export default function DashboardPage() {
  return (
    <PlatformAuthBoundary>
      {(session) => <Dashboard session={session} />}
    </PlatformAuthBoundary>
  );
}

function Dashboard({ session }: { session: PlatformSession }) {
  const entitlements = useQuery({
    queryKey: ["account", "entitlements", session.profile?.subject],
    queryFn: () => getMyEntitlements(undefined, session.token),
  });
  const billingPortal = useMutation({
    mutationFn: () =>
      createPortalSession(
        { return_url: `${window.location.origin}/app` },
        session.token,
      ),
    onSuccess: ({ url }) => window.location.assign(url),
  });
  const items = entitlements.data?.entitlements ?? [];
  const paidPlans = items.filter(
    (item) => item.plan !== "free" && item.status !== "expired",
  ).length;
  const displayName =
    session.profile?.name ?? session.profile?.email ?? "Algorithco account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  return (
    <section className="platform-dashboard">
      <header className="dashboard-hero">
        <div>
          <p className="eyebrow">Algorithco dashboard</p>
          <h1>Everything you use, in one place.</h1>
          <p className="dashboard-hero__lead">
            One account, one subscription view, and one home for every
            Algorithco product.
          </p>
        </div>
        <div className="dashboard-identity">
          <span className="dashboard-avatar" aria-hidden="true">
            {initial}
          </span>
          <span>
            <strong>{displayName}</strong>
            <small>{session.profile?.email ?? "Central account"}</small>
          </span>
        </div>
      </header>

      <div className="dashboard-metrics" aria-label="Account summary">
        <article>
          <span>Products</span>
          <strong>{products.length}</strong>
          <small>Connected to this account</small>
        </article>
        <article>
          <span>Paid plans</span>
          <strong>{entitlements.isPending ? "—" : paidPlans}</strong>
          <small>Across the whole company suite</small>
        </article>
        <article>
          <span>Identity</span>
          <strong>Unified</strong>
          <small>One sign-in for every product</small>
        </article>
      </div>

      {entitlements.error ? (
        <p className="dashboard-alert" role="alert">
          Subscription data is temporarily unavailable. Product access and local
          features remain available.
        </p>
      ) : null}

      <section className="dashboard-section" aria-labelledby="products-title">
        <div className="dashboard-section__heading">
          <div>
            <p className="eyebrow">Products</p>
            <h2 id="products-title">Your workspace</h2>
          </div>
          <Link href="/products">Explore all products →</Link>
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

      <div className="dashboard-lower-grid">
        <section className="dashboard-panel" aria-labelledby="plans-title">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Subscription</p>
              <h2 id="plans-title">Plans across products</h2>
            </div>
            <span className="status-pill status-pill--ok">Central billing</span>
          </div>
          <div className="dashboard-plan-list">
            {products.map((product) => {
              const entitlement = entitlementFor(items, product);
              return (
                <div key={product.slug}>
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
                      {displayDate(entitlement?.valid_until ?? null)}
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
              {billingPortal.isPending ? "Opening…" : "Manage billing"}
            </button>
            <ButtonLink href="/products" variant="secondary">
              Compare products
            </ButtonLink>
          </div>
          {billingPortal.error ? (
            <p className="form-error" role="alert">
              Billing portal could not be opened. Use Account settings or try
              again.
            </p>
          ) : null}
        </section>

        <section className="dashboard-panel" aria-labelledby="account-title">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Account</p>
              <h2 id="account-title">Your central identity</h2>
            </div>
          </div>
          <dl className="dashboard-account-list">
            <div>
              <dt>Name</dt>
              <dd>{session.profile?.name ?? "Not set"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{session.profile?.email ?? "Not available"}</dd>
            </div>
            <div>
              <dt>Account ID</dt>
              <dd>{session.profile?.subject ?? "Not available"}</dd>
            </div>
          </dl>
          <div className="dashboard-panel__actions">
            <ButtonLink href={siteConfig.accountUrl} external>
              Account settings
            </ButtonLink>
            <button
              className="button button--secondary"
              type="button"
              onClick={session.logout}
            >
              Sign out
            </button>
          </div>
        </section>
      </div>
    </section>
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
  const enabledFeatures = entitlement
    ? Object.values(entitlement.features).filter(Boolean).length
    : 0;
  return (
    <article
      className={`dashboard-product dashboard-product--${product.accent}`}
    >
      <div className="dashboard-product__top">
        <span className="dashboard-product__number">0{index + 1}</span>
        <StatusBadge status={product.status} label={product.statusLabel} />
      </div>
      <div>
        <p className="eyebrow">{product.name}</p>
        <h3>{product.tagline}</h3>
        <p>{product.description}</p>
      </div>
      <div className="dashboard-product__plan">
        <span>
          <small>Current plan</small>
          <strong>{displayPlan(entitlement?.plan)}</strong>
        </span>
        <span>
          <small>Account features</small>
          <strong>{enabledFeatures || "—"}</strong>
        </span>
      </div>
      <div className="dashboard-product__actions">
        <ButtonLink
          href={destination.href}
          external={destination.external}
          variant={product.slug === "guard" ? "primary" : "secondary"}
        >
          {destination.label}
        </ButtonLink>
        <Link href={`/products/${product.slug}`}>Product details</Link>
      </div>
    </article>
  );
}
