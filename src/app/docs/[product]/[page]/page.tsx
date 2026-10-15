import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle, docMetadata } from "@/components/docs/doc-article";
import { docsProducts, findDocsPage, productPages } from "@/content/docs";

type Props = { params: Promise<{ product: string; page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return docsProducts.flatMap((product) =>
    productPages(product)
      .filter((page) => page.slug)
      .map((page) => ({ product: product.slug, page: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product, page } = await params;
  const location = findDocsPage(product, page);
  return location ? docMetadata(location) : {};
}

export default async function DocsPage({ params }: Props) {
  const { product, page } = await params;
  const location = findDocsPage(product, page);
  if (!location) notFound();
  return <DocArticle location={location} />;
}
