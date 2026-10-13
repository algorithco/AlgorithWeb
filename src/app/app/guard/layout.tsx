"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import {
  DashboardIcon,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { dashboardRoutes } from "@/config/dashboard";
import { displayPlan } from "@/lib/dashboard-format";
import {
  createGuardOrg,
  GuardApiError,
  getGuardEntitlement,
  listGuardOrgs,
} from "@/lib/guard-api";

export default function GuardLayout({ children }: { children: ReactNode }) {
  const session = useDashboardSession();
  const queryClient = useQueryClient();
  const [orgName, setOrgName] = useState("My workspace");
  const orgs = useQuery({
    queryKey: ["guard", "orgs", session.profile?.subject],
    queryFn: () => listGuardOrgs(session.token),
    enabled: session.signedIn,
  });
  const entitlement = useQuery({
    queryKey: ["guard", "entitlement", session.profile?.subject],
    queryFn: () => getGuardEntitlement(session.token),
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

  const workspaces = orgs.data?.orgs ?? [];
  const activeOrg = workspaces.find((org) => org.org_id === session.orgId);
  const requestError = orgs.error ?? create.error;
  const error =
    requestError instanceof GuardApiError
      ? requestError.message
      : requestError instanceof Error
        ? requestError.message
        : undefined;

  return (
    <section className="guard-dashboard-layout">
      <header className="guard-workspace-toolbar">
        <div className="guard-workspace-toolbar__identity">
          <span aria-hidden="true">
            <DashboardIcon name="guard" />
          </span>
          <div>
            <p className="eyebrow">Workspace</p>
            <strong>
              {activeOrg?.org_name ??
                (orgs.isPending ? "Loading…" : "No workspace yet")}
            </strong>
            {activeOrg ? (
              <small className="guard-code">{activeOrg.org_id}</small>
            ) : orgs.isPending ? null : (
              <small>Create a workspace to begin</small>
            )}
          </div>
        </div>

        <div className="guard-workspace-toolbar__control">
          {workspaces.length > 1 ? (
            <label>
              <span>Switch workspace</span>
              <select
                value={session.orgId}
                onChange={(event) => session.selectOrg(event.target.value)}
              >
                {workspaces.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.org_name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {orgs.isSuccess && workspaces.length === 0 ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (orgName.trim()) create.mutate();
              }}
            >
              <label>
                <span>Workspace name</span>
                <input
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                  maxLength={128}
                />
              </label>
              <button
                className="button button--primary"
                type="submit"
                disabled={!orgName.trim() || create.isPending}
              >
                {create.isPending ? "Creating…" : "Create workspace"}
              </button>
            </form>
          ) : null}
          {entitlement.data ? (
            <Link
              className="guard-workspace-toolbar__plan"
              href={dashboardRoutes.billing}
              title="Plans and billing"
            >
              {displayPlan(entitlement.data.plan)} plan
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className="dashboard-alert" role="alert">
          <strong>AlgorithGuard workspace is unavailable.</strong>
          <span>{error}</span>
        </p>
      ) : null}

      <div className="guard-dashboard-content">{children}</div>
    </section>
  );
}
