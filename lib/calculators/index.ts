import type { CalculatorDefinition } from "@/lib/types";
import { CATEGORIES } from "@/data/categories";
import { FINANCE_CALCULATORS } from "./finance";
import { TAX_CALCULATORS } from "./tax";
import { BUSINESS_CALCULATORS } from "./business";
import { MATH_CALCULATORS } from "./math";
import { HEALTH_CALCULATORS } from "./health";
import { EVERYDAY_CALCULATORS } from "./everyday";
import { CONVERSION_CALCULATORS } from "./conversion";
import { TRANSPORT_CALCULATORS } from "./transport";
import { EXTRA_CALCULATORS } from "./extra";
import { SPECIAL_CALCULATORS } from "./special";

export * from "@/lib/types";

export const CALCULATORS: CalculatorDefinition[] = [
  ...FINANCE_CALCULATORS,
  ...TAX_CALCULATORS,
  ...BUSINESS_CALCULATORS,
  ...MATH_CALCULATORS,
  ...HEALTH_CALCULATORS,
  ...EVERYDAY_CALCULATORS,
  ...CONVERSION_CALCULATORS,
  ...TRANSPORT_CALCULATORS,
  ...EXTRA_CALCULATORS,
  ...SPECIAL_CALCULATORS,
].filter((c) => c.published);

const BY_SLUG = new Map(CALCULATORS.map((c) => [c.slug, c]));

export function getCalculator(slug: string): CalculatorDefinition | undefined {
  return BY_SLUG.get(slug);
}

export function getPublishedSlugs(): string[] {
  return CALCULATORS.map((c) => c.slug);
}

export function getByCategory(categorySlug: string): CalculatorDefinition[] {
  return CALCULATORS.filter((c) => c.category === categorySlug).sort((a, b) => b.popularity - a.popularity);
}

export function categoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of CATEGORIES) counts[c.slug] = 0;
  for (const c of CALCULATORS) counts[c.category] = (counts[c.category] ?? 0) + 1;
  return counts;
}

export const POPULAR_SLUGS: string[] = [
  "emi-calculator",
  "sip-calculator",
  "gst-calculator",
  "age-calculator",
  "bmi-calculator",
  "percentage-calculator",
  "compound-interest-calculator",
  "income-tax-calculator",
  "tdee-calculator",
  "fd-calculator",
  "salary-calculator",
  "discount-calculator",
];

export function getPopular(): CalculatorDefinition[] {
  return POPULAR_SLUGS.map((s) => BY_SLUG.get(s)).filter((c): c is CalculatorDefinition => Boolean(c));
}

/** Resolve related slugs to published definitions (drops dangling refs safely). */
export function getRelated(def: CalculatorDefinition): CalculatorDefinition[] {
  const explicit = (def.relatedSlugs ?? [])
    .map((s) => BY_SLUG.get(s))
    .filter((c): c is CalculatorDefinition => Boolean(c));
  if (explicit.length >= 3) return explicit.slice(0, 6);
  // Top-padded with same-category peers
  const peers = getByCategory(def.category).filter(
    (c) => c.slug !== def.slug && !explicit.some((e) => e.slug === c.slug),
  );
  return [...explicit, ...peers].slice(0, 6);
}

export interface SearchItem {
  slug: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  categoryName: string;
  popularity: number;
  keywords: string[];
}

let SEARCH_ITEMS: SearchItem[] | null = null;

/** Serializable list for client components (search/directory). */
export function getSearchItems(): SearchItem[] {
  if (!SEARCH_ITEMS) {
    SEARCH_ITEMS = CALCULATORS.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      description: c.description,
      category: c.category,
      categoryName: CATEGORIES.find((cat) => cat.slug === c.category)?.name ?? c.category,
      popularity: c.popularity,
      keywords: c.keywords,
    }));
  }
  return SEARCH_ITEMS;
}
