"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SearchItem } from "@/lib/calculators";
import CalculatorSearch from "./CalculatorSearch";
import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cs-theme", next);
    } catch {
      /* private mode */
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale, tr } = useLocale();
  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <select
        aria-label={tr("lang.label")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        style={{ width: "auto", padding: "7px 10px", fontSize: 13 }}
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="zh">中文</option>
        <option value="pt">Português</option>
        <option value="ru">Русский</option>
        <option value="ja">日本語</option>
        <option value="tr">Türkçe</option>
      </select>
    </div>
  );
}

export default function Header({ items }: { items: SearchItem[] }) {
  const pathname = usePathname();
  const { tr } = useLocale();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden>∑</span>
          CalcSphere
        </Link>
        <nav className="main-nav" aria-label={tr("a11y.mainNav")}>
          <Link href="/" className="nav-desktop" aria-current={pathname === "/" ? "page" : undefined}>{tr("nav.home")}</Link>
          <Link href="/calculators" className="nav-desktop" aria-current={pathname === "/calculators" ? "page" : undefined}>
            {tr("nav.all")}
          </Link>
          <Link href="/#popular" className="nav-desktop">{tr("nav.popular")}</Link>
          <Link href="/#categories" className="nav-desktop">{tr("nav.categories")}</Link>
        </nav>
        <div className="header-actions">
          <CalculatorSearch items={items} />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Footer({ categoryLinks }: { categoryLinks: { slug: string; name: string }[] }) {
  const { tr, locale } = useLocale();
  const catName = (slug: string, fallback: string) => {
    const key = `cat.${slug}`;
    const translated = tr(key);
    return translated === key ? fallback : translated;
  };
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>CalcSphere</h4>
            <p style={{ color: "var(--muted)", fontSize: 13.5 }}>{tr("footer.blurb")}</p>
          </div>
          <div>
            <h4>{tr("footer.categories")}</h4>
            <ul>
              {categoryLinks.slice(0, 6).map((c) => (
                <li key={c.slug}><a href={`/category/${c.slug}`}>{catName(c.slug, c.name)}</a></li>
              ))}
              <li><a href="/calculators">{tr("footer.browseAll")}</a></li>
            </ul>
          </div>
          <div>
            <h4>{tr("footer.popular")}</h4>
            <ul>
              <li><a href="/calculator/emi-calculator">EMI Calculator</a></li>
              <li><a href="/calculator/sip-calculator">SIP Calculator</a></li>
              <li><a href="/calculator/gst-calculator">GST Calculator</a></li>
              <li><a href="/calculator/bmi-calculator">BMI Calculator</a></li>
              <li><a href="/calculator/age-calculator">Age Calculator</a></li>
            </ul>
          </div>
          <div>
            <h4>{tr("footer.company")}</h4>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Use</a></li>
              <li><a href="/disclaimer">Disclaimer</a></li>
              <li><a href="/cookie-policy">Cookie Policy</a></li>
              <li><a href="/sitemap.xml">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">{tr("footer.copyright", { year: new Date().getFullYear() })}</div>
      </div>
    </footer>
  );
}
