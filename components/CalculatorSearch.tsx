"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchItem } from "@/lib/calculators";
import { track } from "@/lib/analytics";
import { useLocale } from "./LocaleProvider";

function score(item: SearchItem, q: string): number {
  const name = item.name.toLowerCase();
  const cat = item.categoryName.toLowerCase();
  let s = 0;
  if (name === q) s += 100;
  if (name.startsWith(q)) s += 50;
  if (name.includes(q)) s += 30;
  if (item.slug.replace(/-/g, " ").includes(q)) s += 20;
  if (cat.includes(q)) s += 10;
  for (const k of item.keywords) {
    const kw = k.toLowerCase();
    if (kw === q) s += 25;
    else if (kw.startsWith(q) || kw.includes(q)) s += 15;
  }
  return s;
}

export default function CalculatorSearch({
  items,
  placeholder = "Search calculators…",
}: {
  items: SearchItem[];
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { tr } = useLocale();
  const placeholderText = placeholder ?? tr("search.placeholder");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return items
      .map((item) => ({ item, s: score(item, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || b.item.popularity - a.item.popularity)
      .slice(0, 8)
      .map((r) => r.item);
  }, [q, items]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const go = (slug: string) => {
    track("calculator_search", { query: q.slice(0, 60), result: slug });
    setOpen(false);
    setQ("");
    router.push(`/calculator/${slug}`);
  };

  return (
    <div className="hero-search" style={{ margin: 0, maxWidth: 320 }} ref={boxRef}>
      <span className="icon" aria-hidden>🔍</span>
      <input
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-label="Search calculators"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={placeholderText}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length > 0) go(results[0].slug);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && results.length > 0 && (
        <div className="search-dropdown" role="listbox">
          {results.map((r) => (
            <a key={r.slug} href={`/calculator/${r.slug}`} onClick={(e) => { e.preventDefault(); go(r.slug); }}>
              <span aria-hidden>{r.icon}</span>
              <span>
                <span className="n">{r.name}</span>
                <br />
                <span className="d">{r.description}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroSearch({ items }: { items: SearchItem[] }) {
  return <CalculatorSearch items={items} placeholder="Search 45+ calculators — “emi”, “gst”, “bmi”, “कर्ज”…" />;
}
