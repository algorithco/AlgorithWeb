import type { DocProduct } from "./types";

export const guardDocs: DocProduct = {
  slug: "guard",
  name: "AlgorithGuard",
  description:
    "A control layer for CLI coding agents. It checks each command an agent wants to run, allows the safe ones, asks about the rest, and keeps an audit log.",
  productHref: "/guard",
  accent: "yellow",
  groups: [
    {
      title: "Get started",
      pages: [
        {
          slug: "",
          title: "Overview",
          summary:
            "AlgorithGuard sits between a coding agent and your shell. Every command the agent wants to run gets a decision: allow, ask or deny, with a reason you can read.",
          sections: [
            {
              id: "preview",
              title: "Early preview",
              blocks: [
                {
                  type: "note",
                  tone: "warning",
                  text: "AlgorithGuard is an early preview. Commands and defaults may still change between versions; the [changelog](/changelog/guard) lists every change.",
                },
              ],
            },
            {
              id: "what-it-does",
              title: "What it does",
              blocks: [
                {
                  type: "steps",
                  items: [
                    {
                      title: "The agent asks to run a command",
                      text: "AlgorithGuard attaches to the agent through its hook system, so it sees each shell command before it runs.",
                    },
                    {
                      title: "AlgorithGuard decides",
                      text: "Fixed rules, a cache of earlier decisions and local checks give one of three answers: **allow**, **ask** or **deny**. Most decisions take a few milliseconds.",
                    },
                    {
                      title: "Everything is recorded",
                      text: "The decision, its reason, its confidence, its source and how long it took go to a local audit log. `algo why` explains the last one.",
                    },
                  ],
                },
              ],
            },
            {
              id: "principles",
              title: "Principles",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Shadow first",
                      "A new installation only observes: it records what it would have blocked, and blocks nothing until you turn enforcement on.",
                    ],
                    [
                      "Fail safe",
                      "When anything goes wrong (a crash, a timeout, input it cannot read), the answer is **ask**, never **allow**.",
                    ],
                    [
                      "Rules before models",
                      "Fixed rules are checked first and always win over anything a model suggests.",
                    ],
                    [
                      "Local first",
                      "Decisions are made on your computer and the audit log stays there. Nothing leaves it unless you choose otherwise.",
                    ],
                    [
                      "Reversible",
                      "`algo init` backs up the agent configuration it changes, and `algo uninstall` puts it back byte for byte.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "agents",
              title: "Supported agents",
              blocks: [
                {
                  type: "table",
                  head: ["Agent", "Status"],
                  rows: [
                    [
                      "Claude Code",
                      "Supported. `algo init` connects it for you.",
                    ],
                    [
                      "Codex CLI",
                      "Early adapter, not set up by `algo init` yet",
                    ],
                    [
                      "OpenCode",
                      "Early adapter, not set up by `algo init` yet",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "In the preview, AlgorithGuard focuses on the shell commands an agent wants to run.",
                },
              ],
            },
            {
              id: "next",
              title: "Where to go next",
              blocks: [
                {
                  type: "list",
                  items: [
                    "[Install](/docs/guard/install) the CLI and its background service.",
                    "Follow the [quickstart](/docs/guard/quickstart) to connect Claude Code in a few minutes.",
                    "Read [how decisions are made](/docs/guard/how-it-works).",
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "install",
          title: "Install",
          summary:
            "Install the `algo` command and its three companion programs, then check the installation with `algo doctor`.",
          sections: [
            {
              id: "requirements",
              title: "Requirements",
              blocks: [
                {
                  type: "table",
                  head: ["", "Requirement"],
                  rows: [
                    ["Linux", "Supported"],
                    ["macOS", "Supported"],
                    [
                      "Windows",
                      "The CLI installs, but the background service is not available yet. Run AlgorithGuard inside WSL.",
                    ],
                    [
                      "Rust",
                      "A current stable Rust toolchain with `cargo`, from [rustup.rs](https://rustup.rs)",
                    ],
                    ["Agent", "Claude Code, for `algo init`"],
                  ],
                },
              ],
            },
            {
              id: "programs",
              title: "What gets installed",
              blocks: [
                {
                  type: "defs",
                  items: [
                    ["algo", "The command you use."],
                    [
                      "algo-daemon",
                      "The background service that makes decisions. It is started on demand.",
                    ],
                    [
                      "algo-hook-client",
                      "The small program your agent calls before each command.",
                    ],
                    [
                      "algo-tui",
                      "The terminal viewer opened by `algo` or `algo tui`.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "cargo",
              title: "Install with cargo",
              blocks: [
                {
                  type: "p",
                  text: "Install all four into `~/.algo/bin`, the folder AlgorithGuard expects them in:",
                },
                {
                  type: "code",
                  label: "Terminal",
                  code: "cargo install --root ~/.algo algocli-cli algocli-daemon algocli-hook-client algocli-tui",
                },
                {
                  type: "p",
                  text: "Then put that folder on your `PATH`. For bash or zsh, add this line to `~/.bashrc` or `~/.zshrc` and open a new terminal:",
                },
                {
                  type: "code",
                  label: "~/.bashrc",
                  code: 'export PATH="$HOME/.algo/bin:$PATH"',
                },
                {
                  type: "note",
                  tone: "info",
                  title: "Why ~/.algo/bin",
                  text: "For safety, the hook starts the background service only from `~/.algo/bin/algo-daemon` and never searches the `PATH` for it.",
                },
              ],
            },
            {
              id: "check",
              title: "Check the installation",
              blocks: [
                {
                  type: "code",
                  label: "Terminal",
                  code: "algo --version\nalgo doctor",
                },
                {
                  type: "p",
                  text: "`algo doctor` checks the programs, the background service's socket and its permissions, the audit database and your agent's configuration. Fix anything it marks before you go on. Next: the [quickstart](/docs/guard/quickstart).",
                },
              ],
            },
            {
              id: "uninstall",
              title: "Uninstall",
              blocks: [
                {
                  type: "code",
                  label: "Terminal",
                  code: "algo uninstall\nrm -rf ~/.algo/bin",
                },
                {
                  type: "p",
                  text: "`algo uninstall` restores your agent configuration from the backup made by `algo init`, removes the hook, the socket and the audit database. Add `--keep-db` to keep the audit log. It works even when the background service is broken.",
                },
              ],
            },
          ],
        },
        {
          slug: "quickstart",
          title: "Quickstart",
          summary:
            "Connect Claude Code, watch AlgorithGuard in shadow mode, then turn enforcement on when you trust its decisions.",
          sections: [
            {
              id: "init",
              title: "1. Connect Claude Code",
              blocks: [
                {
                  type: "code",
                  label: "Terminal",
                  code: "algo init",
                },
                {
                  type: "p",
                  text: "`algo init` walks you through these steps and asks before it changes anything:",
                },
                {
                  type: "list",
                  ordered: true,
                  items: [
                    "Finds your Claude Code configuration.",
                    "Shows the change it will make, as a before-and-after: one hook that runs before each tool call.",
                    "Asks for your consent. `--yes` answers yes for you.",
                    "Backs up the configuration, then adds the hook. Anything already there is kept.",
                    "Asks for a [privacy mode](/docs/guard/privacy-security#privacy-modes); `local-only` is the default. `--privacy local-only` answers for you.",
                    "Runs `algo doctor`.",
                  ],
                },
                {
                  type: "p",
                  text: "Running `algo init` again is safe: when the hook is already there it changes nothing, and it keeps your enforcement setting.",
                },
              ],
            },
            {
              id: "shadow",
              title: "2. Work as usual in shadow mode",
              blocks: [
                {
                  type: "p",
                  text: "Use Claude Code the way you always do. AlgorithGuard decides on every command but blocks nothing: what it would have denied or asked about is recorded as **would have blocked**.",
                },
                {
                  type: "code",
                  label: "Terminal",
                  code: "algo status   # counts: allowed, asked, blocked, would have blocked\nalgo why      # the last decision, explained\nalgo log      # the latest decisions",
                },
              ],
            },
            {
              id: "enforce",
              title: "3. Turn enforcement on",
              blocks: [
                {
                  type: "p",
                  text: "When the would-have-blocked decisions look right to you, switch to enforcing:",
                },
                {
                  type: "code",
                  label: "Terminal",
                  code: "algo enforce on",
                },
                {
                  type: "p",
                  text: "The background service reads the setting when it starts, so restart it: stop it with `pkill algo-daemon` and the next command your agent runs starts it again. `algo enforce off` goes back to shadow mode the same way.",
                },
              ],
            },
            {
              id: "pause",
              title: "Step out of the way",
              blocks: [
                {
                  type: "p",
                  text: "`algo pause` lets every command through at once, even when the background service is not running. `algo resume` brings AlgorithGuard back.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Concepts",
      pages: [
        {
          slug: "how-it-works",
          title: "How decisions are made",
          summary:
            "Each command goes through up to five levels, from fixed rules to asking you. Most commands are settled by the first two, in a few milliseconds.",
          sections: [
            {
              id: "decisions",
              title: "Allow, ask, deny",
              blocks: [
                {
                  type: "defs",
                  items: [
                    ["allow", "The command runs without interrupting you."],
                    [
                      "ask",
                      "Your agent asks you before it runs the command. This is also the answer whenever AlgorithGuard cannot decide safely.",
                    ],
                    [
                      "deny",
                      "The command is blocked and the agent is told why.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "pipeline",
              title: "The levels",
              blocks: [
                {
                  type: "table",
                  head: ["Level", "What it does", "Target time"],
                  rows: [
                    [
                      "L0 Rules",
                      "Fixed allow and deny rules, checked on the parsed command, not on its text. Hard denies cannot be overridden.",
                      "under 3 ms",
                    ],
                    [
                      "L1 Cache",
                      "Commands that are the same once normalised get the same answer as last time.",
                      "under 3 ms",
                    ],
                    [
                      "L2 Local check",
                      "A small classifier that runs on your processor.",
                      "under 10 ms",
                    ],
                    [
                      "L3 Remote evaluation",
                      "An optional second opinion from a remote service. Off unless you opt in, and not part of the preview builds.",
                      "under 250 ms",
                    ],
                    ["L4 You", "When nothing else is sure, you decide.", "—"],
                  ],
                },
                {
                  type: "p",
                  text: "Each level answers only when it is confident; otherwise the command moves to the next. The level that answered is the decision's **source**.",
                },
              ],
            },
            {
              id: "fail-safe",
              title: "Fail safe",
              blocks: [
                {
                  type: "p",
                  text: "Any error becomes **ask**: the background service not running while enforcing, a timeout, a command that cannot be parsed, a database error, an invalid policy. AlgorithGuard never turns an error into **allow**.",
                },
                {
                  type: "p",
                  text: "Shadow mode is the exception in the other direction: it never blocks, even on an error, and records **would have asked** instead.",
                },
              ],
            },
            {
              id: "explain",
              title: "Every decision explained",
              blocks: [
                {
                  type: "p",
                  text: "`algo why` prints the last decision with everything that led to it:",
                },
                {
                  type: "defs",
                  items: [
                    ["action", "allow, ask or deny."],
                    [
                      "reason",
                      "Why, in words: the rule or check that decided.",
                    ],
                    ["confidence", "How sure the level was, from 0 to 1."],
                    ["source", "The level that answered."],
                    ["latency", "How long the decision took, in milliseconds."],
                    [
                      "profile",
                      "The rule profile in use; `balanced` by default.",
                    ],
                    ["shadow", "Whether it was only recorded, not enforced."],
                    ["redacted_command", "The command, with secrets masked."],
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "privacy-security",
          title: "Privacy and security",
          summary:
            "Decisions are made on your computer and the audit log stays there. Secrets are masked before anything is stored.",
          sections: [
            {
              id: "local",
              title: "Local first",
              blocks: [
                {
                  type: "p",
                  text: "The rules, the cache and the audit log work without an account and without a network. Signing in is only needed for the team console.",
                },
              ],
            },
            {
              id: "privacy-modes",
              title: "Privacy modes",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "local-only",
                      "The default. Nothing leaves your computer.",
                    ],
                    [
                      "redacted",
                      "Allows remote evaluation of commands with secrets masked.",
                    ],
                    [
                      "full",
                      "Allows remote evaluation of commands as they are, which may include secrets.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "Before you choose `redacted` or `full`, `algo init` shows what would be sent and where, and records your consent in `~/.algo/consent.json`. The preview builds do not include remote evaluation, so they send nothing in any mode.",
                },
                {
                  type: "p",
                  text: "To see exactly what would leave your computer, run `algo log --show-egress` or `algo doctor --show-egress`. To stop all sending, run `algo init` again and choose `local-only`.",
                },
              ],
            },
            {
              id: "redaction",
              title: "Redaction",
              blocks: [
                {
                  type: "p",
                  text: "Before a command is stored or shown, secrets in it are masked: cloud access keys, GitHub and Slack tokens, private keys, JSON web tokens and long random-looking strings. The audit log keeps the masked command, never the original.",
                },
              ],
            },
            {
              id: "local-files",
              title: "Files are private to you",
              blocks: [
                {
                  type: "p",
                  text: "`~/.algo` is created readable by you only, and the socket and the audit database by you only as well. `algo doctor` checks these permissions.",
                },
              ],
            },
            {
              id: "account",
              title: "Your account",
              blocks: [
                {
                  type: "p",
                  text: "`algo login` signs the CLI in through your browser with your [Algorithco account](/docs/account). The CLI stores its credentials in your system's credential vault, and `algo logout` deletes them.",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Reference",
      pages: [
        {
          slug: "cli",
          title: "CLI reference",
          summary:
            "Every `algo` command and its options. Run `algo --help` or `algo <command> --help` for the same in your terminal.",
          sections: [
            {
              id: "summary",
              title: "Commands",
              blocks: [
                {
                  type: "table",
                  head: ["Command", "What it does"],
                  codeColumns: [0],
                  rows: [
                    ["algo", "Opens the terminal viewer."],
                    [
                      "algo init",
                      "Connects Claude Code and sets your privacy mode.",
                    ],
                    ["algo doctor", "Checks the installation."],
                    [
                      "algo status",
                      "Counts of decisions and the current mode.",
                    ],
                    ["algo why", "Explains the last decision."],
                    ["algo log", "Lists the latest decisions."],
                    ["algo enforce", "Switches between shadow and enforcing."],
                    ["algo pause", "Lets every command through."],
                    ["algo resume", "Ends a pause."],
                    ["algo policy", "Shows the policy in effect."],
                    ["algo tui", "Opens the terminal viewer."],
                    [
                      "algo login",
                      "Signs the CLI in to your Algorithco account.",
                    ],
                    ["algo logout", "Signs the CLI out."],
                    ["algo uninstall", "Undoes `algo init`."],
                  ],
                },
              ],
            },
            {
              id: "global",
              title: "Global option",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "--home <dir>",
                      "Use another home folder instead of yours, for example to try AlgorithGuard without touching your real configuration. The `ALGO_HOME` variable does the same.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "init",
              title: "algo init",
              blocks: [
                {
                  type: "p",
                  text: "Finds the Claude Code configuration, shows the change, asks for consent, backs the file up, adds the hook, sets the privacy mode and runs `algo doctor`. See the [quickstart](/docs/guard/quickstart#init).",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "--privacy <mode>",
                      "`local-only`, `redacted` or `full`, instead of being asked.",
                    ],
                    ["--yes", "Consent to the change without a prompt."],
                  ],
                },
                {
                  type: "code",
                  label: "Example",
                  code: "algo init --privacy local-only --yes",
                },
              ],
            },
            {
              id: "doctor",
              title: "algo doctor",
              blocks: [
                {
                  type: "p",
                  text: "Checks the companion programs, the background service's socket and its permissions, the audit database and the agent configuration.",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "--show-egress",
                      "Also shows what would leave your computer, with secrets masked, under your privacy mode.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "status",
              title: "algo status",
              blocks: [
                {
                  type: "p",
                  text: "Prints how many commands were allowed, asked about and blocked, how many were recorded in shadow mode and how many would have been blocked, with the enforcement and privacy settings.",
                },
              ],
            },
            {
              id: "why",
              title: "algo why",
              blocks: [
                {
                  type: "p",
                  text: "Prints the last decision: action, reason, confidence, source, latency, profile, whether it was shadow, the masked command, the time and the agent session. See [Every decision explained](/docs/guard/how-it-works#explain).",
                },
              ],
            },
            {
              id: "log",
              title: "algo log",
              blocks: [
                {
                  type: "p",
                  text: "Lists the latest decisions from the local audit log, newest first.",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "--limit <n>",
                      "How many decisions to show; 20 by default.",
                    ],
                    [
                      "--show-egress",
                      "Shows exactly what would leave your computer for each decision.",
                    ],
                  ],
                },
                {
                  type: "code",
                  label: "Example",
                  code: "algo log --limit 50",
                },
              ],
            },
            {
              id: "enforce",
              title: "algo enforce",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "algo enforce on",
                      "Enforce decisions: deny blocks, ask asks.",
                    ],
                    [
                      "algo enforce off",
                      "Shadow mode, the default: record decisions, block nothing.",
                    ],
                    [
                      "algo enforce status",
                      "Prints the current setting. `algo enforce` alone does the same.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "Restart the background service after a change: `pkill algo-daemon`, and it starts again with the next command.",
                },
              ],
            },
            {
              id: "pause",
              title: "algo pause and algo resume",
              blocks: [
                {
                  type: "p",
                  text: "`algo pause` lets every command through immediately, even when the background service is broken. `algo resume` ends the pause.",
                },
              ],
            },
            {
              id: "policy",
              title: "algo policy",
              blocks: [
                {
                  type: "p",
                  text: "Shows the policy in effect on this computer: its version, the privacy mode and whether enforcement is on. It only reads. Editing, dry runs and publishing signed policy bundles are in the [console](/docs/guard/console#policy).",
                },
              ],
            },
            {
              id: "tui",
              title: "algo tui",
              blocks: [
                {
                  type: "p",
                  text: "Opens the terminal viewer: a live feed of decisions with their details, and the active policy. Every row, button and tab can be clicked; hold `Shift` while clicking to select text. It only reads the audit log, so it can never block your agent. Running `algo` with no command opens it too.",
                },
              ],
            },
            {
              id: "login",
              title: "algo login and algo logout",
              blocks: [
                {
                  type: "p",
                  text: "`algo login` signs the CLI in to your Algorithco account: it prints a sign-in link and a device code, and you approve the sign-in in your browser.",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "--flow device",
                      "The default: approve with a code in any browser, also on another device.",
                    ],
                    [
                      "--flow loopback",
                      "Sign in with a browser on the same computer, which hands the result back to the CLI directly.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "`algo logout` deletes the credentials from your system's credential vault.",
                },
              ],
            },
            {
              id: "uninstall",
              title: "algo uninstall",
              blocks: [
                {
                  type: "p",
                  text: "Restores the agent configuration byte for byte from the backup made by `algo init`, and removes the hook, the socket and the audit database.",
                },
                {
                  type: "defs",
                  items: [["--keep-db", "Keep the audit log."]],
                },
              ],
            },
          ],
        },
        {
          slug: "configuration",
          title: "Configuration",
          summary:
            "Where AlgorithGuard keeps its files, and the settings you can change with environment variables.",
          sections: [
            {
              id: "files",
              title: "Files",
              blocks: [
                {
                  type: "p",
                  text: "Everything lives in `~/.algo`:",
                },
                {
                  type: "table",
                  head: ["Path", "What it is"],
                  codeColumns: [0],
                  rows: [
                    ["~/.algo/bin/", "The four programs."],
                    [
                      "~/.algo/config.json",
                      "Your settings: enforcement and privacy mode.",
                    ],
                    [
                      "~/.algo/audit.db",
                      "The local audit log and the decision cache (SQLite).",
                    ],
                    [
                      "~/.algo/algo.sock",
                      "The socket the hook uses to reach the background service.",
                    ],
                    [
                      "~/.algo/consent.json",
                      "The record of the privacy mode you consented to, and when.",
                    ],
                    [
                      "~/.algo/paused",
                      "Present while AlgorithGuard is paused.",
                    ],
                    ["~/.algo/hooks/", "The hook your agent calls."],
                  ],
                },
              ],
            },
            {
              id: "environment",
              title: "Environment variables",
              blocks: [
                {
                  type: "p",
                  text: "Variables are read by the background service when it starts and win over `config.json`.",
                },
                {
                  type: "table",
                  head: ["Variable", "Effect"],
                  codeColumns: [0],
                  rows: [
                    ["ALGO_HOME", "The home folder to use instead of yours."],
                    [
                      "ALGO_ENFORCE",
                      "Turns enforcement on or off, ahead of `config.json`.",
                    ],
                    ["ALGO_SHADOW", "The same switch, the other way round."],
                    [
                      "ALGO_PRIVACY",
                      "`local-only`, `redacted` or `full`. An unknown value means `local-only`.",
                    ],
                    [
                      "ALGO_DAEMON_BIN",
                      "An absolute path to the background service, when it is not in `~/.algo/bin`.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "profiles",
              title: "Rule profiles",
              blocks: [
                {
                  type: "p",
                  text: "Decisions are made under a profile: `strict` for sensitive repositories, `balanced` for everyday work, or `fast`. The preview uses `balanced`. A profile changes how sure a check must be before it may allow; hard deny rules apply in every profile.",
                },
              ],
            },
          ],
        },
        {
          slug: "console",
          title: "Team console",
          summary:
            "The AlgorithGuard console in the dashboard shows a workspace's decisions, audit log, policy and statistics.",
          sections: [
            {
              id: "open",
              title: "Open the console",
              blocks: [
                {
                  type: "p",
                  text: "Sign in at [trqsh.uz](/signin) and open [AlgorithGuard in the dashboard](/app/guard). Choose a workspace at the top. The CLI and the console use the same [Algorithco account](/docs/account).",
                },
                {
                  type: "note",
                  tone: "info",
                  text: "In the preview the CLI keeps its audit log on your computer, so a workspace shows decisions only once they are sent to it.",
                },
              ],
            },
            {
              id: "pages",
              title: "Pages",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Overview",
                      "The last 30 days at a glance, and the latest decisions.",
                    ],
                    ["History", "The last 50 decisions, with their reasons."],
                    [
                      "Audit",
                      "The latest 200 entries of the audit log. Commands are shown masked.",
                    ],
                    [
                      "Policy",
                      "Edit the workspace's policy, try it on past decisions, and publish it.",
                    ],
                    [
                      "Stats",
                      "The last 90 days by project and by person, and how fast decisions were.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "policy",
              title: "Policy",
              blocks: [
                {
                  type: "steps",
                  items: [
                    {
                      title: "Edit",
                      text: "Change the policy, written in YAML, on the Policy page.",
                    },
                    {
                      title: "Dry run",
                      text: "Run it against the workspace's masked history to see what it would have decided differently.",
                    },
                    {
                      title: "Publish",
                      text: "Publish it as a signed bundle with a version. The background service accepts only signed bundles, and never one older than the one it has.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "troubleshooting",
          title: "Troubleshooting",
          summary:
            "Start with `algo doctor`. Most problems are a missing program, a service that is not running, or a hook that is not installed.",
          sections: [
            {
              id: "doctor",
              title: "Run algo doctor first",
              blocks: [
                {
                  type: "p",
                  text: "Fix each line `algo doctor` marks as failed or warned, from the top. A missing companion program means the [install](/docs/guard/install#cargo) did not put all four in `~/.algo/bin`.",
                },
              ],
            },
            {
              id: "asks-everything",
              title: "My agent asks about every command",
              blocks: [
                {
                  type: "p",
                  text: "That is the fail-safe answer: AlgorithGuard could not decide. Run `algo why` and read the reason. Common causes:",
                },
                {
                  type: "list",
                  items: [
                    "The background service cannot start: check that `~/.algo/bin/algo-daemon` exists.",
                    "You are on Windows outside WSL, where the background service is not available yet.",
                    "The audit database cannot be opened: check the permissions of `~/.algo` with `algo doctor`.",
                  ],
                },
                {
                  type: "p",
                  text: "To keep working in the meantime, `algo pause` lets every command through.",
                },
              ],
            },
            {
              id: "nothing-recorded",
              title: "No decisions are recorded",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Check that `algo init` added the hook: `algo doctor` shows the agent configuration.",
                    "Check that AlgorithGuard is not paused: `algo resume`.",
                    "Restart Claude Code after `algo init`, so it reads the new hook.",
                  ],
                },
              ],
            },
            {
              id: "enforce",
              title: "algo enforce has no effect",
              blocks: [
                {
                  type: "p",
                  text: "The background service reads the setting when it starts. Stop it with `pkill algo-daemon`; the next command starts it with the new setting. Also check that `ALGO_ENFORCE` or `ALGO_SHADOW` is not set in your environment, as they win over the setting.",
                },
              ],
            },
            {
              id: "blocked",
              title: "A command I need is blocked",
              blocks: [
                {
                  type: "p",
                  text: "Run `algo why` to see the rule that denied it. Hard deny rules guard against destructive commands and cannot be overridden by the agent; run such a command yourself if you really mean it. While you investigate, `algo enforce off` returns to shadow mode.",
                },
              ],
            },
            {
              id: "login",
              title: "algo login does not finish",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Approve the sign-in on the **Sign in to this app?** page in your browser.",
                    "On a computer without a browser, use the default device flow and open the link on another device.",
                    "If your system has no credential vault, the CLI cannot keep you signed in; local decisions still work.",
                  ],
                },
              ],
            },
            {
              id: "report",
              title: "Reporting a problem",
              blocks: [
                {
                  type: "p",
                  text: "Write to us from the [contact page](/contact) with the output of `algo doctor` and `algo why`. Both mask secrets.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
