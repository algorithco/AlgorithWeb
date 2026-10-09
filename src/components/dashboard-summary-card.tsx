"use client";

import { AnimatedNumber } from "./animated-number";
import { DashboardIcon, type DashboardIconName } from "./dashboard-shell";

export function SummaryCard({
  detail,
  icon,
  label,
  loading,
  value,
  wideValue = false,
}: {
  detail: string;
  icon: DashboardIconName;
  label: string;
  loading: boolean;
  value: string;
  wideValue?: boolean;
}) {
  return (
    <article className="dashboard-summary-card" aria-busy={loading}>
      <div>
        <span className="dashboard-summary-card__icon">
          <DashboardIcon name={icon} />
        </span>
        <span>{label}</span>
      </div>
      <strong className={wideValue ? "is-wide" : undefined}>
        {loading ? (
          "—"
        ) : /^\d+$/.test(value) ? (
          <AnimatedNumber value={Number(value)} />
        ) : (
          value
        )}
      </strong>
      <small>{detail}</small>
    </article>
  );
}
