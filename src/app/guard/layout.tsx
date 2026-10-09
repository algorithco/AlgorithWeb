import type { ReactNode } from "react";
import { ProductNav } from "@/components/product-nav";

/** Guard section: the product navbar sits under the site header. */
export default function GuardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProductNav slug="guard" />
      {children}
    </>
  );
}
