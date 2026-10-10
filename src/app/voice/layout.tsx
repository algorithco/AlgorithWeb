import type { ReactNode } from "react";
import { ProductNav } from "@/components/product-nav";

/** AlgorithVoice section: the product navbar sits under the site header. */
export default function VoiceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ProductNav slug="voice" />
      {children}
    </>
  );
}
