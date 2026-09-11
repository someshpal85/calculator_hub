import type { Metadata } from "next";

export const SITE = {
  name: "Calculator ProHub",
  tagline: "Smart Calculators for Everyday Decisions",
  description:
    "Free online calculators for finance, loans, tax, salary, health, math, education, conversions and everyday life. Instant results, no sign-up — everything runs in your browser.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://calculator-prohub.com",
};

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path}`;
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}
