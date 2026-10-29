/** Copy of the home page's "How it works" section and its drawing. */
export const howItWorks = {
  eyebrow: "How it works",
  title: "Your machine is the default. The cloud is your call.",
  lead: "Everything happens on the computer in front of you. One switch decides whether anything goes further.",
} as const;

/**
 * The numbered parts of the drawing, in the order the animation visits them.
 * Every line is a fact about the shipped products (see the docs).
 */
export const machineParts = [
  {
    n: 1,
    title: "Microphone",
    body: "Hold Ctrl + Space and speak. Your voice is captured right here.",
  },
  {
    n: 2,
    title: "Speech model",
    body: "Turns your voice into text on this machine, offline, and types it where your cursor is.",
  },
  {
    n: 3,
    title: "Your disk",
    body: "Your dictation history and AlgorithGuard's audit log are kept here.",
  },
  {
    n: 4,
    title: "The switch",
    body: "Cloud transcription stays off until you turn it on yourself.",
  },
] as const;
