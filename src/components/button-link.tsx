import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "text";
  external?: boolean;
}) {
  return (
    <Link
      className={`button button--${variant}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="button__mark">
        {external ? "↗" : "→"}
      </span>
    </Link>
  );
}
