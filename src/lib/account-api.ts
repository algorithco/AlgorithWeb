"use client";

import { apiFetch, buildQuery, normalizeBase } from "./api-base";

const ACCOUNT_API_BASE = () =>
  normalizeBase(process.env.NEXT_PUBLIC_ACCOUNT_API_BASE, "/api/account");

export type CompanyEntitlement = {
  product: string;
  plan: string;
  status: string;
  validUntil: string | null;
  limits: Record<string, unknown>;
  source: string;
  sourceId: string;
  owner: {
    type: "user" | "org";
    id: string;
  };
};

export function getMyEntitlements(product: string | undefined, token: string) {
  return apiFetch<{ entitlements: CompanyEntitlement[] }>(
    ACCOUNT_API_BASE(),
    `/v1/entitlements${buildQuery({ product })}`,
    { token },
  );
}

export function createPortalSession(
  input: { org_id?: string; return_url?: string },
  token: string,
) {
  return apiFetch<{ url: string }>(ACCOUNT_API_BASE(), "/v1/billing/portal", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}
