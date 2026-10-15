import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle, docMetadata } from "@/components/docs/doc-article";
import { docsProducts, findDocsPage } from "@/content/docs";

type Props = { params: Promise<{ product: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return docsProducts.map((product) => ({ product: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = findDocsPage((await params).product);
  return location ? docMetadata(location) : {};
}

/** A product's first page: /docs/voice, /docs/guard, /docs/account. */
export default async function DocsProductPage({ params }: Props) {
  const location = findDocsPage((await params).product);
  if (!location) notFound();
  return <DocArticle location={location} />;
}
