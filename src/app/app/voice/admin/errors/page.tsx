"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDashboardSession } from "@/components/dashboard-shell";
import { VoiceAdminTabs } from "@/components/voice/admin-tabs";
import { DASHBOARD_LOCALE } from "@/lib/dashboard-format";
import {
  listVoiceAdminErrors,
  tokenHasScope,
  voiceErrorMessage,
} from "@/lib/voice-api";

function timeLabel(value: string) {
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

export default function VoiceAdminErrorsPage() {
  const session = useDashboardSession();
  const [page, setPage] = useState(1);
  const ready =
    session.signedIn && tokenHasScope(session.token, "voice:access");

  const errors = useQuery({
    queryKey: ["voice", "admin", "errors", page],
    queryFn: () => listVoiceAdminErrors(page, session.token),
    enabled: ready,
    retry: false,
    placeholderData: keepPreviousData,
  });
  const meta = errors.data?.meta;
  const lastPage = Math.max(1, meta?.totalPages ?? 1);

  return (
    <div className="platform-dashboard voice-dashboard">
      <VoiceAdminTabs />
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">
            <span className="keep-case">AlgorithVoice</span> admin
          </p>
          <h1>Errors</h1>
          <p>Failed requests to transcription providers, newest first.</p>
        </div>
      </header>

      {errors.error ? (
        <div className="dashboard-alerts">
          <p className="dashboard-alert" role="alert">
            <strong>The error log is unavailable.</strong>
            <span>{voiceErrorMessage(errors.error)}</span>
          </p>
        </div>
      ) : null}

      <section aria-labelledby="voice-errors-title" className="dashboard-panel">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Provider requests</p>
            <h2 id="voice-errors-title">Failures</h2>
          </div>
          {meta ? (
            <span className="status-pill">{meta.total} total</span>
          ) : null}
        </div>
        {errors.data?.data.length ? (
          <div className="voice-admin__table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Model</th>
                  <th scope="col">Code</th>
                  <th scope="col">Message</th>
                </tr>
              </thead>
              <tbody>
                {errors.data.data.map((row) => (
                  <tr key={row.id}>
                    <td className="is-nowrap">{timeLabel(row.createdAt)}</td>
                    <td>
                      <code>{row.model}</code>
                    </td>
                    <td>{row.errorCode ?? "—"}</td>
                    <td className="voice-admin__message">
                      {row.errorMessage ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            {errors.isPending ? "Loading errors…" : "No failed requests."}
          </p>
        )}
        {lastPage > 1 ? (
          <div className="voice-pager">
            <button
              className="button button--secondary"
              disabled={page <= 1 || errors.isFetching}
              onClick={() => setPage((current) => current - 1)}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {page} of {lastPage}
            </span>
            <button
              className="button button--secondary"
              disabled={page >= lastPage || errors.isFetching}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
