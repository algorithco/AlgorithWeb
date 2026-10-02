import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { products } from "@/config/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore Algorithco products for voice dictation and safer CLI coding agents.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Products — Algorithco",
    description: "Focused tools for developers and power users.",
    url: "/products",
  },
  twitter: {
    card: "summary",
    title: "Products — Algorithco",
    description: "Focused tools for developers and power users.",
  },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Tools with a clear point of view."
        description="Each Algorithco product solves a focused problem while sharing the same foundation: speed, privacy, and control."
      />
      <Section className="page-products">
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard product={product} index={index} key={product.slug} />
          ))}
        </div>
      </Section>
    </>
  );
}
