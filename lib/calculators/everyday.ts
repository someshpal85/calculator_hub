import type { CalculatorDefinition } from "@/lib/types";
import { inr, fmt } from "@/lib/format";
import { num, requirePositive, requireNonNegative } from "@/lib/validation";

export const EVERYDAY_CALCULATORS: CalculatorDefinition[] = [
  {
    slug: "age-calculator",
    name: "Age Calculator",
    icon: "🎂",
    category: "time-date",
    description: "Exact age in years, months, days — plus total days lived.",
    keywords: ["age", "date of birth", "dob", "how old", "उम्र"],
    popularity: 99,
    published: true,
    inputs: [
      { kind: "date", name: "dob", label: "Date of birth" },
      { kind: "date", name: "asOf", label: "Age as on (default: today)" },
    ],
    calculate(v) {
      const dob = v.dob ? new Date(v.dob + "T00:00:00") : null;
      const asOf = v.asOf ? new Date(v.asOf + "T00:00:00") : new Date();
      if (!dob || Number.isNaN(dob.getTime())) return { error: "Please enter a valid date of birth." };
      if (Number.isNaN(asOf.getTime())) return { error: "Please enter a valid 'as on' date." };
      if (dob > asOf) return { error: "Date of birth must be before the reference date." };

      let years = asOf.getFullYear() - dob.getFullYear();
      let months = asOf.getMonth() - dob.getMonth();
      let days = asOf.getDate() - dob.getDate();
      let mi = 0;
      while (days < 0) {
        months -= 1;
        mi -= 1;
        days += new Date(asOf.getFullYear(), asOf.getMonth() + mi + 1, 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / 86400000);

      let nb = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
      if (nb <= asOf) nb = new Date(asOf.getFullYear() + 1, dob.getMonth(), dob.getDate());
      const toBirthday = Math.ceil((nb.getTime() - asOf.getTime()) / 86400000);

      return {
        rows: [
          { label: "Exact age", value: `${years} years, ${months} months, ${days} days`, emphasis: true },
          { label: "Total days lived", value: totalDays.toLocaleString("en-IN") },
          { label: "Born on a", value: dob.toLocaleDateString("en-US", { weekday: "long" }) },
          { label: `Next birthday in`, value: `${toBirthday} day${toBirthday === 1 ? "" : "s"} (${nb.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})` },
        ],
      };
    },
    formula: "Calendar arithmetic borrowing days/months — not simple ÷365, which drifts with leap years.",
    about: [
      "Official age for exams, visas and retirement is computed in completed calendar years-months-days, not by dividing days by 365.25. This calculator follows the standard calendar-borrowing method used worldwide.",
    ],
    faqs: [
      { q: "How old is someone born on 29 February?", a: "Legally their birthday falls on 28 Feb (or 1 Mar in some jurisdictions) in non-leap years; the calculator treats it as 1 March." },
      { q: "Why does 'total days' matter?", a: "Interest calculations, warranty periods and visa durations often count exact days rather than calendar months." },
    ],
    relatedSlugs: ["date-difference-calculator", "time-difference-calculator", "retirement-corpus-calculator"],
    seoTitle: "Age Calculator — Exact Years, Months & Days",
  },

  {
    slug: "date-difference-calculator",
    name: "Date Difference Calculator",
    icon: "📅",
    category: "time-date",
    description: "Days between two dates in years/months/days plus totals.",
    keywords: ["date difference", "days between", "duration between dates", "तारीख"],
    popularity: 83,
    published: true,
    inputs: [
      { kind: "date", name: "start", label: "Start date" },
      { kind: "date", name: "end", label: "End date" },
    ],
    calculate(v) {
      const s = v.start ? new Date(v.start + "T00:00:00") : null;
      const e = v.end ? new Date(v.end + "T00:00:00") : null;
      if (!s || !e || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()))
        return { error: "Please pick both start and end dates." };
      if (s > e) return { error: "Start date must be on or before end date." };

      let years = e.getFullYear() - s.getFullYear();
      let months = e.getMonth() - s.getMonth();
      let days = e.getDate() - s.getDate();
      let mi = 0;
      while (days < 0) {
        months -= 1;
        mi -= 1;
        days += new Date(e.getFullYear(), e.getMonth() + mi + 1, 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const totalDays = Math.round((e.getTime() - s.getTime()) / 86400000);
      return {
        rows: [
          { label: "Difference", value: `${years} y ${months} m ${days} d`, emphasis: true },
          { label: "Total days", value: totalDays.toLocaleString("en-IN") },
          { label: "Total weeks", value: `${Math.floor(totalDays / 7)} weeks ${totalDays % 7} days` },
          { label: "Working estimate (Mon–Fri)", value: `≈ ${Math.round((totalDays * 5) / 7)} weekdays` },
        ],
      };
    },
    formula: "Calendar subtraction with month/day borrowing; total days via UTC-normalised millisecond difference.",
    about: [
      "Project deadlines, notice periods, interest accrual and warranty windows all live on this calculation. The weekday estimate helps sanity-check business-day counts before precise holiday adjustments.",
    ],
    faqs: [
      { q: "Inclusive or exclusive counting?", a: "This shows elapsed time (exclusive of start). For inclusive booking-style counts add 1 to total days." },
      { q: "Timezone handling?", a: "Both dates parse at midnight local time, avoiding off-by-one issues common when mixing timezones." },
    ],
    relatedSlugs: ["age-calculator", "time-difference-calculator", "emi-calculator"],
    seoTitle: "Date Difference Calculator — Days Between Dates",
  },

  {
    slug: "time-difference-calculator",
    name: "Time Difference Calculator",
    icon: "⏱️",
    category: "time-date",
    description: "Hours & minutes between two times, overnight-aware.",
    keywords: ["time difference", "hours between", "timesheet", "shift duration"],
    popularity: 74,
    published: true,
    inputs: [
      { kind: "time", name: "start", label: "From" },
      { kind: "time", name: "end", label: "To" },
      { kind: "number", name: "rate", label: "Optional: hourly rate (₹)", min: 0, step: 10, placeholder: "e.g. 250", defaultValue: "" },
    ],
    calculate(v) {
      const parse = (t?: string): number | null => {
        if (!t) return null;
        const [h, m] = t.split(":").map(Number);
        if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) return null;
        return h * 60 + m;
      };
      const s = parse(v.start);
      const e = parse(v.end);
      if (s === null || e === null) return { error: "Pick valid times in both fields." };
      let diff = e - s;
      const overnight = diff < 0;
      if (overnight) diff += 1440;

      const rows = [
        { label: "Duration", value: `${Math.floor(diff / 60)} hours ${diff % 60} minutes`, emphasis: true },
        { label: "Decimal hours", value: `${(diff / 60).toFixed(2)} h` },
        ...(overnight ? [{ label: "Note", value: "Crosses midnight (+24h applied)" }] : []),
      ] as { label: string; value: string; emphasis?: boolean }[];

      const rate = num(v.rate);
      if (rate !== null && rate > 0) {
        rows.push({ label: "Earnings at given rate", value: inr((diff / 60) * rate), emphasis: true });
      }
      return { rows };
    },
    formula: "Minutes(end) − minutes(start); negative results wrap past midnight via +1440.",
    about: [
      "Shift workers and freelancers constantly need span-of-time maths. Decimal hours (8h30m = 8.5) feed payroll systems directly — multiply by your rate without unit headaches.",
    ],
    faqs: [
      { q: "Night shift 22:00 → 06:30?", a: "Handled automatically: negative difference wraps through midnight giving 8h30m." },
      { q: "Break deductions?", a: "Compute each worked block separately, or subtract the break manually from decimal hours." },
    ],
    relatedSlugs: ["salary-calculator", "age-calculator", "date-difference-calculator"],
    seoTitle: "Time Difference Calculator — Hours Between Two Times",
  },

  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    icon: "🍔",
    category: "everyday",
    description: "Tip amount and grand total, split across any number of people.",
    keywords: ["tip", "gratuity restaurant", "service charge", "bill"],
    popularity: 76,
    published: true,
    inputs: [
      { kind: "number", name: "bill", label: "Bill amount (₹)", min: 0, step: 10, placeholder: "e.g. 2400", defaultValue: 2400 },
      { kind: "number", name: "tipPct", label: "Tip (%)", min: 0, max: 100, step: 5, placeholder: "e.g. 10", defaultValue: 10 },
      { kind: "number", name: "people", label: "Split between people", min: 1, step: 1, placeholder: "e.g. 4", defaultValue: 4 },
    ],
    calculate(v) {
      const r = requireNonNegative(v, [{ name: "bill", label: "Bill amount" }]);
      if ("error" in r) return r;
      const people = num(v.people);
      const tipPct = num(v.tipPct);
      if (people === null || people < 1) return { error: "At least one person is needed to split the bill." };
      if (tipPct === null || tipPct < 0 || tipPct > 100) return { error: "Tip must be between 0% and 100%." };
      const [bill] = r;
      const tip = (bill * tipPct) / 100;
      const perPerson = (bill + tip) / people;
      return {
        rows: [
          { label: "Each person pays", value: `${inr(perPerson)} × ${fmt(people)}`, emphasis: true },
          { label: "Tip amount", value: inr(tip) },
          { label: "Grand total", value: inr(bill + tip) },
        ],
      };
    },
    formula: "Total = bill × (1 + tip%); share = total ÷ people",
    about: [
      "India's tipping culture ranges from rounding-up street food to 7–10% at upscale venues where no service charge appears. Abroad, 15–20% is expected in US full-service dining since servers rely on tips legally.",
      "Watch bills that already include 'service charge' (commonly 5–10%) — tipping again on top double-pays unless service exceeded expectations.",
    ],
    faqs: [
      { q: "Is GST calculated on the tipped amount?", a: "No. GST applies to the food bill; tips given afterward stay outside tax scope." },
      { q: "Fair way to split unequal orders?", a: "Ask for itemised splits or settle proportionally: each pays (their items × (total+tip)/subtotal)." },
    ],
    relatedSlugs: ["split-bill-calculator", "gst-calculator", "discount-calculator"],
    seoTitle: "Tip Calculator With Bill Splitting",
  },

  {
    slug: "split-bill-calculator",
    name: "Split Bill Calculator",
    icon: "🧾",
    category: "everyday",
    description: "Divide any shared expense equally — rent, trips, group gifts.",
    keywords: ["split bill", "divide expense", "share cost", "group payment"],
    popularity: 72,
    published: true,
    inputs: [
      { kind: "number", name: "amount", label: "Total expense (₹)", min: 0, step: 10, placeholder: "e.g. 12500", defaultValue: 12500 },
      { kind: "number", name: "people", label: "Number of people", min: 1, step: 1, placeholder: "e.g. 6", defaultValue: 6 },
      { kind: "number", name: "paidBy", label: "Amount already paid by you (₹)", min: 0, step: 10, placeholder: "e.g. 12500", defaultValue: "" },
    ],
    calculate(v) {
      const r = requireNonNegative(v, [{ name: "amount", label: "Total expense" }]);
      if ("error" in r) return r;
      const people = num(v.people);
      if (people === null || people < 1) return { error: "People must be at least 1." };
      const [amount] = r;
      const share = amount / people;
      const rows = [
        { label: "Per person", value: inr(share), emphasis: true },
        { label: "Group total", value: inr(amount) },
      ] as { label: string; value: string; emphasis?: boolean }[];
      const paid = num(v.paidBy);
      if (paid !== null && paid >= 0) {
        const balance = share * people === 0 ? 0 : paid - share;
        rows.push({
          label: "Your settlement",
          value:
            Math.abs(paid - share) < 0.005
              ? "Settled ✓"
              : paid > share
                ? `You receive ${inr(Math.min(paid - share, amount - share))}`
                : `You owe ${inr(share - paid)}`,
          emphasis: true,
        });
        void balance;
      }
      return { rows };
    },
    formula: "Share = Total ÷ People; settlement = paid − own share.",
    about: [
      "Equal splits work for genuinely shared costs. When consumption differs wildly — one teetotaller amid a bar tab — proportional splitting preserves friendships better than forced equality.",
    ],
    faqs: [
      { q: "Rounding leftover paise?", a: "Round each share up and designate one person's share to absorb the remainder so totals reconcile exactly." },
      { q: "UPI settlement etiquette?", a: "Settle within 48 hours; small recurring debts strain relationships more than the amounts suggest." },
    ],
    relatedSlugs: ["tip-calculator", "ratio-calculator", "fuel-cost-calculator"],
    seoTitle: "Split Bill Calculator — Fair Expense Sharing",
  },

  {
    slug: "electricity-cost-calculator",
    name: "Electricity Cost Calculator",
    icon: "💡",
    category: "utilities",
    description: "Appliance running cost from wattage, usage hours and tariff.",
    keywords: ["electricity", "power cost", "units kwh", "bijli bill", "appliance"],
    popularity: 71,
    published: true,
    inputs: [
      { kind: "number", name: "watts", label: "Appliance power (watts)", min: 1, placeholder: "e.g. 1500", defaultValue: 1500 },
      { kind: "number", name: "hoursDay", label: "Hours used per day", min: 0.1, step: 0.5, placeholder: "e.g. 6", defaultValue: 6 },
      { kind: "number", name: "rate", label: "Tariff (₹ per kWh/unit)", min: 0.1, step: 0.1, placeholder: "e.g. 9", defaultValue: 9 },
      { kind: "number", name: "daysMonth", label: "Days per month", min: 1, max: 31, step: 1, placeholder: "30", defaultValue: 30 },
    ],
    calculate(v) {
      const r = requirePositive(v, [
        { name: "watts", label: "Power rating" },
        { name: "hoursDay", label: "Daily usage hours" },
        { name: "rate", label: "Tariff" },
        { name: "daysMonth", label: "Days per month" },
      ]);
      if ("error" in r) return r;
      const [watts, hrs, rate, days] = r;
      const unitsDay = (watts / 1000) * hrs;
      const monthlyUnits = unitsDay * days;
      return {
        rows: [
          { label: "Monthly cost", value: `${inr(monthlyUnits * rate)}`, emphasis: true },
          { label: "Monthly consumption", value: `${monthlyUnits.toFixed(2)} kWh (units)` },
          { label: "Yearly cost", value: inr(monthlyUnits * rate * 12) },
          { label: "Cost per hour of use", value: inr(unitsDay * rate / hrs) },
        ],
        note: "Indian tariffs are slab-based (telescopic); marginal appliances may fall into higher slabs than your average ₹/unit.",
      };
    },
    formula: "kWh = watts × hours ÷ 1000; Cost = kWh × tariff",
    about: [
      "A 1.5-ton AC (~1500W) running 6 hours daily consumes ~270 units monthly — often ₹2,000–3,000 depending on state tariffs. Knowing per-appliance costs drives real savings: an old fridge can quietly burn more than your TV and fans combined.",
      "Slab tariffs complicate marginal maths: adding a high-consumption appliance can push entire usage into pricier brackets.",
    ],
    faqs: [
      { q: "Where do I find my tariff?", a: "State discom websites publish slab cards (₹/unit by consumption band). Use your latest bill's marginal slab rate for accuracy." },
      { q: "Do inverter appliances really save?", a: "Yes for variable loads — inverter ACs/fridges modulate compressor speed, typically saving 20–40% versus fixed-speed equivalents under partial load." },
    ],
    relatedSlugs: ["fuel-cost-calculator", "tdee-calculator", "split-bill-calculator"],
    seoTitle: "Electricity Cost Calculator — Appliance Running Cost",
  },
];
