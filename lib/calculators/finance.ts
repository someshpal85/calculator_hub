import type { CalculatorDefinition } from "@/lib/types";
import { inr, inr0, inrWords, fmt, fmt0, pct } from "@/lib/format";
import { num, requirePositive } from "@/lib/validation";

const money = (n: number) => {
  const words = inrWords(n);
  return words ? `${inr(n)} (${words})` : inr(n);
};

export const FINANCE_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    icon: "🏦",
    category: "loans",
    description: "Calculate monthly EMI, total interest and total repayment for any loan.",
    keywords: ["emi", "loan", "instalment", "home loan", "car loan", "personal loan", "कर्ज", "किस्त"],
    popularity: 98,
    published: true,
    inputs: [
      { kind: "number", name: "amount", label: "Loan amount (₹)", min: 1, placeholder: "e.g. 1000000", defaultValue: 1000000 },
      { kind: "number", name: "rate", label: "Interest rate (% per year)", min: 0.1, step: 0.05, placeholder: "e.g. 9", defaultValue: 9 },
      { kind: "number", name: "years", label: "Tenure (years)", min: 1, step: 1, placeholder: "e.g. 20", defaultValue: 20 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "amount", label: "Loan amount" },
        { name: "rate", label: "Interest rate" },
        { name: "years", label: "Tenure" },
      ]);
      if ("error" in r) return r;
      const [P, annualRate, years] = r;
      const n = Math.round(years * 12);
      const i = annualRate / 12 / 100;
      const emi = (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - P;
      return {
        rows: [
          { label: "Monthly EMI", value: inr(emi), emphasis: true },
          { label: "Total interest payable", value: inr0(totalInterest) },
          { label: "Total payment (principal + interest)", value: inr0(totalPayment) },
          { label: "Interest as % of principal", value: pct((totalInterest / P) * 100) },
        ],
        note: `${n} monthly instalments over ${fmt(years)} years.`,
      };
    },
    formula: "EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P = principal, r = monthly rate (annual ÷ 12 ÷ 100), n = tenure in months.",
    about: [
      "An Equated Monthly Instalment (EMI) is the fixed amount you pay every month to repay a loan. Each EMI contains two parts — the interest charged on the outstanding balance and a portion of your principal.",
      "Early in the tenure most of your EMI goes towards interest; as the outstanding falls, more goes to principal. A longer tenure lowers the EMI but increases total interest paid, and vice versa.",
    ],
    howToUse: [
      "Enter the loan amount you plan to borrow.",
      "Enter the annual interest rate offered by your lender.",
      "Enter the tenure in years. The result updates instantly.",
    ],
    faqs: [
      { q: "Does this work for home, car and personal loans?", a: "Yes — the EMI maths is identical for any reducing-balance amortising loan. Only the rate, amount and tenure differ." },
      { q: "What happens if I prepay part of my loan?", a: "A prepayment reduces your outstanding principal, which either lowers future EMIs or shortens the remaining tenure depending on what your lender allows." },
      { q: "Is the EMI fixed for the whole tenure?", a: "For fixed-rate loans yes. For floating-rate loans the EMI or tenure is revised when benchmark rates change." },
    ],
    relatedSlugs: ["sip-calculator", "fd-calculator", "compound-interest-calculator", "salary-calculator"],
    seoTitle: "EMI Calculator — Monthly Instalment, Interest & Repayment",
  },

  {
    slug: "sip-calculator",
    name: "SIP Calculator",
    icon: "📆",
    category: "investments",
    description: "Future value of a Systematic Investment Plan (monthly mutual fund investment).",
    keywords: ["sip", "mutual fund", "systematic investment", "monthly investment", "म्यूचुअल फंड"],
    popularity: 95,
    published: true,
    inputs: [
      { kind: "number", name: "monthly", label: "Monthly investment (₹)", min: 100, step: 500, placeholder: "e.g. 10000", defaultValue: 10000 },
      { kind: "number", name: "rate", label: "Expected return (% per year)", min: 1, step: 0.5, placeholder: "e.g. 12", defaultValue: 12 },
      { kind: "number", name: "years", label: "Investment period (years)", min: 1, step: 1, placeholder: "e.g. 10", defaultValue: 10 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "monthly", label: "Monthly investment" },
        { name: "rate", label: "Expected return" },
        { name: "years", label: "Period" },
      ]);
      if ("error" in r) return r;
      const [P, annualRate, years] = r;
      const n = Math.round(years * 12);
      const i = annualRate / 12 / 100;
      const fv = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = P * n;
      return {
        rows: [
          { label: "Maturity value", value: money(fv), emphasis: true },
          { label: "Total invested", value: inr0(invested) },
          { label: "Wealth gained", value: inr0(fv - invested) },
          { label: "Absolute growth", value: pct(((fv - invested) / invested) * 100, 1) },
        ],
      };
    },
    formula: "FV = P × ((1+i)^n − 1) × (1+i) / i, where P = monthly instalment, i = expected monthly return (annual ÷ 12 ÷ 100), n = months.",
    about: [
      "A SIP invests a fixed amount into a mutual fund every month. Because each instalment buys units at different market levels, returns compound on every past instalment.",
      "This calculator uses the standard annuity-due approximation with monthly compounding. Actual mutual fund returns vary because markets fluctuate — treat the output as an estimate, not a guarantee.",
    ],
    howToUse: [
      "Enter the amount you will invest each month.",
      "Enter an expected annual return. Equity funds have historically delivered ~11–13% over long periods, but past performance never guarantees future results.",
      "Set the duration in years to see the projected maturity value.",
    ],
    faqs: [
      { q: "Is SIP return guaranteed?", a: "No. SIPs invest in market-linked funds; returns depend on fund performance. This calculator projects a constant assumed rate for planning purposes only." },
      { q: "What is step-up SIP?", a: "A step-up (top-up) SIP increases your instalment every year, typically by 5–10%, which can significantly raise the final corpus. This basic calculator assumes a constant instalment." },
    ],
    relatedSlugs: ["lumpsum-calculator", "cagr-calculator", "fd-calculator", "compound-interest-calculator"],
    seoTitle: "SIP Calculator — Project Mutual Fund Maturity Value",
  },

  {
    slug: "fd-calculator",
    name: "FD Calculator",
    icon: "🏛️",
    category: "investments",
    description: "Fixed Deposit maturity value with quarterly/monthly/yearly compounding.",
    keywords: ["fd", "fixed deposit", "term deposit", "maturity", "सावधि जमा"],
    popularity: 88,
    published: true,
    inputs: [
      { kind: "number", name: "principal", label: "Deposit amount (₹)", min: 100, step: 1000, placeholder: "e.g. 200000", defaultValue: 200000 },
      { kind: "number", name: "rate", label: "Interest rate (% per year)", min: 1, step: 0.1, placeholder: "e.g. 7.1", defaultValue: 7.1 },
      { kind: "number", name: "years", label: "Tenure (years)", min: 0.25, step: 0.25, placeholder: "e.g. 5", defaultValue: 5 },
      {
        kind: "select",
        name: "freq",
        label: "Compounding frequency",
        options: [
          { value: "1", label: "Yearly" },
          { value: "2", label: "Half-yearly" },
          { value: "4", label: "Quarterly (most banks)" },
          { value: "12", label: "Monthly" },
        ],
        defaultValue: "4",
      },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "principal", label: "Deposit amount" },
        { name: "rate", label: "Interest rate" },
        { name: "years", label: "Tenure" },
      ]);
      if ("error" in r) return r;
      const [P, rate, years] = r;
      const n = Number(v.freq || 4);
      const maturity = P * Math.pow(1 + rate / 100 / n, n * years);
      const interest = maturity - P;
      return {
        rows: [
          { label: "Maturity amount", value: money(maturity), emphasis: true },
          { label: "Interest earned", value: inr0(interest) },
          { label: "Effective yield", value: pct((interest / P / years) * 100) },
        ],
      };
    },
    formula: "A = P × (1 + r/n)^(n×t) — compound interest where n = compounding periods per year.",
    about: [
      "A Fixed Deposit pays a locked-in interest rate for a chosen tenure. Most Indian banks compound FD interest quarterly, which makes the effective annual yield slightly higher than the quoted rate.",
      "Interest on bank FDs is taxable as per your income-tax slab; TDS applies above threshold limits set by the government.",
    ],
    faqs: [
      { q: "Why does quarterly compounding pay more than yearly?", a: "Interest earned during the year itself starts earning further interest. The more frequent the compounding, the higher the effective yield for the same quoted rate." },
      { q: "What if I break my FD early?", a: "Most banks levy a penalty (often 0.5–1%) and pay interest at the applicable rate for the actual holding period, reducing your final amount." },
    ],
    relatedSlugs: ["rd-calculator", "simple-interest-calculator", "compound-interest-calculator", "income-tax-calculator"],
    seoTitle: "FD Calculator — Fixed Deposit Maturity & Yield",
  },

  {
    slug: "rd-calculator",
    name: "RD Calculator",
    icon: "🗓️",
    category: "investments",
    description: "Recurring Deposit maturity value for monthly savings at quarterly compounding.",
    keywords: ["rd", "recurring deposit", "monthly saving", "आवर्ती जमा"],
    popularity: 80,
    published: true,
    inputs: [
      { kind: "number", name: "monthly", label: "Monthly deposit (₹)", min: 100, step: 100, placeholder: "e.g. 5000", defaultValue: 5000 },
      { kind: "number", name: "rate", label: "Interest rate (% per year)", min: 1, step: 0.1, placeholder: "e.g. 6.8", defaultValue: 6.8 },
      { kind: "number", name: "months", label: "Tenure (months)", min: 6, step: 3, placeholder: "e.g. 60", defaultValue: 60 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "monthly", label: "Monthly deposit" },
        { name: "rate", label: "Interest rate" },
        { name: "months", label: "Tenure" },
      ]);
      if ("error" in r) return r;
      const [P, rate, months] = r.map((x) => Math.round(x));
      const i = rate / 400; // quarterly rate
      // Standard Indian RD valuation: each instalment compounds quarterly
      // until the end of the tenure.
      let maturity = 0;
      for (let m = 0; m < months; m++) {
        const quartersRemaining = (months - m) / 3;
        maturity += P * Math.pow(1 + i, quartersRemaining);
      }
      const invested = P * months;
      return {
        rows: [
          { label: "Maturity amount", value: money(maturity), emphasis: true },
          { label: "Total deposited", value: inr0(invested) },
          { label: "Interest earned", value: inr0(maturity - invested) },
        ],
        note: "Assumes quarterly compounding, matching typical bank RD terms.",
      };
    },
    formula: "Each of the n monthly deposits compounds quarterly at r/4 per quarter until maturity; the maturity is the sum of all compounded instalments.",
    about: [
      "A Recurring Deposit lets you save a fixed amount every month while earning FD-like interest. Every instalment earns interest for a different length of time, so the maturity depends on both the rate and when each instalment was made.",
    ],
    faqs: [
      { q: "How is RD different from SIP?", a: "RD earns a fixed, guaranteed interest like an FD. A SIP buys market-linked fund units whose value moves up and down. Use the SIP calculator for market projections and RD for certain outcomes." },
      { q: "Are RD interest earnings taxed?", a: "Yes — RD interest is added to your taxable income each year and taxed at your slab rate; TDS may also apply." },
    ],
    relatedSlugs: ["fd-calculator", "sip-calculator", "compound-interest-calculator"],
    seoTitle: "RD Calculator — Recurring Deposit Maturity Value",
  },

  {
    slug: "simple-interest-calculator",
    name: "Simple Interest Calculator",
    icon: "💵",
    category: "finance",
    description: "SI = P × R × T ÷ 100 — flat-rate interest on principal only.",
    keywords: ["simple interest", "si", "flat interest"],
    popularity: 82,
    published: true,
    inputs: [
      { kind: "number", name: "principal", label: "Principal amount (₹)", min: 1, placeholder: "e.g. 50000", defaultValue: 50000 },
      { kind: "number", name: "rate", label: "Interest rate (% per year)", min: 0.01, step: 0.05, placeholder: "e.g. 7.5", defaultValue: 7.5 },
      { kind: "number", name: "time", label: "Time (years)", min: 0.083, step: 0.5, placeholder: "e.g. 3", defaultValue: 3 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "principal", label: "Principal" },
        { name: "rate", label: "Rate" },
        { name: "time", label: "Time" },
      ]);
      if ("error" in r) return r;
      const [P, R, T] = r;
      const si = (P * R * T) / 100;
      return {
        rows: [
          { label: "Simple interest", value: inr(si), emphasis: true },
          { label: "Total amount (P + SI)", value: inr(P + si) },
          { label: "Interest per year", value: inr((P * R) / 100) },
        ],
      };
    },
    formula: "SI = (P × R × T) / 100",
    about: [
      "Simple interest grows linearly — it is always calculated on the original principal, never on previously accumulated interest. Short-term borrowings, some vehicle finance and informal lending often use flat/simple interest.",
      "Compare it with the Compound Interest calculator to see how powerful reinvesting interest can be over long tenures.",
    ],
    faqs: [
      { q: "When is simple interest used?", a: "Commonly for short-term loans, hire purchase agreements and some gold/vehicle loans where interest is charged flat on the original amount." },
      { q: "Can time be in months?", a: "Yes — enter years as a decimal, e.g. 18 months = 1.5." },
    ],
    relatedSlugs: ["compound-interest-calculator", "fd-calculator", "emi-calculator"],
    seoTitle: "Simple Interest Calculator (SI Formula)",
  },

  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    icon: "📈",
    category: "finance",
    description: "Growth of a lump sum with yearly → daily compounding frequencies.",
    keywords: ["compound interest", "ci", "compounding"],
    popularity: 90,
    published: true,
    inputs: [
      { kind: "number", name: "principal", label: "Principal (₹)", min: 1, placeholder: "e.g. 100000", defaultValue: 100000 },
      { kind: "number", name: "rate", label: "Annual rate (%)", min: 0.1, step: 0.25, placeholder: "e.g. 8", defaultValue: 8 },
      { kind: "number", name: "years", label: "Years", min: 1, step: 1, placeholder: "e.g. 10", defaultValue: 10 },
      {
        kind: "select",
        name: "freq",
        label: "Compounded",
        options: [
          { value: "1", label: "Yearly" },
          { value: "2", label: "Half-yearly" },
          { value: "4", label: "Quarterly" },
          { value: "12", label: "Monthly" },
          { value: "365", label: "Daily" },
        ],
        defaultValue: "4",
      },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "principal", label: "Principal" },
        { name: "rate", label: "Rate" },
        { name: "years", label: "Years" },
      ]);
      if ("error" in r) return r;
      const [P, rate, t] = r;
      const n = Number(v.freq || 4);
      const amount = P * Math.pow(1 + rate / 100 / n, n * t);
      return {
        rows: [
          { label: "Final amount", value: money(amount), emphasis: true },
          { label: "Interest earned", value: inr0(amount - P) },
          { label: "Growth multiple", value: `${fmt(amount / P)}×` },
        ],
      };
    },
    formula: "A = P × (1 + r/n)^(n×t)",
    about: [
      "Compound interest earns interest on interest. Over long horizons this snowball effect dominates — the difference between 6% and 10% over 25 years is not linear but exponential.",
      "Einstein allegedly called compounding the eighth wonder of the world; whether he said it or not, the mathematics holds.",
    ],
    faqs: [
      { q: "What is the Rule of 72?", a: "Divide 72 by the annual return rate to estimate doubling time. At 8% money doubles roughly every 9 years." },
      { q: "Why choose different compounding frequencies?", a: "Banks quote rates with specific compounding conventions (FDs usually quarterly). Match the frequency to get accurate results." },
    ],
    relatedSlugs: ["simple-interest-calculator", "fd-calculator", "sip-calculator", "inflation-calculator"],
    seoTitle: "Compound Interest Calculator — Growth With Any Frequency",
  },

  {
    slug: "lumpsum-calculator",
    name: "Lumpsum Investment Calculator",
    icon: "💎",
    category: "investments",
    description: "One-time investment future value at an assumed annual return.",
    keywords: ["lumpsum", "future value", "one time investment", "mutual fund"],
    popularity: 78,
    published: true,
    inputs: [
      { kind: "number", name: "amount", label: "One-time investment (₹)", min: 100, step: 1000, placeholder: "e.g. 500000", defaultValue: 500000 },
      { kind: "number", name: "rate", label: "Expected return (% p.a.)", min: 1, step: 0.5, placeholder: "e.g. 12", defaultValue: 12 },
      { kind: "number", name: "years", label: "Years", min: 1, step: 1, placeholder: "e.g. 15", defaultValue: 15 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "amount", label: "Investment" },
        { name: "rate", label: "Return" },
        { name: "years", label: "Years" },
      ]);
      if ("error" in r) return r;
      const [P, rate, t] = r;
      const fv = P * Math.pow(1 + rate / 100, t);
      return {
        rows: [
          { label: "Estimated future value", value: money(fv), emphasis: true },
          { label: "Gain", value: inr0(fv - P) },
          { label: "CAGR equivalent", value: pct(rate) },
        ],
      };
    },
    formula: "FV = P × (1 + r)^t",
    about: [
      "A lumpsum investment puts a single large amount to work immediately. The entire capital compounds from day one, unlike a SIP where instalments enter gradually.",
      "Historically, investing a lumpsum has outperformed averaging it in roughly two-thirds of the time — but timing risk is real. Many investors split large sums into tranches.",
    ],
    faqs: [
      { q: "Lumpsum or SIP — which is better?", a: "Mathematically lumpsum wins when markets rise steadily. SIP wins behaviourally — it enforces discipline and averages entry prices. Many people combine both." },
      { q: "What return should I assume?", a: "Long-run Indian equity indices returned ~11–13% annually before tax and inflation. Be conservative for planning; debt funds warrant much lower assumptions." },
    ],
    relatedSlugs: ["sip-calculator", "compound-interest-calculator", "cagr-calculator", "inflation-calculator"],
    seoTitle: "Lumpsum Investment Calculator — Future Value Projection",
  },

  {
    slug: "cagr-calculator",
    name: "CAGR Calculator",
    icon: "🚀",
    category: "investments",
    description: "Compound Annual Growth Rate between beginning and ending values.",
    keywords: ["cagr", "growth rate", "annualised return", "xirr"],
    popularity: 76,
    published: true,
    inputs: [
      { kind: "number", name: "begin", label: "Initial value (₹)", min: 1, placeholder: "e.g. 100000", defaultValue: 100000 },
      { kind: "number", name: "end", label: "Final value (₹)", min: 1, placeholder: "e.g. 260000", defaultValue: 260000 },
      { kind: "number", name: "years", label: "Duration (years)", min: 0.5, step: 0.5, placeholder: "e.g. 5", defaultValue: 5 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "begin", label: "Initial value" },
        { name: "end", label: "Final value" },
        { name: "years", label: "Duration" },
      ]);
      if ("error" in r) return r;
      const [B, E, t] = r;
      const cagr = (Math.pow(E / B, 1 / t) - 1) * 100;
      const absolute = ((E - B) / B) * 100;
      return {
        rows: [
          { label: "CAGR", value: pct(cagr), emphasis: true },
          { label: "Absolute return", value: pct(absolute, 1) },
          { label: "Growth multiple", value: `${fmt(E / B)}×` },
        ],
      };
    },
    formula: "CAGR = (End ÷ Begin)^(1/t) − 1",
    about: [
      "CAGR smooths multi-year performance into one annualised figure — what steady rate would have taken you from start value to end value? It ignores volatility along the way but is the standard way to compare investments held for different durations.",
    ],
    faqs: [
      { q: "CAGR vs XIRR?", a: "CAGR suits single inflow/outflow pairs. When money enters at multiple dates (like SIPs), XIRR handles irregular cash flows and is the correct measure." },
      { q: "What is a good CAGR?", a: "Beating long-term equity index CAGR (~12% for Nifty/Sensex historically) is respectable; beating inflation (~6%) preserves purchasing power." },
    ],
    relatedSlugs: ["roi-calculator", "sip-calculator", "lumpsum-calculator"],
    seoTitle: "CAGR Calculator — Annualised Growth Rate",
  },

  {
    slug: "roi-calculator",
    name: "ROI Calculator",
    icon: "🎯",
    category: "investments",
    description: "Return on Investment — net gain as % of cost.",
    keywords: ["roi", "return on investment", "profit percentage"],
    popularity: 74,
    published: true,
    inputs: [
      { kind: "number", name: "cost", label: "Amount invested (₹)", min: 1, placeholder: "e.g. 150000", defaultValue: 150000 },
      { kind: "number", name: "value", label: "Current/final value (₹)", min: 0, placeholder: "e.g. 195000", defaultValue: 195000 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "cost", label: "Amount invested" }]);
      if ("error" in r) return r;
      const end = num(v.value);
      if (end === null) return { error: "Please enter the final/current value." };
      const [cost] = r;
      const profit = end - cost;
      return {
        rows: [
          { label: "Net profit / loss", value: `${profit >= 0 ? "" : "−"}${inr(Math.abs(profit))}`, emphasis: true },
          { label: "ROI", value: `${((profit / cost) * 100).toFixed(2)}%` },
          { label: "Value multiple", value: `${(end / cost).toFixed(3)}×` },
        ],
      };
    },
    formula: "ROI = (Final − Cost) ÷ Cost × 100",
    about: [
      "ROI expresses profit relative to what you put in, making wildly different investments comparable. Its weakness: it ignores time — 50% over 2 years beats 60% over 15. Pair ROI with the CAGR calculator when durations differ.",
    ],
    faqs: [
      { q: "Can ROI be negative?", a: "Yes — when the final value is below cost, ROI is negative and represents a loss." },
      { q: "Should transaction costs be included?", a: "Ideally yes. Brokerage, taxes and fees belong in 'cost' so ROI reflects reality." },
    ],
    relatedSlugs: ["cagr-calculator", "profit-margin-calculator", "compound-interest-calculator"],
    seoTitle: "ROI Calculator — Return on Investment %",
  },

  {
    slug: "inflation-calculator",
    name: "Inflation Calculator",
    icon: "🎈",
    category: "finance",
    description: "What today's money will cost — and be worth — after inflation.",
    keywords: ["inflation", "purchasing power", "future cost", "महंगाई"],
    popularity: 72,
    published: true,
    inputs: [
      { kind: "number", name: "cost", label: "Today's cost (₹)", min: 1, placeholder: "e.g. 100000", defaultValue: 100000 },
      { kind: "number", name: "rate", label: "Inflation rate (% p.a.)", min: 0.1, step: 0.1, placeholder: "e.g. 6", defaultValue: 6 },
      { kind: "number", name: "years", label: "Years later", min: 1, step: 1, placeholder: "e.g. 20", defaultValue: 20 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "cost", label: "Today's cost" },
        { name: "rate", label: "Inflation rate" },
        { name: "years", label: "Years" },
      ]);
      if ("error" in r) return r;
      const [C, rate, t] = r;
      const futureCost = C * Math.pow(1 + rate / 100, t);
      const worthOfTodayMoney = C / Math.pow(1 + rate / 100, t);
      return {
        rows: [
          { label: `Same basket after ${t} years`, value: money(futureCost), emphasis: true },
          { label: `₹${fmt0(C)} then buys what costs`, value: inr(worthOfTodayMoney) + " today", },
          { label: "Value lost to inflation", value: pct((1 - worthOfTodayMoney / C) * 100, 1) },
        ],
      };
    },
    formula: "Future cost = C × (1+i)^t ; Real value = C ÷ (1+i)^t",
    about: [
      "Inflation silently shrinks purchasing power. India's CPI inflation has averaged roughly 5–7% in recent decades. Anything that doesn't grow faster than inflation is effectively losing value.",
    ],
    faqs: [
      { q: "Which inflation rate should I use?", a: "Use recent CPI trends (~5–6%) for general planning; education and medical costs often inflate faster (8–10%), so use higher figures for those goals." },
      { q: "How do I beat inflation?", a: "Historically, diversified equity has outpaced CPI over long periods; FDs often barely match it after tax." },
    ],
    relatedSlugs: ["compound-interest-calculator", "retirement-corpus-calculator", "fd-calculator"],
    seoTitle: "Inflation Calculator — Future Cost & Purchasing Power",
  },

  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    icon: "🏷️",
    category: "everyday",
    description: "Sale price and savings after a discount, plus reverse discount lookup.",
    keywords: ["discount", "sale price", "off", "छूट"],
    popularity: 85,
    published: true,
    inputs: [
      { kind: "number", name: "price", label: "Original price (₹)", min: 0.01, placeholder: "e.g. 2999", defaultValue: 2999 },
      { kind: "number", name: "discount", label: "Discount (%)", min: 0, max: 100, step: 1, placeholder: "e.g. 30", defaultValue: 30 },
    ],
    calculate(v) {
      const r = requirePositive(v, [{ name: "price", label: "Original price" }]);
      if ("error" in r) return r;
      const d = num(v.discount);
      if (d === null || d < 0 || d > 100) return { error: "Discount must be between 0 and 100." };
      const [price] = r;
      const saved = (price * d) / 100;
      return {
        rows: [
          { label: "You pay", value: inr(price - saved), emphasis: true },
          { label: "You save", value: inr(saved) },
        ],
      };
    },
    formula: "Sale price = Price × (1 − d/100)",
    about: [
      "Retailers love quoting percentages because they feel smaller than rupee amounts. Always translate discounts into absolute savings — 30% off ₹499 saves less than 10% off a ₹9,999 item.",
      "Beware stacked offers: '30% off' followed by an extra 10% off is NOT 40% off — it's 37% off, because the second cut applies to the already-reduced price.",
    ],
    faqs: [
      { q: "Two successive discounts of 20% and 10% equal how much?", a: "Not 30%. Effective discount = 100 − (0.8 × 0.9 × 100) = 28%." },
      { q: "How do I find the original price from a sale price?", a: "Original = Sale ÷ (1 − d/100). For a ₹700 item bought at 30% off: 700 ÷ 0.7 = ₹1,000." },
    ],
    relatedSlugs: ["gst-calculator", "percentage-calculator", "split-bill-calculator"],
    seoTitle: "Discount Calculator — Sale Price & Savings",
  },
];
