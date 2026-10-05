"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useDashboardSession } from "@/components/dashboard-shell";
import { ErrorMessage } from "@/components/guard/error-message";
import { MetricCard } from "@/components/guard/metric-card";
import { dashboardRoutes } from "@/config/dashboard";
import {
  getGuardEntitlement,
  getGuardOrg,
  guardHealth,
  queryGuardStats,
} from "@/lib/guard-api";

export default function GuardOverviewPage() {
  const session = useDashboardSession();
  const active = session.signedIn && session.orgId !== "";
  const health = useQuery({
    queryKey: ["guard", "health"],
    queryFn: guardHealth,
  });
  const org = useQuery({
    queryKey: ["guard", "org", session.orgId],
    queryFn: () => getGuardOrg(session.orgId, session.token),
    enabled: active,
  });
  const entitlement = useQuery({
    queryKey: ["guard", "entitlement", session.profile?.subject],
    queryFn: () => getGuardEntitlement(session.token),
    enabled: session.signedIn,
  });
  const stats = useQuery({
    queryKey: ["guard", "stats", session.orgId, "overview"],
    queryFn: () =>
      queryGuardStats(
        { org_id: session.orgId, granularity: "day", limit: 30 },
        session.token,
      ),
    enabled: active,
  });

  const error = org.error ?? entitlement.error ?? stats.error;
  return (
    <div className="guard-stack">
      <div className="guard-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>
            Welcome,{" "}
            {session.profile?.name ?? session.profile?.email ?? "account"}.
          </h2>
        </div>
        <span
          className={
            health.isSuccess ? "status-pill status-pill--ok" : "status-pill"
          }
        >
          backend {health.isSuccess ? "online" : "checking"}
        </span>
      </div>
      <ErrorMessage error={error} />
      <div className="guard-metrics">
        <MetricCard label="Total decisions" value={stats.data?.total ?? 0} />
        <MetricCard
          label="Allowed"
          value={stats.data?.allow ?? 0}
          tone="allow"
        />
        <MetricCard label="Asked" value={stats.data?.ask ?? 0} tone="ask" />
        <MetricCard label="Denied" value={stats.data?.deny ?? 0} tone="deny" />
      </div>
      <div className="guard-grid">
        <article className="guard-card">
          <p className="eyebrow">Workspace</p>
          <h3>{org.data?.org.org_name ?? "Create a workspace to begin"}</h3>
          <p className="muted guard-code">
            {session.orgId || "No active workspace"}
          </p>
        </article>
        <article className="guard-card">
          <p className="eyebrow">Entitlement</p>
          <h3>{entitlement.data?.plan ?? "free"}</h3>
          <p className="muted">
            {entitlement.data?.status ?? "Loading"} ·{" "}
            {entitlement.data?.source ?? "Account"}
          </p>
          <Link href={dashboardRoutes.account}>
            Manage account and billing →
          </Link>
        </article>
      </div>
      <article className="guard-card">
        <p className="eyebrow">Quick actions</p>
        <div className="guard-actions">
          <Link href={dashboardRoutes.guardHistory}>View history</Link>
          <Link href={dashboardRoutes.guardPolicy}>Edit policy</Link>
          <Link href={dashboardRoutes.guardStats}>Open usage stats</Link>
          <Link href={dashboardRoutes.guardDocs}>Connect an agent</Link>
        </div>
      </article>
    </div>
  );
}
