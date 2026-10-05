"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorMessage } from "@/components/guard/error-message";
import { MetricCard } from "@/components/guard/metric-card";
import { usePlatformSession } from "@/hooks/use-platform-session";
import { queryGuardStats } from "@/lib/guard-api";

const percent = (value: number, total: number) =>
  total ? `${Math.round((value / total) * 100)}%` : "0%";

export default function GuardStatsPage() {
  const session = usePlatformSession();
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
      <p className="eyebrow">Guard</p>
      <h2>Usage statistics</h2>
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
