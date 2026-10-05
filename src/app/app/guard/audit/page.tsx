"use client";

import { useQuery } from "@tanstack/react-query";
import { AuditTable } from "@/components/guard/audit-table";
import { ErrorMessage } from "@/components/guard/error-message";
import { usePlatformSession } from "@/hooks/use-platform-session";
import { listAudit } from "@/lib/guard-api";

export default function GuardAuditPage() {
  const session = usePlatformSession();
  const audit = useQuery({
    queryKey: ["guard", "audit", session.orgId, 200],
    queryFn: () =>
      listAudit({ org_id: session.orgId, limit: 200 }, session.token),
    enabled: session.signedIn && session.orgId !== "",
  });
  return (
    <div className="guard-stack">
      <p className="eyebrow">Guard</p>
      <h2>Audit log</h2>
      <p className="muted">
        Redacted payloads only. Use <code>algo log --show-egress</code> locally
        to inspect egress.
      </p>
      <ErrorMessage error={audit.error} />
      {audit.isPending ? (
        <div className="guard-card muted">Loading audit log…</div>
      ) : (
        <AuditTable records={audit.data?.records ?? []} />
      )}
    </div>
  );
}
