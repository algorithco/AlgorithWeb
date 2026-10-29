"use client";

import { useQuery } from "@tanstack/react-query";
import { ButtonLink } from "@/components/button-link";
import { CloudMeter } from "@/components/voice/cloud-meter";
import { useVoiceAccess, VoiceAlerts } from "@/components/voice/voice-access";
import { dashboardRoutes } from "@/config/dashboard";
import { getMyEntitlements } from "@/lib/account-api";
import { displayDate, displayPlan } from "@/lib/dashboard-format";
import {
  formatSeconds,
  getVoiceUsage,
  listVoiceDevices,
  type VoiceLimit,
} from "@/lib/voice-api";
import { readLimit } from "@/lib/voice-usage";

function cloudAllowance(limit: VoiceLimit) {
  if (limit === "unlimited") return "Unlimited";
  if (limit === null || limit === 0) return "Not included";
  return `${formatSeconds(limit)} a month`;
}

function seatAllowance(limit: VoiceLimit) {
  if (limit === "unlimited") return "Unlimited";
  if (limit === null) return "Not set";
  return `${limit} ${limit === 1 ? "computer" : "computers"}`;
}

function statusLabel(status: string | undefined) {
  if (status === "active") return "Active";
  if (status === "grace") return "Grace period";
  return status ? status[0].toUpperCase() + status.slice(1) : "—";
}

export default function VoicePlanPage() {
  const { session, ready, subject } = useVoiceAccess();
  // Same query as the Billing page, so the two share one answer.
  const entitlements = useQuery({
    queryKey: ["account", "entitlements", subject],
    queryFn: () => getMyEntitlements(undefined, session.token),
    enabled: session.signedIn,
  });
  const usage = useQuery({
    queryKey: ["voice", "usage", subject],
    queryFn: () => getVoiceUsage(session.token),
    enabled: ready,
  });
  const devices = useQuery({
    queryKey: ["voice", "devices", subject],
    queryFn: () => listVoiceDevices(session.token),
    enabled: ready,
  });

  const voice = entitlements.data?.entitlements.find(
    (item) => item.product === "voice",
  );
  const cloud = readLimit(voice?.limits.cloudSecondsPerMonth);
  const seats = readLimit(voice?.limits.devices);
  const used = devices.data?.devices.length;

  return (
    <div className="platform-dashboard voice-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">AlgorithVoice</p>
          <h1>Plan &amp; limits</h1>
          <p>
            What your AlgorithVoice plan includes and how much of it you have
            used. Plans are bought and changed under Billing.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <ButtonLink href={dashboardRoutes.billing}>
            Plans and billing
          </ButtonLink>
        </div>
      </header>

      <VoiceAlerts
        error={usage.error ?? devices.error ?? undefined}
        returnTo={dashboardRoutes.voicePlan}
      />
      {entitlements.error ? (
        <div className="dashboard-alerts">
          <p className="dashboard-alert" role="alert">
            <strong>Your plan could not be loaded.</strong>
            <span>Try again in a minute.</span>
          </p>
        </div>
      ) : null}

      <div className="dashboard-detail-grid">
        <section aria-labelledby="voice-plan-title" className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Your plan</p>
              <h2 id="voice-plan-title">
                {voice
                  ? `AlgorithVoice ${displayPlan(voice.plan)}`
                  : entitlements.isPending
                    ? "Loading…"
                    : "No AlgorithVoice plan"}
              </h2>
            </div>
            {voice ? (
              <span
                className={`status-pill ${voice.status === "active" ? "status-pill--ok" : ""}`}
              >
                {statusLabel(voice.status)}
              </span>
            ) : null}
          </div>
          {voice ? (
            <dl className="voice-plan">
              <div>
                <dt>Local dictation</dt>
                <dd>Unlimited, on your computer</dd>
              </div>
              <div>
                <dt>Cloud transcription</dt>
                <dd>{cloudAllowance(cloud)}</dd>
              </div>
              <div>
                <dt>Computers</dt>
                <dd>
                  {seatAllowance(seats)}
                  {used === undefined ? "" : ` · ${used} in use`}
                </dd>
              </div>
              <div>
                <dt>{voice.validUntil ? "Valid until" : "Renewal"}</dt>
                <dd>
                  {voice.validUntil
                    ? displayDate(voice.validUntil)
                    : "No end date"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="muted">
              {entitlements.isPending
                ? "Loading your plan…"
                : "Choose a plan under Billing to start using AlgorithVoice."}
            </p>
          )}
          {voice?.status === "grace" ? (
            <p className="voice-note">
              Your plan is in its grace period. Renew it under Billing to keep
              cloud transcription.
            </p>
          ) : null}
        </section>

        <section
          aria-labelledby="voice-allowance-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">This month</p>
              <h2 id="voice-allowance-title">Cloud time used</h2>
            </div>
          </div>
          {usage.data ? (
            <CloudMeter usage={usage.data} />
          ) : (
            <p className="muted">
              {ready && usage.isPending ? "Loading usage…" : "No usage data."}
            </p>
          )}
          <ul className="voice-facts">
            <li>
              Only audio sent for cloud transcription counts. Local dictation is
              never counted.
            </li>
            <li>The allowance resets on the first day of each month (UTC).</li>
            <li>
              When it runs out, cloud requests stop until the reset. Local
              dictation keeps working.
            </li>
          </ul>
          <div className="voice-panel-actions">
            <ButtonLink href={dashboardRoutes.voiceUsage} variant="secondary">
              See usage
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
