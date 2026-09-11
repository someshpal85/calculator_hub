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

/**
 * Reliable numeric range for double-precision display formatting.
 * Beyond this magnitude, results degrade to "—" or lose meaning for users.
 */
export const MAX_RELIABLE_INPUT = 1e15;

/**
 * Returns a friendly error if any numeric input exceeds the reliable range,
 * otherwise null. Guards every generic calculator at a single point instead
 * of letting Infinity silently become "—" in results.
 */
export function extremeInputError(
  values: Record<string, string>,
  labels: Record<string, string> = {},
): string | null {
  for (const [name, raw] of Object.entries(values)) {
    const n = num(raw);
    if (n !== null && Math.abs(n) > MAX_RELIABLE_INPUT) {
      const label = labels[name] ?? "This value";
      return `${label} is too large to calculate reliably. Please enter a number below 1,000 trillion.`;
    }
  }
  return null;
}
