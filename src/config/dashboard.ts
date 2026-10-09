export const dashboardRoutes = {
  overview: "/app",
  products: "/app#products",
  subscriptions: "/app#subscriptions",
  account: "/app/account",
  guard: "/app/guard",
  guardHistory: "/app/guard/history",
  guardAudit: "/app/guard/audit",
  guardPolicy: "/app/guard/policy",
  guardStats: "/app/guard/stats",
  guardDocs: "/guard/docs",
  voice: "/app/voice",
  voiceAdmin: "/app/voice/admin",
  productsCatalog: "/#products",
} as const;

export const dashboardPageLabels: Record<
  string,
  { section: string; page: string }
> = {
  [dashboardRoutes.overview]: { section: "Workspace", page: "Overview" },
  [dashboardRoutes.account]: { section: "Workspace", page: "Account" },
  [dashboardRoutes.guard]: { section: "Guard", page: "Overview" },
  [dashboardRoutes.guardHistory]: {
    section: "Guard",
    page: "Decision history",
  },
  [dashboardRoutes.guardAudit]: { section: "Guard", page: "Audit log" },
  [dashboardRoutes.guardPolicy]: { section: "Guard", page: "Policy" },
  [dashboardRoutes.guardStats]: { section: "Guard", page: "Usage & stats" },
  [dashboardRoutes.voice]: { section: "Voice", page: "Overview" },
  [dashboardRoutes.voiceAdmin]: { section: "Voice", page: "Admin" },
};

export const workspaceNavigation = [
  { label: "Overview", href: dashboardRoutes.overview, icon: "home" },
  { label: "Products", href: dashboardRoutes.products, icon: "apps" },
  {
    label: "Subscriptions",
    href: dashboardRoutes.subscriptions,
    icon: "billing",
  },
  { label: "Account", href: dashboardRoutes.account, icon: "account" },
] as const;

export const guardNavigation = [
  { label: "Guard overview", href: dashboardRoutes.guard, icon: "guard" },
  {
    label: "Decision history",
    href: dashboardRoutes.guardHistory,
    icon: "history",
  },
  { label: "Audit log", href: dashboardRoutes.guardAudit, icon: "audit" },
  { label: "Policy", href: dashboardRoutes.guardPolicy, icon: "policy" },
  { label: "Usage & stats", href: dashboardRoutes.guardStats, icon: "pulse" },
] as const;

export const voiceNavigation = [
  { label: "Voice overview", href: dashboardRoutes.voice, icon: "mic" },
] as const;

export function productDetailsRoute(slug: string) {
  return `/${encodeURIComponent(slug)}`;
}
