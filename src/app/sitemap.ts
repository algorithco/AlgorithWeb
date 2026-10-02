import type { MetadataRoute } from "next";
import { products } from "@/config/products";
import { absoluteUrl } from "@/config/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/products",
    ...products.map((p) => `/products/${p.slug}`),
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return routes.map((route) => ({
    url: absoluteUrl(route || "/"),
    changeFrequency: route.startsWith("/products") ? "monthly" : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));
}
