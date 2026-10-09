"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useDashboardSession } from "@/components/dashboard-shell";
import { SummaryCard } from "@/components/dashboard-summary-card";
import { dashboardRoutes } from "@/config/dashboard";
import {
  formatSeconds,
  getVoiceAdminUsage,
  listVoiceAdminUsers,
  setVoiceUserBlocked,
  tokenHasScope,
  VoiceApiError,
  voiceErrorMessage,
} from "@/lib/voice-api";

function shortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default function VoiceAdminPage() {
  const session = useDashboardSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const ready =
    session.signedIn && tokenHasScope(session.token, "voice:access");

  const usage = useQuery({
    queryKey: ["voice", "admin", "usage"],
    queryFn: () => getVoiceAdminUsage(session.token),
    enabled: ready,
    retry: false,
  });
  const users = useQuery({
    queryKey: ["voice", "admin", "users", query],
    queryFn: () =>
      listVoiceAdminUsers({ search: query || undefined }, session.token),
    enabled: ready && usage.isSuccess,
  });
  const toggle = useMutation({
    mutationFn: (input: { id: string; blocked: boolean }) =>
      setVoiceUserBlocked(input.id, input.blocked, session.token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["voice", "admin"] });
    },
  });

  const forbidden =
    usage.error instanceof VoiceApiError && usage.error.status === 403;
  if (forbidden || (session.ready && !ready)) {
    return (
      <div className="platform-dashboard">
        <section className="dashboard-panel">
          <p className="eyebrow">Voice admin</p>
          <h1 className="voice-admin__title">No access</h1>
          <p className="muted">
            This page is for Voice operators. Ask an operator to add your
            account, or go back to{" "}
            <Link href={dashboardRoutes.voice}>Voice</Link>.
          </p>
        </section>
      </div>
    );
  }

  const error = usage.error ?? users.error ?? toggle.error;
  const stats = usage.data;
  return (
    <div className="platform-dashboard voice-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Voice admin</p>
          <h1>Service overview</h1>
          <p>
            Managed cloud transcription this month, from the metering ledger
            that quotas are enforced on.
          </p>
        </div>
      </header>

      {error ? (
        <div className="dashboard-alerts">
          <p className="dashboard-alert" role="alert">
            <strong>Admin data is unavailable.</strong>
            <span>{voiceErrorMessage(error)}</span>
          </p>
        </div>
      ) : null}

      <section className="dashboard-summary" aria-label="Voice service">
        <SummaryCard
          detail={`${stats?.requests ?? 0} requests`}
          icon="pulse"
          label="Cloud time"
          loading={usage.isPending}
          value={stats ? formatSeconds(stats.cloudSeconds) : "—"}
          wideValue
        />
        <SummaryCard
          detail={`of ${stats?.users ?? 0} users`}
          icon="account"
          label="Active this month"
          loading={usage.isPending}
          value={String(stats?.activeUsers ?? 0)}
        />
        <SummaryCard
          detail="Registered computers"
          icon="mic"
          label="Devices"
          loading={usage.isPending}
          value={String(stats?.devices ?? 0)}
        />
        <SummaryCard
          detail={`${stats?.avgLatencyMs ?? 0} ms average latency`}
          icon="guard"
          label="Blocked users"
          loading={usage.isPending}
          value={String(stats?.blockedUsers ?? 0)}
        />
      </section>

      <section aria-labelledby="voice-users-title" className="dashboard-panel">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Access</p>
            <h2 id="voice-users-title">Users</h2>
            <p>
              Voice knows users only by their Algorithco account ID. Blocking
              stops Voice for that account; the account itself is untouched.
            </p>
          </div>
        </div>
        <form
          className="voice-admin__search"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
          }}
        >
          <label htmlFor="voice-admin-search">Account ID</label>
          <input
            id="voice-admin-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Exact account ID"
            value={search}
          />
          <button className="button button--secondary" type="submit">
            Search
          </button>
        </form>
        {users.data?.data.length ? (
          <div className="voice-admin__table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account ID</th>
                  <th scope="col">Devices</th>
                  <th scope="col">First seen</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.data.data.map((user) => {
                  const blocked = user.blockedAt !== null;
                  const pending =
                    toggle.isPending && toggle.variables?.id === user.id;
                  const self = user.accountSubject === session.profile?.subject;
                  return (
                    <tr key={user.id}>
                      <td>
                        <code>{user.accountSubject}</code>
                      </td>
                      <td>{user._count.devices}</td>
                      <td>{shortDate(user.createdAt)}</td>
                      <td>
                        <span
                          className={`status-pill${blocked ? "" : " status-pill--ok"}`}
                        >
                          {blocked ? "blocked" : "active"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="button button--secondary"
                          disabled={pending || (self && !blocked)}
                          onClick={() =>
                            toggle.mutate({ id: user.id, blocked: !blocked })
                          }
                          title={self && !blocked ? "This is you" : undefined}
                          type="button"
                        >
                          {pending ? "Saving…" : blocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            {users.isPending ? "Loading users…" : "No users found."}
          </p>
        )}
      </section>
    </div>
  );
}
