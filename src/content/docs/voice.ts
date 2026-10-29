import type { DocProduct } from "./types";

/** The on-device model catalog, in the order the app lists it. */
export const voiceModels = [
  {
    id: "parakeet-tdt-0.6b-v3",
    name: "Parakeet TDT 0.6B v3",
    note: "Default",
    size: "670 MB",
    memory: "4 GB (8 GB recommended)",
    languages:
      "25: Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Italian, Latvian, Lithuanian, Maltese, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Spanish, Swedish, Ukrainian",
    license: "CC-BY-4.0",
  },
  {
    id: "parakeet-unified-en-0.6b",
    name: "Parakeet Unified EN 0.6B",
    note: "",
    size: "663 MB",
    memory: "4 GB (8 GB recommended)",
    languages: "English",
    license: "NVIDIA Open Model License",
  },
  {
    id: "gigaam-v3-ru",
    name: "GigaAM v3",
    note: "",
    size: "232 MB",
    memory: "2 GB (4 GB recommended)",
    languages: "Russian",
    license: "MIT",
  },
  {
    id: "fastconformer-uz",
    name: "FastConformer Uzbek",
    note: "",
    size: "174 MB",
    memory: "2 GB (4 GB recommended)",
    languages: "Uzbek",
    license: "CC-BY-4.0",
  },
  {
    id: "whisper-small",
    name: "Whisper Small",
    note: "Smallest multilingual",
    size: "375 MB",
    memory: "2 GB (4 GB recommended)",
    languages: "98 (Whisper family)",
    license: "Apache-2.0",
  },
  {
    id: "whisper-large-v3-turbo",
    name: "Whisper Large v3 Turbo",
    note: "",
    size: "1.0 GB",
    memory: "4 GB (8 GB recommended)",
    languages: "98 (Whisper family)",
    license: "MIT",
  },
  {
    id: "whisper-large-v3",
    name: "Whisper Large v3",
    note: "",
    size: "1.8 GB",
    memory: "8 GB (16 GB recommended)",
    languages: "98 (Whisper family)",
    license: "Apache-2.0",
  },
  {
    id: "qwen3-asr-1.7b",
    name: "Qwen3 ASR 1.7B",
    note: "",
    size: "2.4 GB",
    memory: "8 GB (16 GB recommended)",
    languages: "5: English, Chinese, Japanese, Korean, Vietnamese",
    license: "Apache-2.0",
  },
  {
    id: "distil-large-v3.5",
    name: "Distil Large v3.5",
    note: "",
    size: "984 MB",
    memory: "4 GB (8 GB recommended)",
    languages: "English",
    license: "MIT",
  },
] as const;

export const voiceDocs: DocProduct = {
  slug: "voice",
  name: "AlgorithVoice",
  description:
    "Push-to-talk dictation for Windows and Linux. Hold a key, speak, and the text is typed where your cursor is.",
  productHref: "/voice",
  accent: "mono",
  groups: [
    {
      title: "Get started",
      pages: [
        {
          slug: "",
          title: "Overview",
          summary:
            "AlgorithVoice turns your speech into text in whatever app you are using. Hold a key, speak, release: the words appear at the cursor.",
          sections: [
            {
              id: "how-it-works",
              title: "How it works",
              blocks: [
                {
                  type: "steps",
                  items: [
                    {
                      title: "Hold the hotkey",
                      text: "Press and hold your push-to-talk key, `Ctrl+Space` unless you change it. A small pill at the edge of the screen shows that it is listening.",
                    },
                    {
                      title: "Speak",
                      text: "Talk the way you would to a person. The pill shows a live waveform so you can see the microphone hears you.",
                    },
                    {
                      title: "Release",
                      text: "Let go of the key. Your speech is transcribed and typed into the app you were in: a terminal, an editor, a browser, a chat window.",
                    },
                  ],
                },
                {
                  type: "p",
                  text: "AlgorithVoice never takes focus away from the app you are working in, so there is nothing to click and nothing to copy.",
                },
              ],
            },
            {
              id: "local-and-cloud",
              title: "Local and cloud",
              blocks: [
                {
                  type: "p",
                  text: "Speech can be transcribed in one of two places, and you choose which:",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "Local",
                      "A speech model runs on your own computer. Audio never leaves it, it works offline, and it is unlimited on every plan, including Free. This is how a new installation starts.",
                    ],
                    [
                      "Cloud",
                      "The recording is sent to Algorithco and transcribed with Microsoft's MAI-Transcribe 2. Nothing to download, and it recognises the language you speak by itself. Cloud transcription is part of the Pro plan.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "The differences are laid out in [Local and cloud](/docs/voice/transcription-modes).",
                },
              ],
            },
            {
              id: "requirements",
              title: "Requirements",
              blocks: [
                {
                  type: "table",
                  head: ["", "Requirement"],
                  rows: [
                    ["Windows", "Windows 10 version 1809 or later"],
                    [
                      "Linux",
                      "Ubuntu 22.04 or later, or a comparable distribution",
                    ],
                    [
                      "macOS",
                      "Not available yet: a native macOS app is in development",
                    ],
                    [
                      "Memory",
                      "2 GB free for the smallest local models, 4 to 8 GB for the default one",
                    ],
                    ["Disk", "174 MB to 2.4 GB for each local model you keep"],
                    [
                      "Account",
                      "An [Algorithco account](/docs/account); a Free account is enough",
                    ],
                  ],
                },
              ],
            },
            {
              id: "plans",
              title: "Plans",
              blocks: [
                {
                  type: "table",
                  head: ["", "Free", "Pro"],
                  rows: [
                    ["The desktop app", "Yes", "Yes"],
                    ["Local dictation", "Unlimited", "Unlimited"],
                    ["Cloud transcription", "No", "70 hours a month"],
                  ],
                },
                {
                  type: "p",
                  text: "You can see and change your plan in the dashboard; see [Plans and billing](/docs/account/billing).",
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
                    "[Install AlgorithVoice](/docs/voice/install) on Windows or Linux.",
                    "Learn the hotkey, the pill and the limits in [Dictation](/docs/voice/dictation).",
                    "Pick the right [on-device model](/docs/voice/models) for your language.",
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
            "Install the desktop app, sign in, and go through the three-step setup. It takes a few minutes, most of it the model download.",
          sections: [
            {
              id: "download",
              title: "Download",
              blocks: [
                {
                  type: "p",
                  text: "Get the latest version from the [download page](/voice/download). It always offers the newest release for each system.",
                },
              ],
            },
            {
              id: "windows",
              title: "Windows",
              blocks: [
                {
                  type: "steps",
                  items: [
                    {
                      title: "Run the installer",
                      text: "Open the downloaded `x64-setup.exe` file. It installs Microsoft Edge WebView2 when your computer does not have it yet.",
                    },
                    {
                      title: "Allow the microphone",
                      text: "Windows asks desktop apps for microphone access. If dictation stays silent later, open **Settings → Privacy & security → Microphone** and turn on access for desktop apps.",
                    },
                    {
                      title: "Start AlgorithVoice",
                      text: "It opens from the Start menu. A new version installs over the old one and keeps your settings, history and models.",
                    },
                  ],
                },
              ],
            },
            {
              id: "linux",
              title: "Linux",
              blocks: [
                {
                  type: "p",
                  text: "Two packages are offered. On Debian and Ubuntu, install the `.deb`:",
                },
                {
                  type: "code",
                  label: "Terminal",
                  code: "sudo apt install ./AlgorithVoice_*_amd64.deb",
                },
                {
                  type: "p",
                  text: "On any other distribution, make the AppImage executable and run it:",
                },
                {
                  type: "code",
                  label: "Terminal",
                  code: "chmod +x AlgorithVoice_*_amd64.AppImage\n./AlgorithVoice_*_amd64.AppImage",
                },
                {
                  type: "note",
                  tone: "info",
                  title: "Wayland",
                  text: "Wayland sessions restrict what an app may do to other windows. If the text cannot be typed for you, AlgorithVoice leaves it on the clipboard; see [Troubleshooting](/docs/voice/troubleshooting#text-does-not-appear).",
                },
              ],
            },
            {
              id: "macos",
              title: "macOS",
              blocks: [
                {
                  type: "p",
                  text: "A native macOS app is in development and has not been published yet. The [changelog](/changelog/voice) will say when it ships.",
                },
              ],
            },
            {
              id: "sign-in",
              title: "Sign in",
              blocks: [
                {
                  type: "p",
                  text: "On first start, the app opens your browser to sign in with your Algorithco account, so your password is never typed into the app. Sign in or create an account, then confirm on the **Sign in to this app?** page. The browser hands you back to the app.",
                },
                {
                  type: "p",
                  text: "Signing in sends no audio and no transcripts. The session renews itself while you use the app. To see which computers are signed in, or to sign one out, see [Apps and devices](/docs/account/apps-and-devices).",
                },
              ],
            },
            {
              id: "setup",
              title: "First-run setup",
              blocks: [
                {
                  type: "steps",
                  items: [
                    {
                      title: "Where transcription runs",
                      text: "Choose **Local** or **Cloud**. For Local, the app checks your memory and disk, recommends a model that fits, and downloads it. Setup waits until the download is finished.",
                    },
                    {
                      title: "Your push-to-talk key",
                      text: "Press the combination you want to hold while you speak. `Ctrl+Space` is the default.",
                    },
                    {
                      title: "A microphone check",
                      text: "Pick a microphone and say a few words to see that it hears you.",
                    },
                  ],
                },
                {
                  type: "p",
                  text: "You can skip setup and run it again at any time from **Settings → System → Run setup again**.",
                },
              ],
            },
            {
              id: "updates",
              title: "Updates",
              blocks: [
                {
                  type: "p",
                  text: "AlgorithVoice updates itself: a new version installs inside the app and restarts it. **Settings → System → Updates** shows the version you have. What changed in each version is in the [changelog](/changelog/voice).",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Use AlgorithVoice",
      pages: [
        {
          slug: "dictation",
          title: "Dictation",
          summary:
            "Hold the hotkey, speak, release. The text appears where your cursor is, in any app.",
          sections: [
            {
              id: "hotkey",
              title: "The hotkey",
              blocks: [
                {
                  type: "p",
                  text: "The default push-to-talk key is `Ctrl+Space`. Change it in **Settings → Dictation → Push-to-talk hotkey** by pressing the combination you want; it works in every app.",
                },
                {
                  type: "list",
                  items: [
                    "A hotkey is a modifier (`Ctrl`, `Alt`, `Shift` or the Windows key) plus a key, such as `Ctrl+Alt+D`.",
                    "A single key is accepted only when it types nothing, such as `F8`.",
                    "Shortcuts that other apps or the system rely on, such as `Ctrl+C`, `Alt+Tab` or `Alt+F4`, are refused.",
                  ],
                },
              ],
            },
            {
              id: "pill",
              title: "The pill",
              blocks: [
                {
                  type: "p",
                  text: "A small pill stays on top of other windows and shows what AlgorithVoice is doing: ready, recording with a live waveform, or transcribing. It never takes focus, so the text goes to the app you were already in. Drag it anywhere on the screen.",
                },
                {
                  type: "p",
                  text: "While it records, the pill has **Cancel** and **Stop** buttons. A soft sound marks the start and the end of each recording.",
                },
                {
                  type: "p",
                  text: "Before it records, the pill tells you when a dictation cannot be made: Cloud is chosen on a plan without it (**Pro required**), the month's cloud time is used up, no local model is chosen, or Cloud mode has no connection.",
                },
              ],
            },
            {
              id: "limits",
              title: "Length and timing",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Shortest",
                      "A press shorter than 300 ms is treated as accidental and nothing is recorded.",
                    ],
                    [
                      "Longest",
                      "A recording stops after 5 minutes and is sent as it is. Long recordings are transcribed in pieces, so nothing is dropped.",
                    ],
                    ["Cancel", "Press `Esc` while recording to throw it away."],
                    [
                      "No speech",
                      "A recording with no speech in it is reported as **No speech detected**; nothing is sent or typed.",
                    ],
                    [
                      "Microphone",
                      "After a dictation the microphone stays ready for 30 seconds, so the next one starts at once. Nothing is recorded in that time, but your system's microphone indicator stays on until it closes.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "writing-style",
              title: "Writing style",
              blocks: [
                {
                  type: "p",
                  text: "**Settings → Dictation → Writing style** decides how one dictation joins the next:",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "Continuous",
                      "The default. A dictation carries on from the last one, as if you had not stopped talking.",
                    ],
                    [
                      "Full sentences",
                      "Each dictation is kept exactly as it was transcribed, on its own.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "Filler sounds such as “uh” and “um” are left out of the text in both styles.",
                },
              ],
            },
            {
              id: "custom-words",
              title: "Custom words",
              blocks: [
                {
                  type: "p",
                  text: "List names, product names and terms in **Settings → Dictation → Custom words**, spelled the way you want them written. The Parakeet models prefer your spelling when they hear the word.",
                },
                {
                  type: "list",
                  items: [
                    "Up to 200 words or phrases, each up to 64 characters.",
                    "They apply to local transcription with the Parakeet models; other models and Cloud mode ignore them.",
                  ],
                },
              ],
            },
            {
              id: "typing",
              title: "How the text reaches your app",
              blocks: [
                {
                  type: "p",
                  text: "AlgorithVoice pastes the text into the window that has focus. If it cannot type there, it leaves the text on the clipboard and tells you; press `Ctrl+V` to paste it yourself.",
                },
                {
                  type: "note",
                  tone: "tip",
                  text: "On Windows, an app started normally cannot type into a window that runs as administrator. Start AlgorithVoice as administrator too when you dictate into such windows.",
                },
              ],
            },
            {
              id: "history",
              title: "History and usage",
              blocks: [
                {
                  type: "p",
                  text: "Every dictation is saved to **History** on your computer, where you can search it for a word or a phrase and delete entries. The **Usage** page shows a calendar of your dictations, your streaks and totals, for local and cloud transcription. Neither leaves your computer.",
                },
              ],
            },
          ],
        },
        {
          slug: "transcription-modes",
          title: "Local and cloud",
          summary:
            "Local mode runs on your computer and works offline. Cloud mode sends the recording to Algorithco. You can switch at any time.",
          sections: [
            {
              id: "compare",
              title: "At a glance",
              blocks: [
                {
                  type: "table",
                  head: ["", "Local", "Cloud"],
                  rows: [
                    [
                      "Where speech is transcribed",
                      "On your computer",
                      "On Algorithco's service, with Microsoft's MAI-Transcribe 2",
                    ],
                    [
                      "Audio leaves your computer",
                      "Never",
                      "Yes, once you release the key",
                    ],
                    ["Works offline", "Yes, once you are signed in", "No"],
                    [
                      "Plan",
                      "Free and Pro, unlimited",
                      "Pro, 70 hours a month",
                    ],
                    ["Download", "One model, 174 MB to 2.4 GB", "Nothing"],
                    [
                      "Language",
                      "The model's languages; you can pin one",
                      "Recognised automatically",
                    ],
                    ["Custom words", "With the Parakeet models", "Not used"],
                  ],
                },
              ],
            },
            {
              id: "switch",
              title: "Switch modes",
              blocks: [
                {
                  type: "p",
                  text: "Open **Settings → Dictation → Transcription mode** and choose **Local** or **Cloud**. The pill follows the change at once. A new installation starts in Local mode, so audio goes to the cloud only after you choose it.",
                },
              ],
            },
            {
              id: "local",
              title: "Local",
              blocks: [
                {
                  type: "p",
                  text: "Speech is transcribed by an on-device model, chosen in **Settings → Models**. The model is downloaded once and checked before it is used; after that, dictation needs no connection. See [On-device models](/docs/voice/models) for the list.",
                },
                {
                  type: "p",
                  text: "Local dictation is unlimited on every plan and is never counted in your account. The app keeps its own usage meter on your computer.",
                },
              ],
            },
            {
              id: "cloud",
              title: "Cloud",
              blocks: [
                {
                  type: "p",
                  text: "When you release the key, the finished recording is sent to Algorithco over HTTPS, signed in with your account, and transcribed with Microsoft's MAI-Transcribe 2. The text comes back to the app and is typed as usual. There is no key or service to set up.",
                },
                {
                  type: "list",
                  items: [
                    "Cloud transcription is part of the Pro plan, with 70 hours a month.",
                    "The length of each recording counts toward your month. The dashboard shows what you have used under [AlgorithVoice](/app/voice): [Usage](/app/voice/usage) goes back a year and [Request history](/app/voice/history) lists each request. Neither holds what you said.",
                    "Audio is held only while it is processed, and no transcript is kept by Algorithco.",
                  ],
                },
              ],
            },
            {
              id: "cloud-unavailable",
              title: "When cloud cannot be used",
              blocks: [
                {
                  type: "p",
                  text: "The pill says why before it records, and nothing is sent:",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "Pro required",
                      "Your plan does not include cloud transcription. Choose Local, or upgrade in [Plans and billing](/docs/account/billing).",
                    ],
                    [
                      "No cloud time left",
                      "This month's 70 hours are used up. Local still works without limit.",
                    ],
                    [
                      "No connection",
                      "Cloud mode needs the internet. Choose Local to keep dictating offline.",
                    ],
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "models",
          title: "On-device models",
          summary:
            "Nine speech models run on your computer. Each is downloaded on demand over HTTPS and checked against its SHA-256 hash before it is used.",
          sections: [
            {
              id: "catalog",
              title: "Catalog",
              blocks: [
                {
                  type: "table",
                  head: ["Model", "Download", "Memory", "Languages", "License"],
                  rows: voiceModels.map((model) => [
                    model.note
                      ? `**${model.name}** — ${model.note}`
                      : `**${model.name}**`,
                    model.size,
                    model.memory,
                    model.languages,
                    model.license,
                  ]),
                },
                {
                  type: "p",
                  text: "Accuracy and speed of each model, measured on the same recordings, are on the [benchmarks page](/voice/benchmarks).",
                },
              ],
            },
            {
              id: "choose",
              title: "Choosing a model",
              blocks: [
                {
                  type: "list",
                  items: [
                    "**One of the 25 European languages:** keep the default, Parakeet TDT 0.6B v3.",
                    "**English only:** Parakeet Unified EN, or Distil Large v3.5.",
                    "**Russian:** GigaAM v3. **Uzbek:** FastConformer Uzbek.",
                    "**Chinese, Japanese, Korean or Vietnamese:** Qwen3 ASR 1.7B.",
                    "**Any other language:** a Whisper model. Whisper Small is the lightest; Large v3 is the most thorough and needs the most memory.",
                  ],
                },
                {
                  type: "p",
                  text: "Pick a model during setup or in **Settings → Models**. The app checks your memory and free disk space and marks which models fit this computer.",
                },
              ],
            },
            {
              id: "language",
              title: "Language",
              blocks: [
                {
                  type: "p",
                  text: "The language setting is **Auto** by default: the model works out what you speak. With a multilingual model you can pin one language in **Settings → Models**, which helps with short phrases. The model list can be filtered by language.",
                },
              ],
            },
            {
              id: "manage",
              title: "Downloading and managing",
              blocks: [
                {
                  type: "list",
                  items: [
                    "A model is downloaded only when you choose it, from pinned versions, and verified before first use.",
                    "**Settings → Models** shows download progress and lets you verify, switch and delete models.",
                    "Deleting a model also unloads it from memory and frees its disk space.",
                    "A model that is already downloaded is reused, never downloaded again.",
                  ],
                },
                {
                  type: "p",
                  text: "Each model's license and attribution are shown next to it in the app.",
                },
              ],
            },
          ],
        },
        {
          slug: "settings",
          title: "Settings",
          summary:
            "Every setting in the app, in the order the Settings page shows them: Dictation, Models, Account and System.",
          sections: [
            {
              id: "dictation",
              title: "Dictation",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Push-to-talk hotkey",
                      "The key you hold to talk. See [The hotkey](/docs/voice/dictation#hotkey).",
                    ],
                    [
                      "Microphone",
                      "The input dictation records from, with a test. If the chosen microphone is unplugged, the system default is used until it is back.",
                    ],
                    [
                      "Writing style",
                      "Continuous or Full sentences. See [Writing style](/docs/voice/dictation#writing-style).",
                    ],
                    [
                      "Custom words",
                      "Names and terms written your way. See [Custom words](/docs/voice/dictation#custom-words).",
                    ],
                    [
                      "Transcription mode",
                      "Local or Cloud. See [Local and cloud](/docs/voice/transcription-modes).",
                    ],
                  ],
                },
              ],
            },
            {
              id: "models",
              title: "Models",
              blocks: [
                {
                  type: "p",
                  text: "The local model catalog: search, filter by language, the hardware check, downloads and the active model. See [On-device models](/docs/voice/models).",
                },
              ],
            },
            {
              id: "account",
              title: "Account",
              blocks: [
                {
                  type: "p",
                  text: "Your profile, your plan, and the session of this computer, with **Sign out**. Plans are changed in the dashboard; see [Plans and billing](/docs/account/billing).",
                },
              ],
            },
            {
              id: "system",
              title: "System",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Launch at login",
                      "Starts AlgorithVoice in the background when you sign in to your computer.",
                    ],
                    [
                      "Setup",
                      "Runs the first-run setup again: transcription, the hotkey and the microphone check.",
                    ],
                    ["Updates", "The installed version and the update button."],
                    [
                      "Diagnostics",
                      "The app's logs. They stay on your computer; attach them when you report a problem.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "The app has a light and a dark theme; switch between them from the sidebar.",
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
          slug: "privacy",
          title: "Privacy",
          summary:
            "What stays on your computer, what is sent, and to whom. In short: in Local mode, nothing you say leaves your computer.",
          sections: [
            {
              id: "on-your-computer",
              title: "On your computer",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Local transcription: the audio and the text never leave your computer.",
                    "History, the usage calendar and the local usage meter are stored on your computer only. You can delete them in the app.",
                    "Settings, custom words and logs are stored on your computer only. There is no sync between computers.",
                  ],
                },
              ],
            },
            {
              id: "sent",
              title: "What is sent",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Sign-in",
                      "Your account sign-in goes through your browser to Algorithco Account. No audio or transcript is part of it.",
                    ],
                    [
                      "Model downloads",
                      "The model files you choose, downloaded over HTTPS from Algorithco's model repository on Hugging Face. Nothing about you is sent with the request beyond what any download sends.",
                    ],
                    [
                      "Cloud mode only",
                      "Each recording, after you release the key, to Algorithco, which passes it through OpenRouter to Microsoft's MAI-Transcribe 2 to be transcribed. Algorithco records how long it was, to count your cloud time, and keeps neither the audio nor the text.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "no-tracking",
              title: "No tracking",
              blocks: [
                {
                  type: "p",
                  text: "The app has no analytics, no advertising and no cross-app tracking. The full policy is on the [privacy page](/privacy).",
                },
              ],
            },
          ],
        },
        {
          slug: "troubleshooting",
          title: "Troubleshooting",
          summary:
            "Start with the microphone, then check how the text reaches your app.",
          sections: [
            {
              id: "nothing-recorded",
              title: "Nothing is recorded",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Allow microphone access for desktop apps in your system's privacy settings.",
                    "Check the microphone chosen in **Settings → Dictation → Microphone**, and use its test.",
                    "Another app may hold the microphone. Close it and try again.",
                    "A press shorter than 300 ms is ignored on purpose: hold the key a little longer.",
                  ],
                },
              ],
            },
            {
              id: "text-does-not-appear",
              title: "The text does not appear",
              blocks: [
                {
                  type: "p",
                  text: "When typing into the focused window fails, the text is on the clipboard: press `Ctrl+V`. This happens more often:",
                },
                {
                  type: "list",
                  items: [
                    "On Linux Wayland sessions, which restrict what apps may do to other windows.",
                    "On Windows, in a window that runs as administrator. Start AlgorithVoice as administrator too.",
                  ],
                },
              ],
            },
            {
              id: "hotkey",
              title: "The hotkey does nothing",
              blocks: [
                {
                  type: "p",
                  text: "Another app may already use that combination, and the app tells you when it cannot register it. Choose a different one in **Settings → Dictation → Push-to-talk hotkey**.",
                },
              ],
            },
            {
              id: "pill-message",
              title: "The pill shows a message instead of recording",
              blocks: [
                {
                  type: "defs",
                  items: [
                    [
                      "Pro required",
                      "Cloud is chosen on a plan without it. Choose Local, or upgrade.",
                    ],
                    [
                      "No cloud time left",
                      "This month's cloud hours are used up. Choose Local until the month turns.",
                    ],
                    [
                      "No model",
                      "Local is chosen but no model is downloaded. Pick one in **Settings → Models**.",
                    ],
                    [
                      "No connection",
                      "Cloud mode is offline. Check your connection, or choose Local.",
                    ],
                  ],
                },
              ],
            },
            {
              id: "model",
              title: "A model will not download or load",
              blocks: [
                {
                  type: "list",
                  items: [
                    "Check free disk space: the catalog lists each model's size.",
                    "A model needs a minimum of memory, shown in the [catalog](/docs/voice/models#catalog). Close large apps or choose a smaller model.",
                    "Use **Verify** next to the model in **Settings → Models**; delete it and download it again if verification fails.",
                  ],
                },
              ],
            },
            {
              id: "sign-in",
              title: "Signing in does not finish",
              blocks: [
                {
                  type: "list",
                  items: [
                    "The browser page must stay open until it says the app is signed in; approve it on **Sign in to this app?**.",
                    "If the browser did not open, start the sign-in again from the app.",
                    "If the account check cannot be reached, the app offers to retry; it does not sign you out.",
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
                  text: "Write to us from the [contact page](/contact) and attach the logs from **Settings → System → Diagnostics**. They stay on your computer until you send them.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
