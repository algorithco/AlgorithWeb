import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/legal-placeholder";
export const metadata: Metadata = {
  title: "Privacy",
  description: "Algorithco privacy notice placeholder pending legal review.",
  alternates: { canonical: "/privacy" },
};
export default function PrivacyPage() {
  return <LegalPlaceholder title="Privacy notice" />;
}
