import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CalculatorRunner from "@/components/calculator/CalculatorRunner";
import { CategoryBreadcrumb, AdSlot } from "@/components/Layout";
import { CALCULATORS, getCalculator, getByCategory, getRelated } from "@/lib/calculators";
import { getCategory } from "@/data/categories";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const def = getCalculator(slug);
  if (!def) return {};
  const title = def.seoTitle ?? `${def.name} — ${def.description}`;
  const description = def.seoDescription ?? def.description;
  return pageMetadata({ title, description, path: `/calculator/${slug}` });
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getCalculator(slug);
  if (!def || !def.published) notFound();

  const category = getCategory(def.category);
  const related = getRelated(def);
  void getByCategory;

  // Structured data
  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: def.name,
    url: absoluteUrl(`/calculator/${slug}`),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    description: def.description,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Calculators", item: absoluteUrl("/calculators") },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: absoluteUrl(`/category/${category.slug}`),
      },
      { "@type": "ListItem", position: 4, name: def.name },
    ],
  };
  const faqSchema =
    def.faqs && def.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: def.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <CategoryBreadcrumb categorySlug={def.category} />
      <h1>
        <span aria-hidden>{def.icon}</span> {def.name}
      </h1>
      <p className="subtitle">{def.description}</p>

      <AdSlot slot="above-calculator" />

      <div className="calc-layout">
        {/* Interactive card */}
        <section className="panel" aria-label={`${def.name} tool`}>
          <Suspense fallback={<p className="muted">Loading calculator…</p>}>
            <CalculatorRunner slug={slug} />
          </Suspense>
        </section>

        {/* Explanation column */}
        <div className="prose">
          {def.about && def.about.length > 0 && (
            <section className="panel" style={{ marginBottom: 14 }}>
              <h2 className="mt-0" style={{ fontSize: 18 }}>About this calculator</h2>
              {def.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          )}
          {def.formula && (
            <section className="panel" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, marginTop: 0 }}>Formula</h2>
              <div className="formula-box">{def.formula}</div>
            </section>
          )}
          {(def.category === "health" || def.category === "tax") && (
            <div className="disclaimer-box">
              {def.category === "tax"
                ? "Tax rules change every budget. This estimate reflects the financial year stated in the results and should be verified against official government calculators before filing."
                : "Health metrics are informational estimates and are not a medical diagnosis."}
            </div>
          )}
        </div>
      </div>

      <AdSlot slot="below-calculator" />

      {def.howToUse && def.howToUse.length > 0 && (
        <section className="panel section prose">
          <h2 style={{ marginTop: 0 }}>How to use the {def.name}</h2>
          <ol>
            {def.howToUse.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      )}

      {def.faqs && def.faqs.length > 0 && (
        <section className="section prose" aria-labelledby="faq-h">
          <h2 id="faq-h">Frequently Asked Questions</h2>
          <div style={{ marginTop: 12 }}>
            {def.faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-h">
          <h2 id="related-h">Related Calculators</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {related.map((r) => (
              <Link key={r.slug} href={`/calculator/${r.slug}`} className="card">
                <span className="icon">{r.icon}</span>
                <h3>{r.name}</h3>
                <p>{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
