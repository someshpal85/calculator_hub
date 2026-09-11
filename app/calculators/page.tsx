import type { Metadata } from "next";
import DirectoryBrowser from "@/components/DirectoryBrowser";
import { AdSlot } from "@/components/Layout";
import { getSearchItems } from "@/lib/calculators";
import { CATEGORIES } from "@/data/categories";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Calculators — Complete Directory",
  description:
    "Browse every free Calculator ProHub calculator: finance, loans, tax, salary, math, health, education, conversions and everyday tools. Search and filter instantly.",
  path: "/calculators",
});

export default function CalculatorsPage() {
  return (
    <div style={{ paddingTop: 24 }}>
      <h1>All Calculators</h1>
      <p className="subtitle">
        The complete Calculator ProHub directory. Search by name or keyword (Hindi works too), filter by
        category, or sort alphabetically.
      </p>
      <AdSlot slot="directory-top" />
      <DirectoryBrowser
        items={getSearchItems()}
        categories={CATEGORIES.filter((c) => getSearchItems().some((i) => i.category === c.slug)).map((c) => ({
          slug: c.slug,
          name: c.name,
          icon: c.icon,
        }))}
      />
    </div>
  );
}
