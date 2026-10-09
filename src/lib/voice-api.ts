"use client";

import { ApiError, apiFetch, buildQuery, normalizeBase } from "./api-base";

const API_BASE = () =>
  normalizeBase(process.env.NEXT_PUBLIC_VOICE_API_BASE, "/api/voice");

export class VoiceApiError extends ApiError {
  override name = "VoiceApiError";
}

/** A plan limit: a number, "unlimited", or null when the plan has not set it. */
export type VoiceLimit = number | "unlimited" | null;

export type VoiceUsage = {
  periodStart: string;
  periodEnd: string;
  cloudSecondsUsed: number;
  cloudSecondsLimit: VoiceLimit;
  requests: number;
  plan: string;
};

export type VoiceDevice = {
  id: string;
  name: string;
  type: "desktop-macos" | "desktop-windows" | "desktop-linux";
  lastSeenAt: string | null;
  createdAt: string;
};

export type VoiceDevices = {
  devices: VoiceDevice[];
  seatsUsed: number;
  seatsMax: VoiceLimit;
};

export type VoiceAdminUsage = {
  periodStart: string;
  periodEnd: string;
  cloudSeconds: number;
  requests: number;
  avgLatencyMs: number;
  activeUsers: number;
  users: number;
  blockedUsers: number;
  devices: number;
};

export type VoiceAdminUser = {
  id: string;
  accountSubject: string;
  blockedAt: string | null;
  createdAt: string;
  _count: { devices: number };
};

type RequestOptions = RequestInit & { token?: string };

export async function voiceFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    return await apiFetch<T>(API_BASE(), path, options);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new VoiceApiError(error.status, error.message, error.upgrade);
    }
    throw error;
  }
}

export function getVoiceUsage(token: string) {
  return voiceFetch<VoiceUsage>("/usage/summary", { token });
}

export function listVoiceDevices(token: string) {
  return voiceFetch<VoiceDevices>("/devices", { token });
}

export function removeVoiceDevice(id: string, token: string) {
  return voiceFetch<void>(`/devices/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export function getVoiceAdminUsage(token: string) {
  return voiceFetch<VoiceAdminUsage>("/admin/stats/usage", { token });
}

export function listVoiceAdminUsers(
  params: { page?: number; search?: string },
  token: string,
) {
  return voiceFetch<{
    data: VoiceAdminUser[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>(`/admin/users${buildQuery({ limit: 50, ...params })}`, { token });
}

export function setVoiceUserBlocked(
  id: string,
  blocked: boolean,
  token: string,
) {
  return voiceFetch<{ ok: true }>(
    `/admin/users/${encodeURIComponent(id)}/${blocked ? "block" : "unblock"}`,
    { method: "POST", token },
  );
}

/** Copy for the backend's error codes, phrased for people. */
export function voiceErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (!(error instanceof VoiceApiError)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }
  switch (error.message) {
    case "entitlements_unavailable":
      return "Your plan could not be loaded from your Algorithco account right now. Try again in a minute.";
    case "no_entitlement":
      return "This account has no Voice plan.";
    case "account_blocked":
      return "Voice is disabled for this account. Contact support.";
    case "auth_unavailable":
      return "Sign-in could not be verified right now. Try again in a minute.";
    case "forbidden":
      return "You do not have access to this page.";
    case "cannot_block_self":
      return "You cannot block your own account.";
    default:
      return error.status === 0
        ? "The Voice service is unreachable."
        : `Voice request failed (${error.message}).`;
  }
}

/**
 * Whether the (unverified) access token carries a scope. Display logic only:
 * tokens issued before Voice joined the platform lack voice:access, and the
 * page offers a re-sign-in instead of failing. The backend still decides.
 */
export function tokenHasScope(token: string, scope: string): boolean {
  const payload = token.split(".")[1];
  if (!payload) return false;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as { scope?: unknown };
    return (
      typeof claims.scope === "string" &&
      claims.scope.split(" ").includes(scope)
    );
  } catch {
    return false;
  }
}

/** "1 h 5 min", "12 min", "40 s" for cloud transcription time. */
export function formatSeconds(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return rest
    ? `${Math.floor(minutes / 60)} h ${rest} min`
    : `${minutes / 60} h`;
}
