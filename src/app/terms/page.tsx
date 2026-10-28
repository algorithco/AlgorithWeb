import type { Metadata } from "next";
import Link from "next/link";
import { type LegalClause, LegalDocument } from "@/components/legal-document";
import { legal } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms for using the Algorithco website, Algorithco Account, AlgorithVoice and AlgorithGuard.",
  alternates: { canonical: "/terms" },
};

const mail = <a href={`mailto:${legal.email}`}>{legal.email}</a>;

const summary = [
  `You must be at least ${legal.minimumAge} to use our services.`,
  "Your content stays yours. We use it only to run the services for you.",
  "Paid plans renew until you cancel. You can cancel at any time and keep access until the end of the paid period. Payments are not refunded, except where the law requires it.",
  "AlgorithGuard is in early preview and helps you supervise coding agents. It does not replace your own review, and you stay responsible for what your agents do.",
  "These terms are governed by the laws of the Republic of Uzbekistan.",
] as const;

const clauses: readonly LegalClause[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: (
      <>
        <p>
          These terms apply when you use the Algorithco website, Algorithco
          Account, AlgorithVoice or AlgorithGuard (together, the “services”). By
          creating an account or using the services, you agree to them. If you
          do not agree, do not use the services.
        </p>
        <p>
          {legal.operator} “Algorithco”, “we” and “us” mean that operator. If
          you use the services for an organization, you confirm that you may
          accept these terms on its behalf.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use the services",
    body: (
      <p>
        You must be at least {legal.minimumAge} years old, and legally able to
        accept these terms where you live. You may not use the services if the
        law prohibits you from doing so.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul>
        <li>Give accurate information and keep your email address current.</li>
        <li>
          Keep your password and recovery codes safe. We recommend turning on
          two-factor authentication.
        </li>
        <li>
          An account is for one person. Do not share it or let others sign in as
          you.
        </li>
        <li>
          Tell us at {mail} if you think someone else has access to your
          account. You are responsible for activity on your account until you
          do.
        </li>
      </ul>
    ),
  },
  {
    id: "products",
    title: "Our products",
    body: (
      <>
        <h3>AlgorithVoice</h3>
        <p>
          AlgorithVoice turns speech into text and types it into the app you are
          using. Transcription can make mistakes, so check anything important
          before you rely on it. Local mode works on your device. Cloud
          transcription is part of the Pro plan and runs only when you choose
          it, as described in our <Link href="/privacy">privacy policy</Link>.
        </p>
        <h3>AlgorithGuard</h3>
        <p>
          AlgorithGuard sits between CLI coding agents and the actions they
          take, and allows, blocks or asks you about each one. It is in early
          preview, so features and behavior will change, and it may have errors.
          AlgorithGuard reduces risk, but it cannot catch every harmful action.
          You remain responsible for the agents you run, the commands they
          execute and the changes they make. Keep backups and review important
          changes.
        </p>
        <p>
          If you choose AlgorithGuard’s redacted or full privacy mode, requests
          are sent to TypeSafe with your own API key. Your use of TypeSafe is
          governed by your agreement with TypeSafe.
        </p>
        <h3>Previews and free plans</h3>
        <p>
          Preview features and free plans are offered as they are. We may
          change, limit or end them, and we will try to give notice before we
          remove something you depend on.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>When you use the services, do not:</p>
        <ul>
          <li>break the law or infringe anyone else’s rights;</li>
          <li>
            try to access accounts, systems or data that are not yours, or test
            the security of our services without our written permission;
          </li>
          <li>
            disrupt or overload the services, or get around rate limits, usage
            limits or plan limits;
          </li>
          <li>
            resell or share access to paid features unless your plan allows it;
          </li>
          <li>
            use the services to build malware, send spam or harm other people.
          </li>
        </ul>
        <p>
          Found a security issue? Report it privately to {mail} rather than
          publishing it, and give us reasonable time to fix it.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Paid plans",
    body: (
      <ul>
        <li>
          Prices, billing periods and what each plan includes are shown before
          you buy. Payments are processed by Stripe.
        </li>
        <li>
          Plans are billed in advance and renew automatically at the end of each
          period until you cancel.
        </li>
        <li>
          You can cancel at any time. Your plan stays active until the end of
          the period you have paid for, and then it does not renew.
        </li>
        <li>
          Payments are non-refundable, including for partly used periods, except
          where the law requires a refund. If you think you were charged by
          mistake, contact {mail} and we will look into it.
        </li>
        <li>
          If we change a price, we will tell you before it applies to your next
          renewal, so you can cancel first.
        </li>
        <li>
          Prices may not include taxes, which are added where the law requires.
        </li>
        <li>
          If a payment fails, we may limit paid features until it is resolved.
        </li>
      </ul>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    body: (
      <p>
        Your content, such as your recordings, transcripts, AlgorithGuard
        policies and audit logs, belongs to you. You give us permission to
        store, process and transmit it only as needed to run the services for
        you and as described in our <Link href="/privacy">privacy policy</Link>.
        You are responsible for having the right to the content you use with the
        services.
      </p>
    ),
  },
  {
    id: "our-software",
    title: "Our software and open source",
    body: (
      <>
        <p>
          The services, our names and logos, and the website belong to us or to
          our licensors. We give you a personal, non-exclusive right to use the
          services under these terms.
        </p>
        <p>
          Where we distribute software under an open-source license, such as the
          GNU Affero General Public License version 3 or, for earlier releases,
          the GNU General Public License version 3, that license governs the
          software, and nothing in these terms limits your rights under it.
          Third-party components, including the speech models used by
          AlgorithVoice, come with their own licenses, which AlgorithVoice shows
          for each model.
        </p>
        <p>
          If you send us feedback or ideas, we may use them without any
          obligation to you.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Ending your use",
    body: (
      <>
        <p>
          You can stop using the services at any time and delete your account in{" "}
          <Link href="/app/account">account settings</Link>. Deletion becomes
          permanent {legal.deletionGraceHours} hours later. Cancel any paid plan
          before you delete your account.
        </p>
        <p>
          We may suspend or close an account that breaks these terms, puts other
          users or the services at risk, or that the law requires us to close.
          Where possible, we will tell you why and give you a chance to export
          your content first.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <p>
        We work hard to make the services reliable, but they are provided “as
        is” and “as available”. To the extent the law allows, we make no promise
        that they will be uninterrupted or error-free, or that they will meet
        every need you have. Nothing in these terms limits rights you have as a
        consumer that cannot be waived by contract.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the extent the law allows, we are not liable for indirect or
        consequential losses, such as lost profits, lost data or the cost of
        replacement services. Our total liability for any claim related to the
        services is limited to the amount you paid us in the 12 months before
        the claim. These limits do not apply to liability that the law does not
        allow us to limit.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms as the services change. We will update the
        date at the top of this page, and for material changes we will email
        account holders before the changes take effect. If you keep using the
        services after that, the new terms apply.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <p>
        These terms are governed by the laws of the Republic of Uzbekistan.
        Before going to court, please contact us at {mail} so we can try to
        resolve the issue. Disputes we cannot resolve will be heard by the
        competent courts of the Republic of Uzbekistan, unless the law of your
        country gives you the right to bring a claim where you live.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these terms: {mail}. How we handle personal data is
        described in our <Link href="/privacy">privacy policy</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      clauses={clauses}
      description="The agreement between you and Algorithco when you use our website, accounts and products. Plain language where we can manage it."
      summary={summary}
      title="Terms of service"
    />
  );
}
