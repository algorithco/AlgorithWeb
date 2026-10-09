import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Algorithco about our products, your account, your personal data or a security issue.",
  alternates: { canonical: "/contact" },
};

const topics = [
  {
    title: "Products and support",
    body: "Questions about Algorith Voice or algorithco guard, a bug, or a feature you need. Tell us your operating system and product version.",
  },
  {
    title: "Your account",
    body: "Trouble signing in or with a subscription. Write from the email address on your account so we can find it.",
  },
  {
    title: "Privacy requests",
    body: "A copy of your data, a correction or deletion. You can also delete your account yourself in account settings.",
    link: { href: "/privacy#your-rights", label: "Your rights" },
  },
  {
    title: "Security reports",
    body: "Found a vulnerability? Send the steps to reproduce it and its impact. Please do not publish it or include real credentials or personal data.",
  },
  {
    title: "Business and partnerships",
    body: "Working on something where our tools fit? We would like to hear about it.",
  },
] as const;

export default function ContactPage() {
  const email = siteConfig.contactEmail;
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start a conversation."
        description="One inbox for everything. Questions about Algorithco or one of our products? Write to us directly."
      />
      <Section className="contact-section">
        <div className="contact-block">
          <p className="eyebrow">Email</p>
          <a className="contact-email" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
        <ul className="contact-topics" data-stagger>
          {topics.map((topic) => (
            <li key={topic.title}>
              <h2>{topic.title}</h2>
              <p>{topic.body}</p>
              {"link" in topic ? (
                <Link className="text-link" href={topic.link.href}>
                  {topic.link.label} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
