import type { CalculatorDefinition } from "@/lib/types";
import { inr, fmt, pct } from "@/lib/format";
import { num, requirePositive } from "@/lib/validation";

const FY_NOTE = "Rates per Finance Act provisions applicable for FY 2025-26. Verify against incometax.gov.in before filing.";

export const TAX_EXTRA_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "tds-calculator",
    name: "TDS Calculator",
    icon: "🧾",
    category: "tax",
    description: "TDS on professional fees, commission, rent, interest and more (FY 2025-26).",
    keywords: ["tds", "tax deducted at source", "194j", "194h", "194i", "टीडीएस"],
    popularity: 80,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "section",
        label: "Payment type",
        options: [
          { value: "10", label: "Professional fees — 194J (10%)" },
          { value: "2", label: "Commission / brokerage — 194H (2%)" },
          { value: "10", label: "Rent, land/building — 194-I (10%)" },
          { value: "2pm", label: "Rent, plant & machinery — 194-I (2%)" },
          { value: "2", label: "Rent by individual/HUF — 194-IB (2%)" },
          { value: "10", label: "Interest on securities — 193 (10%)" },
          { value: "2c", label: "Contractor (non-individual) — 194C (2%)" },
          { value: "1c", label: "Contractor (individual) — 194C (1%)" },
          { value: "30", label: "Lottery/winnings — 194B (30%)" },
        ],
        defaultValue: "10",
      },
      { kind: "number", name: "amount", label: "Payment amount (₹)", min: 1, placeholder: "e.g. 100000", defaultValue: 100000 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "amount", label: "Payment amount" }]);
      if ("error" in r) return r;
      const [amount] = r;
      const sel = v.section ?? "10";
      const rate = sel === "2pm" ? 2 : sel === "2c" ? 2 : sel === "1c" ? 1 : Number(sel);
      if (!Number.isFinite(rate)) return { error: "Select a valid payment type." };
      const tds = (amount * rate) / 100;
      return {
        rows: [
          { label: "TDS to deduct", value: inr(tds), emphasis: true },
          { label: "Net payable to recipient", value: inr(amount - tds) },
          { label: "Applicable rate", value: pct(rate, rate === Math.floor(rate) ? 0 : 1) },
        ],
        note: FY_NOTE,
      };
    },
    formula: "TDS = Payment × rate/100",
    about: [
      "Tax Deducted at Source makes the payer collect tax upfront on specified payments. The recipient claims credit for it while filing.",
      "Rates were rationalised in recent budgets (e.g. commission and individual rent moved to 2%), so always use current-year rates.",
    ],
    faqs: [
      { q: "TDS vs TCS?", a: "TDS is deducted by the payer; TCS is collected by the seller. Both give the payee tax credit." },
      { q: "What if PAN is not furnished?", a: "Higher 20% TDS typically applies under section 206AA — collect PAN beforehand." },
    ],
    relatedSlugs: ["income-tax-calculator", "gst-calculator", "salary-calculator"],
    seoTitle: "TDS Calculator — Rates for Fees, Rent, Commission (FY 2025-26)",
  },
  {
    slug: "hra-calculator",
    name: "HRA Exemption Calculator",
    icon: "🏠",
    category: "tax",
    description: "HRA tax exemption under section 10(13A) — old regime.",
    keywords: ["hra", "house rent allowance", "10(13a)", "rent exemption", "एचआरए"],
    popularity: 82,
    published: true,
    inputs: [
      { kind: "number", name: "basic", label: "Annual Basic + DA (₹)", min: 1, placeholder: "e.g. 600000", defaultValue: 600000 },
      { kind: "number", name: "hra", label: "Annual HRA received (₹)", min: 0, placeholder: "e.g. 240000", defaultValue: 240000 },
      { kind: "number", name: "rent", label: "Annual rent paid (₹)", min: 0, placeholder: "e.g. 300000", defaultValue: 300000 },
      {
        kind: "select",
        name: "city",
        label: "City type",
        options: [
          { value: "metro", label: "Metro (Delhi/Mumbai/Chennai/Kolkata)" },
          { value: "nonmetro", label: "Non-metro" },
        ],
        defaultValue: "metro",
      },
      {
        kind: "select",
        name: "regime",
        label: "Tax regime",
        options: [
          { value: "old", label: "Old regime (HRA allowed)" },
          { value: "new", label: "New regime (no HRA exemption)" },
        ],
        defaultValue: "old",
      },
    ],
    calculate(v) {
      const basic = num(v.basic);
      const hra = num(v.hra) ?? 0;
      const rent = num(v.rent) ?? 0;
      if (basic === null || basic <= 0) return { error: "Enter annual Basic + DA." };
      if (hra < 0 || rent < 0) return { error: "HRA and rent cannot be negative." };
      if (v.regime === "new") {
        return {
          rows: [
            { label: "HRA exemption", value: inr(0), emphasis: true },
            { label: "Taxable HRA", value: inr(hra) },
          ],
          note: "New regime offers no HRA exemption under section 10(13A). " + FY_NOTE,
        };
      }
      const opt1 = hra;
      const opt2 = Math.max(0, rent - basic * 0.1);
      const opt3 = basic * (v.city === "metro" ? 0.5 : 0.4);
      const exempt = Math.min(opt1, opt2, opt3);
      return {
        rows: [
          { label: "HRA exempt from tax", value: inr(exempt), emphasis: true },
          { label: "Taxable HRA", value: inr(hra - exempt) },
          { label: "Least of the three", value: `min(${inr(opt1)}, ${inr(opt2)}, ${inr(opt3)})` },
        ],
        note: "Least of: HRA received, rent minus 10% salary, 50%/40% of salary. " + FY_NOTE,
      };
    },
    formula: "Exempt = min(HRA, rent − 10% salary, 50% metro / 40% salary)",
    about: [
      "Section 10(13A) exempts part of your House Rent Allowance if you actually pay rent and claim under the old regime.",
      "Keep rent receipts; landlords' PAN is needed above ₹1 lakh annual rent.",
    ],
    faqs: [
      { q: "Can I claim HRA living with parents?", a: "Yes, with a genuine rent agreement and receipts, if they declare the income." },
      { q: "New regime + HRA?", a: "No exemption — the lower slab rates are the trade-off." },
    ],
    relatedSlugs: ["income-tax-calculator", "salary-calculator", "gst-calculator"],
    seoTitle: "HRA Calculator — Exemption Under Section 10(13A)",
  },
  {
    slug: "capital-gains-calculator",
    name: "Capital Gains Tax Calculator",
    icon: "📊",
    category: "tax",
    description: "STCG/LTCG tax on equity and other assets (post-July 2024 rules).",
    keywords: ["capital gains", "ltcg", "stcg", "equity tax", "12.5%", "कैपिटल गेन"],
    popularity: 84,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "asset",
        label: "Asset type",
        options: [
          { value: "equity", label: "Listed equity / equity MF" },
          { value: "other", label: "Other (property, gold, debt)" },
        ],
        defaultValue: "equity",
      },
      {
        kind: "select",
        name: "holding",
        label: "Holding period",
        options: [
          { value: "short", label: "Short term (equity ≤12m, other ≤24m)" },
          { value: "long", label: "Long term" },
        ],
        defaultValue: "long",
      },
      { kind: "number", name: "buy", label: "Purchase price (₹)", min: 1, placeholder: "e.g. 400000", defaultValue: 400000 },
      { kind: "number", name: "sell", label: "Sale price (₹)", min: 0, placeholder: "e.g. 650000", defaultValue: 650000 },
    ],
    calculate(v) {
      const buy = num(v.buy);
      const sell = num(v.sell);
      if (buy === null || buy <= 0) return { error: "Enter purchase price." };
      if (sell === null || sell < 0) return { error: "Enter sale price." };
      const gain = sell - buy;
      if (gain <= 0) {
        return {
          rows: [{ label: "Capital gain", value: inr(gain), emphasis: true }, { label: "Tax", value: inr(0) }],
          note: "No gain, no tax. Short-term losses can offset gains per set-off rules.",
        };
      }
      let rate: number;
      let taxable = gain;
      let label: string;
      if (v.asset === "equity") {
        if (v.holding === "short") { rate = 20; label = "STCG @ 20%"; }
        else { rate = 12.5; taxable = Math.max(0, gain - 125000); label = "LTCG @ 12.5% (₹1.25L exempt)"; }
      } else {
        if (v.holding === "short") { rate = -1; label = "STCG @ slab rate"; }
        else { rate = 12.5; label = "LTCG @ 12.5% (no indexation)"; }
      }
      if (rate === -1) {
        return {
          rows: [
            { label: "Short-term gain (added to income)", value: inr(gain), emphasis: true },
            { label: "Tax", value: `Slab rate — use Income Tax calculator` },
          ],
          note: "Non-equity STCG is taxed at your slab. " + FY_NOTE,
        };
      }
      const tax = (taxable * rate) / 100;
      return {
        rows: [
          { label: "Capital gain", value: inr(gain), emphasis: true },
          { label: `Tax — ${label}`, value: inr(tax), emphasis: true },
          { label: "Post-tax proceeds", value: inr(sell - tax) },
        ],
        note: "Post 23-Jul-2024 rules: equity STCG 20%, LTCG 12.5% above ₹1.25L annual exemption. " + FY_NOTE,
      };
    },
    formula: "Tax = taxable gain × rate; equity LTCG exempts first ₹1.25L per year.",
    about: [
      "Budget 2024 simplified capital gains: two holding buckets and broadly 12.5%/20% rates, with indexation removed for most assets.",
      "Equity LTCG gets a ₹1.25 lakh annual exemption before 12.5% applies.",
    ],
    faqs: [
      { q: "Is indexation gone?", a: "For most assets post-July 2024, yes — a flat 12.5% replaces 20% with indexation. Transitional options existed for property." },
      { q: "STCG on stocks held 8 months?", a: "20% flat (plus applicable surcharge/cess)." },
    ],
    relatedSlugs: ["income-tax-calculator", "cagr-calculator", "roi-calculator"],
    seoTitle: "Capital Gains Tax Calculator — STCG/LTCG (FY 2025-26)",
  },
];
