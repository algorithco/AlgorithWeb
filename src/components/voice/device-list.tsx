"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { DashboardIcon } from "@/components/dashboard-shell";
import { getAccountOverview } from "@/lib/account-center";
import { displayDate, displayDateTime } from "@/lib/dashboard-format";
import {
  type VoiceDevice,
  type VoiceLimit,
  voiceErrorMessage,
} from "@/lib/voice-api";
import { removeComputer } from "@/lib/voice-devices";

export const PLATFORM_LABELS: Record<VoiceDevice["type"], string> = {
  "desktop-windows": "Windows",
  "desktop-linux": "Linux",
  "desktop-macos": "macOS",
};

/** "2 of 3 seats", for the heading of the device list. */
export function seatsLabel(used: number, seats: VoiceLimit) {
  if (seats === "unlimited") return `${used} in use · unlimited seats`;
  if (seats === null) return `${used} in use`;
  return `${used} of ${seats} ${seats === 1 ? "seat" : "seats"}`;
}

/**
 * The computers signed in to AlgorithVoice, each with a Remove button that
 * signs the app out there and frees its seat. `detailed` adds the day each
 * one was first signed in.
 */
export function DeviceList({
  devices,
  token,
  detailed = false,
}: {
  devices: readonly VoiceDevice[];
  token: string;
  detailed?: boolean;
}) {
  const [removing, setRemoving] = useState<VoiceDevice | null>(null);
  return (
    <>
      <ul className="voice-devices">
        {devices.map((device) => (
          <li key={device.id}>
            <span className="voice-devices__mark" aria-hidden="true">
              <DashboardIcon name="devices" />
            </span>
            <span className="voice-devices__body">
              <strong>{device.name}</strong>
              <small>
                {PLATFORM_LABELS[device.type]} · last used{" "}
                {device.lastSeenAt
                  ? displayDateTime(device.lastSeenAt)
                  : "never"}
                {detailed
                  ? ` · signed in since ${displayDate(device.createdAt)}`
                  : null}
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
      {removing ? (
        <RemoveDeviceDialog
          device={removing}
          onClose={() => setRemoving(null)}
          token={token}
        />
      ) : null}
    </>
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
    // Ends the app's sign-in on that computer, then frees the seat.
    mutationFn: () =>
      removeComputer(
        device,
        token,
        async () => (await getAccountOverview()).apps,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["voice", "devices"] });
      void queryClient.invalidateQueries({ queryKey: ["account", "overview"] });
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
          AlgorithVoice on that computer is signed out within half a minute and
          its seat is freed. To dictate there again, sign in to the app again.
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
            {remove.isPending ? "Signing out…" : "Sign out and remove"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
