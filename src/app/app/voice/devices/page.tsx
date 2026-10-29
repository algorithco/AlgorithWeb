"use client";

import { useQuery } from "@tanstack/react-query";
import { ButtonLink } from "@/components/button-link";
import { SummaryCard } from "@/components/dashboard-summary-card";
import { DeviceList, seatsLabel } from "@/components/voice/device-list";
import { useVoiceAccess, VoiceAlerts } from "@/components/voice/voice-access";
import { dashboardRoutes } from "@/config/dashboard";
import { listVoiceDevices } from "@/lib/voice-api";

export default function VoiceDevicesPage() {
  const { session, ready, subject } = useVoiceAccess();
  const devices = useQuery({
    queryKey: ["voice", "devices", subject],
    queryFn: () => listVoiceDevices(session.token),
    enabled: ready,
  });

  const list = devices.data?.devices ?? [];
  const seats = devices.data?.seatsMax ?? null;
  const free =
    typeof seats === "number" ? Math.max(0, seats - list.length) : null;
  const full = free === 0;
  const loading = ready && devices.isPending;

  return (
    <div className="platform-dashboard voice-dashboard">
      <header className="dashboard-welcome">
        <div>
          <p className="eyebrow">AlgorithVoice</p>
          <h1>Devices</h1>
          <p>
            The computers signed in to AlgorithVoice with this account. Each one
            takes a seat of your plan; removing a computer signs the app out
            there and frees its seat.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <ButtonLink href={dashboardRoutes.voiceDownload}>
            Download the app
          </ButtonLink>
        </div>
      </header>

      <VoiceAlerts
        error={devices.error ?? undefined}
        returnTo={dashboardRoutes.voiceDevices}
      />

      <div className="dashboard-summary voice-summary--three">
        <SummaryCard
          detail="signed in to AlgorithVoice"
          icon="devices"
          label="Computers"
          loading={loading}
          value={devices.data ? String(list.length) : "—"}
        />
        <SummaryCard
          detail="on your plan"
          icon="billing"
          label="Seats"
          loading={loading}
          value={
            !devices.data
              ? "—"
              : seats === "unlimited"
                ? "Unlimited"
                : seats === null
                  ? "Not set"
                  : String(seats)
          }
        />
        <SummaryCard
          detail={
            full ? "remove a computer to add another" : "for new computers"
          }
          icon="spark"
          label="Free seats"
          loading={loading}
          value={
            !devices.data
              ? "—"
              : free === null
                ? seats === "unlimited"
                  ? "Unlimited"
                  : "—"
                : String(free)
          }
        />
      </div>

      <div className="dashboard-detail-grid">
        <section
          aria-labelledby="voice-devices-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Signed in</p>
              <h2 id="voice-devices-title">Your computers</h2>
            </div>
            {devices.data ? (
              <span className="dashboard-tag">
                {seatsLabel(list.length, seats)}
              </span>
            ) : null}
          </div>
          {list.length ? (
            <DeviceList detailed devices={list} token={session.token} />
          ) : (
            <p className="muted">
              {loading ? "Loading devices…" : "No computers yet."}
            </p>
          )}
          {seats === null && devices.data ? (
            <p className="voice-note">
              Your plan does not set a device limit yet, so new computers cannot
              use cloud transcription. Local dictation is unaffected.
            </p>
          ) : null}
        </section>

        <section aria-labelledby="voice-add-title" className="dashboard-panel">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Add a computer</p>
              <h2 id="voice-add-title">
                Use AlgorithVoice on another computer
              </h2>
            </div>
          </div>
          <ol className="voice-steps">
            <li>
              <strong>Install the app.</strong>
              <span>
                Windows and Linux installers are on the download page.
              </span>
            </li>
            <li>
              <strong>Sign in with this account.</strong>
              <span>
                The app opens your browser; press Approve and it signs in.
              </span>
            </li>
            <li>
              <strong>It takes a free seat.</strong>
              <span>
                The computer appears in this list the first time it signs in.
              </span>
            </li>
          </ol>
          {full ? (
            <p className="voice-note">
              All seats are in use. Remove a computer you no longer use, or see
              your plan for more seats.
            </p>
          ) : null}
          <div className="voice-panel-actions">
            <ButtonLink href={dashboardRoutes.voiceDownload}>
              Download the app
            </ButtonLink>
            <ButtonLink href={dashboardRoutes.voicePlan} variant="secondary">
              Plan &amp; limits
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
