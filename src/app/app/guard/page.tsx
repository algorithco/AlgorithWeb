"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useDashboardSession } from "@/components/dashboard-shell";
import { AuditTable } from "@/components/guard/audit-table";
import { ErrorMessage } from "@/components/guard/error-message";
import { MetricCard } from "@/components/guard/metric-card";
import { dashboardRoutes } from "@/config/dashboard";
import { guardHealth, listAudit, queryGuardStats } from "@/lib/guard-api";

const LATEST = 5;

export default function GuardOverviewPage() {
  const session = useDashboardSession();
  const active = session.signedIn && session.orgId !== "";
  const health = useQuery({
    queryKey: ["guard", "health"],
    queryFn: guardHealth,
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
  const latest = useQuery({
    queryKey: ["guard", "audit", session.orgId, LATEST],
    queryFn: () =>
      listAudit({ org_id: session.orgId, limit: LATEST }, session.token),
    enabled: active,
  });

  const records = latest.data?.records ?? [];
  return (
    <div className="guard-stack">
      <div className="guard-heading">
        <div>
          <p className="eyebrow">Last 30 days</p>
          <h1>Overview</h1>
        </div>
        <span
          className={
            health.isSuccess ? "status-pill status-pill--ok" : "status-pill"
          }
        >
          {health.isSuccess
            ? "Service online"
            : health.isError
              ? "Service unreachable"
              : "Checking service"}
        </span>
      </div>
      <ErrorMessage error={stats.error ?? latest.error} />
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
      {latest.isSuccess && records.length === 0 ? (
        <article className="guard-card">
          <p className="eyebrow">Getting started</p>
          <h2>No decisions yet</h2>
          <p className="muted">
            Connect a coding agent to this workspace and its first decisions
            appear here.
          </p>
          <Link href={dashboardRoutes.guardDocs}>Connect an agent →</Link>
        </article>
      ) : null}
      {records.length > 0 ? (
        <section className="guard-stack" aria-labelledby="guard-latest-title">
          <div className="guard-subheading">
            <h2 id="guard-latest-title">Latest decisions</h2>
            <Link href={dashboardRoutes.guardHistory}>
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <AuditTable records={records} />
        </section>
      ) : null}
    </div>
  );
}
