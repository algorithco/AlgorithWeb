import type { DocProduct } from "./types";

export const accountDocs: DocProduct = {
  slug: "account",
  name: "Algorithco Account",
  description:
    "One account for every Algorithco product: signing in, two-step verification, the apps you have signed in, and your plans.",
  accent: "neutral",
  groups: [
    {
      title: "Account",
      pages: [
        {
          slug: "",
          title: "Overview",
          summary:
            "One Algorithco account signs you in to AlgorithVoice, AlgorithGuard and the dashboard on algorithco.trqsh.uz.",
          sections: [
            {
              id: "one-account",
              title: "One account, every product",
              blocks: [
                {
                  type: "p",
                  text: "Your profile, your security settings and your plans live in one account. The website, the AlgorithVoice app and the `algo` command all sign in with it, always through your browser, so your password is only ever typed on algorithco.trqsh.uz.",
                },
              ],
            },
            {
              id: "create",
              title: "Create an account",
              blocks: [
                {
                  type: "steps",
                  items: [
                    {
                      title: "Open the sign-in page",
                      text: "Go to [Sign in](/signin) and choose to create an account.",
                    },
                    {
                      title: "Choose how to sign in",
                      text: "Use your email address and a password, or continue with Google or GitHub.",
                    },
                    {
                      title: "Verify your email",
                      text: "Follow the message sent to your email address. An account whose email is not verified cannot sign in with a password.",
                    },
                  ],
                },
                {
                  type: "p",
                  text: "A new account is on the Free plan of each product.",
                },
              ],
            },
            {
              id: "dashboard",
              title: "The account page",
              blocks: [
                {
                  type: "p",
                  text: "Everything about your account is on the [account page](/app/account) of the dashboard:",
                },
                {
                  type: "defs",
                  items: [
                    [
                      "Personal details",
                      "Your name and email, shared by every product.",
                    ],
                    [
                      "Password and two-step verification",
                      "See [Security](/docs/account/security).",
                    ],
                    [
                      "Connected accounts",
                      "Google and GitHub sign-in. See [Signing in](/docs/account/sign-in#google-github).",
                    ],
                    [
                      "Where you are signed in",
                      "See [Apps and devices](/docs/account/apps-and-devices).",
                    ],
                    [
                      "Plans and billing",
                      "See [Plans and billing](/docs/account/billing).",
                    ],
                    [
                      "Delete account",
                      "See [Delete your account](/docs/account/billing#delete).",
                    ],
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "sign-in",
          title: "Signing in",
          summary:
            "Sign in with a password, a code sent to your email, or Google or GitHub. Two-step verification is asked for on every one of them.",
          sections: [
            {
              id: "methods",
              title: "Ways to sign in",
              blocks: [
                {
                  type: "defs",
                  items: [
                    ["Password", "Your email address and your password."],
                    [
                      "Email code",
                      "A one-time code sent to your email, instead of the password.",
                    ],
                    [
                      "Google or GitHub",
                      "Continue with an account you already have there.",
                    ],
                  ],
                },
                {
                  type: "p",
                  text: "Whichever you use, an account with two-step verification also asks for its code.",
                },
              ],
            },
            {
              id: "google-github",
              title: "Google and GitHub",
              blocks: [
                {
                  type: "p",
                  text: "Add or remove them under **Connected accounts** on the [account page](/app/account). Linking Google or GitHub to an account that already exists asks for that account's password first, so no one can attach their sign-in to your account.",
                },
              ],
            },
            {
              id: "new-device",
              title: "New-device alerts",
              blocks: [
                {
                  type: "p",
                  text: "When your account is signed in to from a device it has not seen before, you get an email. If it was not you, change your password and sign that device out from [Apps and devices](/docs/account/apps-and-devices).",
                },
              ],
            },
            {
              id: "forgot",
              title: "Forgotten password",
              blocks: [
                {
                  type: "p",
                  text: "Use the [password reset](/signin?mode=forgot) on the sign-in page. A code is sent to your email; enter it and choose a new password. You can also sign in with an email code and change the password from the account page.",
                },
              ],
            },
          ],
        },
        {
          slug: "security",
          title: "Security",
          summary:
            "Your password and two-step verification. Changes to them are confirmed with a code sent to your email.",
          sections: [
            {
              id: "password",
              title: "Password",
              blocks: [
                {
                  type: "p",
                  text: "Change it under **Password and two-step verification** on the [account page](/app/account). A password that is too common, or that has appeared in a known data breach, is refused.",
                },
              ],
            },
            {
              id: "two-step",
              title: "Two-step verification",
              blocks: [
                {
                  type: "p",
                  text: "With two-step verification, signing in also takes a six-digit code from an authenticator app on your phone, such as Google Authenticator, Microsoft Authenticator or 1Password.",
                },
                {
                  type: "steps",
                  items: [
                    {
                      title: "Start",
                      text: "On the account page, turn on two-step verification.",
                    },
                    {
                      title: "Scan",
                      text: "Scan the QR code with your authenticator app, or type in the key shown under it.",
                    },
                    {
                      title: "Save your recovery codes",
                      text: "Download or copy the recovery codes and keep them somewhere safe, away from your phone.",
                    },
                    {
                      title: "Confirm",
                      text: "Enter the code your app shows to finish.",
                    },
                  ],
                },
              ],
            },
            {
              id: "recovery",
              title: "Recovery codes",
              blocks: [
                {
                  type: "p",
                  text: "If you lose your phone, sign in with one of your recovery codes instead of the app's code. Each code works once. Then set up two-step verification again with your new phone.",
                },
                {
                  type: "note",
                  tone: "warning",
                  text: "Without your authenticator app and without a recovery code, you cannot sign in. Keep the codes where you will find them.",
                },
              ],
            },
          ],
        },
        {
          slug: "apps-and-devices",
          title: "Apps and devices",
          summary:
            "How apps such as AlgorithVoice and the `algo` command are signed in, and how to sign out a browser or a device.",
          sections: [
            {
              id: "approve",
              title: "Approving an app",
              blocks: [
                {
                  type: "p",
                  text: "An app never asks for your password. It opens your browser instead, and the browser always stops on a **Sign in to this app?** page that names the app and your account, with **Approve** and **Deny**.",
                },
                {
                  type: "list",
                  items: [
                    "Approve only when you have just started the sign-in yourself, in the app in front of you.",
                    "If the page appears when you did not expect it, choose **Deny**.",
                  ],
                },
              ],
            },
            {
              id: "devices",
              title: "Where you are signed in",
              blocks: [
                {
                  type: "p",
                  text: "**Where you are signed in** on the [account page](/app/account) lists the browsers signed in with your account and when each was last active. Sign out any you do not recognise, then change your password.",
                },
              ],
            },
            {
              id: "app-sign-out",
              title: "Signing out of an app",
              blocks: [
                {
                  type: "defs",
                  items: [
                    ["AlgorithVoice", "**Settings → Account → Sign out**."],
                    ["AlgorithGuard", "Run `algo logout`."],
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: "billing",
          title: "Plans and billing",
          summary:
            "Each product has its own plan, all paid from your one account.",
          sections: [
            {
              id: "plans",
              title: "Plans",
              blocks: [
                {
                  type: "table",
                  head: ["AlgorithVoice", "Free", "Pro"],
                  rows: [
                    ["The desktop app", "Yes", "Yes"],
                    ["Local dictation", "Unlimited", "Unlimited"],
                    ["Cloud transcription", "No", "70 hours a month"],
                  ],
                },
                {
                  type: "p",
                  text: "AlgorithGuard is in early preview; the plans available to your account are listed on the account page. Prices are shown there before you pay.",
                },
              ],
            },
            {
              id: "upgrade",
              title: "Upgrade",
              blocks: [
                {
                  type: "p",
                  text: "Under **Plans and billing** on the [account page](/app/account), choose the plan you want and complete the checkout. The plan then applies everywhere you are signed in, the AlgorithVoice app included.",
                },
              ],
            },
            {
              id: "manage",
              title: "Invoices, payment and cancelling",
              blocks: [
                {
                  type: "p",
                  text: "**Manage billing** opens the billing portal, where you change your payment method, download invoices and cancel a subscription.",
                },
              ],
            },
            {
              id: "delete",
              title: "Delete your account",
              blocks: [
                {
                  type: "p",
                  text: "**Delete account** at the bottom of the [account page](/app/account) asks for a code sent to your email. Access ends at once: every browser and app is signed out. The account is removed permanently 24 hours later.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
