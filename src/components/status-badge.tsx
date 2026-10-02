import type { ProductStatus } from "@/config/products";

export function StatusBadge({
  status,
  label,
}: {
  status: ProductStatus;
  label: string;
}) {
  return (
    <span className={`status status--${status}`}>
      <span aria-hidden="true" className="status__dot" />
      {label}
    </span>
  );
}
