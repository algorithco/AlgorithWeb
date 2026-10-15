import { type ProductStatus, products } from "./products";

export type FooterLink = {
  label: string;
  href: string;
  /** A product's availability, shown as a small badge after its name. */
  status?: { kind: ProductStatus; label: string };
};

export type FooterColumn = { title: string; links: readonly FooterLink[] };

/**
 * Every link of the site footer, by column. A new page gets one line in the
 * column it belongs to; the footer lays out any number of columns and links.
 */
export const footerColumns: readonly FooterColumn[] = [
  {
    title: "Products",
    links: products.map((product) => ({
      label: product.name,
      href: product.href,
      status: { kind: product.status, label: product.statusLabel },
    })),
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Download AlgorithVoice", href: "/voice/download" },
      { label: "Benchmarks", href: "/voice/benchmarks" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Brand", href: "/brand" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
