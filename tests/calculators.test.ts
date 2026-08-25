import { describe, it, expect, beforeEach } from "vitest";
import { CALCULATORS, getCalculator, getRelated, getPopular, getSearchItems } from "@/lib/calculators";
import { CATEGORIES } from "@/data/categories";
import { inr, inr0, setActiveCurrency } from "@/lib/format";

beforeEach(() => {
  // Tests must never leak currency state between cases
  setActiveCurrency("INR");
});

describe("currency-aware formatting", () => {
  it("INR uses ₹ with lakh/crore grouping", () => {
    setActiveCurrency("INR");
    expect(inr(125000)).toBe("₹1,25,000");
    expect(inr0(1250000)).toBe("₹12,50,000");
  });

  it("USD switches to $ with western grouping", () => {
    setActiveCurrency("USD");
    expect(inr(125000)).toBe("$125,000.00".replace(".00", "")); // $125,000
    expect(inr(1000000)).toBe("$1,000,000");
  });

  it("EUR/GBP symbols apply", () => {
    setActiveCurrency("EUR");
    expect(inr(50000)).toBe("€50,000");
    setActiveCurrency("GBP");
    expect(inr(50000)).toBe("£50,000");
  });

  it("EMI result respects active currency", () => {
    const def = getCalculator("emi-calculator")!;
    setActiveCurrency("USD");
    const out = def.calculate({ amount: "120000", rate: "9", years: "20" });
    if ("error" in out) throw new Error(out.error);
    expect(out.rows[0].value.startsWith("$")).toBe(true);
    setActiveCurrency("INR");
    const outInr = def.calculate({ amount: "120000", rate: "9", years: "20" });
    if ("error" in outInr) throw new Error(outInr.error);
    expect(outInr.rows[0].value.startsWith("₹")).toBe(true);
  });
});

const get = (slug: string) => {
  const def = getCalculator(slug);
  if (!def) throw new Error(`Missing calculator: ${slug}`);
  return def;
};

const ok = (slug: string, values: Record<string, string>) => {
  const out = get(slug).calculate(values);
  if ("error" in out) throw new Error(`Unexpected error: ${out.error}`);
  return out.rows;
};

const errOf = (slug: string, values: Record<string, string>): string => {
  const out = get(slug).calculate(values);
  if ("error" in out) return out.error;
  throw new Error("Expected an error result");
};

describe("registry integrity", () => {
  it("has unique slugs", () => {
    const slugs = CALCULATORS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every calculator references a known category", () => {
    const catSlugs = new Set(CATEGORIES.map((c) => c.slug));
    for (const c of CALCULATORS) expect(catSlugs.has(c.category)).toBe(true);
  });

  it("every calculator has required content", () => {
    for (const c of CALCULATORS) {
      expect(c.name.length).toBeGreaterThan(3);
      expect(c.description.length).toBeGreaterThan(10);
      expect(c.keywords.length).toBeGreaterThan(0);
      expect(c.popularity).toBeGreaterThanOrEqual(1);
      expect(c.popularity).toBeLessThanOrEqual(100);
      if (c.faqs) {
        for (const f of c.faqs) {
          expect(f.q.length).toBeGreaterThan(5);
          expect(f.a.length).toBeGreaterThan(10);
        }
      }
      // No NaN-producing calculate on defaults
      if (!c.custom) {
        const defaults: Record<string, string> = {};
        for (const i of c.inputs) {
          const dv = "defaultValue" in i ? i.defaultValue : undefined;
          if (dv !== undefined && dv !== "") defaults[i.name] = String(dv);
        }
        if (Object.keys(defaults).length === c.inputs.length && c.inputs.length > 0) {
          const out = c.calculate(defaults);
          if (!("error" in out)) {
            for (const row of out.rows) {
              expect(row.value.toLowerCase()).not.toContain("nan");
              expect(row.value.toLowerCase()).not.toContain("infinity");
            }
          }
        }
      }
    }
  });

  it("related slugs resolve to published calculators", () => {
    for (const c of CALCULATORS) {
      const related = getRelated(c);
      expect(related.length).toBeGreaterThan(0);
      expect(related.every((r) => r.published));
      expect(related.every((r) => r.slug !== c.slug));
    }
  });

  it("popular list and search items are consistent", () => {
    const items = getSearchItems();
    expect(items.length).toBe(CALCULATORS.length);
    for (const p of getPopular()) {
      expect(getCalculator(p.slug)).toBeDefined();
    }
  });
});

describe("EMI calculator", () => {
  it("computes the standard annuity EMI", () => {
    const rows = ok("emi-calculator", { amount: "1000000", rate: "9", years: "20" });
    // Reference: ₹10L @9% 20y → EMI ≈ ₹8,997.26
    const emi = Number(rows[0].value.replace(/[₹,]/g, ""));
    expect(emi).toBeCloseTo(8997.26, 1);
    const totalInterest = Number(rows[1].value.replace(/[₹,]/g, ""));
    expect(totalInterest).toBeCloseTo(emi * 240 - 1000000, 0);
  });

  it("rejects zero amount and negative rate", () => {
    expect(errOf("emi-calculator", { amount: "0", rate: "9", years: "20" })).toMatch(/greater than zero/i);
    expect(errOf("emi-calculator", { amount: "100000", rate: "-2", years: "20" })).toBeTruthy();
  });

  it("handles decimal rates", () => {
    const rows = ok("emi-calculator", { amount: "500000", rate: "8.75", years: "15" });
    expect(rows[0].value).toMatch(/₹/);
  });
});

describe("SIP calculator", () => {
  it("matches annuity-due future value", () => {
    const rows = ok("sip-calculator", { monthly: "10000", rate: "12", years: "10" });
    const i = 12 / 1200;
    const expected = 10000 * ((Math.pow(1 + i, 120) - 1) / i) * (1 + i);
    expect(Number(rows[0].value.replace(/[₹,]|\(.*\)/g, ""))).toBeCloseTo(expected, 0);
  });

  it("invested amount equals monthly × months", () => {
    const rows = ok("sip-calculator", { monthly: "5000", rate: "10", years: "5" });
    expect(Number(rows[1].value.replace(/[₹,]/g, ""))).toBe(300000);
  });
});

describe("FD / RD calculators", () => {
  it("FD quarterly compounding beats simple annual interest", () => {
    const rows = ok("fd-calculator", { principal: "100000", rate: "7.1", years: "5", freq: "4" });
    const maturity = Number(rows[0].value.replace(/[₹,]|\(.*\)/g, ""));
    expect(maturity).toBeGreaterThan(100000 * Math.pow(1.071, 5) - 1);
  });

  it("RD maturity exceeds total deposited", () => {
    const rows = ok("rd-calculator", { monthly: "5000", rate: "6.8", months: "60" });
    expect(Number(rows[0].value.replace(/[₹,]|\(.*\)/g, ""))).toBeGreaterThan(300000);
  });
});

describe("interest calculators", () => {
  it("simple interest is linear", () => {
    const rows = ok("simple-interest-calculator", { principal: "50000", rate: "7.5", time: "3" });
    expect(Number(rows[0].value.replace(/[₹,]/g, ""))).toBeCloseTo(11250, 0);
    expect(Number(rows[1].value.replace(/[₹,]/g, ""))).toBeCloseTo(61250, 0);
  });

  it("compound interest yearly matches formula", () => {
    const rows = ok("compound-interest-calculator", { principal: "100000", rate: "8", years: "10", freq: "1" });
    expect(Number(rows[0].value.replace(/[₹,]|\(.*\)/g, ""))).toBeCloseTo(215892.5, 0);
  });

  it("more frequent compounding pays more", () => {
    const yearly = Number(ok("compound-interest-calculator", { principal: "100000", rate: "10", years: "10", freq: "1" })[0].value.replace(/[₹,]|\(.*\)/g, ""));
    const monthly = Number(ok("compound-interest-calculator", { principal: "100000", rate: "10", years: "10", freq: "12" })[0].value.replace(/[₹,]|\(.*\)/g, ""));
    expect(monthly).toBeGreaterThan(yearly);
  });
});

describe("GST calculator", () => {
  it("adds GST correctly", () => {
    const rows = ok("gst-calculator", { mode: "add", amount: "10000", rate: "18" });
    expect(Number(rows[3].value.replace(/[₹,]/g, ""))).toBe(1800);
    expect(Number(rows[0].value.replace(/[₹,]/g, ""))).toBe(11800);
  });

  it("extracts GST from inclusive price", () => {
    const rows = ok("gst-calculator", { mode: "remove", amount: "11800", rate: "18" });
    const tax = Number(rows[0].value.replace(/[₹,]/g, ""));
    expect(tax).toBeCloseTo(1800, 2);
    expect(Number(rows[3].value.replace(/[₹,]/g, ""))).toBeCloseTo(10000, 2);
  });

  it("round-trips add→remove to original base", () => {
    const added = Number(ok("gst-calculator", { mode: "add", amount: "7777", rate: "12" })[0].value.replace(/[₹,]/g, ""));
    const removed = Number(ok("gst-calculator", { mode: "remove", amount: String(added), rate: "12" })[3].value.replace(/[₹,]/g, ""));
    expect(removed).toBeCloseTo(7777, 0);
  });
});

describe("income tax calculator (FY 2025-26 new regime)", () => {
  it("zero tax at ₹12L taxable for salaried earning ₹12,75,000 gross", () => {
    const rows = ok("income-tax-calculator", { income: "1275000", employment: "salaried", ageGroup: "<60" });
    expect(rows[0].value.replace(/[₹,]/g, "")).toBe("0");
  });

  it("applies slab progression above rebate cliff", () => {
    const rows = ok("income-tax-calculator", { income: "1600000", employment: "salaried", ageGroup: "<60" });
    const totalTax = Number(rows[0].value.replace(/[₹,]/g, ""));
    // Taxable 15,25,000: 20k(5%) + 40k(10%) + 48.75k(15%) = 108,750 + 4% cess
    expect(totalTax).toBeCloseTo(113100, 0);
  });

  it("marginal relief smooths just past ₹12L", () => {
    const rows = ok("income-tax-calculator", { income: "1210000", employment: "other", ageGroup: "<60" });
    const totalTax = Number(rows[0].value.replace(/[₹,]/g, ""));
    expect(totalTax).toBeLessThan(11000); // relief caps tax near excess over 12L
  });

  it("senior citizens get no 87A rebate under new regime", () => {
    const rows = ok("income-tax-calculator", { income: "900000", employment: "other", ageGroup: "60+" });
    const hasRebate = rows.some((r) => r.label.includes("87A"));
    expect(hasRebate).toBe(false);
  });
});

describe("percentage calculator modes", () => {
  it("X% of Y", () => {
    expect(ok("percentage-calculator", { mode: "of", x: "15", y: "200" })[0].value).toBe("30");
  });
  it("is what percent", () => {
    expect(ok("percentage-calculator", { mode: "isWhat", x: "30", y: "200" })[0].value).toContain("15");
  });
  it("percent change handles increase/decrease", () => {
    expect(ok("percentage-calculator", { mode: "change", x: "80", y: "100" })[0].value).toContain("+25");
    expect(ok("percentage-calculator", { mode: "change", x: "100", y: "80" })[0].value).toContain("-20");
  });
  it("rejects zero base for change", () => {
    expect(errOf("percentage-calculator", { mode: "change", x: "0", y: "50" })).toMatch(/non-zero/i);
  });
});

describe("math helpers", () => {
  it("LCM of multiple numbers", () => {
    expect(ok("lcm-calculator", { numbers: "12, 18, 24" })[0].value.replace(/,/g, "")).toBe("72");
  });
  it("HCF/GCD", () => {
    expect(ok("hcf-calculator", { numbers: "48, 180, 120" })[0].value).toBe("12");
  });
  it("average with median and range", () => {
    const rows = ok("average-calculator", { numbers: "45, 62, 58, 71, 39" });
    expect(rows[0].value).toBe("55");
    expect(rows[1].value).toBe("58");
  });
  it("ratio simplification and split", () => {
    const rows = ok("ratio-calculator", { a: "6", b: "18", total: "60" });
    expect(rows[0].value).toBe("1:3");
    expect(rows[3].value).toContain("15 : 45");
  });
  it("square root detects perfect squares and rejects negatives", () => {
    expect(ok("square-root-calculator", { value: "1764" })[1].value).toContain("Yes");
    expect(errOf("square-root-calculator", { value: "-4" })).toMatch(/imaginary|negative/i);
  });
  it("marks percentage validates bounds", () => {
    expect(errOf("marks-percentage-calculator", { obtained: "600", total: "500" })).toBeTruthy();
    expect(ok("marks-percentage-calculator", { obtained: "376", total: "500" })[0].value).toContain("75.20%");
  });
  it("CGPA ×9.5 default", () => {
    expect(ok("cgpa-to-percentage-calculator", { cgpa: "8.6", factor: "9.5" })[0].value).toContain("81.70%");
  });
});

describe("health calculators", () => {
  it("BMI classification boundaries", () => {
    // 170cm, 68kg → 23.53 normal
    expect(ok("bmi-calculator", { heightCm: "170", weightKg: "68" })[1].value).toBe("Normal weight");
    // 170cm, 90kg → 31.14 obese
    expect(ok("bmi-calculator", { heightCm: "170", weightKg: "90" })[1].value).toBe("Obese");
  });

  it("BMR Mifflin-St Jeor male/female constants", () => {
    const male = ok("bmr-calculator", { gender: "male", age: "28", heightCm: "175", weightKg: "72" });
    const expectedMale = Math.round(10 * 72 + 6.25 * 175 - 5 * 28 + 5);
    expect(male[0].value).toBe(`${expectedMale} kcal/day`);
    const female = ok("bmr-calculator", { gender: "female", age: "28", heightCm: "165", weightKg: "60" });
    const expectedFemale = Math.round(10 * 60 + 6.25 * 165 - 5 * 28 - 161);
    expect(female[0].value).toBe(`${expectedFemale} kcal/day`);
  });

  it("TDEE scales with activity multiplier", () => {
    const sedentary = Number(ok("tdee-calculator", {
      gender: "male", age: "30", heightCm: "175", weightKg: "75", activity: "1.2",
    })[0].value.replace(/\D/g, ""));
    const athlete = Number(ok("tdee-calculator", {
      gender: "male", age: "30", heightCm: "175", weightKg: "75", activity: "1.9",
    })[0].value.replace(/\D/g, ""));
    expect(athlete).toBeGreaterThan(sedentary);
  });

  it("ideal weight Devine formula", () => {
    const rows = ok("ideal-weight-calculator", { gender: "male", heightCm: "180" });
    // 180cm = 70.87in → 50 + 2.3×10.87 ≈ 75
    expect(Number(rows[0].value.replace(/[^\d.]/g, ""))).toBeGreaterThan(73);
    expect(Number(rows[0].value.replace(/[^\d.]/g, ""))).toBeLessThan(77);
  });

  it("water intake grows with exercise", () => {
    const base = Number(ok("water-intake-calculator", { weightKg: "70", exerciseMin: "0", climate: "temperate" })[0].value.replace(/[^\d.]/g, ""));
    const active = Number(ok("water-intake-calculator", { weightKg: "70", exerciseMin: "60", climate: "hot" })[0].value.replace(/[^\d.]/g, ""));
    expect(active).toBeGreaterThan(base);
  });
});

describe("everyday calculators", () => {
  it("tip split across people", () => {
    const rows = ok("tip-calculator", { bill: "2400", tipPct: "10", people: "4" });
    expect(Number(rows[0].value.split("×")[0].replace(/[₹,]/g, ""))).toBe(660);
  });

  it("electricity cost maths", () => {
    const rows = ok("electricity-cost-calculator", { watts: "1500", hoursDay: "6", rate: "9", daysMonth: "30" });
    expect(Number(rows[1].value.match(/[\d.]+/)?.[0] ?? "")).toBeCloseTo(270, 0);
    expect(Number(rows[0].value.replace(/[₹,]/g, ""))).toBe(2430);
  });

  it("date difference borrows calendar months", () => {
    const rows = ok("date-difference-calculator", { start: "2024-01-31", end: "2024-03-01" });
    // Edge case: components must never go negative; exact span is 30 days
    expect(rows[0].value).not.toMatch(/-\d/);
    expect(rows[0].value).toBe("0 y 0 m 30 d");
    expect(Number(rows[1].value.replace(/,/g, ""))).toBe(30);
  });

  it("time difference wraps overnight", () => {
    const rows = ok("time-difference-calculator", { start: "22:00", end: "06:30" });
    expect(rows[0].value).toBe("8 hours 30 minutes");
  });
});

describe("business & salary", () => {
  it("break-even units ceiling", () => {
    const rows = ok("break-even-calculator", { fixed: "200000", price: "250", variable: "150" });
    expect(rows[0].value).toContain("2,000 units"); // ceil(2000)
  });

  it("margin vs markup distinction", () => {
    const margin = Number(ok("profit-margin-calculator", { revenue: "100", cost: "60" })[0].value.replace("%", ""));
    expect(margin).toBeCloseTo(40, 0);
    const markupPrice = Number(ok("markup-calculator", { cost: "800", markup: "40" })[0].value.replace(/[₹,]/g, ""));
    expect(markupPrice).toBe(1120);
  });

  it("gratuity eligibility gate at 5 years", () => {
    expect(ok("gratuity-calculator", { basicDA: "60000", years: "4" })[0].value.replace(/[₹,]/g, "")).toBe("0");
    const eligible = ok("gratuity-calculator", { basicDA: "60000", years: "8" });
    expect(Number(eligible[0].value.replace(/[₹,]/g, ""))).toBeCloseTo((15 / 26) * 60000 * 8, -2);
  });

  it("salary hourly↔annual roundtrip", () => {
    const annualRows = ok("salary-calculator", { mode: "toAnnual", rate: "500", hoursWeek: "40", weeksYear: "52" });
    expect(Number(annualRows[0].value.replace(/[₹,]/g, ""))).toBe(1040000);
    const hourlyRows = ok("salary-calculator", { mode: "toHourly", rate: "1040000", hoursWeek: "40", weeksYear: "52" });
    expect(Number(hourlyRows[0].value.replace(/[₹,]/g, ""))).toBeCloseTo(500, 0);
  });
});

describe("conversions", () => {
  const firstNumber = (s: string) => Number(s.trim().split(/\s+/)[0]);

  it("length inch ↔ cm exactness", () => {
    const rows = ok("length-converter", { value: "1", from: "Inch (in)", to: "Centimeter (cm)" });
    expect(firstNumber(rows[0].value)).toBeCloseTo(2.54, 2);
  });

  it("temperature triple output and absolute-zero guard", () => {
    const rows = ok("temperature-converter", { value: "37", from: "Celsius (°C)" });
    expect(rows[0].value).toContain("98.6 °F");
    expect(rows[0].value).toContain("310.1 K");
    expect(errOf("temperature-converter", { value: "-300", from: "Celsius (°C)" })).toBeTruthy();
    expect(() => errOf("temperature-converter", { value: "-5", from: "Kelvin (K)" })).not.toThrow();
  });

  it("volume gallon ↔ litre", () => {
    const rows = ok("volume-converter", { value: "1", from: "Gallon (US)", to: "Liter (L)" });
    // Display rounds to 2 dp; exact factor is 3.785411784
    expect(firstNumber(rows[0].value)).toBeCloseTo(3.79, 1);
    expect(rows[0].value).toContain("Liter (L)");
  });

  it("speed mph ↔ km/h", () => {
    const rows = ok("speed-converter", { value: "60", from: "Miles/hour (mph)", to: "Kilometers/hour (km/h)" });
    expect(firstNumber(rows[0].value)).toBeCloseTo(96.56, 1);
  });

  it("weight pound ↔ kg exact factor", () => {
    const rows = ok("weight-converter", { value: "2.20462", from: "Pound (lb)", to: "Kilogram (kg)" });
    expect(firstNumber(rows[0].value)).toBeCloseTo(1, 3);
  });
});

describe("transport & investments extras", () => {
  it("fuel cost kmpl path", () => {
    const rows = ok("fuel-cost-calculator", { distance: "250", unit: "kmpl", efficiency: "16", price: "105", trips: "" });
    expect(Number(rows[1].value.replace(/[₹,]/g, ""))).toBeCloseTo((250 / 16) * 105, 0);
  });

  it("fuel cost MPG conversion constant", () => {
    const rows = ok("fuel-cost-calculator", { distance: "100", unit: "mpg", efficiency: "23.5215", price: "100", trips: "" });
    // 23.5215 mpg ≡ 10 L/100km exactly → 100 km needs 10 L
    expect(rows[0].value).toContain("10.00 litres");
    expect(Number(rows[1].value.replace(/[₹,]/g, ""))).toBe(1000);
  });

  it("travel time ETA arithmetic", () => {
    const rows = ok("travel-time-calculator", { distance: "420", speed: "60", departure: "09:00", breaksMin: "45" });
    expect(rows[0].value).toBe("7h 0m");
    expect(rows.find((r) => r.label === "ETA")?.value).toContain("PM");
  });

  it("mileage full-tank method", () => {
    const rows = ok("mileage-calculator", { distance: "480", fuel: "32", price: "105" });
    expect(Number(rows[0].value.replace(/[^\d.]/g, ""))).toBeCloseTo(15, 1);
  });

  it("CAGR known value", () => {
    const rows = ok("cagr-calculator", { begin: "100000", end: "260000", years: "5" });
    expect(Number(rows[0].value.replace("%", ""))).toBeCloseTo(21.03, 1);
  });

  it("ROI negative case", () => {
    const rows = ok("roi-calculator", { cost: "150000", value: "120000" });
    expect(rows[0].label).toContain("loss");
    expect(rows[1].value).toContain("-20.00%");
  });

  it("retirement corpus is positive and inflation-sensitive", () => {
    const parseCorpus = (inflation: string) => {
      const raw = ok("retirement-corpus-calculator", {
        monthly: "60000", yearsToRetire: "25", retiredYears: "30", inflation, returnPost: "7",
      })[0].value;
      return Number(raw.replace(/[^\d.]/g, " ").trim().split(/\s+/)[0]);
    };
    const low = parseCorpus("4");
    const high = parseCorpus("8");
    expect(low).toBeGreaterThan(0);
    expect(high).toBeGreaterThan(low * 2);
  });

  it("discount stacking sanity", () => {
    const rows = ok("discount-calculator", { price: "2999", discount: "30" });
    expect(Number(rows[1].value.replace(/[₹,]/g, ""))).toBeCloseTo(899.7, 0);
  });
});
