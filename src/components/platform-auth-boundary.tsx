"use client";

import { type ReactNode, useEffect } from "react";
import {
  type PlatformSession,
  usePlatformSession,
} from "@/hooks/use-platform-session";
import { isAccountLogoutPending } from "@/lib/account-auth";

export function PlatformAuthBoundary({
  children,
}: {
  children: (session: PlatformSession) => ReactNode;
}) {
  const session = usePlatformSession();
  const previewEnabled =
    process.env.NEXT_PUBLIC_DASHBOARD_PREVIEW === "visual-qa";
  const activeSession: PlatformSession = previewEnabled
    ? {
        ...session,
        token: "visual-qa",
        profile: {
          subject: "usr_visual_qa",
          name: "Alex Morgan",
          email: "alex@algorithco.com",
          expiresAt: 4_102_444_800,
        },
        ready: true,
        signedIn: true,
      }
    : session;

  useEffect(() => {
    if (
      previewEnabled ||
      !session.ready ||
      session.signedIn ||
      isAccountLogoutPending()
    )
      return;
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const query = new URLSearchParams({ returnTo });
    window.location.replace(`/signin?${query.toString()}`);
  }, [previewEnabled, session.ready, session.signedIn]);

  if (!activeSession.signedIn) {
    return (
      <section className="auth-page">
        <div className="auth-card" aria-live="polite">
          <p className="eyebrow">Algorithco workspace</p>
          <h1>
            {isAccountLogoutPending() ? "Signing out…" : "Opening sign in…"}
          </h1>
          <p className="muted">Taking you to the company sign-in page.</p>
        </div>
      </section>
    );
  }

  return children(activeSession);
}
