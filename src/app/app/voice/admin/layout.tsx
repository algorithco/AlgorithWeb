"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { useDashboardSession } from "@/components/dashboard-shell";
import { dashboardRoutes } from "@/config/dashboard";
import {
  getVoiceAdminUsage,
  tokenHasScope,
  VoiceApiError,
} from "@/lib/voice-api";

/** Gate for every AlgorithVoice admin page; the backend decides who is an operator. */
export default function VoiceAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = useDashboardSession();
  const ready =
    session.signedIn && tokenHasScope(session.token, "voice:access");
  const probe = useQuery({
    queryKey: ["voice", "admin", "usage"],
    queryFn: () => getVoiceAdminUsage(session.token),
    enabled: ready,
    retry: false,
  });

  const forbidden =
    probe.error instanceof VoiceApiError && probe.error.status === 403;
  if (forbidden || (session.ready && !ready)) {
    return (
      <div className="platform-dashboard">
        <section className="dashboard-panel">
          <p className="eyebrow">
            <span className="keep-case">AlgorithVoice</span> admin
          </p>
          <h1 className="voice-admin__title">No access</h1>
          <p className="muted">
            This page is for AlgorithVoice operators. Ask an operator to add
            your account, or go back to{" "}
            <Link href={dashboardRoutes.voice}>AlgorithVoice</Link>.
          </p>
        </section>
      </div>
    );
  }
  return children;
}
