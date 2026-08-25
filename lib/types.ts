// CalcSphere — universal calculator engine types.
// Every calculator is a pure data definition: inputs + calculate + content.
// UI is rendered once by <CalculatorRunner def={...} />.

export type InputDef =
  | {
      kind: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      step?: number | "any";
      placeholder?: string;
      suffix?: string;
      defaultValue?: number | string;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      options: { value: string; label: string }[];
      defaultValue?: string;
    }
  | { kind: "date"; name: string; label: string }
  | { kind: "time"; name: string; label: string }
  | { kind: "text"; name: string; label: string; placeholder?: string };

export interface ResultRow {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface CalcResult {
  rows: ResultRow[];
  note?: string;
}

export type CalcOutput = CalcResult | { error: string };

export function isCalcError(out: CalcOutput): out is { error: string } {
  return typeof (out as { error?: unknown }).error === "string";
}

export interface CalculatorDefinition {
  slug: string; // e.g. "emi-calculator"
  name: string; // e.g. "EMI Calculator"
  icon: string; // emoji
  category: string; // category slug
  description: string; // one-liner for cards & meta description base
  keywords: string[]; // search keywords incl. Hindi synonyms
  popularity: number; // 1–100, drives "Popular" sort & homepage picks
  published: boolean;

  inputs: InputDef[];
  calculate(values: Record<string, string>): CalcOutput;

  formula?: string;
  about?: string[]; // explanation paragraphs (original content)
  howToUse?: string[];
  faqs?: { q: string; a: string }[];
  relatedSlugs?: string[];

  // Special-case renderers for calculators that don't fit generic forms.
  custom?: "expression" | "currency";

  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryDef {
  slug: string;
  name: string;
  icon: string;
  description: string;
}
