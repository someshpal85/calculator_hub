// Formatting helpers — India-first number formatting with worldwide fallbacks.
// Money calculators are currency-aware: the active currency (set by the
// calculator UI before each synchronous calculate() call) decides both the
// symbol and the digit-grouping convention.

export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AED", symbol: "AED ", label: "UAE Dirham" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan" },
  { code: "CHF", symbol: "CHF ", label: "Swiss Franc" },
  { code: "ZAR", symbol: "R ", label: "South African Rand" },
];

const enIN = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const enIN0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const enUS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const enUS0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

let activeCurrency: CurrencyInfo = CURRENCIES[0];

/** Set before a synchronous calculate(); read inside inr()/inr0(). */
export function setActiveCurrency(code: string): void {
  activeCurrency = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function getActiveCurrency(): CurrencyInfo {
  return activeCurrency;
}

function moneyFmt(n: number, fractionDigits?: number): string {
  if (!Number.isFinite(n)) return "—";
  if (activeCurrency.code === "INR") {
    return fractionDigits === 0 ? enIN0.format(n) : enIN.format(n);
  }
  return fractionDigits === 0 ? enUS0.format(n) : enUS.format(n);
}

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return enIN.format(n);
}

export function fmt0(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return enIN0.format(n);
}

/** ₹1,25,000 style Indian currency formatting — or $125,000 when USD active. */
export function inr(n: number): string {
  return `${activeCurrency.symbol}${moneyFmt(n)}`;
}

export function inr0(n: number): string {
  return `${activeCurrency.symbol}${moneyFmt(n, 0)}`;
}

/** Lakh / Crore words for large INR amounts; empty for non-INR currencies. */
export function inrWords(n: number): string {
  if (!Number.isFinite(n)) return "";
  if (activeCurrency.code !== "INR") return "";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${fmt(n / 1e7)} crore`;
  if (abs >= 1e5) return `${fmt(n / 1e5)} lakh`;
  if (abs >= 1e3) return `${fmt(n / 1e3)} thousand`;
  return fmt(n);
}

export function pct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}
