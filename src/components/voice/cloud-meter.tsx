import { displayDate } from "@/lib/dashboard-format";
import { formatSeconds, type VoiceUsage } from "@/lib/voice-api";

/** This month's cloud transcription against the plan's monthly allowance. */
export function CloudMeter({ usage }: { usage: VoiceUsage }) {
  const limit = usage.cloudSecondsLimit;
  const resets = displayDate(usage.periodEnd);
  const percent =
    typeof limit === "number" && limit > 0
      ? Math.min(100, (usage.cloudSecondsUsed / limit) * 100)
      : 0;
  const exhausted =
    typeof limit === "number" && usage.cloudSecondsUsed >= limit;
  return (
    <div className="voice-meter">
      <div className="voice-meter__figures">
        <strong>{formatSeconds(usage.cloudSecondsUsed)}</strong>
        <span>
          {limit === "unlimited"
            ? "used · unlimited on your plan"
            : limit === null
              ? "used · cloud transcription is part of the Pro plan"
              : `of ${formatSeconds(limit)} used`}
        </span>
      </div>
      {typeof limit === "number" ? (
        <div
          aria-label="Cloud transcription used this month"
          aria-valuemax={limit}
          aria-valuemin={0}
          aria-valuenow={Math.min(usage.cloudSecondsUsed, limit)}
          className={`voice-meter__bar${exhausted ? " is-exhausted" : ""}`}
          role="meter"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      ) : null}
      <p className="voice-meter__note">
        {exhausted
          ? `Cloud time is used up until ${resets}. Local dictation keeps working.`
          : `${usage.requests} cloud ${usage.requests === 1 ? "request" : "requests"} this month · resets on ${resets}.`}
      </p>
    </div>
  );
}
