import type { Metadata } from "next";
import Link from "next/link";
import { type LegalClause, LegalDocument } from "@/components/legal-document";
import { legal } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Algorithco collects, why, how long it is kept, who processes it and how to get it deleted.",
  alternates: { canonical: "/privacy" },
};

const mail = <a href={`mailto:${legal.email}`}>{legal.email}</a>;

const summary = [
  "No ads, no trackers and no third-party analytics on this website.",
  "AlgorithVoice and AlgorithGuard are local-first. By default your audio and your coding agents’ activity stay on your device.",
  "An Algorithco account keeps what it needs to sign you in and keep you safe. IP addresses are stored only as keyed hashes.",
  "We do not sell personal data.",
  `You can delete your account yourself. It is permanently erased ${legal.deletionGraceHours} hours later.`,
] as const;

const clauses: readonly LegalClause[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {legal.operator} Until it is registered, the founder is the controller
          responsible for the personal data described in this policy.
          “Algorithco”, “we” and “us” mean that operator.
        </p>
        <p>
          This policy covers the Algorithco website, Algorithco Account (the
          sign-in and billing service shared by our products), AlgorithVoice and
          AlgorithGuard. If a product shows you a more specific notice, for
          example before you turn on a cloud feature, that notice adds to this
          one.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <h3>When you visit the website</h3>
        <p>
          The website runs no analytics, advertising or tracking scripts. Our
          web server keeps standard request logs (IP address, the page
          requested, the browser’s user agent and the time), which we use only
          to keep the service secure and to fix problems. Your light or dark
          theme choice is saved in your browser and never sent to us.
        </p>

        <h3>When you create an Algorithco account</h3>
        <ul>
          <li>
            <strong>Identity.</strong> Your email address and name, including
            first and last name if you give them.
          </li>
          <li>
            <strong>Password.</strong> Stored only as an Argon2id hash. Nobody
            at Algorithco can read it.
          </li>
          <li>
            <strong>Google or GitHub sign-in.</strong> If you use it, the
            provider’s account identifier, the email address it shares with us
            and whether that address is verified. We never receive your password
            for those services.
          </li>
          <li>
            <strong>Two-factor authentication.</strong> If you turn it on, the
            authenticator secret, encrypted with AES-256-GCM, and one-way hashes
            of your recovery codes.
          </li>
          <li>
            <strong>Sessions.</strong> When you signed in, your browser’s user
            agent, and keyed hashes of your IP address and of a browser
            identifier. They let you see and end your sessions and let us warn
            you about sign-ins from browsers your account has not used before.
            That warning email shows the time, browser and IP address of the
            sign-in.
          </li>
          <li>
            <strong>Security log.</strong> Account events such as sign-ins,
            failed attempts, password changes and deletion requests. IP
            addresses in this log are stored only as keyed hashes.
          </li>
          <li>
            <strong>One-time codes and links</strong> we email you for sign-in,
            verification and password reset. We store only their hashes, and
            they expire.
          </li>
        </ul>

        <h3>When you pay</h3>
        <p>
          Paid plans are processed by Stripe. We never see or store your full
          card details. We keep the Stripe customer and subscription
          identifiers, your plan, its status and its renewal date, so we know
          which features your account includes.
        </p>

        <h3>When you use AlgorithVoice</h3>
        <ul>
          <li>
            <strong>Local mode.</strong> Transcription runs on your device.
            Audio does not leave it. The app asks you to sign in with your
            Algorithco account, which sends no audio. Speech models are
            downloaded once from Hugging Face, which, like any download, sees
            your IP address.
          </li>
          <li>
            <strong>Transcript history</strong> is saved in a database on your
            device, never on our servers. You can delete entries or clear it.
          </li>
          <li>
            <strong>Cloud mode.</strong> Only when you choose it, on the Pro
            plan: audio is sent to our backend and forwarded through OpenRouter
            to Microsoft’s MAI-Transcribe 2 for transcription. Longer recordings
            may be queued, in which case the audio and the result are held for
            at most one hour. We record usage, such as seconds transcribed, the
            model and timing, but not the audio.
          </li>
          <li>
            <strong>Local usage meter.</strong> On-device counts (sessions,
            seconds of audio, words). They never include audio or text and never
            leave your device.
          </li>
        </ul>

        <h3>When you use AlgorithGuard</h3>
        <ul>
          <li>
            AlgorithGuard runs on your machine. Its decisions and its audit log
            are stored locally, in <code>~/.algo/audit.db</code>.
          </li>
          <li>
            You choose a privacy mode when you install it.{" "}
            <strong>local-only</strong> is the default, and nothing leaves your
            machine. <strong>redacted</strong> sends redacted requests for
            remote evaluation to TypeSafe (api.typesafe.ai, United States) using
            your own API key. <strong>full</strong> sends the same requests
            unredacted, and they may contain secrets.
          </li>
          <li>
            <code>algo log --show-egress</code> shows exactly what would leave
            your machine. Running <code>algo init</code> again and choosing
            local-only stops all sending.
          </li>
          <li>
            If your organization uses the AlgorithGuard web dashboard, the
            policies and audit events it sends there are stored on our servers
            for that organization. Audit events are stored in redacted form.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <>
        <ul>
          <li>
            <strong>To provide the services:</strong> signing you in, keeping
            your sessions, and delivering the features in your plan. We need
            this to perform our agreement with you.
          </li>
          <li>
            <strong>To keep accounts and services secure:</strong> rate limits,
            lockouts after repeated failures, new sign-in alerts and
            investigating abuse. This is our legitimate interest, and yours.
          </li>
          <li>
            <strong>To send service email:</strong> codes, verification,
            security alerts and account deletion notices. We do not send
            marketing email. If that ever changes, it will be opt-in.
          </li>
          <li>
            <strong>To bill you</strong> for paid plans and manage your
            subscription.
          </li>
          <li>
            <strong>To run features you choose,</strong> such as Algorithco
            cloud transcription in AlgorithVoice. You can stop at any time by
            switching back to local mode.
          </li>
          <li>
            <strong>To meet legal obligations</strong> where the law requires us
            to keep or disclose information.
          </li>
        </ul>
        <p>
          We do not sell personal data, and we do not use it for advertising.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    body: (
      <>
        <p>
          We use only what the services need to work. There are no advertising
          or analytics cookies, which is why there is no cookie banner. Account
          cookies are secure, HTTP-only and limited to our own site.
        </p>
        <div className="legal-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Purpose</th>
                <th scope="col">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>__Host-account-session</code>
                </td>
                <td>Keeps you signed in to your Algorithco account.</td>
                <td>
                  {legal.sessionIdleDays} days without use,{" "}
                  {legal.sessionMaxYears} years at most
                </td>
              </tr>
              <tr>
                <td>
                  <code>__Host-oidc-session</code>
                </td>
                <td>
                  Signs you in to our products through Algorithco Account.
                </td>
                <td>Up to {legal.sessionIdleDays} days</td>
              </tr>
              <tr>
                <td>
                  <code>__Host-account-device</code>
                </td>
                <td>
                  Recognizes a browser you have used before, so we can alert you
                  to sign-ins from new ones. It stays after you sign out.
                </td>
                <td>400 days</td>
              </tr>
              <tr>
                <td>
                  <code>__Host-csrf</code>
                </td>
                <td>Protects account forms against cross-site requests.</td>
                <td>1 hour</td>
              </tr>
              <tr>
                <td>
                  <code>__Host-account-mfa</code>,{" "}
                  <code>__Host-account-social-*</code>
                </td>
                <td>
                  Carry a sign-in in progress, such as a two-factor step or a
                  Google or GitHub sign-in.
                </td>
                <td>5 to 10 minutes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          In your browser’s storage we keep your theme choice, and, only while
          you sign in, a short-lived sign-in transaction and one-time notices.
          The last two are cleared automatically.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who processes it for us",
    body: (
      <>
        <p>
          We use a small number of providers to run the services. Each receives
          only what its job requires.
        </p>
        <div className="legal-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Provider</th>
                <th scope="col">What for</th>
                <th scope="col">Whose data</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cloudflare</td>
                <td>Delivers and protects our websites.</td>
                <td>Visitors</td>
              </tr>
              <tr>
                <td>Resend</td>
                <td>
                  Sends our email: codes, verification and security alerts.
                </td>
                <td>Account holders</td>
              </tr>
              <tr>
                <td>Google, GitHub</td>
                <td>Sign-in with an existing account.</td>
                <td>Only if you choose it</td>
              </tr>
              <tr>
                <td>Stripe</td>
                <td>Payments and subscriptions.</td>
                <td>Paying customers</td>
              </tr>
              <tr>
                <td>OpenRouter</td>
                <td>AlgorithVoice cloud transcription.</td>
                <td>Only when you use it</td>
              </tr>
              <tr>
                <td>Hugging Face</td>
                <td>Hosts the on-device AlgorithVoice speech models.</td>
                <td>When the app downloads a model</td>
              </tr>
              <tr>
                <td>TypeSafe</td>
                <td>
                  AlgorithGuard remote evaluation, with your own key. You deal
                  with TypeSafe directly.
                </td>
                <td>Only in redacted or full mode</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We disclose personal data to authorities only when the law requires
          it. When Algorithco becomes a registered company, your data and this
          policy will move to that company, and we will tell account holders
          when it happens.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Where it is processed",
    body: (
      <p>
        Our providers operate internationally, so your data may be processed
        outside Uzbekistan, including in the United States and the European
        Union. Data travels between your device and our services over encrypted
        connections.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>
          <strong>Account data</strong> is kept while your account exists.
        </li>
        <li>
          <strong>Deleted accounts.</strong> When you delete your account, it is
          scheduled for deletion and permanently erased{" "}
          {legal.deletionGraceHours} hours later, together with its credentials,
          sessions, linked sign-in providers, subscriptions and entitlements.
        </li>
        <li>
          <strong>Sessions</strong> end after {legal.sessionIdleDays} days
          without use, and no later than {legal.sessionMaxYears} years after you
          sign in.
        </li>
        <li>
          <strong>Security log</strong> entries are deleted after{" "}
          {legal.auditRetentionDays} days, including entries about an account
          that has since been deleted.
        </li>
        <li>
          <strong>Email codes and links</strong> expire shortly after they are
          sent.
        </li>
        <li>
          <strong>Payment records</strong> held by Stripe are kept by Stripe as
          financial regulations require.
        </li>
        <li>
          <strong>AlgorithVoice cloud audio</strong> is held for at most one
          hour while it is processed. Usage records are kept while your account
          exists. Transcript history stays on your device until you delete it.
        </li>
        <li>
          <strong>AlgorithGuard’s local audit log</strong> stays on your machine
          until you delete it.
        </li>
        <li>
          <strong>Web server logs</strong> are kept only as long as we need them
          for security and troubleshooting.
        </li>
      </ul>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <>
        <ul>
          <li>Passwords are hashed with Argon2id.</li>
          <li>Two-factor secrets are encrypted with AES-256-GCM.</li>
          <li>
            IP addresses, session tokens and email codes are stored as keyed
            hashes, not in readable form.
          </li>
          <li>
            Session cookies are secure, HTTP-only and bound to our own site.
          </li>
          <li>
            Sign-in is rate-limited, repeated failures lock the attempt, and
            new-browser sign-ins trigger an email alert.
          </li>
          <li>Two-factor authentication is available on every account.</li>
        </ul>
        <p>
          No system is perfectly secure. If a breach affects your personal data,
          we will tell you without undue delay.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>give you a copy of the personal data we hold about you;</li>
          <li>correct data that is wrong or incomplete;</li>
          <li>delete your data;</li>
          <li>send your data to you in a portable format;</li>
          <li>restrict or object to how we use it.</li>
        </ul>
        <p>
          You can delete your account yourself in{" "}
          <Link href="/app/account">account settings</Link>. For anything else,
          email {mail} from the address on your account. We may ask you to
          confirm it is you, and we aim to reply within 30 days. You can also
          complain to your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Our services are not meant for anyone under {legal.minimumAge}. If we
        learn that we hold personal data of someone under {legal.minimumAge}, we
        will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        When this policy changes, we update the date at the top of the page. If
        a change materially affects how we handle your data, we will email
        account holders before it takes effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions or requests about your personal data: {mail}. See also our{" "}
        <Link href="/terms">Terms of service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      clauses={clauses}
      description="What we collect, why, how long we keep it and how to get it deleted, written to match how our software actually works."
      summary={summary}
      title="Privacy policy"
    />
  );
}
