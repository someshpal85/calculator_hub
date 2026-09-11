"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchItem } from "@/lib/calculators";
import { track } from "@/lib/analytics";
import { useLocale } from "./LocaleProvider";

type SortKey = "popular" | "az" | "category";

export default function DirectoryBrowser({ items, categories }: {
  items: SearchItem[];
  categories: { slug: string; name: string; icon: string }[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<SortKey>("popular");
  const [visible, setVisible] = useState(24);
  const { tr } = useLocale();
  const catName = (slug: string, fallback: string) => {
    const key = `cat.${slug}`;
    const translated = tr(key);
    return translated === key ? fallback : translated;
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = items.filter((i) => cat === "all" || i.category === cat);
    if (query) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.slug.includes(query.replace(/ /g, "-")) ||
          i.keywords.some((k) => k.toLowerCase().includes(query)) ||
          i.categoryName.toLowerCase().includes(query),
      );
    }
    switch (sort) {
      case "az":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "category":
        list = [...list].sort(
          (a, b) => a.categoryName.localeCompare(b.categoryName) || b.popularity - a.popularity,
        );
        break;
      default:
        list = [...list].sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [items, q, cat, sort]);

  void track;

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          placeholder={tr("dir.searchPlaceholder")}
          aria-label={tr("dir.searchPlaceholder")}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setVisible(24);
            track("calculator_search", { query: e.target.value.slice(0, 40), context: "directory" });
          }}
        />
        <select aria-label={tr("dir.allCategories")} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{tr("dir.allCategories")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon} {catName(c.slug, c.name)}
            </option>
          ))}
        </select>
        <select
          aria-label={tr("dir.sortPopular")}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="popular">{tr("dir.sortPopular")}</option>
          <option value="az">{tr("dir.sortAZ")}</option>
          <option value="category">{tr("dir.sortCategory")}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="muted" style={{ padding: 30, textAlign: "center" }}>
          {q ? tr("dir.noResults") : tr("dir.noResults")}
        </p>
      ) : (
        <>
          <p className="muted">{tr("dir.results", { n: filtered.length })}</p>
          <div className="grid">
            {filtered.slice(0, visible).map((c) => (
              <Link key={c.slug} href={`/calculator/${c.slug}`} className="card">
                <span className="icon">{c.icon}</span>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <p style={{ marginTop: 10 }}>
                  <span className="badge">{catName(c.category, c.categoryName)}</span>{" "}
                  {c.popularity >= 85 && <span className="badge">🔥 {tr("nav.popular")}</span>}
                </p>
              </Link>
            ))}
          </div>
          {visible < filtered.length && (
            <div style={{ textAlign: "center", marginTop: 22 }}>
              <button className="secondary" onClick={() => setVisible((v) => v + 24)} type="button">
                {tr("dir.showMore", { n: filtered.length - visible })}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
