import type { CalculatorDefinition, InputDef } from "@/lib/types";
import { fmt } from "@/lib/format";
import { num, requirePositive } from "@/lib/validation";

interface UnitSet {
  units: Record<string, number>; // factor to base unit
  label: string; // e.g. "Length"
  icon: string;
  keywords: string[];
  about: string;
}

function makeConverter(
  slugBase: string,
  set: UnitSet,
  extraInputs: InputDef[] = [],
): CalculatorDefinition {
  const unitNames = Object.keys(set.units);
  return {
    slug: `${slugBase}-converter`,
    name: `${set.label} Converter`,
    icon: set.icon,
    category: "conversion",
    description: `Convert ${set.label.toLowerCase()} between metric and imperial units instantly.`,
    keywords: [...set.keywords, "converter", "unit conversion", ...unitNames.map((u) => u.toLowerCase())],
    popularity: 80,
    published: true,
    inputs: [
      { kind: "number", name: "value", label: `Value`, min: 0, step: "any", placeholder: "e.g. 10", defaultValue: 1 },
      { kind: "select", name: "from", label: "From", options: unitNames.map((u) => ({ value: u, label: u })), defaultValue: unitNames[0] },
      { kind: "select", name: "to", label: "To", options: unitNames.map((u) => ({ value: u, label: u })), defaultValue: unitNames[1] },
      ...extraInputs,
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "value", label: "Value" }]);
      if ("error" in r) return r;
      const [value] = r;
      const from = set.units[v.from];
      const to = set.units[v.to];
      if (from === undefined || to === undefined) return { error: "Pick both source and target units." };
      const result = (value * from) / to;
      return {
        rows: [
          { label: `${fmt(value)} ${v.from} =`, value: `${fmt(result)} ${v.to}`, emphasis: true },
          { label: `Reverse check`, value: `1 ${v.to} = ${fmt(to / from)} ${v.from}` },
        ],
      };
    },
    formula: `result = value × (from-unit factor ÷ to-unit factor), where factors are relative to the SI base unit.`,
    about: [set.about],
    faqs: [
      { q: "How exact are these conversions?", a: "Factors use internationally agreed definitions — an inch is exactly 2.54 cm since 1959, a pound exactly 0.45359237 kg since 1959." },
      { q: "Why can't I enter zero or negatives?", a: "Physical quantities here are magnitudes; negative lengths/weights are meaningless in this context." },
    ],
    relatedSlugs: [],
  };
}

export const CONVERSION_CALCULATORS: CalculatorDefinition[] = [
  makeConverter("length", {
    label: "Length",
    icon: "📏",
    keywords: ["length", "distance", "cm inch feet metre mile km"],
    units: {
      "Millimeter (mm)": 0.001,
      "Centimeter (cm)": 0.01,
      "Meter (m)": 1,
      "Kilometer (km)": 1000,
      "Inch (in)": 0.0254,
      "Foot (ft)": 0.3048,
      "Yard (yd)": 0.9144,
      "Mile (mi)": 1609.344,
      "Nautical mile": 1852,
    },
    about:
      "Length conversion bridges India's metric system with imperial holdouts in US construction (feet), aviation (nautical miles) and screen sizes (inches). Since 1959 all imperial units are defined exactly against the metre, so conversions are precise rather than approximate.",
  }),
  makeConverter("weight", {
    label: "Weight",
    icon: "⚖️",
    keywords: ["weight", "mass", "kg pound gram ounce stone"],
    units: {
      "Milligram (mg)": 0.000001,
      "Gram (g)": 0.001,
      "Kilogram (kg)": 1,
      "Tonne (t)": 1000,
      "Ounce (oz)": 0.028349523125,
      "Pound (lb)": 0.45359237,
      "Stone (st)": 6.35029318,
    },
    about:
      "India measures groceries in kg but body weight discussions with American friends drift into pounds (and UK stones!). One kilogram equals exactly 2.20462 pounds — the definition has been atomic-constant since the 2019 SI redefinition.",
  }),
  makeConverter("area", {
    label: "Area",
    icon: "🗺️",
    keywords: ["area", "square feet acre hectare bigha guntha"],
    units: {
      "Sq centimeter (cm²)": 0.0001,
      "Sq meter (m²)": 1,
      "Hectare (ha)": 10000,
      "Sq kilometer (km²)": 1000000,
      "Sq foot (ft²)": 0.09290304,
      "Sq yard (yd²)": 0.83612736,
      "Acre": 4046.8564224,
      "Sq mile (mi²)": 2589988.110336,
    },
    about:
      "Indian real estate speaks square feet while land records mix hectares, acres and regional units like bigha (which itself varies by state!). This converter handles the standard international units; verify local bigha definitions separately.",
  }),
  makeConverter("volume", {
    label: "Volume",
    icon: "🥤",
    keywords: ["volume", "litre gallon ml cup pint"],
    units: {
      "Milliliter (ml)": 0.001,
      "Liter (L)": 1,
      "Cubic meter (m³)": 1000,
      "Teaspoon (US)": 0.00492892159375,
      "Tablespoon (US)": 0.01478676478125,
      "Fluid ounce (US)": 0.0295735295625,
      "Cup (US)": 0.2365882365,
      "Pint (US)": 0.473176473,
      "Quart (US)": 0.946352946,
      "Gallon (US)": 3.785411784,
    },
    about:
      "Recipe chaos ends here: US cups/pints/quarts/gallons convert precisely to millilitres and litres. Note these are US customary volumes — the imperial (UK) gallon is ~20% larger at 4.546 L.",
  }),
  makeConverter("speed", {
    label: "Speed",
    icon: "🏎️",
    keywords: ["speed", "velocity", "kmh mph knot"],
    units: {
      "Meters/second (m/s)": 3.6,
      "Kilometers/hour (km/h)": 1,
      "Miles/hour (mph)": 1.609344,
      "Knots (kn)": 1.852,
      "Feet/second (ft/s)": 1.09728,
    },
    about:
      "Speedometers worldwide read km/h except US/UK (mph), while aviation and marine navigation stick to knots regardless of country. m/s is the SI scientific standard used in physics.",
  }),
  {
    slug: "temperature-converter",
    name: "Temperature Converter",
    icon: "🌡️",
    category: "conversion",
    description: "Celsius ↔ Fahrenheit ↔ Kelvin with formula transparency.",
    keywords: ["temperature", "celsius", "fahrenheit", "kelvin", "c to f"],
    popularity: 84,
    published: true,
    inputs: [
      { kind: "number", name: "value", label: "Temperature", min: -1000, max: 10000, step: "any", placeholder: "e.g. 37", defaultValue: 37 },
      { kind: "select", name: "from", label: "From", options: ["Celsius (°C)", "Fahrenheit (°F)", "Kelvin (K)"].map((u) => ({ value: u, label: u })) },
    ],
    calculate(v) {
      const t = num(v.value);
      if (t === null) return { error: "Please enter a temperature." };
      const from = v.from ?? "Celsius (°C)";
      let c = t;
      if (from.includes("Fahrenheit")) c = ((t - 32) * 5) / 9;
      if (from.includes("Kelvin")) {
        if (t < 0) return { error: "Kelvin cannot be negative — absolute zero is 0 K." };
        c = t - 273.15;
      }
      const f = (c * 9) / 5 + 32;
      const k = c + 273.15;
      if (k < 0) return { error: "That's below absolute zero (−273.15 °C) — physically impossible." };
      const desc =
        c <= 0 ? "Freezing ❄️" : c < 15 ? "Cold 🧥" : c < 25 ? "Pleasant 😊" : c < 35 ? "Warm 🌞" : "Hot 🥵";
      return {
        rows: [
          { label: "All scales", value: `${c.toFixed(1)} °C · ${f.toFixed(1)} °F · ${k.toFixed(1)} K`, emphasis: true },
          { label: "Feel", value: desc },
          { label: "Quick mental shortcut", value: `°F ≈ °C × 2 + 30 (rough)` },
        ],
      };
    },
    formula: "°F = °C × 9/5 + 32 · K = °C + 273.15",
    about: [
      "The classic conversion trips everyone up because Fahrenheit offsets AND scales differently: 0°C isn't 0°F. The ×2+30 mental trick lands within a couple degrees for everyday weather temperatures.",
      "Body temperature reference: 37°C = 98.6°F. Oven settings: 180°C ≈ 350°F — the most-Googled cooking conversion on earth.",
    ],
    faqs: [
      { q: "Which countries still use Fahrenheit?", a: "Principally the United States; weather broadcasts there remain F while science uses C/K universally." },
      { q: "What is absolute zero?", a: "−273.15°C = 0 K, where molecular motion reaches its quantum minimum. Nothing can be colder." },
    ],
    relatedSlugs: [],
  },
];

// Fill cross-links among converters
for (const c of CONVERSION_CALCULATORS) {
  c.relatedSlugs = CONVERSION_CALCULATORS.filter((o) => o.slug !== c.slug).map((o) => o.slug);
}
