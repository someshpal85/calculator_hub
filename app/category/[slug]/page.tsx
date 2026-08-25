import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Layout";
import { AdSlot } from "@/components/Layout";
import { CATEGORIES } from "@/data/categories";
import { getByCategory } from "@/lib/calculators";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return {};
  return pageMetadata({
    title: `${cat.name} Calculators — Free Online Tools`,
    description: `${cat.description} Browse all free ${cat.name.toLowerCase()} calculators on CalcSphere.`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const items = getByCategory(slug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Calculators", item: absoluteUrl("/calculators") },
      { "@type": "ListItem", position: 3, name: cat.name, item: absoluteUrl(`/category/${slug}`) },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Breadcrumbs trail={[{ label: "Calculators", href: "/calculators" }]} />
      <h1>
        <span aria-hidden>{cat.icon}</span> {cat.name} Calculators
      </h1>
      <p className="subtitle">{cat.description}</p>

      {items.length === 0 ? (
        <div className="panel section">
          <h2 className="mt-0">Coming soon 🚧</h2>
          <p className="muted">
            We&apos;re building out the {cat.name} category. In the meantime,{" "}
            <Link href="/calculators">browse our live calculators</Link>.
          </p>
        </div>
      ) : (
        <>
          <p className="muted">{items.length} calculator{items.length === 1 ? "" : "s"} in this category</p>
          <AdSlot slot="category-top" />
          <div className="grid" style={{ marginTop: 16 }}>
            {items.map((c) => (
              <Link key={c.slug} href={`/calculator/${c.slug}`} className="card">
                <span className="icon">{c.icon}</span>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
