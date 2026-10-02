import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/legal-placeholder";
export const metadata: Metadata = {
  title: "Terms",
  description: "Algorithco terms placeholder pending legal review.",
  alternates: { canonical: "/terms" },
};
export default function TermsPage() {
  return <LegalPlaceholder title="Terms of use" />;
}
