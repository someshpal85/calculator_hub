import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "About CalcSphere",
  description: "Who we are and why we built a faster, privacy-first calculator platform.",
  path: "/about",
});

export default function About() {
  return (
    <LegalPage title="About CalcSphere">
      <p>
        CalcSphere exists for one reason: getting a trustworthy answer to an everyday calculation
        should take seconds, not sign-ups. We were tired of calculator websites that bury the tool
        under popups, demand personal details, or hide the formula behind vague marketing.
      </p>
      <h2>Our principles</h2>
      <ul>
        <li><strong>Instant by design.</strong> Results update as you type. No submit buttons where live math works better.</li>
        <li><strong>Transparent formulas.</strong> Every calculator shows exactly which formula it uses, with worked examples.</li>
        <li><strong>Private by architecture.</strong> Your inputs are processed in your browser. There is no server-side calculation to leak them from.</li>
        <li><strong>India-first, worldwide-ready.</strong> Lakh/crore formatting and GST/income-tax tools for India; metric-imperial conversions and currency-agnostic salary maths for everyone else.</li>
        <li><strong>Honest limitations.</strong> Tax tools label their financial year. Health tools remind you they aren&apos;t doctors.</li>
      </ul>
      <h2>How we keep quality high</h2>
      <p>
        Each calculator&apos;s core math is covered by automated tests — normal cases, boundaries,
        invalid inputs and rounding checks — before it ships. Formulas follow standard published
        references (annuity mathematics for EMIs, Mifflin-St Jeor for metabolic rates, statutory
        slab structures for taxes).
      </p>
    </LegalPage>
  );
}
