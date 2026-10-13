"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/button-link";
import {
  DashboardIcon,
  useDashboardSession,
} from "@/components/dashboard-shell";
import { SummaryCard } from "@/components/dashboard-summary-card";
import { DailyUsageChart } from "@/components/voice/daily-usage-chart";
import { dashboardRoutes } from "@/config/dashboard";
import { beginAccountLogin } from "@/lib/account-auth";
import { displayPlan } from "@/lib/dashboard-format";
import {
  formatSeconds,
  getVoiceAdminUsage,
  getVoiceDailyUsage,
  getVoiceUsage,
  listVoiceDevices,
  listVoiceRecentUsage,
  removeVoiceDevice,
  tokenHasScope,
  type VoiceDevice,
  type VoiceLimit,
  type VoiceUsage,
  voiceErrorMessage,
} from "@/lib/voice-api";

const DAILY_DAYS = 14;
const RECENT_LIMIT = 8;

const PLATFORM_LABELS: Record<VoiceDevice["type"], string> = {
  "desktop-windows": "Windows",
  "desktop-linux": "Linux",
  "desktop-macos": "macOS",
};

function dateLabel(value: string | null, fallback: string) {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function limitLabel(limit: VoiceLimit, unit: (value: number) => string) {
  if (limit === "unlimited") return "Unlimited";
  if (limit === null) return "Not set yet";
  return unit(limit);
}

function CloudMeter({ usage }: { usage: VoiceUsage }) {
  const limit = usage.cloudSecondsLimit;
  const resets = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(usage.periodEnd));
  const percent =
    typeof limit === "number" && limit > 0
      ? Math.min(100, (usage.cloudSecondsUsed / limit) * 100)
      : 0;
  const exhausted =
    typeof limit === "number" && usage.cloudSecondsUsed >= limit;
  return (
    <div className="voice-meter">
      <div className="voice-meter__figures">
        <strong>{formatSeconds(usage.cloudSecondsUsed)}</strong>
        <span>
          {limit === "unlimited"
            ? "used · unlimited on your plan"
            : limit === null
              ? "used · cloud transcription is part of the Pro plan"
              : `of ${formatSeconds(limit)} used`}
        </span>
      </div>
      {typeof limit === "number" ? (
        <div
          aria-label="Cloud transcription used this month"
          aria-valuemax={limit}
          aria-valuemin={0}
          aria-valuenow={Math.min(usage.cloudSecondsUsed, limit)}
          className={`voice-meter__bar${exhausted ? " is-exhausted" : ""}`}
          role="meter"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      ) : null}
      <p className="voice-meter__note">
        {exhausted
          ? `Cloud time is used up until ${resets}. Local dictation keeps working.`
          : `${usage.requests} cloud ${usage.requests === 1 ? "request" : "requests"} this month · resets on ${resets}.`}
      </p>
    </div>
  );
}

function RemoveDeviceDialog({
  device,
  onClose,
  token,
}: {
  device: VoiceDevice;
  onClose: () => void;
  token: string;
}) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => removeVoiceDevice(device.id, token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["voice", "devices"] });
      onClose();
    },
  });
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      aria-describedby="voice-remove-description"
      aria-labelledby="voice-remove-title"
      className="dashboard-confirm-dialog"
      // Only the explicit Cancel button dismisses this dialog.
      onCancel={(event) => event.preventDefault()}
      ref={(node) => {
        dialogRef.current = node;
        if (node && !node.open) node.showModal();
      }}
    >
      <div className="dashboard-confirm-dialog__content">
        <p className="eyebrow">Devices</p>
        <h2 id="voice-remove-title">Remove “{device.name}”?</h2>
        <p id="voice-remove-description">
          This frees its seat. If the app on that computer uses cloud
          transcription again, it registers itself again and takes a seat. Local
          dictation on it is not affected.
        </p>
        {remove.error ? (
          <p className="form-error" role="alert">
            {voiceErrorMessage(remove.error)}
          </p>
        ) : null}
        <div className="dashboard-confirm-dialog__actions">
          <button
            autoFocus
            className="button button--secondary"
            disabled={remove.isPending}
            onClick={() => {
              dialogRef.current?.close();
              onClose();
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            className="button button--primary"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
            type="button"
          >
            {remove.isPending ? "Removing…" : "Remove device"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default function VoiceOverviewPage() {
  const session = useDashboardSession();
  const [removing, setRemoving] = useState<VoiceDevice | null>(null);
  const [reauthError, setReauthError] = useState("");
  const hasScope =
    session.signedIn && tokenHasScope(session.token, "voice:access");
  const ready = session.signedIn && hasScope;

  const usage = useQuery({
    queryKey: ["voice", "usage", session.profile?.subject],
    queryFn: () => getVoiceUsage(session.token),
    enabled: ready,
  });
  const devices = useQuery({
    queryKey: ["voice", "devices", session.profile?.subject],
    queryFn: () => listVoiceDevices(session.token),
    enabled: ready,
  });
  const daily = useQuery({
    queryKey: ["voice", "daily", session.profile?.subject, DAILY_DAYS],
    queryFn: () => getVoiceDailyUsage(DAILY_DAYS, session.token),
    enabled: ready,
  });
  const recent = useQuery({
    queryKey: ["voice", "recent", session.profile?.subject],
    queryFn: () => listVoiceRecentUsage(RECENT_LIMIT, session.token),
    enabled: ready,
  });
  // Admins see a link to the admin tools; everyone else gets a quiet 403.
  const admin = useQuery({
    queryKey: ["voice", "admin-probe", session.profile?.subject],
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
          <p className="eyebrow">
            <span className="keep-case">AlgorithVoice</span>
          </p>
          <h1>AlgorithVoice</h1>
          <p>
            Cloud transcription, devices and plan for the desktop app. Local
            dictation runs on your computer and is never counted here.
          </p>
        </div>
        <div className="dashboard-welcome__actions">
          <ButtonLink href="/voice/download">Download AlgorithVoice</ButtonLink>
          <ButtonLink href={dashboardRoutes.subscriptions} variant="secondary">
            Plans & billing
          </ButtonLink>
        </div>
      </header>

      {session.signedIn && !hasScope ? (
        <div className="dashboard-alerts">
          <div className="dashboard-alert voice-reauth" role="status">
            <strong>AlgorithVoice needs one more permission.</strong>
            <span>
              Your sign-in predates AlgorithVoice joining your Algorithco
              account. Refreshing it takes a second and does not ask for your
              password while your account session is active.
            </span>
            <button
              className="button button--primary"
              onClick={() => {
                setReauthError("");
                beginAccountLogin(dashboardRoutes.voice).catch(
                  (failure: unknown) =>
                    setReauthError(
                      failure instanceof Error
                        ? failure.message
                        : "Sign-in could not start.",
                    ),
                );
              }}
              type="button"
            >
              Refresh sign-in
            </button>
            {reauthError ? <p className="form-error">{reauthError}</p> : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="dashboard-alerts">
          <p className="dashboard-alert" role="alert">
            <strong>AlgorithVoice data is unavailable.</strong>
            <span>{voiceErrorMessage(error)}</span>
          </p>
        </div>
      ) : null}

      <section className="dashboard-summary" aria-label="AlgorithVoice summary">
        <SummaryCard
          detail="From your Algorithco account"
          icon="billing"
          label="Plan"
          loading={ready && usage.isPending}
          value={usage.data ? displayPlan(usage.data.plan) : "—"}
        />
        <SummaryCard
          detail={
            usage.data
              ? usage.data.cloudSecondsLimit === null
                ? "Part of the Pro plan"
                : `Limit: ${limitLabel(usage.data.cloudSecondsLimit, formatSeconds)}`
              : "Managed cloud transcription"
          }
          icon="pulse"
          label="Cloud this month"
          loading={ready && usage.isPending}
          value={usage.data ? formatSeconds(usage.data.cloudSecondsUsed) : "—"}
          wideValue
        />
        <SummaryCard
          detail={
            devices.data
              ? `Seats: ${limitLabel(seatsMax, String)}`
              : "Computers using cloud time"
          }
          icon="mic"
          label="Devices"
          loading={ready && devices.isPending}
          value={devices.data ? String(deviceCount) : "—"}
        />
      </section>

      <div className="dashboard-detail-grid">
        <section
          aria-labelledby="voice-cloud-title"
          className="dashboard-panel"
        >
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Usage</p>
              <h2 id="voice-cloud-title">Cloud transcription</h2>
              <p>
                Audio sent through Algorithco for transcription, which is part
                of the Pro plan. Local dictation is unlimited on every plan and
                does not count here.
              </p>
            </div>
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
                A computer appears here the first time the app uses cloud
                transcription with this account.
              </p>
            </div>
          </div>
          {devices.data?.devices.length ? (
            <ul className="voice-devices">
              {devices.data.devices.map((device) => (
                <li key={device.id}>
                  <span className="voice-devices__mark" aria-hidden="true">
                    <DashboardIcon name="mic" />
                  </span>
                  <span className="voice-devices__body">
                    <strong>{device.name}</strong>
                    <small>
                      {PLATFORM_LABELS[device.type]} · last used{" "}
                      {dateLabel(device.lastSeenAt, "never")}
                    </small>
                  </span>
                  <button
                    className="button button--secondary voice-devices__remove"
                    onClick={() => setRemoving(device)}
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
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
          </div>
          {recentRequests.length ? (
            <ul className="voice-recent">
              {recentRequests.map((item) => (
                <li key={item.id}>
                  <span>
                    <strong>{formatSeconds(item.seconds)}</strong>
                    <small>{dateLabel(item.recordedAt, "")}</small>
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

      {removing ? (
        <RemoveDeviceDialog
          device={removing}
          onClose={() => setRemoving(null)}
          token={session.token}
        />
      ) : null}
    </div>
  );
}
