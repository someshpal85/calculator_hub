// Shared numeric parsing for calculator definitions.
// Returns null for blank/invalid input so definitions can emit friendly errors.

export function num(v: string | undefined): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).replace(/,/g, "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function requirePositive(values: Record<string, string>, fields: { name: string; label: string }[]): number[] | { error: string } {
  const out: number[] = [];
  for (const f of fields) {
    const n = num(values[f.name]);
    if (n === null) return { error: `Please enter ${f.label}.` };
    if (n <= 0) return { error: `${f.label} must be greater than zero.` };
    out.push(n);
  }
  return out;
}

export function requireNonNegative(values: Record<string, string>, fields: { name: string; label: string }[]): number[] | { error: string } {
  const out: number[] = [];
  for (const f of fields) {
    const n = num(values[f.name]);
    if (n === null) return { error: `Please enter ${f.label}.` };
    if (n < 0) return { error: `${f.label} cannot be negative.` };
    out.push(n);
  }
  return out;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
