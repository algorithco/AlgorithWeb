"use client";

import { apiFetch, buildQuery, normalizeBase } from "./api-base";

const ACCOUNT_API_BASE = () =>
  normalizeBase(process.env.NEXT_PUBLIC_ACCOUNT_API_BASE, "/api/account");

export type CompanyEntitlement = {
  product: string;
  plan: string;
  status: string;
  valid_until: string | null;
  limits: Record<string, unknown>;
  features: Record<string, boolean>;
  source: string;
};

export function getMyEntitlements(product: string | undefined, token: string) {
  return apiFetch<{ entitlements: CompanyEntitlement[] }>(
    ACCOUNT_API_BASE(),
    `/v1/entitlements${buildQuery({ product })}`,
    { token },
  );
}

export function createCheckoutSession(
  input: {
    product: string;
    plan: string;
    org_id?: string;
    seats?: number;
    success_url?: string;
    cancel_url?: string;
  },
  token: string,
) {
  return apiFetch<{ url: string; session?: string }>(
    ACCOUNT_API_BASE(),
    "/v1/billing/checkout",
    { method: "POST", token, body: JSON.stringify(input) },
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
