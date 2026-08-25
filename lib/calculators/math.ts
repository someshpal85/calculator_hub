import type { CalculatorDefinition } from "@/lib/types";
import { fmt } from "@/lib/format";
import { num, gcd, requirePositive } from "@/lib/validation";

function parseNumberList(s: string | undefined): number[] | null {
  if (!s || !s.trim()) return null;
  const parts = s.split(/[,\s;]+/).filter(Boolean);
  const nums = parts.map((p) => Number(p.replace(/,/g, "")));
  if (!nums.length || nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

export const MATH_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    icon: "％",
    category: "mathematics",
    description: "% of a number, what percent X is of Y, or percentage change.",
    keywords: ["percentage", "percent", "%", "change", "increase", "decrease", "प्रतिशत"],
    popularity: 96,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "mode",
        label: "Calculation type",
        options: [
          { value: "of", label: "What is X% of Y?" },
          { value: "isWhat", label: "X is what % of Y?" },
          { value: "change", label: "% change from X to Y" },
        ],
        defaultValue: "of",
      },
      { kind: "number", name: "x", label: "Value X", step: "any", placeholder: "e.g. 15", defaultValue: 15 },
      { kind: "number", name: "y", label: "Value Y", step: "any", placeholder: "e.g. 200", defaultValue: 200 },
    ],
    calculate(v) {
      const x = num(v.x);
      const y = num(v.y);
      if (x === null || y === null) return { error: "Please enter both values." };
      switch (v.mode) {
        case "of": {
          const r = (x / 100) * y;
          return {
            rows: [
              { label: `${fmt(x)}% of ${fmt(y)}`, value: fmt(r), emphasis: true },
            ],
          };
        }
        case "isWhat": {
          if (y === 0) return { error: "Y must be non-zero for percentage-of-total." };
          return {
            rows: [
              { label: `${fmt(x)} is`, value: `${((x / y) * 100).toFixed(2)}% of ${fmt(y)}`, emphasis: true },
            ],
          };
        }
        default: {
          if (x === 0) return { error: "Percentage change needs a non-zero starting value." };
          const change = ((y - x) / Math.abs(x)) * 100;
          return {
            rows: [
              { label: `Change from ${fmt(x)} to ${fmt(y)}`, value: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`, emphasis: true },
              { label: "Absolute difference", value: fmt(y - x) },
              { label: change >= 0 ? "Direction" : "Direction", value: change >= 0 ? "Increase 📈" : "Decrease 📉" },
            ],
          };
        }
      }
    },
    formula: "X% of Y = Y × X/100 · What% = X/Y × 100 · Change = (New−Old)/|Old| × 100",
    about: [
      "Percentages express ratios against 100. The three everyday questions — finding a share, finding a proportion, and measuring change — trip up even professionals because the base always differs.",
      "Percentage change uses the absolute old value as base so that +50% followed by −50% lands at −25%, not zero. That asymmetry surprises many.",
    ],
    howToUse: [
      "Pick the question you're answering from the dropdown.",
      "Fill X and Y per the labels shown.",
      "Results update as you type — no button needed.",
    ],
    faqs: [
      { q: "Why doesn't +20% then −20% cancel out?", a: "After +20% the base grows to 120. Losing 20% of 120 = −24 → final 96. Percentages chain multiplicatively on shifting bases." },
      { q: "How do I add 18% GST mentally?", a: "Multiply by 1.18 — e.g., ₹500 becomes 500 × 1.18 = ₹590." },
    ],
    relatedSlugs: ["average-calculator", "ratio-calculator", "discount-calculator"],
    seoTitle: "Percentage Calculator — Of, Is-What-%, and Change",
  },

  {
    slug: "average-calculator",
    name: "Average Calculator",
    icon: "🧮",
    category: "mathematics",
    description: "Mean, sum, count, min and max of any list of numbers.",
    keywords: ["average", "mean", "arithmetic mean", "औसत"],
    popularity: 81,
    published: true,
    inputs: [
      {
        kind: "text",
        name: "numbers",
        label: "Numbers (comma or space separated)",
        placeholder: "e.g. 45, 62, 58, 71, 39",
      },
    ],
    calculate(v) {
      const nums = parseNumberList(v.numbers);
      if (!nums) return { error: "Please enter numbers separated by commas — e.g. 10, 20, 30." };
      const sum = nums.reduce((a, b) => a + b, 0);
      const sorted = [...nums].sort((a, b) => a - b);
      const median =
        nums.length % 2 ? sorted[(nums.length - 1) / 2] : (sorted[nums.length / 2 - 1] + sorted[nums.length / 2]) / 2;
      return {
        rows: [
          { label: "Average (mean)", value: fmt(sum / nums.length), emphasis: true },
          { label: "Median", value: fmt(median) },
          { label: "Sum", value: fmt(sum) },
          { label: "Count", value: String(nums.length) },
          { label: "Min – Max", value: `${fmt(sorted[0])} – ${fmt(sorted[sorted.length - 1])}` },
        ],
      };
    },
    formula: "Mean = Σ values ÷ count of values",
    about: [
      "The arithmetic mean is the balance point of a dataset. When outliers distort it — one billionaire walks into a bar and everyone's 'average' wealth explodes — compare with the median, which this tool shows alongside.",
    ],
    faqs: [
      { q: "Mean vs median — when to trust which?", a: "Use median for skewed data: incomes, house prices, response times. Mean suits symmetric data like measurement errors." },
      { q: "Can I paste from Excel?", a: "Yes — tab-separated pastes usually survive; ensure values remain separated by commas/spaces after pasting." },
    ],
    relatedSlugs: ["percentage-calculator", "marks-percentage-calculator", "ratio-calculator"],
    seoTitle: "Average Calculator — Mean, Median, Sum & Range",
  },

  {
    slug: "ratio-calculator",
    name: "Ratio Calculator",
    icon: "⚖️",
    category: "mathematics",
    description: "Simplify ratios and scale recipe/mix quantities.",
    keywords: ["ratio", "simplify ratio", "proportion", "अनुपात"],
    popularity: 66,
    published: true,
    inputs: [
      { kind: "number", name: "a", label: "Quantity A", min: 0.000001, step: "any", placeholder: "e.g. 3", defaultValue: 3 },
      { kind: "number", name: "b", label: "Quantity B", min: 0.000001, step: "any", placeholder: "e.g. 9", defaultValue: 9 },
      { kind: "number", name: "total", label: "Optional: total quantity to divide", min: 0, step: "any", placeholder: "e.g. 60", defaultValue: "" },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "a", label: "Quantity A" },
        { name: "b", label: "Quantity B" },
      ]);
      if ("error" in r) return r;
      const [a, b] = r;
      // Simplify via GCD when integral
      let simplified = "";
      if (Number.isInteger(a) && Number.isInteger(b)) {
        const g = gcd(a, b);
        simplified = `${a / g}:${b / g}`;
      }
      const total = num(v.total);
      const rows = [
        { label: "Ratio", value: simplified || `${(a / Math.min(a, b)).toFixed(2)} : ${(b / Math.min(a, b)).toFixed(2)}`, emphasis: true },
        { label: "A is", value: `${((a / (a + b)) * 100).toFixed(2)}% of the pair` },
        { label: "Decimal form (A/B)", value: (a / b).toFixed(4) },
      ] as { label: string; value: string; emphasis?: boolean }[];
      if (total !== null && total > 0) {
        rows.push({ label: `Split ${fmt(total)} by this ratio`, value: `${fmt((total * a) / (a + b))} : ${fmt((total * b) / (a + b))}`, emphasis: true });
      }
      return { rows };
    },
    formula: "Divide both parts by their GCD to simplify. Shares = total × part/(part₁+part₂).",
    about: [
      "A ratio compares relative sizes; simplification strips common factors so 6:18 reads plainly as 1:3. Ratios power recipes, concrete mixes, screen resolutions and financial leverage alike.",
    ],
    faqs: [
      { q: "Is 3:4 the same as 4:3?", a: "No — order matters. 3:4 means 3 parts of the first for every 4 of the second; reversed it's a different relationship (0.75 vs 1.33)." },
      { q: "Non-integer ratios?", a: "GCD simplification applies to whole numbers only; decimals display scaled to the smaller part instead." },
    ],
    relatedSlugs: ["average-calculator", "percentage-calculator", "split-bill-calculator"],
    seoTitle: "Ratio Simplifier & Scaling Calculator",
  },

  {
    slug: "lcm-calculator",
    name: "LCM Calculator",
    icon: "🔗",
    category: "mathematics",
    description: "Least Common Multiple of two or more whole numbers.",
    keywords: ["lcm", "least common multiple", "लघुत्तम समापवर्त्य"],
    popularity: 64,
    published: true,
    inputs: [{ kind: "text", name: "numbers", label: "Whole numbers (comma separated)", placeholder: "e.g. 12, 18, 24" }],
    calculate(v) {
      const nums = parseNumberList(v.numbers);
      if (!nums || nums.length < 2) return { error: "Enter at least two whole numbers." };
      if (nums.some((n) => n <= 0 || !Number.isInteger(n))) return { error: "LCM needs positive whole numbers only." };
      const lcm2 = (a: number, b: number) => (a * b) / gcd(a, b);
      const result = nums.reduce(lcm2);
      return {
        rows: [{ label: `LCM of ${nums.join(", ")}`, value: result.toLocaleString("en-IN"), emphasis: true }],
      };
    },
    formula: "LCM(a,b) = a×b ÷ GCD(a,b), extended pairwise across all inputs.",
    about: [
      "The LCM is the smallest number divisible by every input. Classic uses: syncing repeating events (buses every 12 and 15 min meet every LCM=60 min), adding fractions, and scheduling cron jobs.",
    ],
    faqs: [
      { q: "Why can't I enter decimals?", a: "LCM is defined over integers. For fractional cycles convert units first (e.g. 1.5 hours → 90 minutes)." },
      { q: "Does order matter?", a: "No — LCM is commutative and associative across the full list." },
    ],
    relatedSlugs: ["hcf-calculator", "ratio-calculator", "square-root-calculator"],
    seoTitle: "LCM Calculator — Least Common Multiple",
  },

  {
    slug: "hcf-calculator",
    name: "HCF Calculator",
    icon: "✂️",
    category: "mathematics",
    description: "Highest Common Factor (GCD) of two or more whole numbers.",
    keywords: ["hcf", "gcd", "greatest common factor", "महत्तम समापवर्तक"],
    popularity: 63,
    published: true,
    inputs: [{ kind: "text", name: "numbers", label: "Whole numbers (comma separated)", placeholder: "e.g. 48, 180, 120" }],
    calculate(v) {
      const nums = parseNumberList(v.numbers);
      if (!nums || nums.length < 2) return { error: "Enter at least two whole numbers." };
      if (nums.some((n) => n <= 0 || !Number.isInteger(n))) return { error: "HCF needs positive whole numbers only." };
      const result = nums.reduce(gcd);
      const lcmOfPair = (nums[0] * nums[1]) / gcd(nums[0], nums[1]);
      return {
        rows: [
          { label: `HCF of ${nums.join(", ")}`, value: result.toLocaleString("en-IN"), emphasis: true },
          ...(nums.length === 2
            ? [{ label: "Related identity check", value: `HCF×LCM = ${(result * lcmOfPair).toLocaleString("en-IN")} = a×b` }]
            : []),
        ],
      };
    },
    formula: "Euclid's algorithm: HCF(a,b) = HCF(b, a mod b) until remainder 0.",
    about: [
      "The HCF/GCD is the largest number dividing all inputs exactly — used to simplify fractions (48/180 → 4/15), cut sheets into largest equal squares, and fairly distribute items into groups.",
    ],
    faqs: [
      { q: "HCF of coprime numbers?", a: "Always 1 — e.g., HCF(17, 28) = 1 despite both being composite-friendly in other pairings." },
      { q: "Relation between HCF and LCM?", a: "For exactly two numbers: HCF × LCM = product of the numbers — handy for verification." },
    ],
    relatedSlugs: ["lcm-calculator", "ratio-calculator", "square-root-calculator"],
    seoTitle: "HCF Calculator — Highest Common Factor (GCD)",
  },

  {
    slug: "square-root-calculator",
    name: "Square Root Calculator",
    icon: "√",
    category: "mathematics",
    description: "Square root plus perfect-square detection and precision digits.",
    keywords: ["square root", "sqrt", "radical", "वर्गमूल"],
    popularity: 70,
    published: true,
    inputs: [{ kind: "number", name: "value", label: "Number (≥ 0)", min: 0, step: "any", placeholder: "e.g. 1764", defaultValue: 1764 }],
    calculate(v) {
      const n = num(v.value);
      if (n === null) return { error: "Please enter a number." };
      if (n < 0) return { error: "Real square roots need a non-negative number. Negative inputs give imaginary results (√−x = i√x)." };
      const root = Math.sqrt(n);
      const isPerfect = Number.isInteger(root);
      return {
        rows: [
          { label: `√${fmt(n)}`, value: root.toLocaleString("en-IN", { maximumFractionDigits: 8 }), emphasis: true },
          { label: "Perfect square?", value: isPerfect ? `Yes — ${root}²` : "No" },
          { label: "Rounded to 2 dp", value: (Math.round(root * 100) / 100).toString() },
        ],
      };
    },
    formula: "√x · Newton's method converges quadratically: xₙ₊₁ = (xₙ + N/xₙ)/2.",
    about: [
      "Square roots invert squaring. Perfect squares (1,4,9,…,169,196…) have integer roots — useful mental-maths anchors between them.",
    ],
    faqs: [
      { q: "Estimate √200 without a calculator?", a: "Between 14 (196) and 15 (225); 196 is close so ≈14.14 — actual 14.142." },
      { q: "Why do negative numbers fail here?", a: "No real number squared gives a negative; those roots live among imaginary numbers (√−9 = 3i)." },
    ],
    relatedSlugs: ["scientific-calculator", "basic-calculator", "lcm-calculator"],
    seoTitle: "Square Root Calculator With Perfect-Square Check",
  },

  {
    slug: "marks-percentage-calculator",
    name: "Marks Percentage Calculator",
    icon: "🎓",
    category: "education",
    description: "Exam score percentage with pass/fail band indicators.",
    keywords: ["marks percentage", "exam", "score", "result", "अंक प्रतिशत"],
    popularity: 84,
    published: true,
    inputs: [
      { kind: "number", name: "obtained", label: "Marks obtained", min: 0, step: "any", placeholder: "e.g. 376", defaultValue: 376 },
      { kind: "number", name: "total", label: "Total marks", min: 1, step: "any", placeholder: "e.g. 500", defaultValue: 500 },
    ],
    calculate(v) {
      const ob = num(v.obtained);
      const tt = num(v.total);
      if (ob === null || tt === null || tt <= 0) return { error: "Please enter valid obtained and total marks (total > 0)." };
      if (ob < 0 || ob > tt) return { error: "Obtained marks cannot be negative or exceed total marks." };
      const p = (ob / tt) * 100;
      const grade =
        p >= 90 ? "A+ 🏆" :
        p >= 80 ? "A" :
        p >= 70 ? "B+" :
        p >= 60 ? "B" :
        p >= 50 ? "C" :
        p >= 40 ? "D (Pass)" : "F (Below pass line)";
      return {
        rows: [
          { label: "Percentage", value: `${p.toFixed(2)}%`, emphasis: true },
          { label: "Indicative grade band", value: grade },
          { label: "Marks needed for next 10% band", value: p < 90 ? `${Math.ceil(((Math.floor(p / 10) + 1) * 10 * tt) / 100 - ob)} more marks` : "Top band reached" },
        ],
        note: "Grade bands are indicative only — institutions publish their own conversion tables.",
      };
    },
    formula: "Percentage = (Obtained ÷ Total) × 100",
    about: [
      "Board results aggregate subject-wise percentages differently (best-of rules, practicals, weightage). This tool computes the straight aggregate percentage — the figure most scholarship and cut-off lists quote.",
    ],
    faqs: [
      { q: "CGPA to percentage?", a: "CBSE convention multiplies CGPA by 9.5 — use the dedicated CGPA calculator for that conversion." },
      { q: "My board weights subjects unequally.", a: "Enter combined obtained and combined maximum across weighted subjects; the ratio handles unequal totals automatically." },
    ],
    relatedSlugs: ["cgpa-to-percentage-calculator", "percentage-calculator", "average-calculator"],
    seoTitle: "Marks Percentage Calculator — Exam Score %",
  },

  {
    slug: "cgpa-to-percentage-calculator",
    name: "CGPA to Percentage Calculator",
    icon: "📜",
    category: "education",
    description: "Convert 10-point CGPA using CBSE (×9.5) or custom institutional factors.",
    keywords: ["cgpa", "sgpa", "percentage converter", "cbse", "gtu factor"],
    popularity: 82,
    published: true,
    inputs: [
      { kind: "number", name: "cgpa", label: "CGPA (out of 10)", min: 0, max: 10, step: 0.01, placeholder: "e.g. 8.6", defaultValue: 8.6 },
      {
        kind: "select",
        name: "factor",
        label: "Conversion factor",
        options: [
          { value: "9.5", label: "× 9.5 (CBSE standard)" },
          { value: "10", label: "× 10 (some universities)" },
          { value: "custom", label: "Custom…" },
        ],
        defaultValue: "9.5",
      },
      { kind: "number", name: "customFactor", label: "Custom multiplier", min: 1, max: 12, step: 0.1, placeholder: "e.g. 9.3", defaultValue: "", suffix: "×" },
    ],
    calculate(v) {
      const cgpa = num(v.cgpa);
      if (cgpa === null || cgpa < 0 || cgpa > 10)
        return { error: "CGPA must be between 0 and 10 on the standard scale." };
      let factor: number | null;
      if (v.factor === "custom") {
        factor = num(v.customFactor);
        if (factor === null || factor <= 0) return { error: "Enter your institution's custom multiplier." };
      } else {
        factor = Number(v.factor);
      }
      const percentage = cgpa * factor;
      return {
        rows: [
          { label: "Equivalent percentage", value: `${percentage.toFixed(2)}%`, emphasis: true },
          { label: "Conversion used", value: `CGPA × ${factor}` },
          { label: "Rounded (2 dp → integer forms)", value: `${percentage.toFixed(0)}%` },
        ],
        note: "Universities like Mumbai (7.1×+11), VTU and Anna follow their own formulas — pick 'Custom' with your official multiplier when notified.",
      };
    },
    formula: "Percentage = CGPA × multiplier (CBSE: 9.5, derived from mean of top scorers' aggregates).",
    about: [
      "There is no single universal CGPA→% formula. CBSE's ×9.5 dominates school-level conversions, while each university publishes its own equivalence for transcripts — using the wrong one can misstate eligibility.",
    ],
    faqs: [
      { q: "Which factor should I use on my resume?", a: "Whichever your issuing institution officially notifies; recruiters may verify against it. When unspecified, CBSE's 9.5 is the widely accepted default for 10th boards." },
      { q: "Is SGPA converted the same way?", a: "SGPA is semester-scoped. Convert SGPA→CGPA credit-weighted across semesters first, then apply the percentage factor." },
    ],
    relatedSlugs: ["marks-percentage-calculator", "percentage-calculator", "average-calculator"],
    seoTitle: "CGPA to Percentage Calculator (CBSE ×9.5 & Custom Factors)",
  },
];
