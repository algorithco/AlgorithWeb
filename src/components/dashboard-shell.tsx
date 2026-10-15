"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  Fragment,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type DashboardNavItem,
  type DashboardNavLink,
  dashboardNavigation,
  dashboardPageLabels,
} from "@/config/dashboard";
import type { PlatformSession } from "@/hooks/use-platform-session";
import { AlgorithcoMark } from "./brand-marks";
import { ThemeToggle } from "./theme-toggle";

export type DashboardIconName =
  | "account"
  | "apps"
  | "audit"
  | "billing"
  | "chevron"
  | "close"
  | "guard"
  | "history"
  | "home"
  | "logout"
  | "menu"
  | "mic"
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
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
      </>
    ),
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

function SignOutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const session = useDashboardSession();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirmLogout = async () => {
    try {
      await session.logout();
    } catch {
      // The dialog stays open and presents the shared session error below.
    }
  };

  return (
    <dialog
      aria-labelledby="sign-out-title"
      aria-describedby="sign-out-description"
      className="dashboard-confirm-dialog"
      ref={dialogRef}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget && !session.loggingOut) {
          onClose();
        }
      }}
    >
      <div className="dashboard-confirm-dialog__content">
        <div className="dashboard-confirm-dialog__heading">
          <span className="dashboard-confirm-dialog__icon">
            <DashboardIcon name="logout" />
          </span>
          <div>
            <p className="eyebrow">Confirm sign out</p>
            <h2 id="sign-out-title">Sign out of Algorithco?</h2>
          </div>
        </div>
        <p id="sign-out-description">
          Your session on this browser will end. You will need to sign in again
          to open the dashboard.
        </p>
        {session.logoutError ? (
          <p className="form-error" role="alert">
            {session.logoutError}
          </p>
        ) : null}
        <div className="dashboard-confirm-dialog__actions">
          <button
            autoFocus
            className="button button--secondary"
            type="button"
            disabled={session.loggingOut}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="button button--primary dashboard-confirm-dialog__confirm"
            type="button"
            disabled={session.loggingOut}
            onClick={() => void confirmLogout()}
          >
            {session.loggingOut ? "Signing out…" : "Yes, sign out"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

const navigationHrefs = dashboardNavigation.flatMap((group) =>
  group.items.flatMap((item) => [
    item.href,
    ...(item.children ?? []).map((child) => child.href),
  ]),
);

function isCurrent(
  pathname: string,
  hash: string,
  item: DashboardNavItem | DashboardNavLink,
) {
  const [targetPath, targetHash] = item.href.split("#");
  if (pathname !== targetPath) {
    return (
      "includeSubpaths" in item &&
      item.includeSubpaths === true &&
      pathname.startsWith(`${targetPath}/`)
    );
  }
  if (targetHash) return hash === `#${targetHash}`;
  // The page's own link gives way to the link of the section jumped to.
  return hash === "" || !navigationHrefs.includes(`${pathname}${hash}`);
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
  const [signingOut, setSigningOut] = useState(false);
  const [hash, setHash] = useState("");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const name = session.profile?.name;
  const email = session.profile?.email;
  const displayName = name ?? email ?? "Algorithco account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";
  const labels = dashboardPageLabels[pathname] ?? { page: "Dashboard" };
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setMenuOpen(false);
    setHash(window.location.hash);
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    // The drawer only exists below this width; see the sidebar's media query.
    const wide = window.matchMedia("(min-width: 62.0625rem)");
    const closeWhenWide = () => {
      if (wide.matches) setMenuOpen(false);
    };
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("keydown", closeOnEscape);
    wide.addEventListener("change", closeWhenWide);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("keydown", closeOnEscape);
      wide.removeEventListener("change", closeWhenWide);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [menuOpen]);

  const navLink = (item: DashboardNavItem | DashboardNavLink) => {
    const current = isCurrent(pathname, hash, item);
    return (
      <Link
        aria-current={current ? "page" : undefined}
        className={current ? "is-active" : undefined}
        href={item.href}
        onClick={() => {
          // A link to a section of the open page changes no path, and the
          // router's own history entry fires no hashchange.
          setHash(item.href.includes("#") ? `#${item.href.split("#")[1]}` : "");
          closeMenu();
        }}
      >
        <DashboardIcon name={item.icon} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <DashboardSessionContext.Provider value={session}>
      <div className="dashboard-shell">
        <button
          aria-hidden="true"
          className={`dashboard-sidebar__scrim${menuOpen ? " is-open" : ""}`}
          onClick={closeMenu}
          tabIndex={-1}
          type="button"
        />
        <aside
          aria-label="Dashboard"
          className={`dashboard-sidebar${menuOpen ? " is-open" : ""}`}
          id="dashboard-sidebar"
        >
          <div className="dashboard-sidebar__brand">
            <Link
              href="/"
              aria-label="Algorithco home page"
              title="Back to the main page"
              onClick={closeMenu}
            >
              <span aria-hidden="true">
                <AlgorithcoMark />
              </span>
              <strong>algorithco</strong>
            </Link>
            <button
              aria-label="Close navigation"
              className="dashboard-sidebar__close"
              onClick={closeMenu}
              ref={closeButtonRef}
              type="button"
            >
              <DashboardIcon name="close" />
            </button>
          </div>

          <nav className="dashboard-sidebar__nav" aria-label="Dashboard">
            {dashboardNavigation.map((group) => (
              <div className="dashboard-nav" key={group.title ?? "overview"}>
                {group.title ? <p>{group.title}</p> : null}
                {group.items.map((item) => (
                  <Fragment key={item.href}>
                    {navLink(item)}
                    {item.children ? (
                      <div className="dashboard-nav__children">
                        {item.children.map((child) => (
                          <Fragment key={child.href}>{navLink(child)}</Fragment>
                        ))}
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </div>
            ))}
          </nav>

          <div className="dashboard-sidebar__account">
            <span className="dashboard-avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="dashboard-sidebar__identity">
              <strong title={displayName}>{displayName}</strong>
              {name && email ? <small title={email}>{email}</small> : null}
            </span>
            <button
              aria-label="Sign out"
              className="dashboard-sidebar__signout"
              disabled={session.loggingOut}
              onClick={() => setSigningOut(true)}
              title="Sign out"
              type="button"
            >
              <DashboardIcon name="logout" />
            </button>
          </div>
        </aside>

        <div className="dashboard-workspace">
          <header className="dashboard-topbar">
            <div className="dashboard-topbar__trail">
              <button
                aria-controls="dashboard-sidebar"
                aria-expanded={menuOpen}
                aria-label="Open navigation"
                className="dashboard-menu-button"
                onClick={() => setMenuOpen(true)}
                ref={menuButtonRef}
                type="button"
              >
                <DashboardIcon name="menu" />
              </button>
              {labels.parent ? (
                <>
                  <Link
                    className="dashboard-topbar__crumb"
                    href={labels.parent.href}
                  >
                    {labels.parent.label}
                  </Link>
                  <DashboardIcon name="chevron" />
                </>
              ) : null}
              <strong>{labels.page}</strong>
            </div>
            <ThemeToggle />
          </header>
          <div className="dashboard-content" id="dashboard-content">
            {children}
          </div>
        </div>

        <SignOutDialog open={signingOut} onClose={() => setSigningOut(false)} />
      </div>
    </DashboardSessionContext.Provider>
  );
}
