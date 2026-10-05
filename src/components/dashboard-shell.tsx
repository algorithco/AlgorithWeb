"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  dashboardPageLabels,
  dashboardRoutes,
  guardNavigation,
  workspaceNavigation,
} from "@/config/dashboard";
import type { PlatformSession } from "@/hooks/use-platform-session";
import { ThemeToggle } from "./theme-toggle";

export type DashboardIconName =
  | "account"
  | "apps"
  | "audit"
  | "billing"
  | "chevron"
  | "close"
  | "docs"
  | "external"
  | "guard"
  | "history"
  | "home"
  | "menu"
  | "policy"
  | "pulse"
  | "settings"
  | "spark";

export function DashboardIcon({ name }: { name: DashboardIconName }) {
  const paths: Record<DashboardIconName, ReactNode> = {
    account: (
      <>
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.75 19c.6-3.1 2.68-4.65 6.25-4.65S17.65 15.9 18.25 19" />
      </>
    ),
    apps: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <rect x="14" y="14" width="6" height="6" rx="1.4" />
      </>
    ),
    audit: (
      <>
        <path d="M8 4.5h8M9 3h6v3H9z" />
        <path d="M7 5H5.5v16h13V5H17M8.5 11h7M8.5 15h4.5" />
      </>
    ),
    billing: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 9h18M7 15h3" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    docs: (
      <>
        <path d="M5 3.5h9l5 5V21H5z" />
        <path d="M14 3.5V9h5M8.5 13h7M8.5 16.5h5" />
      </>
    ),
    external: <path d="M14 4h6v6M20 4l-9 9M18 13v7H4V6h7" />,
    guard: (
      <>
        <path d="M12 3 20 6v5c0 5.1-3.3 8.5-8 10-4.7-1.5-8-4.9-8-10V6z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    history: (
      <>
        <path d="M4 7v5h5" />
        <path d="M5.3 17A8 8 0 1 0 4 12" />
        <path d="M12 7.5V12l3 2" />
      </>
    ),
    home: (
      <>
        <path d="m3.5 11 8.5-7 8.5 7" />
        <path d="M5.5 10v10h13V10M9.5 20v-6h5v6" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    policy: (
      <>
        <path d="M7 3.5h10v17H7z" />
        <path d="M10 8h4M10 12h4M10 16h2" />
      </>
    ),
    pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19 13.5v-3l-2-.7a7 7 0 0 0-.7-1.7l.9-2-2.1-2.1-2 .9a7 7 0 0 0-1.7-.7L10.5 2h-3l-.7 2a7 7 0 0 0-1.7.7l-2-.9L1 6l.9 2a7 7 0 0 0-.7 1.7l-2 .7v3l2 .7a7 7 0 0 0 .7 1.7l-.9 2L3.1 20l2-.9a7 7 0 0 0 1.7.7l.7 2h3l.7-2a7 7 0 0 0 1.7-.7l2 .9 2.1-2.1-.9-2a7 7 0 0 0 .7-1.7z"
          transform="translate(2) scale(.83)"
        />
      </>
    ),
    spark: (
      <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="dashboard-icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      {paths[name]}
    </svg>
  );
}

const DashboardSessionContext = createContext<PlatformSession | null>(null);

export function useDashboardSession() {
  const session = useContext(DashboardSessionContext);
  if (!session) {
    throw new Error("useDashboardSession must be used inside DashboardShell");
  }
  return session;
}

function isActive(pathname: string, hash: string, href: string) {
  const [targetPath, targetHash = ""] = href.split("#");
  if (pathname !== targetPath) return false;
  if (targetHash) return hash === `#${targetHash}`;
  return pathname !== dashboardRoutes.overview || hash === "";
}

export function DashboardShell({
  children,
  session,
}: {
  children: ReactNode;
  session: PlatformSession;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState("");
  const displayName =
    session.profile?.name ?? session.profile?.email ?? "Algorithco account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const labels = dashboardPageLabels[pathname] ?? {
    section: "Workspace",
    page: "Dashboard",
  };
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <DashboardSessionContext.Provider value={session}>
      <div className="dashboard-shell">
        <button
          aria-label="Close navigation"
          className={`dashboard-sidebar__scrim${menuOpen ? " is-open" : ""}`}
          onClick={closeMenu}
          type="button"
        />
        <aside
          aria-label="Dashboard navigation"
          className={`dashboard-sidebar${menuOpen ? " is-open" : ""}`}
        >
          <div className="dashboard-sidebar__brand">
            <Link
              href={dashboardRoutes.overview}
              aria-label="Algorithco dashboard"
            >
              <span aria-hidden="true">A</span>
              <strong>algorithco</strong>
            </Link>
            <button
              aria-label="Close navigation"
              className="dashboard-sidebar__close"
              onClick={closeMenu}
              type="button"
            >
              <DashboardIcon name="close" />
            </button>
          </div>

          <nav className="dashboard-nav" aria-label="Workspace">
            <p>Workspace</p>
            {workspaceNavigation.map((item) => {
              const active = isActive(pathname, hash, item.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={active ? "is-active" : undefined}
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  <DashboardIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <nav className="dashboard-nav" aria-label="Guard product">
            <p>Guard control</p>
            {guardNavigation.map((item) => {
              const active = isActive(pathname, hash, item.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={active ? "is-active" : undefined}
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  <DashboardIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <nav
            className="dashboard-nav dashboard-nav--resources"
            aria-label="Resources"
          >
            <p>Resources</p>
            <Link href={dashboardRoutes.guardDocs} onClick={closeMenu}>
              <DashboardIcon name="docs" />
              <span>Documentation</span>
              <DashboardIcon name="external" />
            </Link>
          </nav>

          <Link
            className="dashboard-sidebar__account"
            href={dashboardRoutes.account}
            onClick={closeMenu}
          >
            <span className="dashboard-avatar" aria-hidden="true">
              {initial}
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>{session.profile?.email ?? "Central account"}</small>
            </span>
            <span className="dashboard-online-dot" title="Signed in" />
          </Link>
        </aside>

        <div className="dashboard-workspace">
          <header className="dashboard-topbar">
            <div>
              <button
                aria-expanded={menuOpen}
                aria-label="Open navigation"
                className="dashboard-menu-button"
                onClick={() => setMenuOpen(true)}
                type="button"
              >
                <DashboardIcon name="menu" />
              </button>
              <span className="dashboard-topbar__crumb">{labels.section}</span>
              <DashboardIcon name="chevron" />
              <strong>{labels.page}</strong>
            </div>
            <div className="dashboard-topbar__actions">
              <span className="dashboard-system-state">
                <i aria-hidden="true" /> All systems operational
              </span>
              <ThemeToggle />
              <Link href={dashboardRoutes.account}>
                <DashboardIcon name="settings" />
                <span>Account</span>
              </Link>
            </div>
          </header>
          <div className="dashboard-content" id="dashboard-content">
            {children}
          </div>
        </div>
      </div>
    </DashboardSessionContext.Provider>
  );
}
