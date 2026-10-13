"use client";

import { useQuery } from "@tanstack/react-query";
import { useDashboardSession } from "@/components/dashboard-shell";
import { AuditTable } from "@/components/guard/audit-table";
import { ErrorMessage } from "@/components/guard/error-message";
import { listAudit } from "@/lib/guard-api";

export default function GuardHistoryPage() {
  const session = useDashboardSession();
  const audit = useQuery({
    queryKey: ["guard", "audit", session.orgId, 50],
    queryFn: () =>
      listAudit({ org_id: session.orgId, limit: 50 }, session.token),
    enabled: session.signedIn && session.orgId !== "",
    refetchInterval: 5_000,
  });
  return (
    <div className="guard-stack">
      <div className="guard-heading">
        <div>
          <p className="eyebrow">Last 50 decisions</p>
          <h1>Decision history</h1>
          <p className="muted">
            Action, reason, confidence and latency of each decision.
          </p>
        </div>
        <span className="status-pill status-pill--ok">Live · every 5 s</span>
      </div>
      <ErrorMessage error={audit.error} />
      {audit.isPending ? (
        <div className="guard-card muted">Loading history…</div>
      ) : (
        <AuditTable records={audit.data?.records ?? []} />
      )}
    </div>
  );
}
