/** Company facts and principles shared by the home and About pages. */

// Every figure here is a fact about the shipped products, not a target.
export const companyFacts = [
  { value: "2", label: "products, one standard" },
  { value: "6", label: "on-device speech models in Voice" },
  { value: "3", label: "coding agents Guard works with" },
  { value: "0", label: "trackers on this website" },
] as const;

export const productNotes: Record<string, string> = {
  voice:
    "Hold a hotkey, speak, and the text lands in the app you are already using. Transcription runs offline on your device. Cloud transcription is there when you choose it, never by default.",
  guard:
    "Coding agents run real commands on real machines. Guard sits between the agent and the action: it allows what is safe, blocks what is not, asks you when it is unsure, and keeps an audit log on your machine.",
};

export const companyPrinciples = [
  {
    title: "Local by default",
    body: "If a job can be done on your machine, it should be.",
    practice:
      "Voice transcribes offline, so in local mode audio never leaves your device and no account is needed. Guard’s default privacy mode is local-only: decisions are made and logged on your machine.",
  },
  {
    title: "Opt-in, not assumed",
    body: "Anything that sends data elsewhere stays off until you turn it on.",
    practice:
      "Voice sends audio to the cloud only if you set that up, with your own Groq key or through Algorithco. Guard asks for consent for each agent before it installs hooks, backs up your configuration first, and its install is reversible.",
  },
  {
    title: "Collect less, protect the rest",
    body: "The safest data is the data we never hold.",
    practice:
      "No analytics or ad trackers on this site. In Algorithco Account, passwords are hashed with Argon2id, IP addresses are kept only as keyed hashes, and two-factor authentication is available to everyone.",
  },
  {
    title: "Fail safe, explain everything",
    body: "When software is unsure, it should ask, not guess.",
    practice:
      "If Guard hits an error, a timeout or something it cannot parse, it asks you instead of allowing the action. One command, algo why, explains any decision: what happened, why, and how confident Guard was.",
  },
] as const;
