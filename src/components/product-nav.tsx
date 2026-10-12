"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getProduct, type ProductSlug } from "@/config/products";
import { VoiceMark } from "./brand-marks";
import { Container } from "./container";

/** Scrolled distance before the site header may tuck away. */
const HIDE_AFTER_PX = 120;
/** Ignore scroll jitter smaller than this. */
const DIRECTION_THRESHOLD_PX = 8;

function isActive(pathname: string, href: string, sectionRoot: string) {
  // The section root (Overview) only matches itself; other links also cover
  // their sub-pages (/guard/docs/cli under Docs).
  if (href === sectionRoot) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The second navbar of a product section, under the site header. It carries
 * the product's own pages and one action, never account controls. While it
 * is mounted, scrolling down tucks the site header away so only this bar
 * stays; scrolling up brings the header back (html[data-header-hidden]).
 */
export function ProductNav({ slug }: { slug: ProductSlug }) {
  const product = getProduct(slug);
  const pathname = usePathname();
  const links = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.productSection = slug;
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < DIRECTION_THRESHOLD_PX) return;
      if (delta > 0 && y > HIDE_AFTER_PX) root.dataset.headerHidden = "true";
      else if (delta < 0) delete root.dataset.headerHidden;
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      delete root.dataset.productSection;
      delete root.dataset.headerHidden;
    };
  }, [slug]);

  // A new page in the section starts with the header visible.
  useEffect(() => {
    if (pathname) delete document.documentElement.dataset.headerHidden;
  }, [pathname]);

  // On a narrow screen the links scroll sideways; the page you are on must
  // not be the one cut off at the edge. Only the row is scrolled, never the
  // page (scrollIntoView would move both).
  useEffect(() => {
    const row = links.current;
    const current = pathname
      ? row?.querySelector<HTMLElement>('[aria-current="page"]')
      : null;
    if (!row || !current) return;
    const rowBox = row.getBoundingClientRect();
    const box = current.getBoundingClientRect();
    // The right end of the row fades out over its padding (see the CSS).
    const fade = Number.parseFloat(getComputedStyle(row).paddingRight) || 0;
    const pastRight = box.right - (rowBox.right - fade);
    const pastLeft = rowBox.left - box.left;
    if (pastRight > 0) row.scrollLeft += pastRight;
    else if (pastLeft > 0) row.scrollLeft -= pastLeft;
  }, [pathname]);

  if (!product) return null;
  const ctaActive = isActive(pathname, product.cta.href, product.href);
  return (
    <nav
      aria-label={product.name}
      className={`product-nav product-nav--${product.accent}`}
    >
      <Container className="product-nav__inner">
        <Link className="product-nav__brand" href={product.href}>
          {slug === "voice" ? (
            <VoiceMark className="product-nav__logo" />
          ) : (
            <span aria-hidden="true" className="product-nav__mark" />
          )}
          <span className="product-nav__name">{product.name}</span>
        </Link>
        <div className="product-nav__links" ref={links}>
          {product.sections.map((section) => {
            const active = isActive(pathname, section.href, product.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                href={section.href}
                key={section.href}
              >
                {section.label}
              </Link>
            );
          })}
        </div>
        <Link
          aria-current={ctaActive ? "page" : undefined}
          className="product-nav__cta"
          href={product.cta.href}
        >
          {product.cta.label}
        </Link>
      </Container>
    </nav>
  );
}
