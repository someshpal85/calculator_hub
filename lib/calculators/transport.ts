import type { CalculatorDefinition } from "@/lib/types";
import { inr, fmt } from "@/lib/format";
import { num, requirePositive, requireNonNegative } from "@/lib/validation";

export const TRANSPORT_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "fuel-cost-calculator",
    name: "Fuel Cost Calculator",
    icon: "⛽",
    category: "transportation",
    description: "Trip fuel cost — supports km/litre and US MPG efficiency.",
    keywords: ["fuel cost", "petrol cost", "trip cost", "mileage", "gas", "पेट्रोल"],
    popularity: 87,
    published: true,
    inputs: [
      { kind: "number", name: "distance", label: "Trip distance (km)", min: 0.1, step: 1, placeholder: "e.g. 250", defaultValue: 250 },
      {
        kind: "select",
        name: "unit",
        label: "Efficiency unit",
        options: [
          { value: "kmpl", label: "km per litre (India)" },
          { value: "mpg", label: "Miles per gallon (US)" },
        ],
        defaultValue: "kmpl",
      },
      { kind: "number", name: "efficiency", label: "Vehicle mileage/efficiency", min: 0.5, step: 0.5, placeholder: "e.g. 16", defaultValue: 16 },
      { kind: "number", name: "price", label: "Fuel price (₹ per litre)", min: 0.5, step: 0.5, placeholder: "e.g. 105", defaultValue: 105 },
      { kind: "number", name: "trips", label: "Trips / frequency", min: 1, step: 1, placeholder: "e.g. 22 (office days)", defaultValue: "" },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "distance", label: "Distance" },
        { name: "efficiency", label: "Mileage" },
        { name: "price", label: "Fuel price" },
      ]);
      if ("error" in r) return r;
      const [distance] = r;
      const eff = num(v.efficiency)!;
      const trips = num(v.trips);
      let litres: number;
      if (v.unit === "mpg") {
        // US mpg → L/100km = 235.215/mpg
        litres = (distance / 100) * (235.215 / eff);
      } else {
        litres = distance / eff;
      }
      const cost = litres * r[2];
      const rows = [
        { label: "Fuel needed", value: `${litres.toFixed(2)} litres${v.unit === "mpg" ? ` (${(litres / 3.785411784).toFixed(2)} gal)` : ""}`, emphasis: true },
        { label: "One-way cost", value: inr(cost), emphasis: true },
      ] as { label: string; value: string; emphasis?: boolean }[];
      if (trips !== null && trips > 1) {
        const totalCost = cost * trips;
        rows.push({ label: `Cost for ${fmt(trips)} trips`, value: inr(totalCost), emphasis: true });
        rows.push({ label: "Total fuel", value: `${(litres * trips).toFixed(1)} litres` });
      }
      return { rows };
    },
    formula: "km/L: litres = km ÷ km/L. US MPG: L = (km ÷ 100) × 235.215/mpg.",
    about: [
      "Real-world consumption beats or trails rated figures by ±20% with traffic, AC load and driving style. Track your own tank-to-tank average once — it beats brochure numbers for planning.",
      "The MPG path converts via the standard 235.215 constant so American-spec vehicles work without mental gymnastics.",
    ],
    faqs: [
      { q: "Diesel vs petrol trip economics?", a: "Diesel costs similar per litre but yields 15–30% better efficiency; high-annual-km drivers recover diesel's premium within a few years." },
      { q: "How do tolls factor in?", a: "They don't here — add tolls manually; NHAI FASTag statements give exact monthly figures for commute routes." },
    ],
    relatedSlugs: ["split-bill-calculator", "travel-time-calculator", "electricity-cost-calculator"],
    seoTitle: "Fuel Cost Calculator — Trip Petrol/Diesel Expense",
  },

  {
    slug: "travel-time-calculator",
    name: "Travel Time Calculator",
    icon: "🛣️",
    category: "transportation",
    description: "Journey duration and ETA from distance and average speed.",
    keywords: ["travel time", "eta", "journey duration", "driving time"],
    popularity: 65,
    published: true,
    inputs: [
      { kind: "number", name: "distance", label: "Distance (km)", min: 0.1, step: 1, placeholder: "e.g. 420", defaultValue: 420 },
      { kind: "number", name: "speed", label: "Average speed (km/h)", min: 1, max: 400, step: 1, placeholder: "e.g. 60", defaultValue: 60 },
      { kind: "time", name: "departure", label: "Departure time (for ETA)" },
      { kind: "number", name: "breaksMin", label: "Total breaks (minutes)", min: 0, step: 15, placeholder: "e.g. 45", defaultValue: "" },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "distance", label: "Distance" },
        { name: "speed", label: "Speed" },
      ]);
      if ("error" in r) return r;
      const [distance, speed] = r;
      const hours = distance / speed;
      const breaks = num(v.breaksMin);
      const driveMinutes = Math.round(hours * 60);
      const totalMinutes = driveMinutes + (breaks ?? 0);

      const fmtDur = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
      const rows = [
        { label: "Driving time", value: fmtDur(driveMinutes), emphasis: true },
        ...(breaks ? [{ label: "With breaks", value: fmtDur(totalMinutes) }] : []),
      ] as { label: string; value: string; emphasis?: boolean }[];

      const dep = v.departure;
      if (dep) {
        const [dh, dm] = dep.split(":").map(Number);
        if (Number.isFinite(dh) && Number.isFinite(dm)) {
          const etaTotal = dh * 60 + dm + totalMinutes;
          const days = Math.floor(etaTotal / 1440);
          const etaH = Math.floor((etaTotal % 1440) / 60);
          const etaM = etaTotal % 60;
          const ampm = etaH < 12 ? "AM" : "PM";
          const h12 = etaH % 12 === 0 ? 12 : etaH % 12;
          rows.push({
            label: "ETA",
            value: `${h12}:${String(etaM).padStart(2, "0")} ${ampm}${days > 0 ? ` (+${days} day)` : ""}`,
            emphasis: true,
          });
        }
      }
      rows.push({ label: "Rule of thumb check", value: `At ${fmt(speed)} km/h you cover ~${fmt(speed)} km/hour` });
      return { rows };
    },
    formula: "Time = Distance ÷ Speed; ETA = departure + travel minutes.",
    about: [
      "Average speed already absorbs traffic lights and slow patches — don't enter highway cruise speed for city commutes. Indian highway planning wisdom budgets 50–60 km/h average on NH-grade roads and 35–40 on state highways.",
    ],
    faqs: [
      { q: "Why is my Maps ETA shorter?", a: "Maps uses live traffic per road segment; this calculator assumes one steady average. Use it for budgeting, navigation for real-time." },
      { q: "Safe daily driving distance?", a: "Two-driver cars manage 700–900 km/day comfortably; solo drivers should cap near 600 km before fatigue erodes reaction times." },
    ],
    relatedSlugs: ["fuel-cost-calculator", "date-difference-calculator", "time-difference-calculator"],
    seoTitle: "Travel Time & ETA Calculator",
  },

  {
    slug: "mileage-calculator",
    name: "Mileage Calculator",
    icon: "🛺",
    category: "transportation",
    description: "Your vehicle's real fuel efficiency from fill-up records.",
    keywords: ["mileage", "average", "fuel efficiency", "kmpl", "tank full"],
    popularity: 66,
    published: true,
    inputs: [
      { kind: "number", name: "distance", label: "Distance travelled since last fill (km)", min: 1, step: 1, placeholder: "e.g. 480", defaultValue: 480 },
      { kind: "number", name: "fuel", label: "Fuel filled at last refill (litres)", min: 0.5, step: 0.5, placeholder: "e.g. 32", defaultValue: 32 },
      { kind: "number", name: "price", label: "Fuel price (₹/litre)", min: 0.5, step: 0.5, placeholder: "e.g. 105", defaultValue: "" },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "distance", label: "Distance" },
        { name: "fuel", label: "Fuel filled" },
      ]);
      if ("error" in r) return r;
      const [distance, fuel] = r;
      const kmpl = distance / fuel;
      const rows = [
        { label: "Fuel efficiency", value: `${kmpl.toFixed(2)} km/litre`, emphasis: true },
        { label: "In L/100km (EU style)", value: `${(100 / kmpl).toFixed(2)} L/100km` },
        { label: "In US MPG", value: `${(kmpl * 2.35215).toFixed(1)} mpg` },
      ] as { label: string; value: string; emphasis?: boolean }[];
      const price = num(v.price);
      if (price !== null && price > 0) {
        rows.push({ label: "Running cost", value: `${inr(price / kmpl)} per km`, emphasis: true });
        rows.push({ label: "Range on ₹1,000 of fuel", value: `${fmt((1000 / price) * kmpl)} km` });
      }
      return { rows };
    },
    formula: "km/L = distance ÷ litres refilled (full-tank method).",
    about: [
      "The full-tank method is the only honest measurement: fill completely, reset trip meter, drive normally, refill to full next time and divide kilometres by litres pumped. Tank 'gauge' readings lie by up to ±10%.",
      "Track three consecutive tanks for a stable figure — single-tank readings swing with traffic mix and AC usage.",
    ],
    faqs: [
      { q: "Why does my mileage beat/miss the company figure?", a: "Claimed figures come from controlled dyno cycles. City traffic with idling can halve them; gentle highway cruising can exceed them." },
      { q: "Does AC really reduce mileage?", a: "Yes — typically 8–15% in stop-go traffic since the compressor loads the engine continuously." },
    ],
    relatedSlugs: ["fuel-cost-calculator", "travel-time-calculator", "electricity-cost-calculator"],
    seoTitle: "Mileage Calculator — Real Vehicle Efficiency (km/L)",
  },
];
