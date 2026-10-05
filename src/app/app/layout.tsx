"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PlatformAuthBoundary } from "@/components/platform-auth-boundary";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-route-shell">
      <PlatformAuthBoundary>
        {(session) => (
          <DashboardShell session={session}>{children}</DashboardShell>
        )}
      </PlatformAuthBoundary>
    </div>
  );
}
