import type { CalculatorDefinition } from "@/lib/types";
import { inr, inr0, fmt, pct } from "@/lib/format";
import { num, requireNonNegative } from "@/lib/validation";

// ─── GST ─────────────────────────────────────────────────────────────────────
export const TAX_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "gst-calculator",
    name: "GST Calculator",
    icon: "🧾",
    category: "tax",
    description: "Add GST to a base price or extract it from an inclusive price.",
    keywords: ["gst", "vat", "tax", "cgst", "sgst", "inclusive", "exclusive", "जीएसटी"],
    popularity: 93,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "mode",
        label: "Amount is",
        options: [
          { value: "add", label: "Before tax (add GST)" },
          { value: "remove", label: "Including tax (remove GST)" },
        ],
        defaultValue: "add",
      },
      { kind: "number", name: "amount", label: "Amount (₹)", min: 0, placeholder: "e.g. 10000", defaultValue: 10000 },
      {
        kind: "select",
        name: "rate",
        label: "GST rate",
        options: [
          { value: "0.25", label: "0.25%" },
          { value: "3", label: "3%" },
          { value: "5", label: "5%" },
          { value: "12", label: "12%" },
          { value: "18", label: "18%" },
          { value: "28", label: "28%" },
        ],
        defaultValue: "18",
      },
    ],
    calculate(v) {
      const r = requireNonNegative(v, [{ name: "amount", label: "Amount" }]);
      if ("error" in r) return r;
      const [amount] = r;
      const rate = num(v.rate) ?? 18;
      if (v.mode === "remove") {
        const tax = amount - amount / (1 + rate / 100);
        return {
          rows: [
            { label: "Total GST included", value: inr(tax), emphasis: true },
            { label: "CGST (" + pct(rate / 2, rate === Math.floor(rate) ? 1 : 2) + ")", value: inr(tax / 2) },
            { label: "SGST/UTGST", value: inr(tax / 2) },
            { label: "Net price before GST", value: inr(amount - tax) },
          ],
          note: `Tax extracted from an inclusive amount at ${pct(rate)} rate.`,
        };
      }
      const tax = (amount * rate) / 100;
      return {
        rows: [
          { label: "Total with GST", value: inr(amount + tax), emphasis: true },
          { label: "CGST", value: inr(tax / 2) },
          { label: "SGST/UTGST", value: inr(tax / 2) },
          { label: "GST amount", value: inr(tax) },
        ],
        note: "For inter-state (IGST) supplies the full amount equals CGST+SGST shown here.",
      };
    },
    formula:
      "Add: Tax = Base × rate/100. Remove: Tax = Inclusive − Inclusive/(1 + rate/100). CGST = SGST = half of total GST.",
    about: [
      "India's GST has slabs of 0.25%, 3%, 5%, 12%, 18% and 28% for most goods and services. Within a state, GST splits equally into Central GST (CGST) and State GST (SGST); interstate supplies attract Integrated GST (IGST) equal to the combined total.",
      "This calculator also works for VAT-style flat taxes used in other countries — just enter your local rate.",
    ],
    howToUse: [
      "Choose whether your amount excludes tax (invoice base) or already includes it.",
      "Pick the applicable GST slab.",
      "Read total tax, CGST/SGST split and net/gross prices.",
    ],
    faqs: [
      { q: "How do I remove 18% GST from a ₹11,800 bill?", a: "Net = 11800 ÷ 1.18 = ₹10,000; GST included = ₹1,800 (₹900 each as CGST & SGST)." },
      { q: "Is GST calculated on discounted price?", a: "Yes — GST applies to the transaction value after discounts recorded on the invoice." },
    ],
    relatedSlugs: ["income-tax-calculator", "discount-calculator", "profit-margin-calculator"],
    seoTitle: "GST Calculator — Add or Remove GST (CGST/SGST Split)",
  },

  {
    slug: "income-tax-calculator",
    name: "Income Tax Calculator (New Regime)",
    icon: "🏛️",
    category: "tax",
    description: "Estimate income tax under India's New Regime, FY 2025-26 slab structure.",
    keywords: ["income tax", "new regime", "slab", "rebate 87a", "cess", "आयकर"],
    popularity: 91,
    published: true,
    inputs: [
      { kind: "number", name: "income", label: "Gross annual income (₹)", min: 0, step: 10000, placeholder: "e.g. 1500000", defaultValue: 1500000 },
      {
        kind: "select",
        name: "employment",
        label: "Employment type",
        options: [
          { value: "salaried", label: "Salaried (standard deduction ₹75,000)" },
          { value: "other", label: "Other / non-salaried" },
        ],
        defaultValue: "salaried",
      },
      {
        kind: "select",
        name: "ageGroup",
        label: "Age group",
        options: [
          { value: "<60", label: "Below 60" },
          { value: "60+", label: "60 or above" },
        ],
        defaultValue: "<60",
      },
    ],
    calculate(v) {
      const gross = num(v.income);
      if (gross === null || gross < 0)
        return { error: "Please enter a valid non-negative income." };
      const salaried = v.employment === "salaried";
      const taxable = Math.max(0, gross - (salaried ? 75000 : 0));

      // FY 2025-26 (AY 2026-27) New Regime slabs
      const slabs: [number, number][] = [
        [400000, 0],
        [800000, 5],
        [1200000, 10],
        [1600000, 15],
        [2000000, 20],
        [2400000, 25],
        [Infinity, 30],
      ];
      let tax = 0;
      let lower = 0;
      const breakdown: string[] = [];
      for (const [upper, rate] of slabs) {
        if (taxable <= lower) break;
        const slice = Math.min(taxable, upper) - lower;
        const t = (slice * rate) / 100;
        if (t > 0) breakdown.push(`${fmt(lower)}–${taxable > upper ? fmt(upper) : fmt(taxable)} @ ${rate}% = ${inr0(t)}`);
        tax += t;
        lower = upper;
      }

      // Section 87A rebate — resident individuals, taxable ≤ ₹12 lakh
      let rebate = 0;
      if (v.ageGroup !== "60+" && taxable <= 1200000) rebate = Math.min(tax, 60000);
      let afterRebate = tax - rebate;

      // Marginal relief near the ₹12L rebate cliff
      if (taxable > 1200000 && afterRebate > taxable - 1200000) {
        afterRebate = taxable - 1200000;
      }

      const cess = afterRebate * 0.04;
      const totalTax = afterRebate + cess;
      const rows = [
        { label: "Estimated total tax (incl. 4% cess)", value: inr(totalTax), emphasis: true },
        { label: "Taxable income", value: inr(taxable) },
        ...(salaried ? [{ label: "Standard deduction applied", value: inr(75000) }] : []),
        ...(rebate > 0 ? [{ label: "Section 87A rebate", value: "−" + inr(rebate) }] : []),
        { label: "Effective tax rate", value: gross > 0 ? pct((totalTax / gross) * 100) : "—" },
      ] as { label: string; value: string; emphasis?: boolean }[];

      return {
        rows,
        note:
          `FY 2025-26 (AY 2026-27), NEW regime only — no old-regime deductions (80C etc.). Slab math: ${breakdown.join("; ") || "nil"}. Excludes surcharge (>₹50L) and marginal cases are approximated. Verify against official CBDT calculators before filing.`,
      };
    },
    formula:
      "Slab-wise progressive tax on taxable income → Section 87A rebate (≤₹60k if taxable ≤ ₹12L) → marginal relief → +4% Health & Education Cess.",
    about: [
      "Under the New Regime (default from FY 2023-24 onward), taxpayers forgo most exemptions like 80C/HRA in exchange for lower slab rates and a larger standard deduction for salaried employees.",
      "The Finance Act 2025 restructured new-regime slabs so that resident individuals with taxable income up to ₹12 lakh pay zero tax via the enhanced Section 87A rebate.",
    ],
    howToUse: [
      "Enter gross annual income (before any deductions).",
      "Select employment type — salaried income gets the ₹75,000 standard deduction automatically.",
      "Review the slab-wise breakdown in the result notes.",
    ],
    faqs: [
      { q: "Which financial year does this cover?", a: "FY 2025-26 (AY 2026-27) new-regime slabs with the ₹12 lakh rebate threshold introduced by Finance Act 2025. Always confirm current-year rules on incometax.gov.in before filing." },
      { q: "Are old-regime deductions supported?", a: "Not here. This tool models only the new regime, which is now the default. The old regime remains available while it exists and requires separate computation." },
      { q: "What about surcharge?", a: "Income above ₹50 lakh attracts surcharge (10%–37%, capped at 25% under the new regime). This calculator targets the majority bracket below ₹50 lakh." },
    ],
    relatedSlugs: ["gst-calculator", "salary-calculator", "gratuity-calculator"],
    seoTitle: "Income Tax Calculator FY 2025-26 — New Regime Estimate",
  },
];
