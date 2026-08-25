import type { CategoryDef } from "@/lib/types";

// Full planned taxonomy. Categories with 0 calculators render a
// "coming soon" state on their page — no dead ends.
export const CATEGORIES: CategoryDef[] = [
  { slug: "finance", name: "Finance", icon: "💰", description: "Interest, investment growth and everyday money math." },
  { slug: "loans", name: "Loans", icon: "🏦", description: "EMI, affordability and loan repayment planning." },
  { slug: "investments", name: "Investments", icon: "📈", description: "SIP, FD, RD, CAGR and long-term wealth tools." },
  { slug: "tax", name: "Tax", icon: "🧾", description: "GST, VAT and income tax estimates with clear rule versions." },
  { slug: "salary", name: "Salary", icon: "💼", description: "Hourly ↔ annual pay, hikes, gratuity and take-home estimates." },
  { slug: "mathematics", name: "Mathematics", icon: "🧮", description: "Basic to scientific calculators plus percentages and ratios." },
  { slug: "health", name: "Health", icon: "❤️", description: "BMI, calories and body metrics. Informational only." },
  { slug: "fitness", name: "Fitness", icon: "🏋️", description: "Training and nutrition numbers." },
  { slug: "education", name: "Education", icon: "🎓", description: "Marks, GPA/CGPA and grade conversions." },
  { slug: "business", name: "Business", icon: "🏢", description: "Pricing, margins, break-even and profitability." },
  { slug: "construction", name: "Construction", icon: "🧱", description: "Concrete, bricks, paint and material estimates." },
  { slug: "real-estate", name: "Real Estate", icon: "🏠", description: "Home loans, rent vs buy and property returns." },
  { slug: "conversion", name: "Conversion", icon: "🔄", description: "Metric ↔ imperial units for length, weight, volume and more." },
  { slug: "currency", name: "Currency", icon: "💱", description: "Live exchange rates and multi-currency calculations in USD, EUR, GBP, INR and more." },
  { slug: "science", name: "Science", icon: "🔬", description: "Physics and chemistry helpers." },
  { slug: "time-date", name: "Time & Date", icon: "⏰", description: "Age, date differences and durations." },
  { slug: "transportation", name: "Transportation", icon: "🚗", description: "Fuel costs, mileage and trip planning." },
  { slug: "utilities", name: "Utilities", icon: "💡", description: "Electricity and household running costs." },
  { slug: "trading", name: "Trading", icon: "📊", description: "Position sizing and P&L tools." },
  { slug: "travel", name: "Travel", icon: "✈️", description: "Trip budgets and currency helpers." },
  { slug: "technology", name: "Technology", icon: "💻", description: "Data storage and computing units." },
  { slug: "everyday", name: "Everyday", icon: "🛒", description: "Tips, bills and daily-life quick maths." },
  { slug: "probability", name: "Probability", icon: "🎲", description: "Chance and odds calculations." },
  { slug: "statistics", name: "Statistics", icon: "📐", description: "Averages, spread and distributions." },
  { slug: "engineering", name: "Engineering", icon: "⚙️", description: "Mechanical and civil quick references." },
];

export function getCategory(slug: string): CategoryDef {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}
