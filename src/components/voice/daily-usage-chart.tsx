"use client";

import { useState } from "react";
import {
  formatSeconds,
  formatUtcDay,
  type VoiceDailyUsage,
} from "@/lib/voice-api";
import { dayTick } from "@/lib/voice-usage";

const requestsLabel = (count: number) =>
  `${count} ${count === 1 ? "request" : "requests"}`;

/**
 * Cloud transcription time per day as columns. Pointing at a day shows its
 * figures in the readout above the plot; the table below carries the same
 * numbers for keyboard and screen-reader users. Windows longer than a month
 * label only the first day of each month.
 */
export function DailyUsageChart({
  daily,
}: {
  daily: VoiceDailyUsage["daily"];
}) {
  const [active, setActive] = useState<number | null>(null);
  const peak = Math.max(...daily.map((day) => day.seconds), 0);
  const total = daily.reduce((sum, day) => sum + day.seconds, 0);
  const shown = active === null ? undefined : daily[active];

  return (
    <div
      className={`voice-chart${daily.length > 14 && daily.length <= 31 ? " voice-chart--dense" : ""}`}
    >
      <p className="voice-chart__readout" aria-hidden="true">
        <strong>{formatSeconds(shown ? shown.seconds : total)}</strong>
        <span>
          {shown
            ? `${formatUtcDay(shown.date, { weekday: "short", month: "short", day: "numeric" })} · ${requestsLabel(shown.requests)}`
            : `in the last ${daily.length} days`}
        </span>
      </p>
      <div
        aria-hidden="true"
        className="voice-chart__plot"
        onPointerLeave={() => setActive(null)}
      >
        <span className="voice-chart__peak">
          {peak > 0 ? formatSeconds(peak) : ""}
        </span>
        {daily.map((day, index) => (
          <div
            className={`voice-chart__day${active === index ? " is-active" : ""}`}
            key={day.date}
            onPointerDown={() => setActive(index)}
            onPointerEnter={() => setActive(index)}
          >
            <span className="voice-chart__track">
              {day.seconds > 0 ? (
                <span
                  className="voice-chart__bar"
                  style={{ height: `${(day.seconds / peak) * 100}%` }}
                />
              ) : null}
            </span>
            <span className="voice-chart__tick">
              {dayTick(day.date, daily.length)}
            </span>
          </div>
        ))}
      </div>
      <details className="voice-chart__table">
        <summary>View as table</summary>
        <div className="voice-admin__table">
          <table>
            <thead>
              <tr>
                <th scope="col">Day (UTC)</th>
                <th scope="col">Cloud time</th>
                <th scope="col">Requests</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((day) => (
                <tr key={day.date}>
                  <th scope="row">
                    {formatUtcDay(day.date, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                  <td>{formatSeconds(day.seconds)}</td>
                  <td>{day.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
