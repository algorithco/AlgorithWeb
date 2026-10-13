/**
 * The dashboard is written in English, so its dates are too: the browser's
 * language would put "3 нояб. 2026 г." in the middle of an English sentence.
 * Times stay in the visitor's own time zone.
 */
export const DASHBOARD_LOCALE = "en-GB";

type DateInput = string | number | Date;

function format(value: DateInput, options: Intl.DateTimeFormatOptions) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, options).format(date);
}

export function displayPlan(value: string | undefined) {
  if (!value) return "Free";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "3 Nov 2026", or "No expiry" for a plan that does not end. */
export function displayDate(value: string | null | undefined) {
  if (!value) return "No expiry";
  return format(value, { dateStyle: "medium" });
}

/** "3 Nov 2026, 16:53" */
export function displayDateTime(value: DateInput) {
  return format(value, { dateStyle: "medium", timeStyle: "short" });
}

/** "16:53" */
export function displayTime(value: DateInput) {
  return format(value, { timeStyle: "short" });
}

/** "1,284" */
export function displayCount(value: number) {
  return new Intl.NumberFormat(DASHBOARD_LOCALE).format(value);
}
