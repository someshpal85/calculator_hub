import type { CalculatorDefinition } from "@/lib/types";
import { inr, inr0, inrWords, fmt, pct } from "@/lib/format";
import { num, requirePositive, requireNonNegative } from "@/lib/validation";

export const BUSINESS_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "salary-calculator",
    name: "Salary Calculator (Hourly ↔ Annual)",
    icon: "💼",
    category: "salary",
    description: "Convert between hourly pay and annual salary — works with any currency.",
    keywords: ["salary", "hourly", "annual", "wage", "ctc", "paycheck", "वेतन"],
    popularity: 89,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "mode",
        label: "Convert",
        options: [
          { value: "toAnnual", label: "Hourly → Annual" },
          { value: "toHourly", label: "Annual → Hourly" },
        ],
        defaultValue: "toAnnual",
      },
      { kind: "number", name: "rate", label: "Rate (per hour / per year)", min: 0.01, placeholder: "e.g. 500", defaultValue: 500 },
      { kind: "number", name: "hoursWeek", label: "Hours per week", min: 1, max: 168, step: 1, placeholder: "e.g. 40", defaultValue: 40 },
      { kind: "number", name: "weeksYear", label: "Working weeks per year", min: 1, max: 52, step: 1, placeholder: "e.g. 52", defaultValue: 52 },
    ],
    calculate(v) {
      const rate = num(v.rate);
      const hpw = num(v.hoursWeek);
      const wpy = num(v.weeksYear);
      if (rate === null || rate <= 0) return { error: "Please enter a valid pay rate." };
      if (hpw === null || hpw <= 0 || hpw > 168) return { error: "Hours per week must be between 1 and 168." };
      if (wpy === null || wpy <= 0 || wpy > 52) return { error: "Working weeks must be between 1 and 52." };
      const annualHours = hpw * wpy;
      if (v.mode === "toHourly") {
        return {
          rows: [
            { label: "Per hour", value: inr(rate / annualHours), emphasis: true },
            { label: "Per month (avg)", value: inr(rate / 12) },
            { label: "Per week", value: inr(rate / wpy) },
            { label: "Annual hours worked", value: fmt(annualHours) },
          ],
        };
      }
      const annual = rate * annualHours;
      return {
        rows: [
          { label: "Per year", value: inr(annual), emphasis: true },
          { label: "Per month (avg)", value: inr(annual / 12) },
          { label: "Per week", value: inr(annual / wpy) },
          { label: "Total hours/year", value: fmt(annualHours) },
        ],
        note: `Based on ${fmt(hpw)} h/week × ${fmt(wpy)} weeks. Adjust weeks for unpaid leave.`,
      };
    },
    formula: "Annual = hourly × hours/week × weeks/year. Hourly = annual ÷ total hours.",
    about: [
      "This converter uses any currency symbol you imagine — the maths is identical worldwide. The default shows ₹ but results are unit-agnostic.",
      "Remember gross vs net: salary figures here are pre-tax. Use the income tax calculator to estimate take-home.",
    ],
    faqs: [
      { q: "How many working weeks should I enter?", a: "52 minus your leave: 4 weeks vacation → 48; typical Indian firms with ~12 public holidays + leave often land at 49–50." },
      { q: "Does this account for bonuses or PF?", a: "No — it converts base pay only. Add expected bonus to the annual figure manually for a fuller picture." },
    ],
    relatedSlugs: ["income-tax-calculator", "gratuity-calculator", "salary-hike-calculator"],
    seoTitle: "Salary Calculator — Hourly to Annual & Back",
  },

  {
    slug: "salary-hike-calculator",
    name: "Salary Hike Calculator",
    icon: "📊",
    category: "salary",
    description: "New salary after a percentage hike, monthly and yearly.",
    keywords: ["hike", "increment", "appraisal", "raise", "बढ़ोतरी"],
    popularity: 77,
    published: true,
    inputs: [
      { kind: "number", name: "current", label: "Current CTC / salary (₹)", min: 1, step: 10000, placeholder: "e.g. 1200000", defaultValue: 1200000 },
      { kind: "number", name: "hike", label: "Hike (%)", min: 0, max: 300, step: 0.5, placeholder: "e.g. 12.5", defaultValue: 12.5 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "current", label: "Current salary" }]);
      if ("error" in r) return r;
      const hike = num(v.hike);
      if (hike === null || hike < 0) return { error: "Hike cannot be negative." };
      const [current] = r;
      const increase = (current * hike) / 100;
      const newSalary = current + increase;
      return {
        rows: [
          { label: "New salary", value: inr(newSalary), emphasis: true },
          { label: "Increase amount", value: inr(increase) },
          { label: "Extra per month", value: inr(increase / 12) },
        ],
      };
    },
    formula: "New = Current × (1 + hike/100)",
    about: [
      "Appraisal percentages compound across years: two consecutive 10% hikes raise pay 21%, not 20%. When comparing offers, always compare growth rates rather than one-off jumps.",
    ],
    faqs: [
      { q: "Is a 10% hike good in India?", a: "Average appraisals have hovered around 8–10%; switching jobs typically yields 25–40%. Inflation-adjusted, sub-6% hikes are effectively flat." },
      { q: "CTC vs in-hand?", a: "CTC includes employer PF, gratuity and insurance. Your in-hand rises less than the headline percentage. This calculator is percentage-based, so it applies equally either way." },
    ],
    relatedSlugs: ["salary-calculator", "income-tax-calculator", "inflation-calculator"],
    seoTitle: "Salary Hike Calculator — New Pay After Increment %",
  },

  {
    slug: "gratuity-calculator",
    name: "Gratuity Calculator",
    icon: "🎁",
    category: "salary",
    description: "Payment of Gratuity Act formula — 15/26 × last drawn × completed years.",
    keywords: ["gratuity", "15/26", "retirement benefit", "उपदान"],
    popularity: 75,
    published: true,
    inputs: [
      { kind: "number", name: "basicDA", label: "Last drawn Basic + DA (monthly ₹)", min: 1, step: 1000, placeholder: "e.g. 60000", defaultValue: 60000 },
      { kind: "number", name: "years", label: "Years of service", min: 0, step: 1, placeholder: "e.g. 8", defaultValue: 8 },
    ],
    calculate(v) {
      const r = requireNonNegative(v, [
        { name: "basicDA", label: "Basic + DA" },
        { name: "years", label: "Years of service" },
      ]);
      if ("error" in r) return r;
      const [basicDA, years] = r;
      if (years < 5)
        return {
          rows: [
            { label: "Gratuity payable", value: inr(0), emphasis: true },
            { label: "Eligibility", value: `Not yet eligible — ${fmt(5 - years)} more year(s) needed` },
          ],
          note: "The Payment of Gratuity Act requires at least 5 continuous years of service.",
        };
      // Service is counted to the nearest completed year (user enters completed years).
      const roundedYears = Math.floor(years);
      const gratuity = ((15 / 26) * basicDA * roundedYears);
      const capped = Math.min(gratuity, 2000000);
      return {
        rows: [
          { label: "Estimated gratuity", value: inr(capped), emphasis: true },
          ...(gratuity > 2000000 ? [{ label: "Statutory cap applied", value: inr(2000000) }] : []),
          { label: "Formula used", value: `${fmt(15)}÷26 days × ${inr0(basicDA)} × ${roundedYears} yrs` },
        ],
        note: "Tax-free up to the government-notified limit (currently ₹20 lakh); amounts above are taxable as salary.",
      };
    },
    formula: "Gratuity = (15 ÷ 26) × last drawn Basic+DA × completed years of service, capped at ₹20 lakh.",
    about: [
      "Gratuity is a lump-sum thank-you payment mandated by law for employees leaving after five continuous years — resignation, retirement or retrenchment alike. The 15/26 factor represents half a month's salary for every year worked (a month ≈ 26 working days after weekly offs).",
    ],
    faqs: [
      { q: "Why divide by 26 and not 30?", a: "The Act counts four paid weekly offs per month, so a month has 26 payable days. Half-month gratuity therefore equals 15/26 of monthly salary." },
      { q: "Do contractual staff qualify?", a: "Employees under the Act need 5 years' continuous service; fixed-term contracts now count proportionally under amendments, but verify with HR/legal." },
    ],
    relatedSlugs: ["salary-calculator", "income-tax-calculator", "compound-interest-calculator"],
    seoTitle: "Gratuity Calculator — 15/26 Rule With Eligibility Check",
  },

  {
    slug: "break-even-calculator",
    name: "Break-Even Calculator",
    icon: "⚖️",
    category: "business",
    description: "Units and revenue needed before profit begins.",
    keywords: ["break even", "bep", "fixed cost", "contribution margin"],
    popularity: 70,
    published: true,
    inputs: [
      { kind: "number", name: "fixed", label: "Fixed costs (₹/month)", min: 1, step: 1000, placeholder: "e.g. 200000", defaultValue: 200000 },
      { kind: "number", name: "price", label: "Price per unit (₹)", min: 0.01, placeholder: "e.g. 250", defaultValue: 250 },
      { kind: "number", name: "variable", label: "Variable cost per unit (₹)", min: 0, placeholder: "e.g. 150", defaultValue: 150 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "fixed", label: "Fixed costs" },
        { name: "price", label: "Price per unit" },
      ]);
      if ("error" in r) return r;
      const variable = num(v.variable);
      if (variable === null || variable < 0) return { error: "Variable cost cannot be negative." };
      const [fixed, price] = r;
      if (price <= variable) return { error: "Price must exceed variable cost per unit or no break-even exists." };
      const contribution = price - variable;
      const bepUnits = fixed / contribution;
      return {
        rows: [
          { label: "Break-even units / month", value: `${Math.ceil(bepUnits).toLocaleString("en-IN")} units`, emphasis: true },
          { label: "Break-even revenue", value: inr(bepUnits * price) },
          { label: "Contribution margin per unit", value: `${inr(contribution)} (${pct((contribution / price) * 100)})` },
        ],
      };
    },
    formula: "BEP units = Fixed costs ÷ (Price − Variable cost per unit)",
    about: [
      "Break-even analysis answers the first question of any business: how much must we sell before profits start? Contribution margin — what each sale adds after variable costs — pays down fixed costs until they're covered.",
      "A BEP that feels unreachable signals pricing or cost-structure problems early, when they're cheapest to fix.",
    ],
    faqs: [
      { q: "What counts as a fixed cost?", a: "Costs unchanged by volume within your range: rent, salaries, insurance, software subscriptions. Electricity partially scales with production and is partly variable." },
      { q: "My BEP is too high — options?", a: "Raise price (check elasticity), cut variable cost via suppliers/scale, reduce fixed overheads, or improve product mix toward higher-margin items." },
    ],
    relatedSlugs: ["profit-margin-calculator", "markup-calculator", "roi-calculator"],
    seoTitle: "Break-Even Calculator — Units & Revenue Needed",
  },

  {
    slug: "profit-margin-calculator",
    name: "Profit Margin Calculator",
    icon: "📈",
    category: "business",
    description: "Gross profit and margin % from revenue and cost.",
    keywords: ["profit margin", "gross margin", "net profit"],
    popularity: 79,
    published: true,
    inputs: [
      { kind: "number", name: "revenue", label: "Revenue (selling price)", min: 0.01, placeholder: "e.g. 120000", defaultValue: 120000 },
      { kind: "number", name: "cost", label: "Total cost", min: 0, placeholder: "e.g. 90000", defaultValue: 90000 },
    ],
    calculate(v) {
      const rev = num(v.revenue);
      const cost = num(v.cost);
      if (rev === null || rev <= 0) return { error: "Revenue must be greater than zero." };
      if (cost === null || cost < 0) return { error: "Cost cannot be negative." };
      const profit = rev - cost;
      return {
        rows: [
          { label: "Profit margin", value: pct((profit / rev) * 100), emphasis: true },
          { label: "Gross profit", value: inr(profit) },
          { label: "Markup on cost", value: cost > 0 ? pct((profit / cost) * 100) : "∞ (zero cost)" },
        ],
        note: profit < 0 ? "Negative margin — selling below cost." : undefined,
      };
    },
    formula: "Margin % = (Revenue − Cost) ÷ Revenue × 100",
    about: [
      "Margin measures profit against selling price; markup measures it against cost. A '50% margin' business runs a 100% markup — mixing these up is among the most common pricing mistakes in small business.",
    ],
    faqs: [
      { q: "What is a healthy margin?", a: "Varies wildly: grocery retail 2–5%, software 80%+. Compare against industry peers, not absolute numbers." },
      { q: "Margin vs markup example?", a: "Buy at ₹60, sell at ₹100: margin = 40/100 = 40%; markup = 40/60 ≈ 66.7%. Both describe the same deal." },
    ],
    relatedSlugs: ["markup-calculator", "break-even-calculator", "gst-calculator"],
    seoTitle: "Profit Margin Calculator — Gross Margin %",
  },

  {
    slug: "markup-calculator",
    name: "Markup Calculator",
    icon: "🏷️",
    category: "business",
    description: "Selling price from cost plus a markup percentage.",
    keywords: ["markup", "pricing", "selling price", "cost plus"],
    popularity: 68,
    published: true,
    inputs: [
      { kind: "number", name: "cost", label: "Unit cost (₹)", min: 0.01, placeholder: "e.g. 800", defaultValue: 800 },
      { kind: "number", name: "markup", label: "Markup (%)", min: 0, step: 5, placeholder: "e.g. 40", defaultValue: 40 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "cost", label: "Unit cost" }]);
      if ("error" in r) return r;
      const m = num(v.markup);
      if (m === null || m < 0) return { error: "Markup cannot be negative." };
      const [cost] = r;
      const price = cost * (1 + m / 100);
      return {
        rows: [
          { label: "Selling price", value: inr(price), emphasis: true },
          { label: "Profit per unit", value: inr(price - cost) },
          { label: "Equivalent profit margin", value: pct(((price - cost) / price) * 100) },
        ],
      };
    },
    formula: "Price = Cost × (1 + markup/100); Margin = markup ÷ (1 + markup)",
    about: [
      "Cost-plus pricing guarantees coverage of unit costs by construction, but ignores willingness-to-pay and competition. Use markup for floor prices; use market research for ceilings.",
      "Note the conversion shown in results — a 40% markup equals only a 28.6% margin, because margin divides by the larger selling price.",
    ],
    faqs: [
      { q: "Should markup apply on landed cost?", a: "Yes — include freight, duties, storage and payment-gateway fees in 'cost', not just the supplier invoice." },
      { q: "Typical markups by trade?", a: "Retail apparel 50–150%, electronics 10–25%, restaurants food-cost rule targets ~30% (≈230% markup), services 2–5× direct labour cost." },
    ],
    relatedSlugs: ["profit-margin-calculator", "break-even-calculator", "discount-calculator"],
    seoTitle: "Markup Calculator — Selling Price From Cost",
  },

  {
    slug: "retirement-corpus-calculator",
    name: "Retirement Corpus Calculator",
    icon: "🌅",
    category: "investments",
    description: "Corpus needed to fund post-retirement expenses, inflation-adjusted.",
    keywords: ["retirement", "corpus", "fire number", "swr", "pension", "सेवानिवृत्ति"],
    popularity: 73,
    published: true,
    inputs: [
      { kind: "number", name: "monthly", label: "Current monthly expense (₹)", min: 1000, step: 1000, placeholder: "e.g. 60000", defaultValue: 60000 },
      { kind: "number", name: "yearsToRetire", label: "Years until retirement", min: 1, step: 1, placeholder: "e.g. 25", defaultValue: 25 },
      { kind: "number", name: "retiredYears", label: "Years in retirement", min: 5, step: 5, placeholder: "e.g. 30", defaultValue: 30 },
      { kind: "number", name: "inflation", label: "Expected inflation (% p.a.)", min: 0.1, step: 0.5, placeholder: "e.g. 6", defaultValue: 6 },
      { kind: "number", name: "returnPost", label: "Post-retirement return (% p.a.)", min: 0.1, step: 0.5, placeholder: "e.g. 7", defaultValue: 7 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "monthly", label: "Monthly expense" },
        { name: "yearsToRetire", label: "Years to retirement" },
        { name: "retiredYears", label: "Retirement duration" },
        { name: "inflation", label: "Inflation" },
        { name: "returnPost", label: "Post-retirement return" },
      ]);
      if ("error" in r) return r;
      const [monthly, ytr, ry, infl, retPost] = r;

      // First-year retirement expense
      const firstYearExpense = monthly * 12 * Math.pow(1 + infl / 100, ytr);

      // Present-value of growing annuity at retirement date:
      // PV = E × [1 − ((1+g)/(1+r))^n] ÷ (r − g), g=inflation, r=return
      const g = infl / 100;
      const disc = retPost / 100;
      let corpus: number;
      if (Math.abs(disc - g) < 1e-9) {
        corpus = firstYearExpense * ry;
      } else {
        corpus =
          (firstYearExpense * (1 - Math.pow((1 + g) / (1 + disc), ry))) /
          (disc - g);
      }

      return {
        rows: [
          { label: "Corpus required at retirement", value: inrWords(corpus) ? `${inr(corpus)} (${inrWords(corpus)})` : inr(corpus), emphasis: true },
          { label: "First-year annual expense", value: inr(firstYearExpense) },
          { label: "Today's ₹1L lifestyle then costs", value: inr(100000 * Math.pow(1 + g, ytr)) + "/month" },
        ],
        note: "Assumes expenses grow with inflation and corpus earns the post-retirement return throughout. Excludes pension/rental income offsets.",
      };
    },
    formula:
      "PV of growing annuity: Corpus = E₁ × [1 − ((1+g)/(1+r))^n] ÷ (r − g), where E₁ = first-year retirement expense.",
    about: [
      "Retirement planning fails most often from ignoring sequence-of-returns risk and medical inflation. This calculator sizes a corpus whose real withdrawals stay level across your retirement horizon.",
      "A common sanity check: annual expense ÷ 4% (the '4% rule'). For Indian inflation-adjusted plans, many advisors prefer 3–3.5% safe withdrawal assumptions.",
    ],
    faqs: [
      { q: "Why does my corpus look huge?", a: "Inflation compounds: ₹60k/month today becomes ~₹2.57 lakh at 6% over 25 years. The corpus must fund that inflated figure for decades." },
      { q: "What return can I assume after retiring?", a: "Retirees shift toward debt instruments; 6.5–7.5% blended is a common conservative assumption versus equity-heavy accumulation phases." },
    ],
    relatedSlugs: ["sip-calculator", "inflation-calculator", "compound-interest-calculator"],
    seoTitle: "Retirement Corpus Calculator — Inflation-Adjusted FIRE Number",
  },
];
