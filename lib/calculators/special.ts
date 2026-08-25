import type { CalculatorDefinition } from "@/lib/types";

// Calculators rendered by dedicated client widgets rather than the generic form.
// `calculate` is never invoked for these; the widget owns its own logic/UI.

export const SPECIAL_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "basic-calculator",
    name: "Basic Calculator",
    icon: "🔢",
    category: "mathematics",
    description: "Everyday arithmetic with keyboard and keypad input plus live results.",
    keywords: ["basic calculator", "arithmetic", "add", "multiply", "percentage", "कैलकुलेटर"],
    popularity: 94,
    published: true,
    inputs: [],
    custom: "expression",
    calculate: () => ({ rows: [] }),
    about: [
      "A fast four-function calculator with percentage support that accepts typed expressions like 25*4+10 as well as button taps. Results preview live as you type — press Enter to lock a value in.",
      "The engine is a proper tokenizer-and-shunting-yard parser, not JavaScript eval(), so malformed expressions fail safely with helpful messages.",
    ],
    faqs: [
      { q: "Does the numpad on my keyboard work?", a: "Yes — digits, operators and Enter all register, whether from the top row or the numeric keypad." },
      { q: "How does % behave?", a: "It acts as modulo/remainder in expressions (17 % 5 = 2), matching scientific convention." },
    ],
    relatedSlugs: ["scientific-calculator", "percentage-calculator", "square-root-calculator"],
    seoTitle: "Basic Calculator — Fast Arithmetic With Live Preview",
  },

  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    icon: "🔬",
    category: "mathematics",
    description: "Trigonometry, logarithms, powers, roots and constants with expression parsing.",
    keywords: ["scientific calculator", "sin cos tan", "logarithm", "square root", "power"],
    popularity: 87,
    published: true,
    inputs: [],
    custom: "expression",
    calculate: () => ({ rows: [] }),
    about: [
      "Full scientific functions — sin/cos/tan (radian measure), their precision via nested parentheses, natural and base-10 logarithms, exponentiation (^), square roots, absolute value and e^x — with π and Euler's e built in.",
      "Type naturally (sqrt(16)+2^3, sin(pi/2)) or use the function keypad. Operator precedence follows standard mathematics: ^ binds tighter than × ÷, which bind tighter than + −.",
    ],
    faqs: [
      { q: "Why radians for trigonometry?", a: "Radians are the mathematical standard and what every serious tool defaults to. For degrees, convert first: multiply by π/180." },
      { q: "Precision limits?", a: "Results carry IEEE-754 double precision (~15–16 significant digits); display rounds to 12 significant figures to hide floating-point noise." },
    ],
    relatedSlugs: ["basic-calculator", "square-root-calculator", "percentage-calculator"],
    seoTitle: "Scientific Calculator — Trig, Logs & Powers Online",
  },

  {
    slug: "currency-converter",
    name: "Currency Converter",
    icon: "💱",
    category: "currency",
    description: "Live exchange rates for 25+ world currencies from ECB data.",
    keywords: ["currency converter", "exchange rate", "usd to inr", "eur gbp", "forex", "मुद्रा", "dollar", "rupaye"],
    popularity: 92,
    published: true,
    inputs: [],
    custom: "currency",
    calculate: () => ({ rows: [] }),
    about: [
      "Converts between major world currencies using European Central Bank reference rates published via frankfurter.dev. The exact rate and its date are always shown alongside your result so you know how fresh it is.",
      "Mid-market rates exclude the spreads, commissions and transfer fees banks add — expect retail conversions to be ~1–3% worse than the figure shown.",
    ],
    howToUse: [
      "Enter the amount and pick source/target currencies.",
      "Press Convert — the live rate fetches directly from your browser.",
      "Check the rate timestamp; ECB rates update once per business day.",
    ],
    faqs: [
      { q: "Why isn't my currency listed?", a: "The ECB reference set covers ~30 freely-traded currencies. Exotic pairs would require additional data sources with different licensing." },
      { q: "Can I use this offline?", a: "No — this is the one CalcSphere tool needing internet, since rates change daily. Everything else works fully offline." },
    ],
    relatedSlugs: ["length-converter", "weight-converter", "salary-calculator"],
    seoTitle: "Currency Converter — Live ECB Exchange Rates",
  },
];
