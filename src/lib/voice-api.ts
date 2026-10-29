"use client";

import { ApiError, apiFetch, buildQuery, normalizeBase } from "./api-base";
import { DASHBOARD_LOCALE } from "./dashboard-format";

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
  /**
   * The Account sign-in of the app on this computer, when the seat knows it
   * (computers registered before it was kept have none).
   */
  grantId?: string | null;
  lastSeenAt: string | null;
  createdAt: string;
};

export type VoiceDevices = {
  devices: VoiceDevice[];
  total: number;
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

export type VoiceDailyUsage = {
  days: number;
  /** One entry per UTC day, oldest first; days without usage are zero. */
  daily: Array<{ date: string; seconds: number; requests: number }>;
};

export type VoiceRecentUsage = {
  recent: Array<{
    id: string;
    metric: string;
    seconds: number;
    model: string | null;
    latencyMs: number | null;
    recordedAt: string;
  }>;
};

/** One metered cloud request. Only numbers: transcripts never leave the app. */
export type VoiceUsageRecord = {
  id: string;
  seconds: number;
  model: string | null;
  latencyMs: number | null;
  recordedAt: string;
};

export type VoiceUsageRecords = {
  records: VoiceUsageRecord[];
  /** Pass back as `cursor` for the next page; null on the last one. */
  nextCursor: string | null;
};

export type VoiceRecordFilters = {
  /** Inclusive UTC days, `YYYY-MM-DD`. */
  from?: string;
  to?: string;
  model?: string;
};

export type VoiceMonthlyUsage = {
  /** One entry per UTC month (`YYYY-MM`), oldest first, empty months too. */
  months: Array<{ month: string; seconds: number; requests: number }>;
};

export type VoiceModelUsage = {
  days: number;
  models: Array<{
    model: string;
    requests: number;
    seconds: number;
    avgLatencyMs: number | null;
  }>;
};

export type VoiceFailedRequest = {
  id: string;
  model: string;
  /** An HTTP status from the provider, or `rate_limited`, `provider_error`, `error`. */
  code: string;
  latencyMs: number;
  recordedAt: string;
};

export type VoiceFailedRequests = {
  errors: VoiceFailedRequest[];
  nextCursor: string | null;
};

export type VoiceAdminOverview = {
  period: { from: string; to: string };
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  avgLatencyMs: number;
  totalCostUsd: number;
};

export type VoiceAdminModelStat = {
  model: string;
  requests: number;
  avgLatencyMs: number;
  costUsd: number;
  errorCount: number;
  errorRate: number;
};

export type VoiceModelConfig = {
  modelId: string;
  displayName: string;
  provider: string;
  isActive: boolean;
  isFallback: boolean;
  isEnabled: boolean;
};

export type VoiceAdminError = {
  id: string;
  model: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
};

type Page = { page: number; limit: number; total: number; totalPages: number };

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

export function getVoiceDailyUsage(days: number, token: string) {
  return voiceFetch<VoiceDailyUsage>(`/usage/daily${buildQuery({ days })}`, {
    token,
  });
}

export function listVoiceRecentUsage(limit: number, token: string) {
  return voiceFetch<VoiceRecentUsage>(`/usage/recent${buildQuery({ limit })}`, {
    token,
  });
}

export function listVoiceUsageRecords(
  params: VoiceRecordFilters & { cursor?: string; limit?: number },
  token: string,
) {
  return voiceFetch<VoiceUsageRecords>(`/usage/records${buildQuery(params)}`, {
    token,
  });
}

export function getVoiceMonthlyUsage(months: number, token: string) {
  return voiceFetch<VoiceMonthlyUsage>(
    `/usage/monthly${buildQuery({ months })}`,
    { token },
  );
}

export function getVoiceModelUsage(days: number, token: string) {
  return voiceFetch<VoiceModelUsage>(`/usage/models${buildQuery({ days })}`, {
    token,
  });
}

export function listVoiceFailedRequests(
  params: { cursor?: string; limit?: number },
  token: string,
) {
  return voiceFetch<VoiceFailedRequests>(`/usage/errors${buildQuery(params)}`, {
    token,
  });
}

/**
 * The caller's cloud requests as one CSV or JSON file. The backend answers
 * with a download, so this reads the raw body instead of JSON.
 */
export async function fetchVoiceUsageExport(
  format: "csv" | "json",
  filters: VoiceRecordFilters,
  token: string,
): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE()}/usage/export${buildQuery({ format, ...filters })}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch {
    throw new VoiceApiError(0, "Backend is unreachable.");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new VoiceApiError(
      response.status,
      body.error ?? `HTTP ${response.status}`,
    );
  }
  return response.blob();
}

export function listVoiceDevices(token: string) {
  return voiceFetch<VoiceDevices>("/license/devices", { token });
}

export function removeVoiceDevice(id: string, token: string) {
  return voiceFetch<{ ok: true; seatsUsed: number; seatsMax: VoiceLimit }>(
    `/license/devices/${encodeURIComponent(id)}`,
    { method: "DELETE", token },
  );
}

export function getVoiceAdminUsage(token: string) {
  return voiceFetch<VoiceAdminUsage>("/admin/stats/usage", { token });
}

export function listVoiceAdminUsers(
  params: { page?: number; search?: string },
  token: string,
) {
  return voiceFetch<{ data: VoiceAdminUser[]; meta: Page }>(
    `/admin/users${buildQuery({ limit: 50, ...params })}`,
    { token },
  );
}

/** Provider requests over the backend's default window (the last 7 days). */
export function getVoiceAdminOverview(token: string) {
  return voiceFetch<VoiceAdminOverview>("/admin/stats/overview", { token });
}

export function listVoiceAdminModelStats(token: string) {
  return voiceFetch<{ data: VoiceAdminModelStat[] }>("/admin/stats/models", {
    token,
  });
}

export function listVoiceModelConfigs(token: string) {
  return voiceFetch<{ all: VoiceModelConfig[] }>("/admin/config/ai-model", {
    token,
  });
}

export function setVoiceModelRole(
  role: "active" | "fallback",
  modelId: string,
  token: string,
) {
  return voiceFetch<{ ok: true }>("/admin/config/ai-model", {
    method: "PUT",
    token,
    body: JSON.stringify(
      role === "active"
        ? { activeModelId: modelId }
        : { fallbackModelId: modelId },
    ),
  });
}

export function listVoiceAdminErrors(page: number, token: string) {
  return voiceFetch<{ data: VoiceAdminError[]; meta: Page }>(
    `/admin/logs/errors${buildQuery({ page, limit: 20 })}`,
    { token },
  );
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
      return "This account has no AlgorithVoice plan.";
    case "account_blocked":
      return "AlgorithVoice is disabled for this account. Contact support.";
    case "auth_unavailable":
      return "Sign-in could not be verified right now. Try again in a minute.";
    case "forbidden":
      return "You do not have access to this page.";
    case "cannot_block_self":
      return "You cannot block your own account.";
    case "model_not_found":
      return "That model is no longer configured. Reload the page.";
    case "invalid_date":
      return "Pick the dates again: one of them is not a valid day.";
    case "invalid_range":
      return "The start date is after the end date.";
    case "invalid_cursor":
      return "The list changed. Reload the page.";
    default:
      return error.status === 0
        ? "The AlgorithVoice service is unreachable."
        : `AlgorithVoice request failed (${error.message}).`;
  }
}

/**
 * Whether the (unverified) access token carries a scope. Display logic only:
 * tokens issued before AlgorithVoice joined the platform lack voice:access, and the
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

/** A backend "YYYY-MM-DD" UTC day, formatted without shifting time zones. */
export function formatUtcDay(
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
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
