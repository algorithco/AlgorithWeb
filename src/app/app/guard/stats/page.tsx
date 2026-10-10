"use client";

import { useQuery } from "@tanstack/react-query";
import { useDashboardSession } from "@/components/dashboard-shell";
import { ErrorMessage } from "@/components/guard/error-message";
import { MetricCard } from "@/components/guard/metric-card";
import { queryGuardStats } from "@/lib/guard-api";

const percent = (value: number, total: number) =>
  total ? `${Math.round((value / total) * 100)}%` : "0%";

export default function GuardStatsPage() {
  const session = useDashboardSession();
  const stats = useQuery({
    queryKey: ["guard", "stats", session.orgId, "full"],
    queryFn: () =>
      queryGuardStats(
        { org_id: session.orgId, granularity: "day", limit: 90, top_n: 10 },
        session.token,
      ),
    enabled: session.signedIn && session.orgId !== "",
  });
  const data = stats.data;
  return (
    <div className="guard-stack">
      <div className="guard-heading">
        <div>
          <p className="eyebrow">
            <span className="keep-case">AlgorithGuard</span> · Insights
          </p>
          <h2>Usage statistics</h2>
          <p className="muted">
            A 90-day view of decisions, projects, users, and response time.
          </p>
        </div>
        <span className="status-pill">90 days</span>
      </div>
      <ErrorMessage error={stats.error} />
      <div className="guard-metrics">
        <MetricCard label="Total" value={data?.total ?? 0} />
        <MetricCard
          label="Allowed"
          value={percent(data?.allow ?? 0, data?.total ?? 0)}
          tone="allow"
        />
        <MetricCard
          label="Asked"
          value={percent(data?.ask ?? 0, data?.total ?? 0)}
          tone="ask"
        />
        <MetricCard
          label="Denied"
          value={percent(data?.deny ?? 0, data?.total ?? 0)}
          tone="deny"
        />
      </div>
      <div className="guard-grid">
        <article className="guard-card">
          <p className="eyebrow">Per project</p>
          <ul className="guard-stat-list">
            {(data?.per_project ?? []).map((row) => (
              <li key={row.project}>
                <span>{row.project}</span>
                <strong>{row.total}</strong>
              </li>
            ))}
            {!data?.per_project?.length ? (
              <li className="muted">No project data yet.</li>
            ) : null}
          </ul>
        </article>
        <article className="guard-card">
          <p className="eyebrow">Per user</p>
          <ul className="guard-stat-list">
            {(data?.per_user ?? []).map((row) => (
              <li key={row.user_id}>
                <span className="guard-code">{row.user_id}</span>
                <strong>{row.total}</strong>
              </li>
            ))}
            {!data?.per_user?.length ? (
              <li className="muted">No user data yet.</li>
            ) : null}
          </ul>
        </article>
      </div>
      <article className="guard-card">
        <p className="eyebrow">Performance</p>
        <h3>
          {Math.round(data?.avg_latency_ms ?? 0)} ms average decision latency
        </h3>
      </article>
    </div>
  );
}
