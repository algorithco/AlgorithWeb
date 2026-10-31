"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardSession } from "@/components/dashboard-shell";
import { SummaryCard } from "@/components/dashboard-summary-card";
import { VoiceAdminTabs } from "@/components/voice/admin-tabs";
import {
  getVoiceAdminOverview,
  listVoiceAdminModelStats,
  listVoiceModelConfigs,
  setVoiceModelRole,
  tokenHasScope,
  voiceErrorMessage,
} from "@/lib/voice-api";

const usd = (value: number) => `$${value.toFixed(4)}`;

export default function VoiceAdminModelsPage() {
  const session = useDashboardSession();
  const queryClient = useQueryClient();
  const ready =
    session.signedIn && tokenHasScope(session.token, "voice:access");

  const overview = useQuery({
    queryKey: ["voice", "admin", "overview"],
    queryFn: () => getVoiceAdminOverview(session.token),
    enabled: ready,
    retry: false,
  });
  const stats = useQuery({
    queryKey: ["voice", "admin", "model-stats"],
    queryFn: () => listVoiceAdminModelStats(session.token),
    enabled: ready,
    retry: false,
  });
  const configs = useQuery({
    queryKey: ["voice", "admin", "model-configs"],
    queryFn: () => listVoiceModelConfigs(session.token),
    enabled: ready,
    retry: false,
  });
  const assign = useMutation({
    mutationFn: (input: { role: "active" | "fallback"; modelId: string }) =>
      setVoiceModelRole(input.role, input.modelId, session.token),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["voice", "admin", "model-configs"],
      });
    },
  });

  const error = overview.error ?? stats.error ?? configs.error ?? assign.error;
  const totals = overview.data;
  return (
    <div className="platform-dashboard voice-dashboard">
      <VoiceAdminTabs />
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">
            <span className="keep-case">AlgorithVoice</span> admin
          </p>
          <h1>Models</h1>
          <p>
            Requests to transcription providers in the last 7 days, and which
            model serves managed cloud transcription.
          </p>
        </div>
      </header>

      {error ? (
        <div className="dashboard-alerts">
          <p className="dashboard-alert" role="alert">
            <strong>Model data is unavailable.</strong>
            <span>{voiceErrorMessage(error)}</span>
          </p>
        </div>
      ) : null}

      <section className="dashboard-summary" aria-label="Provider requests">
        <SummaryCard
          detail={`${totals?.failedRequests ?? 0} failed`}
          icon="pulse"
          label="Requests"
          loading={overview.isPending}
          value={String(totals?.totalRequests ?? 0)}
        />
        <SummaryCard
          detail="Of all provider requests"
          icon="guard"
          label="Success rate"
          loading={overview.isPending}
          value={totals?.totalRequests ? `${totals.successRate}%` : "—"}
        />
        <SummaryCard
          detail="Provider response time"
          icon="history"
          label="Average latency"
          loading={overview.isPending}
          value={totals?.totalRequests ? `${totals.avgLatencyMs} ms` : "—"}
          wideValue
        />
        <SummaryCard
          detail="As reported by providers"
          icon="billing"
          label="Provider cost"
          loading={overview.isPending}
          value={usd(totals?.totalCostUsd ?? 0)}
          wideValue
        />
      </section>

      <section
        aria-labelledby="voice-routing-title"
        className="dashboard-panel"
      >
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Routing</p>
            <h2 id="voice-routing-title">Primary and fallback</h2>
            <p>
              The primary model serves requests; the fallback is tried when it
              fails. A change reaches every worker within about 30 seconds.
            </p>
          </div>
        </div>
        {configs.data?.all.length ? (
          <div className="voice-admin__table">
            <table className="dashboard-stack-table">
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Provider</th>
                  <th scope="col">Role</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {configs.data.all.map((model) => {
                  const pending =
                    assign.isPending &&
                    assign.variables?.modelId === model.modelId;
                  return (
                    <tr key={model.modelId}>
                      <td>
                        <strong>{model.displayName}</strong>
                        <br />
                        <code>{model.modelId}</code>
                      </td>
                      <td data-label="Provider">{model.provider}</td>
                      <td data-label="Role">
                        <span className="voice-admin__roles">
                          {model.isActive ? (
                            <span className="status-pill status-pill--ok">
                              primary
                            </span>
                          ) : null}
                          {model.isFallback ? (
                            <span className="status-pill">fallback</span>
                          ) : null}
                          {model.isEnabled ? null : (
                            <span className="status-pill">disabled</span>
                          )}
                        </span>
                      </td>
                      <td className="is-action">
                        <span className="voice-admin__actions">
                          <button
                            className="button button--secondary"
                            disabled={
                              pending || model.isActive || !model.isEnabled
                            }
                            onClick={() =>
                              assign.mutate({
                                role: "active",
                                modelId: model.modelId,
                              })
                            }
                            type="button"
                          >
                            Make primary
                          </button>
                          <button
                            className="button button--secondary"
                            disabled={
                              pending || model.isFallback || !model.isEnabled
                            }
                            onClick={() =>
                              assign.mutate({
                                role: "fallback",
                                modelId: model.modelId,
                              })
                            }
                            type="button"
                          >
                            Make fallback
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            {configs.isPending
              ? "Loading models…"
              : "No models are configured here, so the service uses the primary and fallback models from its environment."}
          </p>
        )}
      </section>

      <section aria-labelledby="voice-models-title" className="dashboard-panel">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Last 7 days</p>
            <h2 id="voice-models-title">By model</h2>
          </div>
        </div>
        {stats.data?.data.length ? (
          <div className="voice-admin__table">
            <table className="dashboard-stack-table">
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th className="is-number" scope="col">
                    Requests
                  </th>
                  <th className="is-number" scope="col">
                    Avg latency
                  </th>
                  <th className="is-number" scope="col">
                    Cost
                  </th>
                  <th className="is-number" scope="col">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.data.data.map((row) => (
                  <tr key={row.model}>
                    <td>
                      <code>{row.model}</code>
                    </td>
                    <td className="is-number" data-label="Requests">
                      {row.requests}
                    </td>
                    <td className="is-number" data-label="Avg latency">
                      {row.avgLatencyMs} ms
                    </td>
                    <td className="is-number" data-label="Cost">
                      {usd(row.costUsd)}
                    </td>
                    <td className="is-number" data-label="Errors">
                      {row.errorCount} ({row.errorRate}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            {stats.isPending
              ? "Loading statistics…"
              : "No provider requests in the last 7 days."}
          </p>
        )}
      </section>
    </div>
  );
}
