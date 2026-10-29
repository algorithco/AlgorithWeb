"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { CloudMeter } from "@/components/voice/cloud-meter";
import { DailyUsageChart } from "@/components/voice/daily-usage-chart";
import { DeviceList, seatsLabel } from "@/components/voice/device-list";
import { useVoiceAccess, VoiceAlerts } from "@/components/voice/voice-access";
import { dashboardRoutes } from "@/config/dashboard";
import { displayDateTime, displayPlan } from "@/lib/dashboard-format";
import {
  formatSeconds,
  getVoiceAdminUsage,
  getVoiceDailyUsage,
  getVoiceUsage,
  listVoiceDevices,
  listVoiceRecentUsage,
} from "@/lib/voice-api";

const DAILY_DAYS = 14;
const RECENT_LIMIT = 8;

/** "See all →" in a panel heading, to the page with the whole story. */
function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="text-link" href={href}>
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export default function VoiceOverviewPage() {
  const { session, ready, subject } = useVoiceAccess();

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
  const daily = useQuery({
    queryKey: ["voice", "daily", subject, DAILY_DAYS],
    queryFn: () => getVoiceDailyUsage(DAILY_DAYS, session.token),
    enabled: ready,
  });
  const recent = useQuery({
    queryKey: ["voice", "recent", subject],
    queryFn: () => listVoiceRecentUsage(RECENT_LIMIT, session.token),
    enabled: ready,
  });
  // Admins see a link to the admin tools; everyone else gets a quiet 403.
  const admin = useQuery({
    queryKey: ["voice", "admin-probe", subject],
    queryFn: () => getVoiceAdminUsage(session.token),
    enabled: ready,
    retry: false,
  });

  const error = usage.error ?? devices.error ?? daily.error ?? recent.error;
  // The ledger also holds other metrics; only transcription time is shown.
  const recentRequests = (recent.data?.recent ?? []).filter(
    (item) => item.metric === "STT_SECONDS",
  );
  const seatsMax = devices.data?.seatsMax ?? null;
  const deviceCount = devices.data?.devices.length ?? 0;

  return (
    <div className="platform-dashboard voice-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">Desktop app</p>
          <h1>AlgorithVoice</h1>
          <p>
            Cloud transcription, devices and plan for the desktop app. Local
            dictation runs on your computer and is never counted here.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <ButtonLink href={dashboardRoutes.voiceDownload}>
            Download the app
          </ButtonLink>
          <ButtonLink href={dashboardRoutes.voicePlan} variant="secondary">
            Plan &amp; limits
          </ButtonLink>
        </div>
      </header>

      <VoiceAlerts error={error} returnTo={dashboardRoutes.voice} />

      <div className="dashboard-detail-grid">
        <section
          aria-labelledby="voice-cloud-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">This month</p>
              <h2 id="voice-cloud-title">Cloud transcription</h2>
              <p>
                Audio sent through Algorithco for transcription, which is part
                of the Pro plan. Local dictation is unlimited on every plan and
                does not count here.
              </p>
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
              {usage.isPending && ready ? "Loading usage…" : "No usage data."}
            </p>
          )}
        </section>

        <section
          aria-labelledby="voice-devices-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Devices</p>
              <h2 id="voice-devices-title">Your computers</h2>
              <p>
                Each computer signed in to AlgorithVoice with this account.
                Removing one signs the app out there and frees its seat.
              </p>
            </div>
            {devices.data ? (
              <span className="dashboard-tag">
                {seatsLabel(deviceCount, seatsMax)}
              </span>
            ) : null}
          </div>
          {devices.data?.devices.length ? (
            <DeviceList devices={devices.data.devices} token={session.token} />
          ) : (
            <p className="muted">
              {devices.isPending && ready
                ? "Loading devices…"
                : "No computers yet."}
            </p>
          )}
          {seatsMax === null && devices.data ? (
            <p className="voice-note">
              Your plan does not set a device limit yet, so new computers cannot
              use cloud transcription. Local dictation is unaffected.
            </p>
          ) : null}
          <PanelLink
            href={dashboardRoutes.voiceDevices}
            label="Manage devices"
          />
        </section>
      </div>

      <div className="dashboard-detail-grid">
        <section
          aria-labelledby="voice-daily-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Last {DAILY_DAYS} days</p>
              <h2 id="voice-daily-title">Daily cloud time</h2>
            </div>
            <PanelLink href={dashboardRoutes.voiceUsage} label="All usage" />
          </div>
          {daily.data ? (
            <DailyUsageChart daily={daily.data.daily} />
          ) : (
            <p className="muted">
              {daily.isPending && ready
                ? "Loading daily usage…"
                : "No usage data."}
            </p>
          )}
        </section>

        <section
          aria-labelledby="voice-recent-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Activity</p>
              <h2 id="voice-recent-title">Recent requests</h2>
            </div>
            <PanelLink
              href={dashboardRoutes.voiceHistory}
              label="All requests"
            />
          </div>
          {recentRequests.length ? (
            <ul className="voice-recent">
              {recentRequests.map((item) => (
                <li key={item.id}>
                  <span>
                    <strong>{formatSeconds(item.seconds)}</strong>
                    <small>{displayDateTime(item.recordedAt)}</small>
                  </span>
                  <span>
                    {item.model ? <code>{item.model}</code> : null}
                    {item.latencyMs === null ? null : (
                      <small>{item.latencyMs} ms</small>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              {recent.isPending && ready
                ? "Loading activity…"
                : "No cloud requests yet."}
            </p>
          )}
        </section>
      </div>

      {admin.isSuccess ? (
        <section className="dashboard-panel voice-admin-link">
          <div>
            <p className="eyebrow">Operator</p>
            <h2>AlgorithVoice admin</h2>
            <p>Service usage, users and access controls.</p>
          </div>
          <Link
            className="button button--secondary"
            href={dashboardRoutes.voiceAdmin}
          >
            Open admin
          </Link>
        </section>
      ) : null}
    </div>
  );
}
