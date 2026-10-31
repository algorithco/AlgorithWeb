"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useVoiceAccess, VoiceAlerts } from "@/components/voice/voice-access";
import { dashboardRoutes } from "@/config/dashboard";
import { displayDateTime } from "@/lib/dashboard-format";
import { saveBlob } from "@/lib/save-blob";
import {
  fetchVoiceUsageExport,
  formatSeconds,
  getVoiceModelUsage,
  listVoiceFailedRequests,
  listVoiceUsageRecords,
  type VoiceRecordFilters,
  voiceErrorMessage,
} from "@/lib/voice-api";
import { exportFileName, failedRequestLabel } from "@/lib/voice-usage";

const PAGE_SIZE = 25;
const ERRORS_PAGE_SIZE = 10;

const latency = (ms: number | null) =>
  ms === null ? "—" : `${(ms / 1000).toFixed(1)} s`;

export default function VoiceHistoryPage() {
  const { session, ready, subject } = useVoiceAccess();
  // What the form shows, and what the list was last asked for.
  const [draft, setDraft] = useState<VoiceRecordFilters>({});
  const [filters, setFilters] = useState<VoiceRecordFilters>({});

  const models = useQuery({
    queryKey: ["voice", "models", subject, 365],
    queryFn: () => getVoiceModelUsage(365, session.token),
    enabled: ready,
  });
  const records = useInfiniteQuery({
    queryKey: ["voice", "records", subject, filters],
    queryFn: ({ pageParam }) =>
      listVoiceUsageRecords(
        { ...filters, limit: PAGE_SIZE, cursor: pageParam },
        session.token,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: ready,
  });
  const failures = useInfiniteQuery({
    queryKey: ["voice", "failed", subject],
    queryFn: ({ pageParam }) =>
      listVoiceFailedRequests(
        { limit: ERRORS_PAGE_SIZE, cursor: pageParam },
        session.token,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: ready,
  });
  const exporter = useMutation({
    mutationFn: async () => {
      const blob = await fetchVoiceUsageExport("csv", filters, session.token);
      saveBlob(blob, exportFileName("csv"));
    },
  });

  const rows = records.data?.pages.flatMap((page) => page.records) ?? [];
  const failed = failures.data?.pages.flatMap((page) => page.errors) ?? [];
  const filtered = Boolean(filters.from || filters.to || filters.model);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ ...draft });
  }

  return (
    <div className="platform-dashboard voice-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">AlgorithVoice</p>
          <h1>Request history</h1>
          <p>
            Every cloud transcription request of this account: when, how long,
            which model and how fast. The words you dictated are not here: they
            stay in the app on your computer.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <button
            className="button button--secondary"
            disabled={!ready || exporter.isPending}
            onClick={() => exporter.mutate()}
            type="button"
          >
            {exporter.isPending
              ? "Preparing…"
              : filtered
                ? "Export these as CSV"
                : "Export CSV"}
          </button>
        </div>
      </header>

      <VoiceAlerts
        error={records.error ?? exporter.error ?? undefined}
        returnTo={dashboardRoutes.voiceHistory}
      />

      <section
        aria-labelledby="voice-requests-title"
        className="dashboard-panel"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Cloud requests</p>
            <h2 id="voice-requests-title">Requests</h2>
          </div>
          {records.data ? (
            <span className="dashboard-tag">
              {rows.length}
              {records.hasNextPage ? "+" : ""} shown
            </span>
          ) : null}
        </div>

        <form className="voice-filters" onSubmit={apply}>
          <label>
            <span>From</span>
            <input
              max={draft.to || undefined}
              onChange={(event) =>
                setDraft({ ...draft, from: event.target.value })
              }
              type="date"
              value={draft.from ?? ""}
            />
          </label>
          <label>
            <span>To</span>
            <input
              min={draft.from || undefined}
              onChange={(event) =>
                setDraft({ ...draft, to: event.target.value })
              }
              type="date"
              value={draft.to ?? ""}
            />
          </label>
          <label>
            <span>Model</span>
            <select
              onChange={(event) =>
                setDraft({ ...draft, model: event.target.value })
              }
              value={draft.model ?? ""}
            >
              <option value="">All models</option>
              {(models.data?.models ?? []).map((model) => (
                <option key={model.model} value={model.model}>
                  {model.model}
                </option>
              ))}
            </select>
          </label>
          <div className="voice-filters__actions">
            <button className="button button--primary" type="submit">
              Apply
            </button>
            {filtered ? (
              <button
                className="button button--secondary"
                onClick={() => {
                  setDraft({});
                  setFilters({});
                }}
                type="button"
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
        <p className="muted voice-hint">Filter dates are UTC days.</p>

        {rows.length ? (
          <div className="voice-admin__table voice-table">
            <table className="dashboard-stack-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Audio</th>
                  <th scope="col">Model</th>
                  <th scope="col">Response time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="is-nowrap">
                      {displayDateTime(row.recordedAt)}
                    </td>
                    <td data-label="Audio">{formatSeconds(row.seconds)}</td>
                    <td data-label="Model">
                      {row.model ? <code>{row.model}</code> : "—"}
                    </td>
                    <td data-label="Response time">{latency(row.latencyMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            {ready && records.isPending
              ? "Loading requests…"
              : filtered
                ? "No requests match these filters."
                : "No cloud requests yet."}
          </p>
        )}
        {records.hasNextPage ? (
          <div className="voice-pager">
            <button
              className="button button--secondary"
              disabled={records.isFetchingNextPage}
              onClick={() => void records.fetchNextPage()}
              type="button"
            >
              {records.isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="voice-failed-title" className="dashboard-panel">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Problems</p>
            <h2 id="voice-failed-title">Failed requests</h2>
            <p>
              Requests the speech service could not finish. They are not counted
              against your allowance.
            </p>
          </div>
        </div>
        {failures.error ? (
          <p className="form-error" role="alert">
            {voiceErrorMessage(failures.error)}
          </p>
        ) : failed.length ? (
          <div className="voice-admin__table voice-table">
            <table className="dashboard-stack-table">
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">What happened</th>
                  <th scope="col">Code</th>
                  <th scope="col">Model</th>
                </tr>
              </thead>
              <tbody>
                {failed.map((item) => (
                  <tr key={item.id}>
                    <td className="is-nowrap">
                      {displayDateTime(item.recordedAt)}
                    </td>
                    <td data-label="What happened">
                      {failedRequestLabel(item.code)}
                    </td>
                    <td data-label="Code">
                      <code>{item.code}</code>
                    </td>
                    <td data-label="Model">
                      <code>{item.model}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            {ready && failures.isPending ? "Loading…" : "No failed requests."}
          </p>
        )}
        {failures.hasNextPage ? (
          <div className="voice-pager">
            <button
              className="button button--secondary"
              disabled={failures.isFetchingNextPage}
              onClick={() => void failures.fetchNextPage()}
              type="button"
            >
              {failures.isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
