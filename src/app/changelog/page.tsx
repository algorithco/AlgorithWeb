import type { Metadata } from "next";
import { ChangelogView } from "@/components/changelog/changelog-view";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What changed in AlgorithVoice, AlgorithGuard, Algorithco Account and this site, release by release.",
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  return <ChangelogView />;
}
