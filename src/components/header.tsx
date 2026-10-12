"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { products } from "@/config/products";
import { siteConfig } from "@/config/site";
import { usePlatformSession } from "@/hooks/use-platform-session";
import { AlgorithcoMark } from "./brand-marks";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

const companyLinks = [
  { label: "Changelog", href: "/changelog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function Header() {
  const session = usePlatformSession();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;
  const links = [
    ...products.map((product) => ({
      label: product.name,
      href: product.href,
    })),
    ...companyLinks,
  ];

  // The header never remounts on client navigation; close the mobile menu
  // whenever the route changes.
  useEffect(() => {
    if (pathname) menuRef.current?.removeAttribute("open");
  }, [pathname]);

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link className="wordmark" href="/" aria-label="Algorithco home">
          <span className="wordmark__mark" aria-hidden="true">
            <AlgorithcoMark />
          </span>
          <span>algorithco</span>
        </Link>
        <nav aria-label="Main navigation" className="site-nav">
          {links.map((link) => (
            <Link
              aria-current={current(link.href)}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link
            className="sign-in"
            href={session.signedIn ? "/app" : siteConfig.authUrl}
          >
            {session.signedIn ? "Dashboard" : "Sign in"}
          </Link>
          <details className="site-menu" ref={menuRef}>
            <summary aria-label="Menu">
              <span aria-hidden="true" />
            </summary>
            <nav
              aria-label="Main navigation (mobile)"
              className="site-menu__panel"
            >
              {links.map((link) => (
                <Link
                  aria-current={current(link.href)}
                  href={link.href}
                  key={link.href}
                  onClick={() => menuRef.current?.removeAttribute("open")}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
