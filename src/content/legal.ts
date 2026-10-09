import { siteConfig } from "@/config/site";

/**
 * Facts shared by the privacy policy and the terms. Keep them in sync with the
 * services: retention and lifetimes mirror algorithco-account's config
 * (AUDIT_RETENTION_DAYS, ACCOUNT_DELETE_GRACE_DAYS, session lifetimes).
 */
export const legal = {
  updated: "9 October 2026",
  updatedIso: "2026-10-09",
  email: siteConfig.contactEmail,
  operator:
    "Algorithco is operated by its founder in the Republic of Uzbekistan and is not yet a registered legal entity.",
  minimumAge: 16,
  deletionGraceDays: 30,
  auditRetentionDays: 365,
  sessionIdleDays: 14,
  sessionMaxDays: 90,
} as const;
