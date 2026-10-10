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
  voiceAdminModels: "/app/voice/admin/models",
  voiceAdminErrors: "/app/voice/admin/errors",
  voiceDocs: "/voice/docs",
  productsCatalog: "/#products",
} as const;

export const dashboardPageLabels: Record<
  string,
  { section: string; page: string }
> = {
  [dashboardRoutes.overview]: { section: "Workspace", page: "Overview" },
  [dashboardRoutes.account]: { section: "Workspace", page: "Account" },
  [dashboardRoutes.guard]: { section: "AlgorithGuard", page: "Overview" },
  [dashboardRoutes.guardHistory]: {
    section: "AlgorithGuard",
    page: "Decision history",
  },
  [dashboardRoutes.guardAudit]: { section: "AlgorithGuard", page: "Audit log" },
  [dashboardRoutes.guardPolicy]: { section: "AlgorithGuard", page: "Policy" },
  [dashboardRoutes.guardStats]: {
    section: "AlgorithGuard",
    page: "Usage & stats",
  },
  [dashboardRoutes.voice]: { section: "AlgorithVoice", page: "Overview" },
  [dashboardRoutes.voiceAdmin]: { section: "AlgorithVoice", page: "Admin" },
  [dashboardRoutes.voiceAdminModels]: {
    section: "AlgorithVoice",
    page: "Admin · Models",
  },
  [dashboardRoutes.voiceAdminErrors]: {
    section: "AlgorithVoice",
    page: "Admin · Errors",
  },
};

export const voiceAdminNavigation = [
  { label: "Overview", href: dashboardRoutes.voiceAdmin },
  { label: "Models", href: dashboardRoutes.voiceAdminModels },
  { label: "Errors", href: dashboardRoutes.voiceAdminErrors },
] as const;

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
  {
    label: "AlgorithGuard overview",
    href: dashboardRoutes.guard,
    icon: "guard",
  },
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
  { label: "AlgorithVoice overview", href: dashboardRoutes.voice, icon: "mic" },
] as const;

export function productDetailsRoute(slug: string) {
  return `/${encodeURIComponent(slug)}`;
}
