"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { PlatformAuthBoundary } from "@/components/platform-auth-boundary";
import type { PlatformSession } from "@/hooks/use-platform-session";
import { createGuardOrg, GuardApiError, listGuardOrgs } from "@/lib/guard-api";

const tabs = [
  ["Overview", "/app/guard"],
  ["History", "/app/guard/history"],
  ["Audit", "/app/guard/audit"],
  ["Policy", "/app/guard/policy"],
  ["Stats", "/app/guard/stats"],
] as const;

export default function GuardLayout({ children }: { children: ReactNode }) {
  return (
    <PlatformAuthBoundary>
      {(session) => <GuardConsole session={session}>{children}</GuardConsole>}
    </PlatformAuthBoundary>
  );
}

function GuardConsole({
  children,
  session,
}: {
  children: ReactNode;
  session: PlatformSession;
}) {
  const queryClient = useQueryClient();
  const [orgName, setOrgName] = useState("My workspace");
  const orgs = useQuery({
    queryKey: ["guard", "orgs", session.profile?.subject],
    queryFn: () => listGuardOrgs(session.token),
    enabled: session.signedIn,
  });
  const create = useMutation({
    mutationFn: () => createGuardOrg(orgName.trim(), session.token),
    onSuccess: (org) => {
      session.selectOrg(org.org_id);
      void queryClient.invalidateQueries({ queryKey: ["guard", "orgs"] });
    },
  });

  useEffect(() => {
    if (!session.orgId && orgs.data?.orgs[0]) {
      session.selectOrg(orgs.data.orgs[0].org_id);
    }
  }, [orgs.data, session.orgId, session.selectOrg]);

  const error =
    orgs.error instanceof GuardApiError ? orgs.error.message : undefined;
  return (
    <section className="guard-console">
      <header className="guard-console__header">
        <div>
          <Link className="dashboard-backlink" href="/app">
            ← Dashboard
          </Link>
          <h1>Guard</h1>
        </div>
        <div className="guard-account">
          <span>
            {session.profile?.name ?? session.profile?.email ?? "Account"}
          </span>
          <button type="button" onClick={session.logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="guard-workspace">
        <span className="eyebrow">Workspace</span>
        {orgs.data?.orgs.length ? (
          <select
            value={session.orgId}
            onChange={(event) => session.selectOrg(event.target.value)}
            aria-label="Guard workspace"
          >
            {orgs.data.orgs.map((org) => (
              <option key={org.org_id} value={org.org_id}>
                {org.org_name}
              </option>
            ))}
          </select>
        ) : orgs.isPending ? (
          <span className="muted">Loading workspaces…</span>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (orgName.trim()) create.mutate();
            }}
          >
            <input
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              maxLength={128}
              aria-label="Workspace name"
            />
            <button
              type="submit"
              disabled={!orgName.trim() || create.isPending}
            >
              {create.isPending ? "Creating…" : "Create workspace"}
            </button>
          </form>
        )}
        {error ? <span className="form-error">{error}</span> : null}
      </div>

      <nav className="guard-tabs" aria-label="Guard console">
        {tabs.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="guard-console__content">{children}</div>
    </section>
  );
}
