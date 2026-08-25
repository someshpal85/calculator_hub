"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SearchItem } from "@/lib/calculators";
import CalculatorSearch from "./CalculatorSearch";
import { CATEGORIES } from "@/data/categories";

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

export default function Header({ items }: { items: SearchItem[] }) {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark" aria-hidden>∑</span>
          CalcSphere
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/" className="nav-desktop" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
          <Link href="/calculators" className="nav-desktop" aria-current={pathname === "/calculators" ? "page" : undefined}>
            All Calculators
          </Link>
          <Link href="/#popular" className="nav-desktop">Popular</Link>
          <Link href="/#categories" className="nav-desktop">Categories</Link>
        </nav>
        <div className="header-actions">
          <CalculatorSearch items={items} placeholder="Search…" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Footer({ categoryLinks }: { categoryLinks: { slug: string; name: string }[] }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>CalcSphere</h4>
            <p style={{ color: "var(--muted)", fontSize: 13.5 }}>
              Smart calculators for everyday decisions — free, instant and privacy-friendly.
              All calculations run in your browser; nothing you enter is stored.
            </p>
          </div>
          <div>
            <h4>Categories</h4>
            <ul>
              {categoryLinks.slice(0, 6).map((c) => (
                <li key={c.slug}><a href={`/category/${c.slug}`}>{c.name}</a></li>
              ))}
              <li><a href="/calculators">Browse all →</a></li>
            </ul>
          </div>
          <div>
            <h4>Popular</h4>
            <ul>
              <li><a href="/calculator/emi-calculator">EMI Calculator</a></li>
              <li><a href="/calculator/sip-calculator">SIP Calculator</a></li>
              <li><a href="/calculator/gst-calculator">GST Calculator</a></li>
              <li><a href="/calculator/bmi-calculator">BMI Calculator</a></li>
              <li><a href="/calculator/age-calculator">Age Calculator</a></li>
            </ul>
          </div>
          <div>
            <h4>Company &amp; Legal</h4>
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
        <div className="footer-bottom">
          © {new Date().getFullYear()} CalcSphere. Results are estimates for informational purposes only —
          not financial, tax or medical advice.
        </div>
      </div>
    </footer>
  );
}
