export function displayPlan(value: string | undefined) {
  if (!value) return "Free";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function displayDate(value: string | null | undefined) {
  if (!value) return "No expiry";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
