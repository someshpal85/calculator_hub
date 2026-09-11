import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Header, { Footer } from "@/components/HeaderFooter";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getSearchItems } from "@/lib/calculators";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1020" },
  ],
};

// Apply saved/system theme before paint to avoid a flash.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("cs-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const items = getSearchItems();
  const categoryLinks = CATEGORIES.filter((c) => items.some((i) => i.category === c.slug)).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <LocaleProvider>
          <Header items={items} />
          <main className="container">{children}</main>
          <Footer categoryLinks={categoryLinks} />
        </LocaleProvider>
        <noscript>
          <p style={{ textAlign: "center", padding: 20 }}>
            Calculator ProHub calculators need JavaScript for live results.{" "}
            <Link href="/calculators">Browse the directory</Link> to pick one.
          </p>
        </noscript>
      </body>
    </html>
  );
}
