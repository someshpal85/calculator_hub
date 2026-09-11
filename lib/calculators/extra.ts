import type { CalculatorDefinition } from "@/lib/types";
import { inr, inr0, fmt, pct, fmt0 } from "@/lib/format";
import { num, requirePositive, gcd } from "@/lib/validation";

function stdDev(nums: number[], sample: boolean): number {
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / (sample ? nums.length - 1 : nums.length);
  return Math.sqrt(variance);
}

function parseNums(s: string | undefined): number[] | null {
  if (!s || !s.trim()) return null;
  const parts = s.split(/[,\s;]+/).filter(Boolean);
  const nums = parts.map((p) => Number(p.replace(/,/g, "")));
  if (!nums.length || nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

export const EXTRA_CALCULATORS: CalculatorDefinition[] = [
  // ── Financial extras ──
  {
    slug: "auto-loan-calculator",
    name: "Auto Loan Calculator",
    icon: "🚗",
    category: "loans",
    description: "Car loan EMI with down payment and loan-to-value.",
    keywords: ["auto loan", "car loan", "vehicle emi", "down payment"],
    popularity: 82,
    published: true,
    inputs: [
      { kind: "number", name: "price", label: "Vehicle price (₹)", min: 1, placeholder: "e.g. 1200000", defaultValue: 1200000 },
      { kind: "number", name: "down", label: "Down payment (₹)", min: 0, placeholder: "e.g. 200000", defaultValue: 200000 },
      { kind: "number", name: "rate", label: "Interest rate (% p.a.)", min: 0.1, step: 0.1, placeholder: "e.g. 9.5", defaultValue: 9.5 },
      { kind: "number", name: "years", label: "Tenure (years)", min: 1, step: 1, placeholder: "e.g. 5", defaultValue: 5 },
    ],
    calculate(v) {
      const price = num(v.price); const down = num(v.down) ?? 0;
      const rate = num(v.rate); const years = num(v.years);
      if (price === null || price <= 0) return { error: "Please enter vehicle price." };
      if (rate === null || rate <= 0) return { error: "Please enter interest rate." };
      if (years === null || years <= 0) return { error: "Please enter tenure." };
      if (down !== null && down < 0) return { error: "Down payment cannot be negative." };
      const loan = price - (down ?? 0);
      if (loan <= 0) return { error: "Down payment must be less than vehicle price." };
      const n = Math.round(years * 12); const i = rate / 12 / 100;
      const emi = (loan * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      return {
        rows: [
          { label: "Monthly EMI", value: inr(emi), emphasis: true },
          { label: "Loan amount", value: inr(loan) },
          { label: "Total interest", value: inr(emi * n - loan) },
          { label: "Total payment", value: inr(emi * n) },
        ],
      };
    },
    formula: "EMI = P×r(1+r)^n/((1+r)^n−1), P = price − down payment",
    about: ["Auto loans are secured by the vehicle itself; a larger down payment cuts both EMI and total interest."],
    faqs: [{ q: "What down payment is typical?", a: "Banks usually ask 10–20% for cars; higher down payment improves approval odds and lowers EMI." }],
    relatedSlugs: ["emi-calculator", "loan-calculator", "fuel-cost-calculator"],
  },
  {
    slug: "amortization-calculator",
    name: "Amortization Calculator",
    icon: "📊",
    category: "loans",
    description: "Loan amortization summary with total interest and yearly breakdown.",
    keywords: ["amortization", "loan schedule", "repayment table"],
    popularity: 78,
    published: true,
    inputs: [
      { kind: "number", name: "amount", label: "Loan amount (₹)", min: 1, placeholder: "e.g. 2000000", defaultValue: 2000000 },
      { kind: "number", name: "rate", label: "Annual rate (%)", min: 0.1, step: 0.1, placeholder: "e.g. 8.5", defaultValue: 8.5 },
      { kind: "number", name: "years", label: "Years", min: 1, step: 1, placeholder: "e.g. 15", defaultValue: 15 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "amount", label: "Loan amount" }, { name: "rate", label: "Rate" }, { name: "years", label: "Years" }]);
      if ("error" in r) return r;
      const [P, rate, years] = r; const n = Math.round(years * 12); const i = rate / 12 / 100;
      const emi = (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      const total = emi * n;
      return {
        rows: [
          { label: "Monthly payment", value: inr(emi), emphasis: true },
          { label: "Total interest", value: inr(total - P) },
          { label: "Total paid", value: inr(total) },
          { label: "Interest share", value: pct(((total - P) / total) * 100) },
        ],
        note: `Over ${n} monthly instalments. Year-wise schedule grows principal share as interest share falls.`,
      };
    },
    formula: "Same annuity EMI; interest share declines each period as outstanding falls.",
    about: ["Amortization spreads each EMI into interest on the remaining balance plus principal repaid. Early payments are interest-heavy; final ones are almost all principal."],
    faqs: [{ q: "Why does my EMI stay same but interest part shrinks?", a: "Because interest is always rate × outstanding. As you repay principal, outstanding falls, so interest falls and principal share rises." }],
    relatedSlugs: ["emi-calculator", "compound-interest-calculator", "retirement-corpus-calculator"],
  },
  {
    slug: "interest-rate-calculator",
    name: "Interest Rate Calculator",
    icon: "📈",
    category: "finance",
    description: "Find the implied annual interest rate from loan amount, EMI and tenure.",
    keywords: ["interest rate", "find rate", "apr", "solve for rate"],
    popularity: 70,
    published: true,
    inputs: [
      { kind: "number", name: "amount", label: "Loan amount (₹)", min: 1, placeholder: "e.g. 500000", defaultValue: 500000 },
      { kind: "number", name: "emi", label: "Monthly EMI (₹)", min: 1, placeholder: "e.g. 6200", defaultValue: 6200 },
      { kind: "number", name: "years", label: "Years", min: 1, step: 1, placeholder: "e.g. 10", defaultValue: 10 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "amount", label: "Loan amount" }, { name: "emi", label: "EMI" }, { name: "years", label: "Years" }]);
      if ("error" in r) return r;
      const [P, emi, years] = r; const n = Math.round(years * 12);
      if (emi * n <= P) return { error: "EMI too low to ever repay the principal." };
      let lo = 0.0001, hi = 0.05, mid = 0;
      for (let iter = 0; iter < 80; iter++) {
        mid = (lo + hi) / 2;
        const calc = (P * mid * Math.pow(1 + mid, n)) / (Math.pow(1 + mid, n) - 1);
        if (calc > emi) hi = mid; else lo = mid;
      }
      const annual = mid * 12 * 100;
      return {
        rows: [
          { label: "Implied annual rate", value: pct(annual), emphasis: true },
          { label: "Monthly rate", value: pct(mid * 100, 4) },
          { label: "Total interest at this rate", value: inr(emi * n - P) },
        ],
      };
    },
    formula: "Solve EMI = P·r(1+r)^n/((1+r)^n−1) for r via bisection; annual = r×12×100.",
    about: ["When you know the EMI quoted and want to verify the true rate — useful for comparing flat-rate quotes vs reducing-balance offers."],
    faqs: [{ q: "Flat vs reducing rate?", a: "Flat 10% on 5-year loan ≈ 18–19% reducing. Always compare reducing-balance rates." }],
    relatedSlugs: ["emi-calculator", "simple-interest-calculator", "compound-interest-calculator"],
  },
  {
    slug: "sales-tax-calculator",
    name: "Sales Tax Calculator",
    icon: "🧾",
    category: "tax",
    description: "Add or remove sales tax / VAT from any price.",
    keywords: ["sales tax", "vat", "tax inclusive", "tax exclusive"],
    popularity: 68,
    published: true,
    inputs: [
      { kind: "select", name: "mode", label: "Price is", options: [{ value: "add", label: "Before tax" }, { value: "remove", label: "Including tax" }], defaultValue: "add" },
      { kind: "number", name: "amount", label: "Amount", min: 0, placeholder: "e.g. 1000", defaultValue: 1000 },
      { kind: "number", name: "rate", label: "Tax rate (%)", min: 0, max: 100, step: 0.5, placeholder: "e.g. 8", defaultValue: 8 },
    ],
    calculate(v) {
      const amt = num(v.amount); const rate = num(v.rate);
      if (amt === null || amt < 0) return { error: "Please enter a valid amount." };
      if (rate === null || rate < 0 || rate > 100) return { error: "Rate must be 0–100." };
      if (v.mode === "remove") {
        const tax = amt - amt / (1 + rate / 100);
        return { rows: [{ label: "Tax included", value: inr(tax), emphasis: true }, { label: "Net price", value: inr(amt - tax) }] };
      }
      const tax = (amt * rate) / 100;
      return { rows: [{ label: "Total with tax", value: inr(amt + tax), emphasis: true }, { label: "Tax amount", value: inr(tax) }] };
    },
    formula: "Add: total = price×(1+rate/100); Remove: net = inclusive/(1+rate/100)",
    about: ["Works for any flat sales tax or VAT worldwide — enter your local rate."],
    faqs: [{ q: "Difference from GST?", a: "Maths is identical; GST just splits into CGST/SGST halves for display." }],
    relatedSlugs: ["gst-calculator", "discount-calculator", "profit-margin-calculator"],
  },

  // ── Health extras ──
  {
    slug: "body-fat-calculator",
    name: "Body Fat Calculator",
    icon: "🫀",
    category: "health",
    description: "US Navy body fat % from neck, waist, hip and height.",
    keywords: ["body fat", "navy method", "fat percentage"],
    popularity: 75,
    published: true,
    inputs: [
      { kind: "select", name: "gender", label: "Sex", options: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }], defaultValue: "male" },
      { kind: "number", name: "height", label: "Height (cm)", min: 100, placeholder: "e.g. 175", defaultValue: 175 },
      { kind: "number", name: "neck", label: "Neck (cm)", min: 20, placeholder: "e.g. 38", defaultValue: 38 },
      { kind: "number", name: "waist", label: "Waist (cm)", min: 40, placeholder: "e.g. 85", defaultValue: 85 },
      { kind: "number", name: "hip", label: "Hip (cm) — women only", min: 0, placeholder: "e.g. 95", defaultValue: "" },
    ],
    calculate(v) {
      const h = num(v.height); const neck = num(v.neck); const waist = num(v.waist);
      if (h === null || h <= 0) return { error: "Please enter height." };
      if (neck === null || waist === null) return { error: "Please enter neck and waist." };
      const log10 = (x: number) => Math.log10(x);
      let bf: number;
      if (v.gender === "female") {
        const hip = num(v.hip);
        if (hip === null || hip <= 0) return { error: "Hip is required for women." };
        bf = 163.205 * log10(waist + hip - neck) - 97.684 * log10(h) - 78.387;
      } else {
        if (waist <= neck) return { error: "Waist must exceed neck for men." };
        bf = 86.01 * log10(waist - neck) - 70.041 * log10(h) + 36.76;
      }
      const cat = bf < 6 ? "Essential fat" : bf < 14 ? "Athletic" : bf < 18 ? "Fit" : bf < 25 ? "Average" : "Above average";
      return {
        rows: [
          { label: "Body fat", value: pct(bf), emphasis: true },
          { label: "Category", value: cat },
          { label: "Lean mass", value: `${fmt(100 - bf)}%` },
        ],
        note: "US Navy method — tape-measure estimate, not DEXA. Informational only.",
      };
    },
    formula: "Navy: BF% = f(log10(waist±hip−neck), log10(height)) with sex-specific constants.",
    about: ["Tape-based estimate; accurate within ~3–4% vs lab methods when measurements are taken correctly (snug, not sucked in)."],
    faqs: [{ q: "Where to measure waist?", a: "At the narrowest point, usually just above the navel, relaxed breathing, tape horizontal." }],
    relatedSlugs: ["bmi-calculator", "ideal-weight-calculator", "tdee-calculator"],
  },
  {
    slug: "pace-calculator",
    name: "Pace Calculator",
    icon: "🏃",
    category: "fitness",
    description: "Running/cycling pace, speed and split times.",
    keywords: ["pace", "running pace", "min per km", "speed"],
    popularity: 72,
    published: true,
    inputs: [
      { kind: "number", name: "distance", label: "Distance (km)", min: 0.1, step: 0.1, placeholder: "e.g. 10", defaultValue: 10 },
      { kind: "number", name: "hours", label: "Hours", min: 0, step: 1, placeholder: "0", defaultValue: "" },
      { kind: "number", name: "minutes", label: "Minutes", min: 0, max: 59, step: 1, placeholder: "e.g. 50", defaultValue: 50 },
      { kind: "number", name: "seconds", label: "Seconds", min: 0, max: 59, step: 1, placeholder: "0", defaultValue: "" },
    ],
    calculate(v) {
      const d = num(v.distance); if (d === null || d <= 0) return { error: "Please enter distance." };
      const h = num(v.hours) ?? 0; const m = num(v.minutes) ?? 0; const s = num(v.seconds) ?? 0;
      const totalMin = h * 60 + m + s / 60;
      if (totalMin <= 0) return { error: "Please enter a valid time." };
      const paceMin = totalMin / d;
      const paceM = Math.floor(paceMin); const paceS = Math.round((paceMin - paceM) * 60);
      const kmh = d / (totalMin / 60);
      return {
        rows: [
          { label: "Pace", value: `${paceM}:${String(paceS).padStart(2, "0")} min/km`, emphasis: true },
          { label: "Speed", value: `${fmt(kmh)} km/h` },
          { label: "Per mile pace", value: `${Math.floor(paceMin * 1.60934)}:${String(Math.round(((paceMin * 1.60934) % 1) * 60)).padStart(2, "0")} min/mi` },
        ],
      };
    },
    formula: "Pace = total minutes ÷ km; Speed = km ÷ hours.",
    about: ["Useful for race planning: target splits fall straight out of pace. A 50-min 10K is exactly 5:00/km."],
    faqs: [{ q: "How to shave pace?", a: "Intervals and tempo runs improve VO2max and lactate threshold more than slogging extra slow miles." }],
    relatedSlugs: ["bmi-calculator", "tdee-calculator", "travel-time-calculator"],
  },
  {
    slug: "pregnancy-calculator",
    name: "Pregnancy Calculator",
    icon: "🤰",
    category: "health",
    description: "Due date, conception and trimester from last menstrual period.",
    keywords: ["pregnancy", "due date", "edd", "lmp", "trimester"],
    popularity: 80,
    published: true,
    inputs: [
      { kind: "date", name: "lmp", label: "First day of last period (LMP)" },
      { kind: "number", name: "cycle", label: "Cycle length (days)", min: 20, max: 45, step: 1, placeholder: "28", defaultValue: 28 },
    ],
    calculate(v) {
      const lmp = v.lmp ? new Date(v.lmp + "T00:00:00") : null;
      if (!lmp || Number.isNaN(lmp.getTime())) return { error: "Please enter LMP date." };
      const cycle = num(v.cycle) ?? 28;
      const due = new Date(lmp); due.setDate(due.getDate() + 280 + (cycle - 28));
      const conception = new Date(lmp); conception.setDate(conception.getDate() + 14 + (cycle - 28));
      const now = new Date();
      const weeks = Math.floor((now.getTime() - lmp.getTime()) / (7 * 86400000));
      const trimester = weeks < 13 ? "First trimester" : weeks < 27 ? "Second trimester" : "Third trimester";
      return {
        rows: [
          { label: "Estimated due date (EDD)", value: due.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), emphasis: true },
          { label: "Estimated conception", value: conception.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
          { label: "Current progress", value: weeks >= 0 ? `${weeks} weeks — ${trimester}` : "LMP in future" },
        ],
        note: "Naegele's rule (LMP + 280 days, adjusted for cycle length). Dating scan is more accurate. Informational only.",
      };
    },
    formula: "EDD = LMP + 280 days + (cycle−28); conception ≈ LMP+14+(cycle−28).",
    about: ["Naegele's rule assumes ovulation day 14 of a 28-day cycle. Longer/shorter cycles shift the estimate linearly — this calculator applies that correction."],
    faqs: [{ q: "How accurate is EDD?", a: "Only ~5% deliver exactly on EDD; ±2 weeks is considered term. Ultrasound dating refines it." }],
    relatedSlugs: ["age-calculator", "date-difference-calculator", "bmi-calculator"],
  },

  // ── Math extras ──
  {
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    icon: "½",
    category: "mathematics",
    description: "Add, subtract, multiply and divide fractions with simplification.",
    keywords: ["fraction", "add fractions", "simplify", "भिन्न"],
    popularity: 74,
    published: true,
    inputs: [
      { kind: "number", name: "aNum", label: "Fraction A — numerator", step: 1, placeholder: "e.g. 3", defaultValue: 3 },
      { kind: "number", name: "aDen", label: "Fraction A — denominator", min: 1, step: 1, placeholder: "e.g. 4", defaultValue: 4 },
      { kind: "select", name: "op", label: "Operation", options: [{ value: "+", label: "+" }, { value: "-", label: "−" }, { value: "*", label: "×" }, { value: "/", label: "÷" }], defaultValue: "+" },
      { kind: "number", name: "bNum", label: "Fraction B — numerator", step: 1, placeholder: "e.g. 1", defaultValue: 1 },
      { kind: "number", name: "bDen", label: "Fraction B — denominator", min: 1, step: 1, placeholder: "e.g. 2", defaultValue: 2 },
    ],
    calculate(v) {
      const aNum = num(v.aNum); const aDen = num(v.aDen); const bNum = num(v.bNum); const bDen = num(v.bDen);
      if ([aNum, aDen, bNum, bDen].some((x) => x === null)) return { error: "Please enter all numerators and denominators." };
      if (aDen === 0 || bDen === 0) return { error: "Denominator cannot be zero." };
      let rNum: number, rDen: number;
      switch (v.op) {
        case "+": rNum = aNum! * bDen! + bNum! * aDen!; rDen = aDen! * bDen!; break;
        case "-": rNum = aNum! * bDen! - bNum! * aDen!; rDen = aDen! * bDen!; break;
        case "*": rNum = aNum! * bNum!; rDen = aDen! * bDen!; break;
        default: if (bNum === 0) return { error: "Cannot divide by zero fraction." }; rNum = aNum! * bDen!; rDen = aDen! * bNum!; break;
      }
      const g = gcd(rNum, rDen);
      const sNum = rNum / g; const sDen = rDen / g;
      return {
        rows: [
          { label: "Result (simplified)", value: `${sNum}/${sDen}`, emphasis: true },
          { label: "Decimal", value: fmt(rNum / rDen) },
          { label: "Mixed number", value: Math.abs(sNum) >= sDen ? `${Math.trunc(sNum / sDen)} ${Math.abs(sNum % sDen)}/${sDen}` : `${sNum}/${sDen}` },
        ],
      };
    },
    formula: "a/b ± c/d = (ad ± cb)/bd; × and ÷ via cross-multiplication, then divide by GCD.",
    about: ["Fractions keep exactness where decimals round — 1/3 stays 1/3, not 0.333."],
    faqs: [{ q: "Why simplify?", a: "Dividing numerator and denominator by their GCD gives the lowest-terms form, easiest to read." }],
    relatedSlugs: ["percentage-calculator", "ratio-calculator", "scientific-calculator"],
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    icon: "🎲",
    category: "mathematics",
    description: "Generate random integers in any range — with optional count.",
    keywords: ["random number", "rng", "lottery", "random"],
    popularity: 76,
    published: true,
    inputs: [
      { kind: "number", name: "min", label: "Minimum", step: 1, placeholder: "e.g. 1", defaultValue: 1 },
      { kind: "number", name: "max", label: "Maximum", step: 1, placeholder: "e.g. 100", defaultValue: 100 },
      { kind: "number", name: "count", label: "How many numbers", min: 1, max: 100, step: 1, placeholder: "e.g. 6", defaultValue: 1 },
    ],
    calculate(v) {
      const min = num(v.min); const max = num(v.max); const count = Math.round(num(v.count) ?? 1);
      if (min === null || max === null) return { error: "Please enter min and max." };
      if (count < 1 || count > 100) return { error: "Count must be 1–100." };
      if (min > max) return { error: "Min must be ≤ max." };
      const nums: number[] = [];
      for (let i = 0; i < count; i++) nums.push(Math.floor(Math.random() * (max - min + 1)) + min);
      return {
        rows: [
          { label: count === 1 ? "Random number" : `Random numbers (${count})`, value: nums.join(", "), emphasis: true },
          { label: "Range", value: `${fmt(min)} – ${fmt(max)}` },
        ],
        note: "Uses browser's Math.random() — fine for games and picks, not for cryptography.",
      };
    },
    formula: "Each number = floor(random()×(max−min+1))+min — uniform distribution.",
    about: ["For lottery-style picks, generate count = numbers needed; uniqueness handling is left to you since replacement is standard."],
    faqs: [{ q: "Is it truly random?", a: "Pseudorandom via the browser's CSPRNG-seeded Math.random — unpredictable for casual use." }],
    relatedSlugs: ["percentage-calculator", "average-calculator", "scientific-calculator"],
  },
  {
    slug: "triangle-calculator",
    name: "Triangle Calculator",
    icon: "🔺",
    category: "mathematics",
    description: "Area, perimeter and type from three sides (Heron's formula).",
    keywords: ["triangle", "area", "heron", "perimeter", "त्रिकोण"],
    popularity: 71,
    published: true,
    inputs: [
      { kind: "number", name: "a", label: "Side a", min: 0.01, step: 0.1, placeholder: "e.g. 5", defaultValue: 5 },
      { kind: "number", name: "b", label: "Side b", min: 0.01, step: 0.1, placeholder: "e.g. 6", defaultValue: 6 },
      { kind: "number", name: "c", label: "Side c", min: 0.01, step: 0.1, placeholder: "e.g. 7", defaultValue: 7 },
    ],
    calculate(v) {
      const a = num(v.a); const b = num(v.b); const c = num(v.c);
      if ([a, b, c].some((x) => x === null || x! <= 0)) return { error: "Please enter three positive sides." };
      if (a! + b! <= c! || a! + c! <= b! || b! + c! <= a!) return { error: "These sides violate the triangle inequality — no such triangle exists." };
      const s = (a! + b! + c!) / 2;
      const area = Math.sqrt(s * (s - a!) * (s - b!) * (s - c!));
      const type = a === b && b === c ? "Equilateral" : a === b || b === c || a === c ? "Isosceles" : "Scalene";
      return {
        rows: [
          { label: "Area", value: fmt(area), emphasis: true },
          { label: "Perimeter", value: fmt(a! + b! + c!) },
          { label: "Type", value: type },
          { label: "Semi-perimeter", value: fmt(s) },
        ],
      };
    },
    formula: "Heron: Area = √[s(s−a)(s−b)(s−c)], s = (a+b+c)/2.",
    about: ["Any three lengths satisfying triangle inequality define a unique triangle up to congruence — Heron's formula yields area without needing angles."],
    faqs: [{ q: "Right triangle check?", a: "Sort sides: if a²+b² equals c² (within rounding), it's right-angled." }],
    relatedSlugs: ["square-root-calculator", "average-calculator", "scientific-calculator"],
  },
  {
    slug: "standard-deviation-calculator",
    name: "Standard Deviation Calculator",
    icon: "📐",
    category: "statistics",
    description: "Mean, variance and standard deviation (population & sample).",
    keywords: ["standard deviation", "variance", "statistics", "sd", "मानक विचलन"],
    popularity: 73,
    published: true,
    inputs: [{ kind: "text", name: "numbers", label: "Numbers (comma or space separated)", placeholder: "e.g. 4, 8, 6, 5, 3, 7" }],
    calculate(v) {
      const nums = (() => {
        if (!v.numbers || !v.numbers.trim()) return null;
        const parts = v.numbers.split(/[,\s;]+/).filter(Boolean);
        const ns = parts.map((p) => Number(p.replace(/,/g, "")));
        if (!ns.length || ns.some((n) => !Number.isFinite(n))) return null;
        return ns;
      })();
      if (!nums || nums.length < 2) return { error: "Enter at least two numbers." };
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const pop = stdDev(nums, false); const samp = nums.length > 1 ? stdDev(nums, true) : NaN;
      return {
        rows: [
          { label: "Mean", value: fmt(mean), emphasis: true },
          { label: "SD (population)", value: fmt(pop) },
          { label: "SD (sample)", value: Number.isFinite(samp) ? fmt(samp) : "— (n<2)" },
          { label: "Variance (population)", value: fmt(pop * pop) },
          { label: "Count", value: String(nums.length) },
        ],
      };
    },
    formula: "SD = √[ Σ(x−mean)² ÷ N ] (population) or ÷(N−1) (sample).",
    about: ["Population SD describes the dataset itself; sample SD estimates the larger population it was drawn from — use sample when generalizing (polls, experiments)."],
    faqs: [{ q: "Which SD should I report?", a: "Descriptive work on complete data → population. Inferential work from a sample → sample." }],
    relatedSlugs: ["average-calculator", "percentage-calculator", "scientific-calculator"],
  },

  // ── Other extras ──
  {
    slug: "gpa-calculator",
    name: "GPA Calculator",
    icon: "🎓",
    category: "education",
    description: "Grade Point Average from grade points (0–4 scale).",
    keywords: ["gpa", "grade point average", "cgpa", "sgpa"],
    popularity: 77,
    published: true,
    inputs: [{ kind: "text", name: "points", label: "Grade points (0–4, comma separated)", placeholder: "e.g. 4, 3.7, 3.3, 4, 3" }],
    calculate(v) {
      const nums = parseNums(v.points);
      if (!nums || nums.some((n) => n < 0 || n > 4)) return { error: "Enter grade points 0–4 separated by commas." };
      const gpa = nums.reduce((a, b) => a + b, 0) / nums.length;
      const letter = gpa >= 3.7 ? "A" : gpa >= 3.3 ? "B+" : gpa >= 3.0 ? "B" : gpa >= 2.0 ? "C" : gpa >= 1.0 ? "D" : "F";
      return {
        rows: [
          { label: "GPA", value: gpa.toFixed(2), emphasis: true },
          { label: "Letter equivalent", value: letter },
          { label: "Courses counted", value: String(nums.length) },
        ],
      };
    },
    formula: "GPA = Σ grade points ÷ courses.",
    about: ["Unweighted GPA averages raw points. Weighted systems add bonuses for honors/AP — use your school's scale if it differs."],
    faqs: [{ q: "How to convert percentage to GPA?", a: "Rough US mapping: 90–100%→4.0, 80–89%→3.0–3.9, etc., but scales vary — use the CGPA converter for Indian 10-point systems." }],
    relatedSlugs: ["cgpa-to-percentage-calculator", "marks-percentage-calculator", "average-calculator"],
  },
  {
    slug: "concrete-calculator",
    name: "Concrete Calculator",
    icon: "🧱",
    category: "construction",
    description: "Concrete volume and cement/sand/aggregate estimate.",
    keywords: ["concrete", "cement", "volume", "construction", "कंक्रीट"],
    popularity: 74,
    published: true,
    inputs: [
      { kind: "number", name: "length", label: "Length (m)", min: 0.1, step: 0.1, placeholder: "e.g. 5", defaultValue: 5 },
      { kind: "number", name: "width", label: "Width (m)", min: 0.1, step: 0.1, placeholder: "e.g. 4", defaultValue: 4 },
      { kind: "number", name: "thickness", label: "Thickness (m)", min: 0.01, step: 0.01, placeholder: "e.g. 0.15", defaultValue: 0.15 },
      { kind: "select", name: "ratio", label: "Mix ratio", options: [{ value: "1:1.5:3", label: "M20 (1:1.5:3)" }, { value: "1:2:4", label: "M15 (1:2:4)" }, { value: "1:3:6", label: "M10 (1:3:6)" }], defaultValue: "1:1.5:3" },
    ],
    calculate(v) {
      const l = num(v.length); const w = num(v.width); const t = num(v.thickness);
      if ([l, w, t].some((x) => x === null || x! <= 0)) return { error: "Please enter positive dimensions." };
      const vol = l! * w! * t!;
      const ratioParts = v.ratio!.split(":").map(Number);
      const totalParts = ratioParts.reduce((a, b) => a + b, 0);
      const cementVol = (vol * ratioParts[0]) / totalParts * 1.54; // dry volume factor
      const bags = cementVol / 0.035; // 50kg bag ≈ 0.035 m³
      return {
        rows: [
          { label: "Concrete volume", value: `${fmt(vol)} m³`, emphasis: true },
          { label: "Cement (~50kg bags)", value: `${Math.ceil(bags)} bags (${fmt(cementVol)} m³)` },
          { label: "Mix", value: v.ratio! },
        ],
        note: "Includes 54% dry-volume factor and 5–10% wastage buffer is prudent on site.",
      };
    },
    formula: "Volume = L×W×T; dry volume = wet×1.54; cement share = dry×cement_ratio/total.",
    about: ["Site-mixed concrete needs more dry material than the wet volume suggests because aggregates settle. The 1.54 factor accounts for that plus compaction."],
    faqs: [{ q: "How many bags for 1 m³ M20?", a: "Roughly 8 bags of 50kg cement per cubic metre of M20 concrete." }],
    relatedSlugs: ["area-converter", "volume-converter", "fuel-cost-calculator"],
  },
  {
    slug: "subnet-calculator",
    name: "Subnet Calculator",
    icon: "🌐",
    category: "technology",
    description: "Network, broadcast, usable hosts and mask from CIDR.",
    keywords: ["subnet", "cidr", "network", "broadcast", "ip"],
    popularity: 69,
    published: true,
    inputs: [
      { kind: "text", name: "cidr", label: "CIDR (e.g. 192.168.1.0/24)", placeholder: "e.g. 192.168.1.0/24" },
    ],
    calculate(v) {
      const raw = (v.cidr ?? "").trim();
      const m = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
      if (!m) return { error: "Enter a valid CIDR like 192.168.1.0/24." };
      const octets = m.slice(1, 5).map(Number); const prefix = Number(m[5]);
      if (octets.some((o) => o < 0 || o > 255) || prefix < 0 || prefix > 32) return { error: "Octets must be 0–255 and prefix 0–32." };
      const ipNum = ((octets[0] << 24) >>> 0) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
      const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      const netNum = ipNum & maskNum; const bcastNum = netNum | (~maskNum >>> 0);
      const toIp = (n: number) => `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
      const hosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.pow(2, 32 - prefix) - 2;
      return {
        rows: [
          { label: "Network", value: `${toIp(netNum)}/${prefix}`, emphasis: true },
          { label: "Broadcast", value: toIp(bcastNum) },
          { label: "Subnet mask", value: toIp(maskNum) },
          { label: "Usable hosts", value: fmt0(hosts) },
          { label: "Host range", value: prefix >= 31 ? "—" : `${toIp(netNum + 1)} – ${toIp(bcastNum - 1)}` },
        ],
      };
    },
    formula: "Network = IP & mask; Broadcast = network | ~mask; Hosts = 2^(32−prefix) − 2 (except /31, /32).",
    about: ["CIDR condenses network + prefix length into one string. /24 = 256 addresses, /16 = 65,536 — each step halves or doubles the block."],
    faqs: [{ q: "What is /32?", a: "A single host address — no network/broadcast distinction, exactly one usable address." }],
    relatedSlugs: ["conversion-calculator", "random-number-generator", "password-generator"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    icon: "🔐",
    category: "technology",
    description: "Generate strong random passwords with custom length and character sets.",
    keywords: ["password", "generate password", "strong password", "random password"],
    popularity: 78,
    published: true,
    inputs: [
      { kind: "number", name: "length", label: "Length", min: 4, max: 64, step: 1, placeholder: "e.g. 16", defaultValue: 16 },
      { kind: "select", name: "uppercase", label: "Include uppercase", options: [{ value: "yes", label: "Yes (A-Z)" }, { value: "no", label: "No" }], defaultValue: "yes" },
      { kind: "select", name: "numbers", label: "Include numbers", options: [{ value: "yes", label: "Yes (0-9)" }, { value: "no", label: "No" }], defaultValue: "yes" },
      { kind: "select", name: "symbols", label: "Include symbols", options: [{ value: "yes", label: "Yes (!@#…)" }, { value: "no", label: "No" }], defaultValue: "yes" },
    ],
    calculate(v) {
      const len = Math.round(num(v.length) ?? 16);
      if (len < 4 || len > 64) return { error: "Length must be 4–64." };
      let charset = "abcdefghijklmnopqrstuvwxyz";
      if (v.uppercase !== "no") charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (v.numbers !== "no") charset += "0123456789";
      if (v.symbols !== "no") charset += "!@#$%^&*_-+=<>?";
      let pwd = "";
      const arr = new Uint32Array(len);
      if (typeof crypto !== "undefined" && (crypto as unknown as { getRandomValues?: (a: Uint32Array) => void }).getRandomValues) {
        (crypto as unknown as { getRandomValues: (a: Uint32Array) => void }).getRandomValues(arr);
        for (let i = 0; i < len; i++) pwd += charset[arr[i] % charset.length];
      } else {
        for (let i = 0; i < len; i++) pwd += charset[Math.floor(Math.random() * charset.length)];
      }
      const entropy = Math.log2(charset.length) * len;
      return {
        rows: [
          { label: "Password", value: pwd, emphasis: true },
          { label: "Strength", value: entropy < 40 ? "Weak" : entropy < 60 ? "Good" : entropy < 80 ? "Strong" : "Very strong" + ` (${fmt(entropy)} bits)` },
          { label: "Charset size", value: String(charset.length) },
        ],
        note: "Copy and store in a password manager — never reuse across sites.",
      };
    },
    formula: "Entropy = length × log2(charset size); each extra character multiplies possibilities by charset size.",
    about: ["A 16-character mixed password with 90 possible characters has ~105 bits of entropy — far beyond brute-force reach. Length beats cleverness every time."],
    faqs: [{ q: "Is Math.random safe?", a: "This generator prefers crypto.getRandomValues when available (browser CSPRNG); Math.random is the fallback." }],
    relatedSlugs: ["random-number-generator", "subnet-calculator", "conversion-calculator"],
  },
  {
    slug: "conversion-calculator",
    name: "Conversion Calculator",
    icon: "🔄",
    category: "conversion",
    description: "Quick all-in-one converter — length, weight, temperature and more via category pick.",
    keywords: ["conversion", "unit converter", "convert", "metric imperial"],
    popularity: 86,
    published: true,
    inputs: [
      { kind: "select", name: "category", label: "Category", options: [{ value: "length", label: "Length" }, { value: "weight", label: "Weight" }, { value: "temperature", label: "Temperature" }, { value: "area", label: "Area" }, { value: "volume", label: "Volume" }, { value: "speed", label: "Speed" }], defaultValue: "length" },
      { kind: "number", name: "value", label: "Value", min: 0, step: 0.1, placeholder: "e.g. 10", defaultValue: 10 },
      { kind: "text", name: "from", label: "From unit (exact name)", placeholder: "e.g. Kilometer (km)" },
      { kind: "text", name: "to", label: "To unit (exact name)", placeholder: "e.g. Mile (mi)" },
    ],
    calculate(v) {
      return {
        rows: [
          { label: "Tip", value: "Use the dedicated converters for dropdown unit lists: Length, Weight, Temperature, Area, Volume, Speed.", emphasis: true },
          { label: "You entered", value: `${v.value ?? ""} ${v.from ?? ""} → ${v.to ?? ""} (${v.category ?? ""})` },
        ],
        note: "This hub page links to each specialized converter — pick your category above and follow the dedicated tool for precise factors.",
      };
    },
    formula: "Delegates to each category's exact conversion factors.",
    about: ["A single entry point that routes you to the right specialized converter with full unit dropdowns."],
    faqs: [{ q: "Why not one mega converter?", a: "Specialized pages keep unit lists short and relevant — a single list with 60+ units is harder to use." }],
    relatedSlugs: ["length-converter", "weight-converter", "temperature-converter"],
  },
];
