export const guardDocs = {
  install: {
    title: "Install AlgorithGuard",
    intro:
      "Install the local-first AlgorithGuard CLI and connect it to your Algorithco account.",
    sections: [
      [
        "Install",
        "Download the signed release for your operating system, place the algo binary on PATH, then run algo doctor.",
      ],
      [
        "Initialize",
        "Run algo init inside a repository. AlgorithGuard creates project-local configuration and starts in shadow mode so you can review decisions before enforcement.",
      ],
      [
        "Connect",
        "Run algo login to authorize the AlgorithGuard CLI through the central Account service. The browser and CLI share the same Algorithco identity.",
      ],
    ],
  },
  cli: {
    title: "CLI reference",
    intro:
      "The essential AlgorithGuard commands for setup, inspection, and enforcement.",
    sections: [
      [
        "algo init",
        "Create project configuration and detect supported coding agents.",
      ],
      [
        "algo doctor",
        "Check hooks, daemon health, policy signatures, and account connectivity.",
      ],
      [
        "algo status",
        "Show the active profile, enforcement mode, policy version, and recent activity.",
      ],
      [
        "algo why",
        "Explain one decision with action, reason, confidence, source, and latency.",
      ],
      [
        "algo log",
        "Inspect the local audit log. Add --show-egress only when you intentionally need to inspect outbound data.",
      ],
      [
        "algo enforce / pause",
        "Enable enforcement or temporarily return to observation mode.",
      ],
      [
        "algo login",
        "Authorize the CLI through the central Algorithco Account device flow.",
      ],
      [
        "algo policy",
        "Inspect, validate, dry-run, and synchronize policy bundles.",
      ],
    ],
  },
  configuration: {
    title: "Configuration",
    intro:
      "AlgorithGuard is conservative by default and keeps project policy explicit.",
    sections: [
      [
        "Profiles",
        "Use balanced for normal development, strict for sensitive repositories, or a reviewed custom policy bundle.",
      ],
      [
        "Fail-safe behavior",
        "Unknown inputs, unavailable models, invalid policy, or verification failures resolve to ask—never silently allow.",
      ],
      [
        "Policy precedence",
        "Hard deterministic rules run before local models or optional remote judgment.",
      ],
    ],
  },
  "privacy-security": {
    title: "Privacy and security",
    intro:
      "Local decisions remain local; cloud features receive only explicitly enabled, redacted data.",
    sections: [
      [
        "Local first",
        "Policy evaluation, caches, and the local audit log continue to work without a cloud account.",
      ],
      [
        "Redaction",
        "Secrets and sensitive command content are redacted before optional audit ingestion.",
      ],
      [
        "Account boundary",
        "The AlgorithGuard backend verifies short-lived Account access tokens locally and uses a read-only product-scoped service credential for entitlements.",
      ],
      [
        "Signed policies",
        "Published policy bundles are signed and rollback-protected before the daemon accepts them.",
      ],
    ],
  },
  troubleshooting: {
    title: "Troubleshooting",
    intro:
      "Start with local diagnostics, then verify Account and backend connectivity.",
    sections: [
      [
        "Run doctor",
        "Run algo doctor and resolve hook, daemon, policy, or signature failures first.",
      ],
      [
        "Account sign-in",
        "Sign in again if the short-lived browser or CLI token expired. Confirm trqsh.uz/account is reachable.",
      ],
      [
        "No dashboard data",
        "Confirm a workspace is selected and the daemon is configured to upload redacted audit events.",
      ],
      [
        "Fail-safe asks",
        "Inspect algo why and the active policy. AlgorithGuard intentionally asks when a dependency or rule cannot be evaluated safely.",
      ],
    ],
  },
  architecture: {
    title: "Architecture",
    intro:
      "AlgorithGuard separates fast local enforcement from optional account and team services.",
    sections: [
      [
        "Agent adapters",
        "Hooks and plugins normalize coding-agent tool requests into a stable event contract.",
      ],
      [
        "Local pipeline",
        "Parsing, redaction, deterministic rules, cache, and optional models produce allow, ask, or deny.",
      ],
      [
        "AlgorithGuard backend",
        "The backend provides organizations, redacted audit history, statistics, entitlement enforcement, and signed policy synchronization.",
      ],
      [
        "Algorithco platform",
        "The unified trqsh.uz frontend owns authentication, billing navigation, documentation, and the AlgorithGuard console.",
      ],
    ],
  },
} as const;

export type GuardDocTopic = keyof typeof guardDocs;
