import type { MetadataRoute } from "next";
import { changelogStreams } from "@/config/changelog";
import { products } from "@/config/products";
import { absoluteUrl } from "@/config/site";
import { allDocsHrefs } from "@/content/docs";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    ...products.flatMap((p) => [
      p.href,
      ...p.sections.map((s) => s.href),
      p.cta.href,
    ]),
    "/ai",
    "/docs",
    ...allDocsHrefs(),
    "/changelog",
    ...changelogStreams.map((stream) => `/changelog/${stream.slug}`),
    "/about",
    "/brand",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return [...new Set(routes)].map((route) => ({
    url: absoluteUrl(route || "/"),
    changeFrequency: route.startsWith("/changelog")
      ? "weekly"
      : route.startsWith("/docs") ||
          products.some((p) => route.startsWith(p.href))
        ? "monthly"
        : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));
}
