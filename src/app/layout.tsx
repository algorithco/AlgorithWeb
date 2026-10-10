import "@fontsource-variable/inter";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MotionController } from "@/components/motion-controller";
import { absoluteUrl, siteConfig } from "@/config/site";
import { Providers } from "./providers";
import "./tokens.css";
import "./globals.css";
import "./motion.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Algorithco — Software that stays out of your way",
    template: "%s — Algorithco",
  },
  description: "Focused, local-first software for developers and power users.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Algorithco",
    title: "Algorithco",
    description:
      "Focused, local-first software for developers and power users.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Algorithco",
    description:
      "Focused, local-first software for developers and power users.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: absoluteUrl(),
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MotionController />
          <script type="application/ld+json">
            {JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c")}
          </script>
        </Providers>
      </body>
    </html>
  );
}
