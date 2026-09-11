"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CalculatorDefinition, CalcOutput } from "@/lib/types";
import { isCalcError } from "@/lib/types";
import { getCalculator } from "@/lib/calculators";
import { CURRENCIES, getActiveCurrency, setActiveCurrency } from "@/lib/format";
import { extremeInputError } from "@/lib/validation";
import { useLocale } from "@/components/LocaleProvider";
import ExpressionCalculator from "./ExpressionCalculator";
import CurrencyConverterWidget from "./CurrencyConverter";
import { track } from "@/lib/analytics";

function defaultsOf(def: CalculatorDefinition): Record<string, string> {
  const out: Record<string, string> = {};
  for (const input of def.inputs) {
    const dv = "defaultValue" in input ? input.defaultValue : undefined;
    if (dv !== undefined && dv !== "") out[input.name] = String(dv);
  }
  return out;
}

function formatRowsText(def: CalculatorDefinition, rows: { label: string; value: string }[]): string {
  const lines = rows.map((r) => `${r.label}: ${r.value}`);
  return [def.name, ...lines].join("\n");
}

export default function CalculatorRunner({ slug }: { slug: string }) {
  const def = getCalculator(slug);
  if (!def) return <p className="error-box">⚠️ Unknown calculator.</p>;

  // ── Special-case widgets ────────────────────────────────────
  if (def.custom === "expression") {
    return <ExpressionCalculator variant={def.slug === "scientific-calculator" ? "sci" : "basic"} />;
  }
  if (def.custom === "currency") {
    return (
      <>
        <CurrencyConverterWidget />
        {def.about?.map((p, i) => (
          <p key={i} className="result-note" style={{ marginTop: 14 }}>{p}</p>
        ))}
      </>
    );
  }

  return <GenericRunner def={def} key={def.slug} />;
}

function GenericRunner({ def }: { def: CalculatorDefinition }) {
  const { tr } = useLocale();
  const searchParams = useSearchParams();
  const defaults = useMemo(() => defaultsOf(def), [def]);

  // Money calculators auto-gain a currency selector: probe whether the
  // definition produces ₹-denominated output or ₹-labelled inputs.
  const currencyAware = useMemo(() => {
    if (def.inputs.some((i) => i.label.includes("₹"))) return true;
    try {
      const probe = def.calculate({ ...defaults });
      return !isCalcError(probe) && JSON.stringify(probe.rows).includes("₹");
    } catch {
      return false;
    }
  }, [def, defaults]);

  const [values, setValues] = useState<Record<string, string>>(() => ({ ...defaults }));
  const [currency, setCurrency] = useState("USD");
  const [copied, setCopied] = useState<"result" | "link" | null>(null);
  const usedTracked = useRef(false);

  // Prefill from shareable URL (?amount=…&rate=…) once on mount.
  // Also emits the primary calculator_view event — normal view vs share-URL view.
  useEffect(() => {
    const incoming: Record<string, string> = {};
    for (const input of def.inputs) {
      const v = searchParams.get(input.name);
      if (v !== null) incoming[input.name] = v;
    }
    if (Object.keys(incoming).length > 0) {
      setValues((prev) => ({ ...prev, ...incoming }));
      track("calculator_view", { slug: def.slug, via: "share_url" });
    } else {
      track("calculator_view", { slug: def.slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live calculation — set the active currency first so every inr()/inr0()
  // call inside the definition's calculate() emits the right symbol & grouping.
  const activeSymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹";
  const result: CalcOutput = useMemo(() => {
    try {
      const labelMap: Record<string, string> = {};
      for (const input of def.inputs) labelMap[input.name] = input.label;
      const extreme = extremeInputError(values, labelMap);
      if (extreme) return { error: extreme };
      setActiveCurrency(currency);
      return def.calculate(values);
    } catch {
      return { error: "Something went wrong computing this — please check your inputs." };
    }
  }, [def, values, currency]);

  // Sync inputs into the URL so results are shareable/bookmarkable.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        let changed = false;
        for (const input of def.inputs) {
          const val = values[input.name];
          const isDefault = !val || !defaults[input.name] || val === defaults[input.name];
          if (!isDefault) {
            url.searchParams.set(input.name, val);
            changed = true;
          } else if (url.searchParams.has(input.name)) {
            url.searchParams.delete(input.name);
            changed = true;
          }
        }
        if (changed) {
          window.history.replaceState(null, "", url.toString());
        }
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(id);
  }, [values, def, defaults]);

  // Analytics: first real interaction per session
  const onChange = useCallback(
    (name: string, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (!usedTracked.current) {
        usedTracked.current = true;
        track("calculator_used", { slug: def.slug });
      }
    },
    [def.slug],
  );

  const reset = () => {
    setValues({ ...defaults });
    setCurrency("USD");
    try {
      const url = new URL(window.location.href);
      for (const input of def.inputs) url.searchParams.delete(input.name);
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* ignore */
    }
  };

  const copy = async (what: "result" | "link") => {
    try {
      if (what === "result") {
        if (!isCalcError(result)) {
          await navigator.clipboard.writeText(formatRowsText(def, result.rows));
        }
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
      if (what === "link") track("calculator_shared", { slug: def.slug, method: "copy_link" });
    } catch {
      /* clipboard unavailable */
    }
  };

  const nativeShare = async () => {
    track("calculator_shared", { slug: def.slug, method: "native" });
    try {
      if (navigator.share) {
        await navigator.share({
          title: def.name,
          text: `${def.name} — CalcSphere`,
          url: window.location.href,
        });
        return;
      }
    } catch {
      /* user cancelled */
    }
    void copy("link");
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${def.name} → ${typeof window !== "undefined" ? window.location.href : ""}`)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(def.name)}`;

  const hasValues = def.inputs.some((i) => (values[i.name] ?? "") !== "");

  // Swap the ₹ glyph in input labels for the active symbol (e.g. "Loan amount ($)")
  const withSymbol = (s: string) => (currency === "INR" ? s : s.replace(/₹/g, activeSymbol.trim() || activeSymbol));

  return (
    <div>
      {/* Inputs */}
      <div>
        {currencyAware && (
          <div className="field">
            <label htmlFor={`cur-${def.slug}`}>Currency</label>
            <select
              id={`cur-${def.slug}`}
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                if (!usedTracked.current) {
                  usedTracked.current = true;
                  track("calculator_used", { slug: def.slug });
                }
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol.trim()} {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {def.inputs.map((input) => {
          const id = `in-${def.slug}-${input.name}`;
          if (input.kind === "select") {
            return (
              <div className="field" key={input.name}>
                <label htmlFor={id}>{withSymbol(input.label)}</label>
                <select
                  id={id}
                  value={values[input.name] ?? ""}
                  onChange={(e) => onChange(input.name, e.target.value)}
                >
                  {input.options.map((o) => (
                    <option key={o.value} value={o.value}>{withSymbol(o.label)}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (input.kind === "text") {
            return (
              <div className="field" key={input.name}>
                <label htmlFor={id}>{withSymbol(input.label)}</label>
                <input
                  id={id}
                  type="text"
                  value={values[input.name] ?? ""}
                  placeholder={input.placeholder}
                  onChange={(e) => onChange(input.name, e.target.value)}
                />
              </div>
            );
          }
          const numericProps =
            input.kind === "number"
              ? { min: input.min, max: input.max, step: input.step as number | undefined }
              : {};
          return (
            <div className="field" key={input.name}>
              <label htmlFor={id}>
                {withSymbol(input.label)}
                {"suffix" in input && input.suffix ? <span className="hint"> ({input.suffix})</span> : null}
              </label>
              <input
                id={id}
                type={input.kind}
                {...numericProps}
                placeholder={"placeholder" in input ? input.placeholder : undefined}
                value={values[input.name] ?? ""}
                onChange={(e) => onChange(input.name, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={reset} disabled={!hasValues}>{tr("calc.reset")}</button>
      </div>

      {/* Results */}
      <div style={{ marginTop: 18 }} aria-live="polite">
        {isCalcError(result) ? (
          <p className="error-box">⚠️ {result.error}</p>
        ) : (
          (() => {
            const main = result.rows.find((r) => r.emphasis) ?? result.rows[0];
            const secondary = result.rows.filter((r) => r !== main);
            return (
              <>
                {main && (
                  <div className="result-main">
                    <div className="label">{withSymbol(main.label)}</div>
                    <div className="value">{withSymbol(main.value)}</div>
                  </div>
                )}
                {secondary.length > 0 && (
                  <div className="result-secondary">
                    {secondary.map((r, i) => (
                      <div className="result-row" key={i}>
                        <span className="k">{withSymbol(r.label)}</span>
                        <span className="v">{withSymbol(r.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result.note && <p className="result-note">{withSymbol(result.note)}</p>}
                <div className="share-actions">
                  <button type="button" className="secondary" onClick={() => copy("result")}>
                    {copied === "result" ? "✓" : `📋 ${tr("calc.copyResult")}`}
                  </button>
                  <button type="button" className="secondary" onClick={() => copy("link")}>
                    {copied === "link" ? "✓" : `🔗 ${tr("calc.copyLink")}`}
                  </button>
                  <a className="btn secondary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    {tr("calc.whatsapp")}
                  </a>
                  <a className="btn secondary" href={telegramHref} target="_blank" rel="noopener noreferrer">
                    {tr("calc.telegram")}
                  </a>
                  <button type="button" className="secondary" onClick={nativeShare}>
                    ↗ {tr("calc.share")}
                  </button>
                </div>
              </>
            );
          })()
        )}
      </div>
    </div>
  );
}
