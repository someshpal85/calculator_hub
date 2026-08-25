import Link from "next/link";
import { getCategory } from "@/data/categories";

export default function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      {trail.map((t, i) => (
        <span key={i} style={{ display: "contents" }}>
          <span className="sep" aria-hidden>›</span>
          {t.href ? <a href={t.href}>{t.label}</a> : <span aria-current="page">{t.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function CategoryBreadcrumb({ categorySlug }: { categorySlug: string }) {
  const cat = getCategory(categorySlug);
  return (
    <Breadcrumbs
      trail={[
        { label: "Calculators", href: "/calculators" },
        { label: cat.name, href: `/category/${cat.slug}` },
      ]}
    />
  );
}

export function AdSlot({ slot }: { slot: string }) {
  // Reserved ad placeholder — wire to AdSense/Direct in production.
  return (
    <div className="ad-slot" data-slot={slot} aria-hidden>
      Ad space — {slot}
    </div>
  );
}
