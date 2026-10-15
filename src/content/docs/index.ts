import { plainText } from "../../lib/changelog";
import { accountDocs } from "./account";
import { guardDocs } from "./guard";
import type { DocPage, DocProduct } from "./types";
import { voiceDocs } from "./voice";

export type { DocBlock, DocPage, DocProduct, DocSection } from "./types";
export { voiceModels } from "./voice";

/** Every product's documentation, in the order of the sidebar. */
export const docsProducts: readonly DocProduct[] = [
  voiceDocs,
  guardDocs,
  accountDocs,
];

export function docsHref(product: DocProduct["slug"], page = "") {
  return page ? `/docs/${product}/${page}` : `/docs/${product}`;
}

export function getDocsProduct(slug: string) {
  return docsProducts.find((product) => product.slug === slug);
}

export function productPages(product: DocProduct): readonly DocPage[] {
  return product.groups.flatMap((group) => group.pages);
}

export type DocLocation = {
  product: DocProduct;
  page: DocPage;
  href: string;
  previous?: { title: string; href: string; product: string };
  next?: { title: string; href: string; product: string };
};

/** Every page of every product, in reading order. */
const allPages = docsProducts.flatMap((product) =>
  productPages(product).map((page) => ({
    product,
    page,
    href: docsHref(product.slug, page.slug),
  })),
);

export function allDocsHrefs(): readonly string[] {
  return allPages.map((entry) => entry.href);
}

/** The page at /docs/<product>/<page>, with its neighbours. */
export function findDocsPage(
  productSlug: string,
  pageSlug = "",
): DocLocation | undefined {
  const index = allPages.findIndex(
    (entry) =>
      entry.product.slug === productSlug && entry.page.slug === pageSlug,
  );
  if (index < 0) return undefined;
  const link = (entry: (typeof allPages)[number] | undefined) =>
    entry && {
      title: entry.page.slug ? entry.page.title : entry.product.name,
      href: entry.href,
      product: entry.product.name,
    };
  return {
    ...allPages[index],
    previous: link(allPages[index - 1]),
    next: link(allPages[index + 1]),
  };
}

export type SearchEntry = {
  href: string;
  title: string;
  /** Where it is: "AlgorithVoice · Dictation". */
  trail: string;
};

/** What the sidebar search looks through: every page and every section. */
export const docsSearchIndex: readonly SearchEntry[] = allPages.flatMap(
  ({ product, page, href }) => {
    const pageTitle = page.slug ? page.title : `${product.name} overview`;
    return [
      { href, title: pageTitle, trail: product.name },
      ...page.sections.map((section) => ({
        href: `${href}#${section.id}`,
        title: plainText(section.title),
        trail: `${product.name} · ${page.title}`,
      })),
    ];
  },
);
