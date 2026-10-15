export const dashboardRoutes = {
  overview: "/app",
  account: "/app/account",
  security: "/app/account#security",
  billing: "/app/billing",
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
  voiceDownload: "/voice/download",
} as const;

type Crumb = { label: string; href: string };

const voiceCrumb: Crumb = {
  label: "AlgorithVoice",
  href: dashboardRoutes.voice,
};
const guardCrumb: Crumb = {
  label: "AlgorithGuard",
  href: dashboardRoutes.guard,
};

/** The trail in the top bar: the page, under the section it belongs to. */
export const dashboardPageLabels: Record<
  string,
  { parent?: Crumb; page: string }
> = {
  [dashboardRoutes.overview]: { page: "Overview" },
  [dashboardRoutes.account]: { page: "Account" },
  [dashboardRoutes.billing]: { page: "Billing" },
  [dashboardRoutes.voice]: { page: "AlgorithVoice" },
  [dashboardRoutes.voiceAdmin]: { parent: voiceCrumb, page: "Admin" },
  [dashboardRoutes.voiceAdminModels]: {
    parent: voiceCrumb,
    page: "Admin · Models",
  },
  [dashboardRoutes.voiceAdminErrors]: {
    parent: voiceCrumb,
    page: "Admin · Errors",
  },
  [dashboardRoutes.guard]: { page: "AlgorithGuard" },
  [dashboardRoutes.guardHistory]: {
    parent: guardCrumb,
    page: "Decision history",
  },
  [dashboardRoutes.guardAudit]: { parent: guardCrumb, page: "Audit log" },
  [dashboardRoutes.guardPolicy]: { parent: guardCrumb, page: "Policy" },
  [dashboardRoutes.guardStats]: { parent: guardCrumb, page: "Usage & stats" },
};

export const voiceAdminNavigation = [
  { label: "Overview", href: dashboardRoutes.voiceAdmin },
  { label: "Models", href: dashboardRoutes.voiceAdminModels },
  { label: "Errors", href: dashboardRoutes.voiceAdminErrors },
] as const;

export type DashboardNavIcon =
  | "account"
  | "audit"
  | "billing"
  | "guard"
  | "history"
  | "home"
  | "mic"
  | "policy"
  | "pulse";

export type DashboardNavLink = {
  label: string;
  href: string;
  icon: DashboardNavIcon;
};

export type DashboardNavItem = DashboardNavLink & {
  /** Also current on pages below it that have no link of their own. */
  includeSubpaths?: boolean;
  children?: readonly DashboardNavLink[];
};

export type DashboardNavGroup = {
  title?: string;
  items: readonly DashboardNavItem[];
};

/** The sidebar: every destination of the dashboard is listed once. */
export const dashboardNavigation: readonly DashboardNavGroup[] = [
  {
    items: [
      { label: "Overview", href: dashboardRoutes.overview, icon: "home" },
    ],
  },
  {
    title: "Products",
    items: [
      {
        label: "AlgorithVoice",
        href: dashboardRoutes.voice,
        icon: "mic",
        includeSubpaths: true,
      },
      {
        label: "AlgorithGuard",
        href: dashboardRoutes.guard,
        icon: "guard",
        children: [
          {
            label: "Decision history",
            href: dashboardRoutes.guardHistory,
            icon: "history",
          },
          {
            label: "Audit log",
            href: dashboardRoutes.guardAudit,
            icon: "audit",
          },
          {
            label: "Policy",
            href: dashboardRoutes.guardPolicy,
            icon: "policy",
          },
          {
            label: "Usage & stats",
            href: dashboardRoutes.guardStats,
            icon: "pulse",
          },
        ],
      },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Account", href: dashboardRoutes.account, icon: "account" },
      { label: "Billing", href: dashboardRoutes.billing, icon: "billing" },
    ],
  },
];

export const dashboardResources = [
  { label: "AlgorithVoice docs", href: dashboardRoutes.voiceDocs },
  { label: "AlgorithGuard docs", href: dashboardRoutes.guardDocs },
] as const;
