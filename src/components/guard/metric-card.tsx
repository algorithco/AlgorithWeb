import { AnimatedNumber } from "@/components/animated-number";

export function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "allow" | "ask" | "deny";
}) {
  return (
    <article className={`guard-card guard-metric guard-metric--${tone}`}>
      <p>{label}</p>
      <strong>
        {typeof value === "number" && Number.isInteger(value) ? (
          <AnimatedNumber value={value} />
        ) : typeof value === "string" && /^\d+$/.test(value) ? (
          <AnimatedNumber value={Number(value)} />
        ) : (
          value
        )}
      </strong>
    </article>
  );
}
