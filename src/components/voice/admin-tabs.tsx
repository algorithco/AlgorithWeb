"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { voiceAdminNavigation } from "@/config/dashboard";

/** Sub-navigation shared by the AlgorithVoice admin pages. */
export function VoiceAdminTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="AlgorithVoice admin" className="voice-admin-tabs">
      {voiceAdminNavigation.map((item) => (
        <Link
          aria-current={pathname === item.href ? "page" : undefined}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
