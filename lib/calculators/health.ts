import type { CalculatorDefinition } from "@/lib/types";
import { fmt, pct } from "@/lib/format";
import { num, requirePositive, requireNonNegative } from "@/lib/validation";

const HEALTH_DISCLAIMER = "Informational estimate only — not a medical diagnosis. Consult a healthcare professional for personal advice.";

export const HEALTH_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    icon: "⚖️",
    category: "health",
    description: "Body Mass Index with WHO category and healthy weight range.",
    keywords: ["bmi", "body mass index", "obesity", "weight status", "बीएमआई"],
    popularity: 97,
    published: true,
    inputs: [
      { kind: "number", name: "heightCm", label: "Height (cm)", min: 50, max: 260, step: 0.5, placeholder: "e.g. 170", defaultValue: 170 },
      { kind: "number", name: "weightKg", label: "Weight (kg)", min: 5, max: 400, step: 0.1, placeholder: "e.g. 68", defaultValue: 68 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "heightCm", label: "Height" },
        { name: "weightKg", label: "Weight" },
      ]);
      if ("error" in r) return r;
      const [h, w] = r;
      const bmi = w / Math.pow(h / 100, 2);
      const category =
        bmi < 18.5 ? ["Underweight", "Consider calorie-dense nutrition; rule out underlying causes."] :
        bmi < 25 ? ["Normal weight", "Maintain with balanced diet and activity."] :
        bmi < 30 ? ["Overweight", "Modest deficit plus strength training typically helps."] :
        ["Obese", "Professional guidance recommended for sustainable loss."];
      return {
        rows: [
          { label: "Your BMI", value: bmi.toFixed(1), emphasis: true },
          { label: "Category (WHO)", value: category[0], emphasis: true },
          { label: "Healthy weight range for height", value: `${fmt(18.5 * Math.pow(h / 100, 2))} – ${fmt(24.9 * Math.pow(h / 100, 2))} kg` },
        ],
        note: `${category[1]} ${HEALTH_DISCLAIMER}`,
      };
    },
    formula: "BMI = weight(kg) ÷ height(m)²",
    about: [
      "BMI screens weight relative to height at population scale — it's cheap and correlates reasonably with body fat for most people. It cannot see muscle vs fat, so athletes often register 'overweight' while carrying little fat.",
      "Asian populations face elevated metabolic risk at lower BMIs; several Asian guidelines flag risk from 23 onward rather than the universal 25 cut-off.",
    ],
    howToUse: [
      "Measure height without shoes, weight first thing in morning if possible.",
      "Enter both values — category updates instantly.",
      "Cross-check trends over months rather than single readings.",
    ],
    faqs: [
      { q: "Is BMI accurate for muscular people?", a: "No — muscle is denser than fat, inflating BMI. Body-fat percentage or waist-to-height ratio are better there." },
      { q: "What's the Asian-specific threshold?", a: "Many Asian health bodies use ≥23 overweight and ≥27.5 obese, reflecting different fat-distribution patterns." },
    ],
    relatedSlugs: ["bmr-calculator", "tdee-calculator", "ideal-weight-calculator"],
    seoTitle: "BMI Calculator — Category & Healthy Weight Range",
  },

  {
    slug: "bmr-calculator",
    name: "BMR Calculator",
    icon: "🔥",
    category: "health",
    description: "Calories burned at complete rest (Mifflin-St Jeor equation).",
    keywords: ["bmr", "basal metabolic rate", "resting calories", "metabolism"],
    popularity: 86,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "gender",
        label: "Sex",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
        defaultValue: "male",
      },
      { kind: "number", name: "age", label: "Age (years)", min: 10, max: 100, step: 1, placeholder: "e.g. 28", defaultValue: 28 },
      { kind: "number", name: "heightCm", label: "Height (cm)", min: 100, max: 250, step: 0.5, placeholder: "e.g. 175", defaultValue: 175 },
      { kind: "number", name: "weightKg", label: "Weight (kg)", min: 20, max: 350, step: 0.1, placeholder: "e.g. 72", defaultValue: 72 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "age", label: "Age" },
        { name: "heightCm", label: "Height" },
        { name: "weightKg", label: "Weight" },
      ]);
      if ("error" in r) return r;
      const [age, h, w] = r;
      const male = v.gender === "male";
      const bmr = 10 * w + 6.25 * h - 5 * age + (male ? 5 : -161);
      return {
        rows: [
          { label: "BMR (Mifflin-St Jeor)", value: `${Math.round(bmr)} kcal/day`, emphasis: true },
          { label: "Sedentary floor (BMR × 1.2)", value: `${Math.round(bmr * 1.2)} kcal/day` },
          { label: "Formula note", value: male ? "+5 constant applied" : "−161 constant applied" },
        ],
        note: HEALTH_DISCLAIMER,
      };
    },
    formula: "Mifflin-St Jeor: BMR = 10W + 6.25H − 5A + (males: +5 | females: −161)",
    about: [
      "BMR powers breathing, circulation and cell repair while you sleep flat on your back. It's the floor of your energy budget — everything you do stacks on top via activity multipliers.",
      "Mifflin-St Jeor outperformed Harris-Benedict against measured calorimetry in validation trials and remains the dietetic standard today.",
    ],
    faqs: [
      { q: "Why does BMR fall with age?", a: "Lean mass declines roughly 3–8% per decade after 30 unless resisted. Preserving muscle keeps BMR higher." },
      { q: "Should I eat below my BMR?", a: "Not deliberately for extended periods — aggressive deficits below resting needs risk nutrient shortfalls, hormonal disruption and lean-mass loss." },
    ],
    relatedSlugs: ["tdee-calculator", "bmi-calculator", "water-intake-calculator"],
    seoTitle: "BMR Calculator — Resting Calorie Burn (Mifflin-St Jeor)",
  },

  {
    slug: "tdee-calculator",
    name: "TDEE / Calorie Calculator",
    icon: "🍽️",
    category: "health",
    description: "Daily calorie targets to maintain, lose or gain weight.",
    keywords: ["tdee", "calorie needs", "maintenance calories", "deficit", "surplus", "कैलोरी"],
    popularity: 88,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "gender",
        label: "Sex",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
        defaultValue: "male",
      },
      { kind: "number", name: "age", label: "Age (years)", min: 10, max: 100, step: 1, placeholder: "e.g. 28", defaultValue: 28 },
      { kind: "number", name: "heightCm", label: "Height (cm)", min: 100, max: 250, step: 0.5, placeholder: "e.g. 175", defaultValue: 175 },
      { kind: "number", name: "weightKg", label: "Weight (kg)", min: 20, max: 350, step: 0.1, placeholder: "e.g. 72", defaultValue: 72 },
      {
        kind: "select",
        name: "activity",
        label: "Activity level",
        options: [
          { value: "1.2", label: "Sedentary — desk job, no exercise" },
          { value: "1.375", label: "Lightly active — 1–3 workouts/week" },
          { value: "1.55", label: "Moderately active — 3–5 workouts/week" },
          { value: "1.725", label: "Very active — 6–7 workouts/week" },
          { value: "1.9", label: "Athlete — physical job + daily training" },
        ],
        defaultValue: "1.375",
      },
    ],
    calculate(v) {
      const act = num(v.activity);
      if (act === null) return { error: "Select an activity level." };
      const r = requirePositive(v, [
        { name: "age", label: "Age" },
        { name: "heightCm", label: "Height" },
        { name: "weightKg", label: "Weight" },
      ]);
      if ("error" in r) return r;
      const [age, h, w] = r;
      const bmr = 10 * w + 6.25 * h - 5 * age + (v.gender === "male" ? 5 : -161);
      const tdee = bmr * act;
      return {
        rows: [
          { label: "Maintenance (TDEE)", value: `${Math.round(tdee)} kcal/day`, emphasis: true },
          { label: "Mild loss (−0.25 kg/wk)", value: `${Math.round(tdee - 275)} kcal/day` },
          { label: "Standard loss (−0.5 kg/wk)", value: `${Math.round(tdee - 550)} kcal/day` },
          { label: "Lean gain (+0.25 kg/wk)", value: `${Math.round(tdee + 275)} kcal/day` },
          { label: "Underlying BMR", value: `${Math.round(bmr)} kcal/day` },
        ],
        note: `≈7,700 kcal ≈ 1 kg of body mass. Never sustainably drop below ~1,200 (F) / 1,500 (M) kcal. ${HEALTH_DISCLAIMER}`,
      };
    },
    formula: "TDEE = BMR × activity factor (1.2 → 1.9); weekly change ≈ daily deficit × 7 ÷ 7700 kg.",
    about: [
      "Total Daily Energy Expenditure is what you burn across a normal day including workouts. Eat near TDEE to hold weight; a persistent 550-kcal gap trims roughly half a kilo weekly.",
      "Activity multipliers are blunt. When in doubt pick lower and let real-world weigh-ins recalibrate: adjust ±200 kcal per stalled fortnight.",
    ],
    howToUse: [
      "Enter stats honestly — aspirational heights help nobody.",
      "Choose the activity level matching an average week, not your best week.",
      "Track weight for 2 weeks against the target to validate the estimate.",
    ],
    faqs: [
      { q: "Why am I not losing despite eating 'at deficit'?", a: "Common causes: under-reported intake (oils, sauces), over-estimated activity, water retention masking fat loss. Weigh food for one honest week." },
      { q: "Do macros matter as much as calories?", a: "For weight change, calories dominate. For body composition and satiety, protein (1.6–2.2 g/kg) and fibre matter greatly." },
    ],
    relatedSlugs: ["bmr-calculator", "bmi-calculator", "ideal-weight-calculator"],
    seoTitle: "TDEE & Calorie Calculator — Maintenance, Cut, Bulk Targets",
  },

  {
    slug: "ideal-weight-calculator",
    name: "Ideal Weight Calculator",
    icon: "🎯",
    category: "health",
    description: "Devine formula ideal weight plus healthy BMI-range weights.",
    keywords: ["ideal weight", "devine", "healthy weight", "ibw"],
    popularity: 71,
    published: true,
    inputs: [
      {
        kind: "select",
        name: "gender",
        label: "Sex",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
        ],
        defaultValue: "male",
      },
      { kind: "number", name: "heightCm", label: "Height (cm)", min: 120, max: 230, step: 0.5, placeholder: "e.g. 172", defaultValue: 172 },
    ],
    calculate(v) {
      const h = num(v.heightCm);
      if (h === null || h < 120 || h > 230)
        return { error: "Enter a height between 120 and 230 cm." };
      const inchesOver5ft = Math.max(0, h / 2.54 - 60);
      const devine =
        v.gender === "male"
          ? 50 + 2.3 * inchesOver5ft
          : 45.5 + 2.3 * inchesOver5ft;
      const bmiLow = 18.5 * Math.pow(h / 100, 2);
      const bmiHigh = 24.9 * Math.pow(h / 100, 2);
      return {
        rows: [
          { label: "Ideal weight (Devine)", value: `${fmt(devine)} kg`, emphasis: true },
          { label: "Healthy BMI range (18.5–24.9)", value: `${fmt(bmiLow)} – ${fmt(bmiHigh)} kg` },
          { label: "Range midpoint", value: `${fmt((bmiLow + bmiHigh) / 2)} kg` },
        ],
        note: "Formulas assume average builds and ignore frame size/muscle mass. A range beats a point estimate every time. " + HEALTH_DISCLAIMER,
      };
    },
    formula: "Devine: M = 50 + 2.3×(inches over 5 ft); F = 45.5 + 2.3×(inches over 5 ft).",
    about: [
      "Devine's 1974 formula was designed to dose medications, not to set beauty targets — yet it became the classic 'ideal body weight'. Treat its output as one anchor inside the broader healthy-BMI band shown beside it.",
    ],
    faqs: [
      { q: "Which number should I target?", a: "Aim anywhere inside the healthy BMI range where you feel strong and blood markers look good — not the single Devine figure." },
      { q: "Do formulas differ?", a: "Robinson/Hammond/Miller variants tweak coefficients slightly; all land within a few kilograms of each other for common heights." },
    ],
    relatedSlugs: ["bmi-calculator", "tdee-calculator", "bmr-calculator"],
    seoTitle: "Ideal Weight Calculator — Devine Formula & BMI Range",
  },

  {
    slug: "water-intake-calculator",
    name: "Water Intake Calculator",
    icon: "💧",
    category: "health",
    description: "Daily hydration target scaled by weight and activity.",
    keywords: ["water intake", "hydration", "drink water", "पानी"],
    popularity: 69,
    published: true,
    inputs: [
      { kind: "number", name: "weightKg", label: "Weight (kg)", min: 10, max: 350, step: 0.5, placeholder: "e.g. 70", defaultValue: 70 },
      { kind: "number", name: "exerciseMin", label: "Daily exercise (minutes)", min: 0, max: 300, step: 15, placeholder: "e.g. 45", defaultValue: 45 },
      {
        kind: "select",
        name: "climate",
        label: "Climate",
        options: [
          { value: "temperate", label: "Temperate" },
          { value: "hot", label: "Hot / humid" },
          { value: "cold", label: "Cold" },
        ],
        defaultValue: "hot",
      },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "weightKg", label: "Weight" }]);
      if ("error" in r) return r;
      const [w] = r;
      const exMin = num(v.exerciseMin);
      if (exMin === null || exMin < 0) return { error: "Exercise minutes cannot be negative." };
      let litres = w * 0.033; // 33 ml/kg baseline
      litres += (exMin / 30) * 0.35; // sweat replacement
      if (v.climate === "hot") litres *= 1.12;
      if (v.climate === "cold") litres *= 0.95;
      const glasses = Math.ceil(litres / 0.25);
      return {
        rows: [
          { label: "Daily target", value: `${litres.toFixed(1)} litres`, emphasis: true },
          { label: "In 250 ml glasses", value: `≈ ${glasses} glasses` },
          { label: "Baseline (before extras)", value: `${(w * 0.033).toFixed(1)} L` },
        ],
        note: "Includes food moisture (~20% of total intake comes from food). Pale-straw urine colour is the practical check. " + HEALTH_DISCLAIMER,
      };
    },
    formula: "Baseline ≈ 33 ml/kg; +350 ml per 30 min exercise; ± climate adjustment.",
    about: [
      "Hydration needs vary with sweat rate, diet and environment far more than any formula captures. These estimates anchor a starting point; thirst plus urine colour remain the best real-time gauges.",
    ],
    faqs: [
      { q: "Does tea/coffee count?", a: "Yes — the diuretic effect of moderate caffeine is smaller than the fluid it delivers. Soups, milk and fruit contribute too." },
      { q: "Can I drink too much?", a: "Rare but real: hyponatraemia from litres beyond sweat losses without electrolytes, mostly in long endurance events." },
    ],
    relatedSlugs: ["tdee-calculator", "bmi-calculator", "bmr-calculator"],
    seoTitle: "Water Intake Calculator — Daily Hydration Target",
  },
];
