import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description: "Financial, tax, health and construction estimate disclaimers for CalcSphere results.",
  path: "/disclaimer",
});

export default function Disclaimer() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        Every result on CalcSphere is an estimate produced by standard published formulas applied to
        the values you enter. Real-world outcomes differ. Category-specific notes:
      </p>
      <h2>💰 Financial calculators</h2>
      <p>
        EMI, SIP, FD/RD and retirement outputs assume constant rates; markets fluctuate and lenders
        apply their own fees, insurance add-ons and rounding conventions. Nothing here is investment
        advice.
      </p>
      <h2>🧾 Tax calculators</h2>
      <p>
        GST and income-tax tools clearly display the financial year and rule version they model
        (e.g., FY 2025-26 new regime). Budgets amend slabs, rebates and surcharges annually — always
        confirm against official government calculators before filing or invoicing.
      </p>
      <h2>❤️ Health calculators</h2>
      <p>
        BMI, BMR, TDEE and related metrics are population-level screening tools, not diagnoses.
        Athletes, pregnant users and people with medical conditions should interpret them only with
        professional guidance.
      </p>
      <h2>🧱 Construction &amp; conversions</h2>
      <p>
        Material estimates ignore wastage factors, local mix practices and site conditions. Unit
        conversions use exact international definitions, but regional units (bigha, guntha) vary by
        state and must be verified locally.
      </p>
    </LegalPage>
  );
}
