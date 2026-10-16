"use client";

import { type AccountOverview, revokeApp } from "./account-center";
import {
  listVoiceDevices,
  removeVoiceDevice,
  type VoiceDevice,
} from "./voice-api";

/**
 * A computer on the AlgorithVoice page is two things: a seat in the Voice
 * service and the app's sign-in with the Algorithco account. Removing the
 * computer ends both, so the app on it signs out (AlgorithVoice checks its
 * sign-in every half minute) and cannot take the seat back by itself.
 */

/** Account client id of the AlgorithVoice desktop app. */
export const VOICE_DESKTOP_CLIENT = "voice-desktop";

type ConnectedApp = NonNullable<AccountOverview["apps"]>[number];

/**
 * The sign-ins to end for a computer: the one its seat recorded, or, for a
 * seat registered before seats kept it, every AlgorithVoice sign-in made on
 * a computer of that name.
 */
export function signInsOfComputer(
  device: Pick<VoiceDevice, "name" | "grantId">,
  apps: readonly ConnectedApp[] | undefined,
): string[] {
  if (device.grantId) return [device.grantId];
  return (apps ?? [])
    .filter(
      (app) =>
        app.clientId === VOICE_DESKTOP_CLIENT &&
        app.deviceName !== null &&
        app.deviceName === device.name,
    )
    .map((app) => app.id);
}

/**
 * The seats an AlgorithVoice sign-in holds: the computers that recorded it,
 * or, when none did, the unrecorded computers of the same name.
 */
export function computersOfSignIn(
  app: Pick<ConnectedApp, "id" | "deviceName">,
  devices: readonly Pick<VoiceDevice, "id" | "name" | "grantId">[],
): string[] {
  const recorded = devices.filter((device) => device.grantId === app.id);
  if (recorded.length) return recorded.map((device) => device.id);
  if (!app.deviceName) return [];
  return devices
    .filter((device) => !device.grantId && device.name === app.deviceName)
    .map((device) => device.id);
}

/**
 * Remove a computer: end its sign-in first (an error leaves everything as it
 * was), then free its seat. `loadApps` is asked only when the seat did not
 * record the sign-in.
 */
export async function removeComputer(
  device: VoiceDevice,
  token: string,
  loadApps: () => Promise<readonly ConnectedApp[] | undefined>,
): Promise<{ signedOut: number }> {
  const signIns = signInsOfComputer(
    device,
    device.grantId ? [] : await loadApps(),
  );
  for (const id of signIns) {
    const ended = await revokeApp(id);
    if (!ended.ok) throw new Error(ended.error);
  }
  await removeVoiceDevice(device.id, token);
  return { signedOut: signIns.length };
}

/**
 * After an AlgorithVoice sign-in was ended in the account center, free the
 * seats it held. Best effort: the sign-in is over whatever happens here.
 */
export async function freeSeatsOf(
  app: Pick<ConnectedApp, "id" | "deviceName" | "clientId">,
  token: string,
): Promise<void> {
  if (app.clientId !== VOICE_DESKTOP_CLIENT) return;
  try {
    const { devices } = await listVoiceDevices(token);
    for (const id of computersOfSignIn(app, devices)) {
      await removeVoiceDevice(id, token);
    }
  } catch {
    // The seat stays; it can still be removed on the AlgorithVoice page.
  }
}
