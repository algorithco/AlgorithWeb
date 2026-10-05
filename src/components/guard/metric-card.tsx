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
      <strong>{value}</strong>
    </article>
  );
}
