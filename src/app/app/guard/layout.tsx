"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import {
  DashboardIcon,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { createGuardOrg, GuardApiError, listGuardOrgs } from "@/lib/guard-api";

export default function GuardLayout({ children }: { children: ReactNode }) {
  const session = useDashboardSession();
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

  const activeOrg = orgs.data?.orgs.find((org) => org.org_id === session.orgId);
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
            <p className="eyebrow">
              <span className="keep-case">AlgorithGuard</span> workspace
            </p>
            <strong>{activeOrg?.org_name ?? "Workspace control"}</strong>
            <small>
              {activeOrg
                ? "Policies, decisions, audit and usage"
                : "Choose or create a workspace to continue"}
            </small>
          </div>
        </div>

        <div className="guard-workspace-toolbar__control">
          {orgs.data?.orgs.length ? (
            <label>
              <span>Active workspace</span>
              <select
                value={session.orgId}
                onChange={(event) => session.selectOrg(event.target.value)}
                aria-label="AlgorithGuard workspace"
              >
                {orgs.data.orgs.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.org_name}
                  </option>
                ))}
              </select>
            </label>
          ) : orgs.isPending ? (
            <span className="guard-workspace-toolbar__loading">
              Loading workspaces…
            </span>
          ) : (
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
                  aria-label="Workspace name"
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
          )}
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
