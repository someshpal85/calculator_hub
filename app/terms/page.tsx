import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms governing your use of CalcSphere's free online calculators.",
  path: "/terms",
});

export default function Terms() {
  return (
    <LegalPage title="Terms of Use">
      <p>By using CalcSphere you agree to these terms. They are intentionally short.</p>
      <h2>1. Service provided as-is</h2>
      <p>
        CalcSphere provides free calculator tools without warranty of any kind — express or
        implied, including merchantability and fitness for a particular purpose. Availability may be
        interrupted; formulas may contain errors despite our testing.
      </p>
      <h2>2. No professional advice</h2>
      <p>
        Outputs are informational estimates only. Nothing on this site creates a financial-advisor,
        tax-practitioner, medical or engineering relationship. Consult qualified professionals for
        consequential decisions.
      </p>
      <h2>3. Acceptable use</h2>
      <ul>
        <li>Don&apos;t scrape, overload or attempt to disrupt the service.</li>
        <li>Don&apos;t republish our original explanations as your own content.</li>
        <li>Personal, educational and commercial internal use of the calculators themselves is welcome.</li>
      </ul>
      <h2>4. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, CalcSphere and its operators are not liable for any
        damages arising from use of — or reliance on — results produced by the site.
      </p>
      <h2>5. Changes</h2>
      <p>These terms may be updated; material changes will be reflected in the &quot;last updated&quot; date.</p>
    </LegalPage>
  );
}
