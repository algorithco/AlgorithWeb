import { absoluteUrl } from "@/config/site";

/**
 * The Algorithco MCP server: one address that AI assistants (Claude, Cursor,
 * VS Code, ...) connect to, signed in with Algorithco Account. Each product
 * adds its own tools behind it. Shown at /ai.
 */
export const mcpServerUrl = absoluteUrl("/mcp");

export type McpTool = {
  name: string;
  /** What it answers, in the visitor's words. */
  question: string;
  body: string;
};

export type McpProduct = {
  slug: "voice" | "guard";
  name: string;
  href: string;
  status: "live" | "next";
  statusLabel: string;
  summary: string;
  tools: readonly McpTool[];
};

export const mcpProducts: readonly McpProduct[] = [
  {
    slug: "voice",
    name: "AlgorithVoice",
    href: "/voice",
    status: "live",
    statusLabel: "Available",
    summary:
      "Your plan, your cloud usage and the computers signed in to your account.",
    tools: [
      {
        name: "get_plan",
        question: "What plan am I on?",
        body: "Plan, status, the date it runs until, the monthly cloud limit and how many computers it allows.",
      },
      {
        name: "get_usage_summary",
        question: "How much cloud time is left?",
        body: "This month's cloud transcription: seconds used, the limit and the number of requests.",
      },
      {
        name: "get_usage_daily",
        question: "How much did I dictate last week?",
        body: "Cloud seconds and requests for each of the last days, up to a year back.",
      },
      {
        name: "get_usage_monthly",
        question: "Is my usage going up?",
        body: "Cloud seconds and requests for each calendar month, up to two years back.",
      },
      {
        name: "list_recent_sessions",
        question: "When did I last use the cloud?",
        body: "Recent cloud requests: length, model, response time and when. Never the words.",
      },
      {
        name: "list_errors",
        question: "Why did my dictation fail?",
        body: "Recent failed cloud requests with a short reason: a limit, the provider or the network.",
      },
      {
        name: "list_devices",
        question: "Which computers are signed in?",
        body: "Each computer's name and type, when it was added and last seen, and your seat limit.",
      },
    ],
  },
  {
    slug: "guard",
    name: "AlgorithGuard",
    href: "/guard",
    status: "next",
    statusLabel: "Next",
    summary:
      "Your organisations, their policy statistics and what the guard has stopped, read the same way.",
    tools: [],
  },
];

/** Numbered parts of the drawing at /ai, in the order the loop lights them. */
export const mcpParts = [
  {
    n: 1,
    title: "You ask your assistant",
    body: "In Claude, Cursor or any assistant that speaks MCP, in your own words.",
  },
  {
    n: 2,
    title: "You approve it once",
    body: "Algorithco Account asks whether this assistant may read your products. Nothing is shared until you press Approve.",
  },
  {
    n: 3,
    title: "One server, read-only tools",
    body: "The assistant picks a tool and gets plain numbers back. No tool can change, delete or buy anything.",
  },
  {
    n: 4,
    title: "Your products answer",
    body: "Each product answers from your own account. What you dictated is never stored, so it can never be read.",
  },
] as const;

export type McpClient = {
  id: string;
  name: string;
  steps: readonly { title: string; text: string }[];
  /** A command or a config file, shown with a copy button. */
  code?: { label: string; text: string };
};

export const mcpClients: readonly McpClient[] = [
  {
    id: "claude",
    name: "Claude",
    steps: [
      {
        title: "Add a connector",
        text: "In Claude, open Settings, then Connectors, and choose Add custom connector.",
      },
      {
        title: "Paste the address",
        text: "Name it Algorithco and paste the server address below.",
      },
      {
        title: "Connect and approve",
        text: "Press Connect, sign in to Algorithco Account if asked, and approve.",
      },
    ],
  },
  {
    id: "claude-code",
    name: "Claude Code",
    steps: [
      {
        title: "Add the server",
        text: "Run the command below in a terminal.",
      },
      {
        title: "Sign in",
        text: "In Claude Code, type /mcp, pick algorithco and follow the sign-in in your browser.",
      },
    ],
    code: {
      label: "Terminal",
      text: `claude mcp add --transport http algorithco ${mcpServerUrl}`,
    },
  },
  {
    id: "cursor",
    name: "Cursor",
    steps: [
      {
        title: "Add the server",
        text: "Put the lines below in ~/.cursor/mcp.json, or in .cursor/mcp.json inside a project.",
      },
      {
        title: "Sign in",
        text: "Open Cursor Settings, then MCP, and press Connect next to algorithco.",
      },
    ],
    code: {
      label: "mcp.json",
      text: `{\n  "mcpServers": {\n    "algorithco": {\n      "url": "${mcpServerUrl}"\n    }\n  }\n}`,
    },
  },
  {
    id: "vscode",
    name: "VS Code",
    steps: [
      {
        title: "Add the server",
        text: "Put the lines below in .vscode/mcp.json, or run MCP: Add Server and choose HTTP.",
      },
      {
        title: "Sign in",
        text: "Start the server from the file or the MCP view; VS Code opens the sign-in in your browser.",
      },
    ],
    code: {
      label: ".vscode/mcp.json",
      text: `{\n  "servers": {\n    "algorithco": {\n      "type": "http",\n      "url": "${mcpServerUrl}"\n    }\n  }\n}`,
    },
  },
];

/** What a connected assistant can never do, said plainly. */
export const mcpPromises: readonly (readonly [string, string])[] = [
  [
    "It only reads",
    "Every tool is read-only. An assistant cannot change a setting, remove a computer, start a payment or write anything.",
  ],
  [
    "It never sees what you said",
    "AlgorithVoice does not store your dictation, so no tool has it to give. Usage is counted in seconds, not words.",
  ],
  [
    "It does not learn who you are",
    "The pass an assistant receives names your account by a number only: no email address, no name.",
  ],
  [
    "You decide, and you can take it back",
    "Each assistant asks for your approval and is listed under connected apps in your account, where you can sign it out at any time.",
  ],
];

export const mcpFaq: readonly (readonly [string, string])[] = [
  [
    "What is MCP?",
    "The Model Context Protocol is an open standard that lets an AI assistant use tools outside the chat. Algorithco runs one MCP server; your assistant connects to it the way a browser connects to a website.",
  ],
  [
    "Does it cost anything?",
    "No. It works on every plan and does not use your cloud transcription time.",
  ],
  [
    "Which assistants work?",
    "Any assistant that can add a remote MCP server with sign-in: Claude, Claude Code, Cursor and VS Code among them.",
  ],
  [
    "Will AlgorithGuard be added?",
    "Yes, behind the same address. When it arrives, your assistant will see the new tools the next time it connects, with nothing to set up again.",
  ],
];
