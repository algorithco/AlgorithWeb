"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { usePlatformSession } from "@/hooks/use-platform-session";
import { Container } from "./container";
import { ProductSwitcher } from "./product-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const session = usePlatformSession();
  const pathname = usePathname();
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link className="wordmark" href="/" aria-label="Algorithco home">
          <span className="wordmark__mark" aria-hidden="true">
            A
          </span>
          <span>algorithco</span>
        </Link>
        <nav aria-label="Main navigation" className="site-nav">
          <ProductSwitcher />
          <Link aria-current={current("/about")} href="/about">
            About
          </Link>
          <Link aria-current={current("/contact")} href="/contact">
            Contact
          </Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link
            className="sign-in"
            href={session.signedIn ? "/app" : siteConfig.authUrl}
          >
            {session.signedIn ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </Container>
    </header>
  );
}
