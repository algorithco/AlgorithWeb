export const voiceDocs = {
  install: {
    title: "Install AlgorithVoice",
    intro:
      "Install the desktop app, pick a speech model, and dictate into any app.",
    sections: [
      [
        "Windows",
        "Requires Windows 10 version 1809 or later. Run the .exe installer from the download page; it installs WebView2 if it is missing. If dictation stays silent, allow microphone access for desktop apps in Settings → Privacy → Microphone.",
      ],
      [
        "Linux",
        "Requires Ubuntu 22.04 or later, or a comparable distribution. Make the AppImage executable and run it, or install the .deb package on Debian and Ubuntu.",
      ],
      [
        "macOS",
        "A native macOS app is in development and has not been published yet.",
      ],
      [
        "First run",
        "The app opens your browser to sign in with your Algorithco account; a Free account is enough. Onboarding then asks for a hotkey and a transcription mode. For local mode the app downloads the model you choose once and verifies it before use.",
      ],
    ],
  },
  dictation: {
    title: "Dictation",
    intro:
      "Hold the hotkey, speak, release. The text appears where your cursor is.",
    sections: [
      [
        "Hotkey",
        "The default is Ctrl+Space. Change it during onboarding or in Settings to any modifier plus a key. It works in any app: terminal, editor, browser.",
      ],
      [
        "The pill",
        "A small always-on-top pill shows the recording state and a live waveform. It never takes focus, so the text goes to the app you were already in. Drag it anywhere on the screen.",
      ],
      [
        "Limits",
        "Holds shorter than 300 ms are discarded as accidental. A recording stops and is sent after 120 seconds. Press Esc while recording to cancel.",
      ],
      [
        "When text cannot be typed",
        "If the app cannot type into the focused window, it leaves the text on the clipboard and tells you; press Ctrl+V to paste it.",
      ],
    ],
  },
  "transcription-modes": {
    title: "Local and cloud",
    intro:
      "Local mode is the default and works offline. Cloud mode is optional.",
    sections: [
      [
        "Local",
        "Speech is transcribed on your computer by an on-device model. Audio never leaves the device, and it works offline once you are signed in.",
      ],
      [
        "Cloud with your own key",
        "Add your own Groq API key in Settings. The finished recording is sent from your computer straight to Groq after you release the hotkey, and Groq bills you for it. The key is stored in the operating system keyring.",
      ],
      [
        "Your Algorithco account",
        "Plan, cloud usage and registered computers for transcription that goes through Algorithco are shown in the dashboard under AlgorithVoice. Local dictation and cloud mode with your own key are never counted there.",
      ],
    ],
  },
  models: {
    title: "On-device models",
    intro:
      "Six speech models run locally. Each is downloaded on demand over HTTPS and checked against its SHA-256 hash.",
    sections: [
      [
        "Choosing a model",
        "Pick a model during onboarding or in Settings → Transcription mode → Local. The app checks your memory and disk space and shows which models fit this computer.",
      ],
      [
        "Managing models",
        "Settings shows download progress, and lets you verify, delete and switch the active model.",
      ],
    ],
  },
  troubleshooting: {
    title: "Troubleshooting",
    intro: "Start with the microphone, then check how text reaches your app.",
    sections: [
      [
        "Nothing is recorded",
        "Allow microphone access in your operating system's privacy settings and check its sound settings for the input device. If another app is holding the microphone, close it and try again.",
      ],
      [
        "Text does not appear",
        "When typing into the focused window fails, the text is on the clipboard: press Ctrl+V. This is more likely on Linux Wayland sessions, which restrict what apps may do to other windows.",
      ],
      [
        "Apps running as administrator",
        "On Windows, an app started normally cannot type into a window that runs as administrator. Start AlgorithVoice as administrator too to dictate into such windows.",
      ],
      [
        "The hotkey does nothing",
        "Another app may already use that combination. Choose a different hotkey in Settings.",
      ],
    ],
  },
} as const;

export type VoiceDocTopic = keyof typeof voiceDocs;

/** The on-device model catalog, shown on the models topic. */
export const voiceModels = [
  {
    id: "parakeet-tdt-0.6b-v3",
    note: "Default",
    size: "670 MB",
    languages:
      "25: Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Italian, Latvian, Lithuanian, Maltese, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Spanish, Swedish, Ukrainian",
    license: "CC-BY-4.0",
  },
  {
    id: "whisper-small",
    note: "Smallest download",
    size: "375 MB",
    languages: "99 (Whisper family)",
    license: "Apache-2.0",
  },
  {
    id: "whisper-large-v3-turbo",
    note: "",
    size: "1.0 GB",
    languages: "99 (Whisper family)",
    license: "MIT",
  },
  {
    id: "whisper-large-v3",
    note: "",
    size: "1.7 GB",
    languages: "99 (Whisper family)",
    license: "Apache-2.0",
  },
  {
    id: "qwen3-asr-1.7b",
    note: "",
    size: "2.4 GB",
    languages: "5: English, Chinese, Japanese, Korean, Vietnamese",
    license: "Apache-2.0",
  },
  {
    id: "distil-large-v3.5",
    note: "",
    size: "983 MB",
    languages: "English",
    license: "MIT",
  },
] as const;

/** Questions answered on the AlgorithVoice overview page. */
export const voiceFaq = [
  [
    "How does push-to-talk work?",
    "Hold the hotkey and speak. When you release it, your speech is transcribed and typed at the cursor in the app you are using.",
  ],
  [
    "Does my audio leave my computer?",
    "Not in local mode: transcription runs on your device and works offline. Cloud transcription is optional and off until you turn it on.",
  ],
  [
    "Which platforms are supported?",
    "Windows and Linux today. A native macOS app is in development and has not been published yet.",
  ],
  [
    "Do I need an account?",
    "Yes. The app asks you to sign in with an Algorithco account, and a Free account is enough. Signing in sends no audio and no transcripts.",
  ],
  [
    "What does it cost?",
    "The app and local dictation are free on every plan, including Free. Cloud mode with your own Groq key is billed by Groq.",
  ],
] as const;
