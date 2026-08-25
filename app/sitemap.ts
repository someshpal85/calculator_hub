import type { MetadataRoute } from "next";
import { CALCULATORS } from "@/lib/calculators";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/calculators",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/cookie-policy",
  ].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }));

  const calculatorPages = CALCULATORS.map((c) => ({
    url: `${SITE.url}/calculator/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: c.popularity >= 90 ? 0.9 : 0.7,
  }));

  // Only categories that actually have calculators
  const categoryPages = CATEGORIES.filter((c) =>
    CALCULATORS.some((calc) => calc.category === c.slug),
  ).map((c) => ({
    url: `${SITE.url}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...categoryPages, ...calculatorPages];
}
