import type { ReactNode } from "react";
import {
  DocsSidebar,
  type SidebarProduct,
} from "@/components/docs/docs-sidebar";
import { docsHref, docsProducts, docsSearchIndex } from "@/content/docs";
import "./docs.css";

// Only what the sidebar shows goes to the browser, not the page bodies.
const sidebar: SidebarProduct[] = docsProducts.map((product) => ({
  slug: product.slug,
  name: product.name,
  groups: product.groups.map((group) => ({
    title: group.title,
    pages: group.pages.map((page) => ({
      title: page.title,
      href: docsHref(product.slug, page.slug),
    })),
  })),
}));

/** /docs: one documentation for every product, with one sidebar. */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-layout">
      <DocsSidebar products={sidebar} searchIndex={docsSearchIndex} />
      <div className="docs-main">{children}</div>
    </div>
  );
}
