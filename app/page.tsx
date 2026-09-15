import Link from "next/link";
import { HeroSearch } from "@/components/CalculatorSearch";
import { AdSlot } from "@/components/Layout";
import HomeCalculator from "@/components/home/HomeCalculator";
import { CALCULATORS, categoryCounts, getPopular, getByCategory, getSearchItems } from "@/lib/calculators";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: SITE.url },
};

const WHY = [
  ["⚡", "Instant results", "Every keystroke recalculates — no submit buttons, no waiting."],
  ["🎯", "Accurate formulas", "Standard financial and scientific formulas with transparent math shown on every page."],
  ["📱", "Mobile friendly", "Thumb-sized inputs and prominent results designed phone-first."],
  ["🔒", "Privacy focused", "Calculations happen in your browser. We never store what you type."],
  ["🆓", "Free forever", "No accounts, no paywalls, no limits on usage."],
  ["🔗", "Shareable results", "Your inputs live in the URL — copy a link or share straight to WhatsApp."],
];

const STEPS = [
  ["Choose a calculator", "Browse by category or search by name — try “emi”, “gst” or “bmi”."],
  ["Enter your values", "Clear labels with sensible examples; results update as you type."],
  ["Get instant answers", "See the main result up front with supporting breakdowns you can copy or share."],
];

const FAQS = [
  {
    q: "Is Calculator ProHub free to use?",
    a: "Yes — every calculator is completely free with no registration. The site is supported by unobtrusive advertising that never interferes with calculations.",
  },
  {
    q: "Are my numbers stored or sent anywhere?",
    a: "No. Calculations run locally in your browser using JavaScript. We do not transmit or store your inputs unless you explicitly create a share link.",
  },
  {
    q: "How accurate are the results?",
    a: "Each calculator uses its standard published formula (EMI annuity formula, Mifflin-St Jeor for BMR, statutory GST slabs, etc.). Tax calculators clearly label the applicable financial year since rules change annually.",
  },
  {
    q: "Can I use these calculators offline?",
    a: "Once loaded, most calculators keep working without a connection because all maths runs client-side. Only the currency converter needs internet to fetch live exchange rates.",
  },
  {
    q: "Do you support Indian number formatting?",
    a: "Yes — money results display in the lakh/crore system (₹1,25,000) rather than Western thousands grouping.",
  },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function HomePage() {
  const popular = getPopular();
  const counts = categoryCounts();
  const activeCategories = CATEGORIES.filter((c) => counts[c.slug] > 0);
  void CALCULATORS;
  void getSearchItems;

  return (
    <>
      <JsonLd />

      {/* Hero */}
      <section className="hero">
        <h1>{SITE.tagline}</h1>
        <p className="subtitle">
          Calculate loans, investments, taxes, salary, health metrics, conversions and everyday
          problems instantly — free, private and in your browser.
        </p>
        <div style={{ maxWidth: 560 }}>
          <HeroSearch items={getSearchItems()} />
        </div>
        <div className="pill-row" style={{ marginTop: 14 }}>
          {popular.slice(0, 6).map((c) => (
            <Link key={c.slug} href={`/calculator/${c.slug}`} className="btn secondary">
              {c.icon} {c.name.replace(/ Calculator$/, "")}
            </Link>
          ))}
        </div>
      </section>

      <HomeCalculator />

      <AdSlot slot="header-banner" />

      {/* Popular */}
      <section className="section" id="popular" aria-labelledby="popular-h">
        <h2 id="popular-h">🔥 Popular Calculators</h2>
        <div className="grid" style={{ marginTop: 16 }}>
          {popular.map((c) => (
            <Link key={c.slug} href={`/calculator/${c.slug}`} className="card">
              <span className="icon">{c.icon}</span>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories" aria-labelledby="categories-h">
        <h2 id="categories-h">🗂️ Browse by Category</h2>
        <div className="grid" style={{ marginTop: 16 }}>
          {activeCategories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="card">
              <span className="icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
              <p style={{ marginTop: 8 }}>
                <span className="badge">{counts[cat.slug]} calculator{counts[cat.slug] === 1 ? "" : "s"}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <AdSlot slot="mid-content" />

      {/* Why */}
      <section className="section" aria-labelledby="why-h">
        <h2 id="why-h">Why Use Calculator ProHub?</h2>
        <div className="feature-grid" style={{ marginTop: 16 }}>
          {WHY.map(([icon, title, desc]) => (
            <div key={title} className="panel" style={{ padding: 18 }}>
              <div style={{ fontSize: 26 }}>{icon}</div>
              <h3 style={{ margin: "8px 0 4px", fontSize: 16 }}>{title}</h3>
              <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" aria-labelledby="how-h">
        <h2 id="how-h">How It Works</h2>
        <div className="grid" style={{ marginTop: 16 }}>
          {STEPS.map(([title, desc], i) => (
            <div key={title} className="panel" style={{ padding: 20 }}>
              <div className="step-num">{i + 1}</div>
              <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{title}</h3>
              <p className="muted" style={{ fontSize: 14 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section prose" aria-labelledby="faq-h">
        <h2 id="faq-h">Frequently Asked Questions</h2>
        <div style={{ marginTop: 16 }}>
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
        <div className="disclaimer-box">
          All results are estimates for informational purposes only and do not constitute financial,
          tax, medical or legal advice. Verify critical figures against official sources.
        </div>
      </section>
    </>
  );
}
