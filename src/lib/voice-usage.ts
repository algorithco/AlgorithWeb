import { DASHBOARD_LOCALE } from "./dashboard-format";
import type { VoiceDailyUsage, VoiceLimit } from "./voice-api";

/** The windows the Usage page offers, in days. */
export const USAGE_RANGES = [7, 30, 90, 365] as const;
export type UsageRange = (typeof USAGE_RANGES)[number];

export function rangeLabel(days: UsageRange): string {
  return days === 365 ? "1 year" : `${days} days`;
}

export function isUsageRange(value: number): value is UsageRange {
  return (USAGE_RANGES as readonly number[]).includes(value);
}

type Day = VoiceDailyUsage["daily"][number];

/** Totals for a run of days: time, requests, days used and the busiest day. */
export function summarizeDays(daily: readonly Day[]) {
  let seconds = 0;
  let requests = 0;
  let activeDays = 0;
  let busiest: Day | null = null;
  for (const day of daily) {
    seconds += day.seconds;
    requests += day.requests;
    if (day.requests > 0) activeDays += 1;
    if (day.seconds > 0 && (!busiest || day.seconds > busiest.seconds)) {
      busiest = day;
    }
  }
  return {
    seconds,
    requests,
    activeDays,
    busiest,
    secondsPerRequest: requests ? seconds / requests : null,
  };
}

/** A backend `YYYY-MM` UTC month as "Oct 2026" (or "October 2026"). */
export function formatMonth(
  month: string,
  style: "short" | "long" = "short",
): string {
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
    month: style,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`));
}

/**
 * The label under a column of the daily chart. A month or less shows every
 * day; longer windows mark only the first day of each month, by its name.
 */
export function dayTick(date: string, total: number): string {
  const day = Number(date.slice(8, 10));
  if (total <= 31) return String(day);
  if (day !== 1) return "";
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** What a failed cloud request's code means, for the person who sent it. */
export function failedRequestLabel(code: string): string {
  if (code === "429" || code === "rate_limited") {
    return "The speech service was busy";
  }
  if (code === "408" || code === "504") return "The speech service timed out";
  if (code === "provider_error" || /^5\d\d$/.test(code)) {
    return "The speech service failed";
  }
  if (code === "413") return "The recording was too long";
  if (/^4\d\d$/.test(code)) return "The speech service refused the audio";
  return "The request failed";
}

/** A plan limit as the Account service sends it, read for display. */
export function readLimit(value: unknown): VoiceLimit {
  if (value === "unlimited") return "unlimited";
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

/** `part` as a whole percentage of `total`, 0 when there is no total. */
export function sharePercent(part: number, total: number): number {
  if (!(total > 0)) return 0;
  return Math.round(Math.min(100, Math.max(0, (part / total) * 100)));
}

/** The name a downloaded export gets, dated in UTC. */
export function exportFileName(format: "csv" | "json", now = new Date()) {
  return `algorithvoice-usage-${now.toISOString().slice(0, 10)}.${format}`;
}
