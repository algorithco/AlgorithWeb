"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { VoiceMark } from "@/components/brand-marks";
import { ButtonLink } from "@/components/button-link";
import {
  DashboardIcon,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { StatusBadge } from "@/components/status-badge";
import { dashboardRoutes } from "@/config/dashboard";
import { getProduct, type Product } from "@/config/products";
import { type CompanyEntitlement, getMyEntitlements } from "@/lib/account-api";
import { getAccountOverview } from "@/lib/account-center";
import { displayCount, displayDate, displayPlan } from "@/lib/dashboard-format";
import { listGuardOrgs, queryGuardStats } from "@/lib/guard-api";
import {
  formatSeconds,
  getVoiceUsage,
  listVoiceDevices,
  tokenHasScope,
} from "@/lib/voice-api";

type Fact = {
  label: string;
  value: string;
  detail?: string;
  loading?: boolean;
  /** 0 to 100: a thin bar under the value. */
  meter?: number;
};

type ProductAction = { label: string; href: string };

const UNAVAILABLE = { value: "—", detail: "Unavailable right now" };

function planFact(
  entitlement: CompanyEntitlement | undefined,
  state: { loading: boolean; failed: boolean },
): Fact {
  if (state.failed) return { label: "Plan", ...UNAVAILABLE };
  return {
    label: "Plan",
    loading: state.loading,
    value: displayPlan(entitlement?.plan),
    detail: entitlement?.validUntil
      ? `Until ${displayDate(entitlement.validUntil)}`
      : "No expiry",
  };
}

export default function DashboardPage() {
  const session = useDashboardSession();
  const subject = session.profile?.subject;
  const voiceConnected = tokenHasScope(session.token, "voice:access");

  const entitlements = useQuery({
    queryKey: ["account", "entitlements", subject],
    queryFn: () => getMyEntitlements(undefined, session.token),
  });
  const account = useQuery({
    queryKey: ["account", "overview", subject],
    queryFn: getAccountOverview,
  });
  const voiceUsage = useQuery({
    queryKey: ["voice", "usage", subject],
    queryFn: () => getVoiceUsage(session.token),
    enabled: voiceConnected,
  });
  const voiceDevices = useQuery({
    queryKey: ["voice", "devices", subject],
    queryFn: () => listVoiceDevices(session.token),
    enabled: voiceConnected,
  });
  const guardWorkspaces = useQuery({
    queryKey: ["guard", "orgs", subject],
    queryFn: () => listGuardOrgs(session.token),
  });
  const workspaces = guardWorkspaces.data?.orgs ?? [];
  const workspace =
    workspaces.find((org) => org.org_id === session.orgId) ?? workspaces[0];
  const guardStats = useQuery({
    queryKey: ["guard", "stats", workspace?.org_id, "overview"],
    queryFn: () =>
      queryGuardStats(
        { org_id: workspace?.org_id, granularity: "day", limit: 30 },
        session.token,
      ),
    enabled: workspace !== undefined,
  });

  const items = entitlements.data?.entitlements ?? [];
  const planState = {
    loading: entitlements.isPending,
    failed: entitlements.isError,
  };
  const displayName =
    session.profile?.name ?? session.profile?.email ?? "Algorithco account";
  const firstName =
    session.profile?.firstName ?? (displayName.split(/[\s@]/)[0] || "there");

  const usage = voiceUsage.data;
  const cloudLimit = usage?.cloudSecondsLimit;
  const cloudFact: Fact = !voiceConnected
    ? { label: "Cloud this month", value: "—", detail: "Open to connect" }
    : voiceUsage.isError
      ? { label: "Cloud this month", ...UNAVAILABLE }
      : {
          label: "Cloud this month",
          loading: voiceUsage.isPending,
          value:
            cloudLimit === null
              ? "Not included"
              : formatSeconds(usage?.cloudSecondsUsed ?? 0),
          detail:
            cloudLimit === null
              ? "Part of the Pro plan"
              : cloudLimit === "unlimited"
                ? "Unlimited on your plan"
                : `of ${formatSeconds(cloudLimit ?? 0)}`,
          meter:
            typeof cloudLimit === "number" && cloudLimit > 0
              ? Math.min(
                  100,
                  ((usage?.cloudSecondsUsed ?? 0) / cloudLimit) * 100,
                )
              : undefined,
        };
  const seats = voiceDevices.data?.seatsMax;
  const devicesFact: Fact = !voiceConnected
    ? { label: "Devices", value: "—", detail: "Open to connect" }
    : voiceDevices.isError
      ? { label: "Devices", ...UNAVAILABLE }
      : {
          label: "Devices",
          loading: voiceDevices.isPending,
          value: String(voiceDevices.data?.devices.length ?? 0),
          detail:
            typeof seats === "number"
              ? `of ${seats} ${seats === 1 ? "seat" : "seats"}`
              : seats === "unlimited"
                ? "Unlimited seats"
                : "Using cloud time",
        };

  const workspacesFact: Fact = guardWorkspaces.isError
    ? { label: "Workspaces", ...UNAVAILABLE }
    : {
        label: "Workspaces",
        loading: guardWorkspaces.isPending,
        value: String(workspaces.length),
        detail: workspace?.org_name ?? "Create one to begin",
      };
  const stats = guardStats.data;
  const decisionsFact: Fact = guardWorkspaces.isError
    ? { label: "Decisions, 30 days", ...UNAVAILABLE }
    : !workspace
      ? {
          label: "Decisions, 30 days",
          loading: guardWorkspaces.isPending,
          value: "—",
          detail: "No workspace yet",
        }
      : guardStats.isError
        ? { label: "Decisions, 30 days", ...UNAVAILABLE }
        : {
            label: "Decisions, 30 days",
            loading: guardStats.isPending,
            value: displayCount(stats?.total ?? 0),
            detail: stats?.total
              ? `${displayCount(stats.ask)} asked · ${displayCount(stats.deny)} denied`
              : "Connect an agent to begin",
          };

  const voice = getProduct("voice");
  const guard = getProduct("guard");
  const twoStepOff = account.data?.security.mfaEnabled === false;

  return (
    <div className="platform-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>Your products, plans and usage in one place.</p>
        </div>
      </header>

      {entitlements.isError || guardWorkspaces.isError ? (
        <div className="dashboard-alerts">
          {entitlements.isError ? (
            <p className="dashboard-alert" role="alert">
              <strong>Plan details are unavailable.</strong>
              <span>Your products still work. Try again shortly.</span>
            </p>
          ) : null}
          {guardWorkspaces.isError ? (
            <p className="dashboard-alert" role="alert">
              <strong>AlgorithGuard is unreachable.</strong>
              <span>Its workspaces and decisions cannot be shown yet.</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="dashboard-section" aria-labelledby="products-title">
        <div className="dashboard-section__heading">
          <h2 id="products-title">Your products</h2>
          <Link href={dashboardRoutes.billing}>
            Plans and billing <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="dashboard-products">
          {voice ? (
            <ProductCard
              facts={[
                planFact(
                  items.find((item) => item.product === "voice"),
                  planState,
                ),
                cloudFact,
                devicesFact,
              ]}
              more={{
                label: "Download the app",
                href: dashboardRoutes.voiceDownload,
              }}
              open={{
                label: "Open AlgorithVoice",
                href: dashboardRoutes.voice,
              }}
              product={voice}
            />
          ) : null}
          {guard ? (
            <ProductCard
              facts={[
                planFact(
                  items.find((item) => item.product === "guard"),
                  planState,
                ),
                workspacesFact,
                decisionsFact,
              ]}
              more={{
                label: "Connect an agent",
                href: dashboardRoutes.guardDocs,
              }}
              open={{
                label: "Open AlgorithGuard",
                href: dashboardRoutes.guard,
              }}
              product={guard}
            />
          ) : null}
        </div>
      </section>

      {twoStepOff ? (
        <section className="dashboard-nudge" aria-labelledby="two-step-title">
          <span className="dashboard-nudge__icon" aria-hidden="true">
            <DashboardIcon name="guard" />
          </span>
          <div>
            <h2 id="two-step-title">Turn on two-step verification</h2>
            <p>
              A code from an authenticator app keeps your account safe even if
              your password leaks.
            </p>
          </div>
          <ButtonLink href={dashboardRoutes.security} variant="secondary">
            Set up
          </ButtonLink>
        </section>
      ) : null}
    </div>
  );
}

function ProductCard({
  facts,
  more,
  open,
  product,
}: {
  facts: Fact[];
  more: ProductAction;
  open: ProductAction;
  product: Product;
}) {
  return (
    <article
      className={`dashboard-product dashboard-product--${product.accent}`}
    >
      <div className="dashboard-product__identity">
        <span className="dashboard-product__logo" aria-hidden="true">
          {product.slug === "guard" ? (
            <DashboardIcon name="guard" />
          ) : (
            <VoiceMark />
          )}
        </span>
        <div>
          <h3>{product.name}</h3>
          <p>{product.tagline}</p>
        </div>
        <StatusBadge status={product.status} label={product.statusLabel} />
      </div>
      <dl className="dashboard-product__facts">
        {facts.map((fact) => (
          <div aria-busy={fact.loading || undefined} key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>
              <strong>{fact.loading ? "—" : fact.value}</strong>
              {fact.meter === undefined || fact.loading ? null : (
                <span className="dashboard-product__meter" aria-hidden="true">
                  <span style={{ width: `${fact.meter}%` }} />
                </span>
              )}
              {fact.detail && !fact.loading ? (
                <small>{fact.detail}</small>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
      <div className="dashboard-product__actions">
        <ButtonLink href={open.href}>{open.label}</ButtonLink>
        <Link href={more.href}>
          {more.label} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
