"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SummaryCard } from "@/components/dashboard-summary-card";
import { CloudMeter } from "@/components/voice/cloud-meter";
import { DailyUsageChart } from "@/components/voice/daily-usage-chart";
import { useVoiceAccess, VoiceAlerts } from "@/components/voice/voice-access";
import { dashboardRoutes } from "@/config/dashboard";
import { displayPlan } from "@/lib/dashboard-format";
import { saveBlob } from "@/lib/save-blob";
import {
  fetchVoiceUsageExport,
  formatSeconds,
  formatUtcDay,
  getVoiceDailyUsage,
  getVoiceModelUsage,
  getVoiceMonthlyUsage,
  getVoiceUsage,
  voiceErrorMessage,
} from "@/lib/voice-api";
import {
  exportFileName,
  formatMonth,
  rangeLabel,
  sharePercent,
  summarizeDays,
  USAGE_RANGES,
  type UsageRange,
} from "@/lib/voice-usage";

const MONTHS = 12;

export default function VoiceUsagePage() {
  const { session, ready, subject } = useVoiceAccess();
  const [range, setRange] = useState<UsageRange>(30);

  const usage = useQuery({
    queryKey: ["voice", "usage", subject],
    queryFn: () => getVoiceUsage(session.token),
    enabled: ready,
  });
  const daily = useQuery({
    queryKey: ["voice", "daily", subject, range],
    queryFn: () => getVoiceDailyUsage(range, session.token),
    enabled: ready,
  });
  const monthly = useQuery({
    queryKey: ["voice", "monthly", subject, MONTHS],
    queryFn: () => getVoiceMonthlyUsage(MONTHS, session.token),
    enabled: ready,
  });
  const models = useQuery({
    queryKey: ["voice", "models", subject, range],
    queryFn: () => getVoiceModelUsage(range, session.token),
    enabled: ready,
  });
  const exporter = useMutation({
    mutationFn: async (format: "csv" | "json") => {
      const blob = await fetchVoiceUsageExport(format, {}, session.token);
      saveBlob(blob, exportFileName(format));
    },
  });

  const error = usage.error ?? daily.error ?? monthly.error ?? models.error;
  const summary = daily.data ? summarizeDays(daily.data.daily) : null;
  const monthTotal = Math.max(
    0,
    ...(monthly.data?.months.map((month) => month.seconds) ?? []),
  );
  const modelTotal = (models.data?.models ?? []).reduce(
    (sum, model) => sum + model.seconds,
    0,
  );
  const loading = ready && daily.isPending;

  return (
    <div className="platform-dashboard voice-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">AlgorithVoice</p>
          <h1>Usage</h1>
          <p>
            Cloud transcription over time: by day, by month and by model. Local
            dictation runs on your computer and is never counted here.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <button
            className="button button--secondary"
            disabled={!ready || exporter.isPending}
            onClick={() => exporter.mutate("csv")}
            type="button"
          >
            {exporter.isPending && exporter.variables === "csv"
              ? "Preparing…"
              : "Export CSV"}
          </button>
          <button
            className="button button--secondary"
            disabled={!ready || exporter.isPending}
            onClick={() => exporter.mutate("json")}
            type="button"
          >
            {exporter.isPending && exporter.variables === "json"
              ? "Preparing…"
              : "Export JSON"}
          </button>
        </div>
      </header>

      <VoiceAlerts error={error} returnTo={dashboardRoutes.voiceUsage} />
      {exporter.error ? (
        <div className="dashboard-alerts">
          <p className="dashboard-alert" role="alert">
            <strong>The export did not download.</strong>
            <span>{voiceErrorMessage(exporter.error)}</span>
          </p>
        </div>
      ) : null}

      <div aria-label="Time range" className="voice-range" role="group">
        {USAGE_RANGES.map((days) => (
          <button
            aria-pressed={range === days}
            key={days}
            onClick={() => setRange(days)}
            type="button"
          >
            {rangeLabel(days)}
          </button>
        ))}
      </div>

      <div className="dashboard-summary">
        <SummaryCard
          detail={`in the last ${rangeLabel(range)}`}
          icon="pulse"
          label="Cloud time"
          loading={loading}
          value={summary ? formatSeconds(summary.seconds) : "—"}
        />
        <SummaryCard
          detail={
            summary
              ? `on ${summary.activeDays} ${summary.activeDays === 1 ? "day" : "days"}`
              : "requests"
          }
          icon="history"
          label="Requests"
          loading={loading}
          value={summary ? String(summary.requests) : "—"}
        />
        <SummaryCard
          detail="of audio per request"
          icon="mic"
          label="Average length"
          loading={loading}
          value={
            summary?.secondsPerRequest == null
              ? "—"
              : formatSeconds(summary.secondsPerRequest)
          }
        />
        <SummaryCard
          detail={
            summary?.busiest
              ? formatUtcDay(summary.busiest.date, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "no cloud use yet"
          }
          icon="spark"
          label="Busiest day"
          loading={loading}
          value={
            summary?.busiest ? formatSeconds(summary.busiest.seconds) : "—"
          }
        />
      </div>

      <section aria-labelledby="voice-daily-title" className="dashboard-panel">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Last {rangeLabel(range)}</p>
            <h2 id="voice-daily-title">Daily cloud time</h2>
            <p>Days are UTC days, like the monthly allowance.</p>
          </div>
        </div>
        {daily.data ? (
          <DailyUsageChart daily={daily.data.daily} />
        ) : (
          <p className="muted">
            {loading ? "Loading daily usage…" : "No usage data."}
          </p>
        )}
      </section>

      <div className="dashboard-detail-grid voice-usage-grid">
        <section
          aria-labelledby="voice-monthly-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Last {MONTHS} months</p>
              <h2 id="voice-monthly-title">By month</h2>
            </div>
          </div>
          {monthly.data ? (
            <div className="voice-admin__table voice-table">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Cloud time</th>
                    <th scope="col">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {[...monthly.data.months].reverse().map((month) => (
                    <tr key={month.month}>
                      <th scope="row">{formatMonth(month.month, "long")}</th>
                      <td>
                        <span className="voice-share">
                          <span
                            aria-hidden="true"
                            className="voice-share__track"
                          >
                            <span
                              className="voice-share__bar"
                              style={{
                                width: `${sharePercent(month.seconds, monthTotal)}%`,
                              }}
                            />
                          </span>
                          <span>{formatSeconds(month.seconds)}</span>
                        </span>
                      </td>
                      <td>{month.requests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">
              {ready && monthly.isPending
                ? "Loading months…"
                : "No usage data."}
            </p>
          )}
        </section>

        <div className="voice-stack">
          <section
            aria-labelledby="voice-month-title"
            className="dashboard-panel"
          >
            <div className="dashboard-panel__heading">
              <div>
                <p className="eyebrow">This month</p>
                <h2 id="voice-month-title">Allowance</h2>
              </div>
              {usage.data ? (
                <span className="dashboard-tag">
                  {displayPlan(usage.data.plan)} plan
                </span>
              ) : null}
            </div>
            {usage.data ? (
              <CloudMeter usage={usage.data} />
            ) : (
              <p className="muted">
                {ready && usage.isPending ? "Loading usage…" : "No usage data."}
              </p>
            )}
          </section>

          <section
            aria-labelledby="voice-models-title"
            className="dashboard-panel"
          >
            <div className="dashboard-panel__heading">
              <div>
                <p className="eyebrow">Last {rangeLabel(range)}</p>
                <h2 id="voice-models-title">By model</h2>
                <p>Which cloud model transcribed your audio, and how fast.</p>
              </div>
            </div>
            {models.data?.models.length ? (
              <ul className="voice-models">
                {models.data.models.map((model) => (
                  <li key={model.model}>
                    <div>
                      <code>{model.model}</code>
                      <small>
                        {model.requests}{" "}
                        {model.requests === 1 ? "request" : "requests"}
                        {model.avgLatencyMs === null
                          ? ""
                          : ` · ${(model.avgLatencyMs / 1000).toFixed(1)} s on average`}
                      </small>
                    </div>
                    <span className="voice-share">
                      <span aria-hidden="true" className="voice-share__track">
                        <span
                          className="voice-share__bar"
                          style={{
                            width: `${sharePercent(model.seconds, modelTotal)}%`,
                          }}
                        />
                      </span>
                      <span>
                        {formatSeconds(model.seconds)} ·{" "}
                        {sharePercent(model.seconds, modelTotal)}%
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">
                {ready && models.isPending
                  ? "Loading models…"
                  : "No cloud requests in this window."}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
