import { describe, expect, it } from "vitest";
import {
  dayTick,
  exportFileName,
  failedRequestLabel,
  formatMonth,
  isUsageRange,
  rangeLabel,
  readLimit,
  sharePercent,
  summarizeDays,
} from "./voice-usage";

describe("usage ranges", () => {
  it("names the windows the page offers", () => {
    expect(rangeLabel(7)).toBe("7 days");
    expect(rangeLabel(365)).toBe("1 year");
    expect(isUsageRange(30)).toBe(true);
    expect(isUsageRange(14)).toBe(false);
  });
});

describe("summarizeDays", () => {
  it("adds up time and requests and finds the busiest day", () => {
    const summary = summarizeDays([
      { date: "2026-10-26", seconds: 0, requests: 0 },
      { date: "2026-10-27", seconds: 90, requests: 3 },
      { date: "2026-10-28", seconds: 30, requests: 1 },
    ]);
    expect(summary).toEqual({
      seconds: 120,
      requests: 4,
      activeDays: 2,
      busiest: { date: "2026-10-27", seconds: 90, requests: 3 },
      secondsPerRequest: 30,
    });
  });
  it("has no busiest day or average without usage", () => {
    const summary = summarizeDays([
      { date: "2026-10-28", seconds: 0, requests: 0 },
    ]);
    expect(summary.busiest).toBeNull();
    expect(summary.secondsPerRequest).toBeNull();
  });
});

describe("dates", () => {
  it("formats UTC months without shifting them", () => {
    expect(formatMonth("2026-10")).toBe("Oct 2026");
    expect(formatMonth("2027-01", "long")).toBe("January 2027");
  });
  it("labels every day in short windows and month starts in long ones", () => {
    expect(dayTick("2026-10-05", 30)).toBe("5");
    expect(dayTick("2026-10-05", 90)).toBe("");
    expect(dayTick("2026-11-01", 90)).toBe("Nov");
  });
  it("dates the export file name", () => {
    expect(exportFileName("csv", new Date("2026-10-29T23:59:00Z"))).toBe(
      "algorithvoice-usage-2026-10-29.csv",
    );
  });
});

describe("failedRequestLabel", () => {
  it("explains the codes the backend returns", () => {
    expect(failedRequestLabel("429")).toBe("The speech service was busy");
    expect(failedRequestLabel("rate_limited")).toBe(
      "The speech service was busy",
    );
    expect(failedRequestLabel("504")).toBe("The speech service timed out");
    expect(failedRequestLabel("502")).toBe("The speech service failed");
    expect(failedRequestLabel("provider_error")).toBe(
      "The speech service failed",
    );
    expect(failedRequestLabel("413")).toBe("The recording was too long");
    expect(failedRequestLabel("400")).toBe(
      "The speech service refused the audio",
    );
    expect(failedRequestLabel("error")).toBe("The request failed");
  });
});

describe("limits and shares", () => {
  it("reads plan limits as numbers, unlimited or unknown", () => {
    expect(readLimit(252000)).toBe(252000);
    expect(readLimit(0)).toBe(0);
    expect(readLimit("unlimited")).toBe("unlimited");
    expect(readLimit(undefined)).toBeNull();
    expect(readLimit("lots")).toBeNull();
    expect(readLimit(-1)).toBeNull();
  });
  it("rounds a share and stays within 0 to 100", () => {
    expect(sharePercent(1, 3)).toBe(33);
    expect(sharePercent(5, 0)).toBe(0);
    expect(sharePercent(9, 4)).toBe(100);
  });
});
