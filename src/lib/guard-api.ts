"use client";

import { ApiError, apiFetch, buildQuery, normalizeBase } from "./api-base";

const API_BASE = () =>
  normalizeBase(process.env.NEXT_PUBLIC_GUARD_API_BASE, "/api/guard");

export class GuardApiError extends ApiError {
  override name = "GuardApiError";
}

export type GuardEntitlement = {
  product: "guard";
  plan: string;
  status: string;
  valid_until: string | null;
  limits: Record<string, unknown>;
  features: Record<string, boolean>;
  source: string;
};

export type GuardOrg = {
  org_id: string;
  org_name: string;
  owner_id: string;
  created_at: string;
};

export type AuditRecord = {
  trace_id: string;
  event_id: string;
  timestamp: string;
  tool_kind: number;
  redacted_payload: string;
  privacy_mode: number;
  org_id: string;
  decision: {
    action: number;
    reason: string;
    confidence_0_1: number;
    source_level: number;
    latency_ms: number;
    policy_version: string;
    trace_id: string;
  };
};

export type GuardStats = {
  total: number;
  allow: number;
  deny: number;
  ask: number;
  avg_latency_ms: number;
  buckets?: Array<{
    bucket_start: string;
    total: number;
    allow: number;
    deny: number;
    ask: number;
    avg_latency_ms: number;
  }>;
  per_user?: Array<{
    user_id: string;
    total: number;
    allow: number;
    deny: number;
    ask: number;
  }>;
  per_project?: Array<{
    project: string;
    total: number;
    allow: number;
    deny: number;
    ask: number;
  }>;
  truncated?: boolean;
};

type RequestOptions = RequestInit & { token?: string };

export async function guardFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  try {
    return await apiFetch<T>(API_BASE(), path, options);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new GuardApiError(error.status, error.message, error.upgrade);
    }
    throw error;
  }
}

export function guardHealth() {
  return guardFetch<{ status: string; service?: string }>("/health");
}

export function listGuardOrgs(token: string) {
  return guardFetch<{ orgs: GuardOrg[]; total: number }>("/v1/orgs", {
    token,
  });
}

export function createGuardOrg(name: string, token: string) {
  return guardFetch<GuardOrg>("/v1/orgs", {
    method: "POST",
    token,
    body: JSON.stringify({ org_name: name }),
  });
}

export function getGuardOrg(orgId: string, token: string) {
  return guardFetch<{ org: GuardOrg }>(
    `/v1/orgs/${encodeURIComponent(orgId)}`,
    {
      token,
    },
  );
}

export function getGuardEntitlement(token: string) {
  return guardFetch<GuardEntitlement>("/v1/entitlement", { token });
}

export function refreshGuardEntitlement(token: string) {
  return guardFetch<GuardEntitlement>("/v1/entitlements/refresh", {
    method: "POST",
    token,
  });
}

function query(params: Record<string, string | number | undefined>): string {
  return buildQuery(params);
}

export function listAudit(
  params: {
    org_id?: string;
    limit?: number;
    cursor?: string;
    decision?: string;
    tool_kind?: string;
    from?: string;
    to?: string;
  },
  token: string,
) {
  return guardFetch<{
    records: AuditRecord[];
    next_cursor: string;
    total: number;
    truncated: boolean;
  }>(`/v1/audit${query(params)}`, { token });
}

export function queryGuardStats(
  params: {
    org_id?: string;
    from?: string;
    to?: string;
    granularity?: string;
    limit?: number;
    top_n?: number;
  },
  token: string,
) {
  return guardFetch<GuardStats>(`/v1/stats${query(params)}`, { token });
}

export function getGuardPolicy(version: string, orgId: string, token: string) {
  return guardFetch<{
    version: string;
    signed_bytes_b64: string;
    sig_b64: string;
  }>(
    `/v1/policy/${encodeURIComponent(version)}?org_id=${encodeURIComponent(orgId)}`,
    {
      token,
    },
  );
}

export function dryRunGuardPolicy(
  input: { org_id: string; bundle: unknown; history_ids: string[] },
  token: string,
) {
  return guardFetch<{ result: string; decisions: string[]; evaluated: number }>(
    "/v1/policy/dry-run",
    { method: "POST", token, body: JSON.stringify(input) },
  );
}

export function publishGuardPolicy(
  input: { org_id: string; content: string },
  token: string,
) {
  return guardFetch<{ version: string; ok: boolean }>("/v1/policy/publish", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}
