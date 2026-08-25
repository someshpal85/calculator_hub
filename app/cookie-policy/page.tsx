import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy",
  description: "How CalcSphere uses (and mostly avoids) cookies and browser storage.",
  path: "/cookie-policy",
});

export default function CookiePolicy() {
  return (
    <LegalPage title="Cookie Policy">
      <h2>The short version</h2>
      <p>
        CalcSphere sets no tracking cookies today. We use two items of browser local storage:
      </p>
      <ul>
        <li><code>cs-theme</code> — remembers light/dark mode preference.</li>
        <li><code>cs-recent</code> — remembers which calculators you recently opened so we can show shortcuts (stored locally, never transmitted).</li>
      </ul>
      <h2>When advertising is enabled</h2>
      <p>
        If/when ad slots activate via a network such as Google AdSense, that network may set its own
        advertising cookies subject to its policies and applicable consent requirements. Ad slots are
        architecturally separated from calculator functionality — blocking them will never break a
        calculation.
      </p>
      <h2>Clearing stored data</h2>
      <p>
        Clearing site data in your browser settings removes both items above instantly. Nothing
        needs to be deleted server-side because nothing is stored server-side.
      </p>
    </LegalPage>
  );
}
