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
          <p className="eyebrow">
            <span className="keep-case">AlgorithGuard</span>
          </p>
          <h2>Decision history</h2>
        </div>
        <span className="muted">Refreshes every five seconds</span>
      </div>
      <p className="muted">
        Action, reason, confidence, source, and latency for recent decisions.
      </p>
      <ErrorMessage error={audit.error} />
      {audit.isPending ? (
        <div className="guard-card muted">Loading history…</div>
      ) : (
        <AuditTable records={audit.data?.records ?? []} />
      )}
    </div>
  );
}
