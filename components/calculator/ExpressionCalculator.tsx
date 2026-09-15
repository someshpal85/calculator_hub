"use client";

import { useEffect, useRef, useState } from "react";
import { evaluate, formatResult } from "@/lib/evaluate";

const BASIC_KEYS: { label: string; action?: "digit" | "op" | "clear" | "back" | "equals"; cls?: string }[] = [
  { label: "C", action: "clear", cls: "danger" },
  { label: "⌫", action: "back", cls: "op" },
  { label: "%", action: "op", cls: "op" },
  { label: "÷", action: "op", cls: "op" },
  { label: "7", action: "digit" },
  { label: "8", action: "digit" },
  { label: "9", action: "digit" },
  { label: "×", action: "op", cls: "op" },
  { label: "4", action: "digit" },
  { label: "5", action: "digit" },
  { label: "6", action: "digit" },
  { label: "-", action: "op", cls: "op" },
  { label: "1", action: "digit" },
  { label: "2", action: "digit" },
  { label: "3", action: "digit" },
  { label: "+", action: "op", cls: "op" },
  { label: "0", action: "digit" },
  { label: ".", action: "digit" },
  { label: "=", action: "equals", cls: "eq" },
];

const SCI_KEYS: { label: string; action?: "digit" | "op" | "clear" | "back" | "equals"; cls?: string }[] = [
  { label: "sin(", action: "digit", cls: "fn" },
  { label: "cos(", action: "digit", cls: "fn" },
  { label: "tan(", action: "digit", cls: "fn" },
  { label: "ln(", action: "digit", cls: "fn" },
  { label: "log(", action: "digit", cls: "fn" },
  { label: "√(", action: "digit", cls: "fn" },
  { label: "^", action: "op", cls: "op" },
  { label: "(", action: "digit", cls: "op" },
  { label: ")", action: "digit", cls: "op" },
  { label: "π", action: "digit", cls: "fn" },
  { label: "C", action: "clear", cls: "danger" },
  { label: "⌫", action: "back", cls: "op" },
  { label: "%", action: "op", cls: "op" },
  { label: "÷", action: "op", cls: "op" },
  { label: "×", action: "op", cls: "op" },
  { label: "7", action: "digit" },
  { label: "8", action: "digit" },
  { label: "9", action: "digit" },
  { label: "-", action: "op", cls: "op" },
  { label: "abs(", action: "digit", cls: "fn" },
  { label: "4", action: "digit" },
  { label: "5", action: "digit" },
  { label: "6", action: "digit" },
  { label: "+", action: "op", cls: "op" },
  { label: "exp(", action: "digit", cls: "fn" },
  { label: "1", action: "digit" },
  { label: "2", action: "digit" },
  { label: "3", action: "digit" },
  { label: ".", action: "digit" },
  { label: "=", action: "equals", cls: "eq" },
  { label: "0", action: "digit" },
];

export default function ExpressionCalculator({ variant }: { variant: "basic" | "sci" }) {
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return;
      if (/^[0-9.+\-*/%()]$/.test(e.key) || e.key === "Enter" || e.key === "Backspace") {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  let preview = "";
  let hasError = false;
  if (expression.trim()) {
    try {
      preview = formatResult(evaluate(expression));
    } catch {
      hasError = true;
    }
  }

  const press = (key: { label: string; action?: string }) => {
    setError("");
    switch (key.action) {
      case "clear":
        setExpression("");
        break;
      case "back":
        setExpression((e) => e.slice(0, -1));
        break;
      case "equals":
        if (!expression.trim()) break;
        try {
          setExpression(formatResult(evaluate(expression)));
        } catch (e) {
          setError(e instanceof Error ? e.message : "Invalid expression");
        }
        break;
      default:
        setExpression((e) => e + key.label);
    }
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const keys = variant === "sci" ? SCI_KEYS : BASIC_KEYS;

  return (
    <div>
      <div className="calc-display">
        <input
          ref={inputRef}
          className="calc-input"
          aria-label="Expression"
          value={expression}
          onChange={(e) => {
            setError("");
            setExpression(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              press({ label: "=", action: "equals" });
            }
          }}
          placeholder={variant === "sci" ? "Type here… e.g. sqrt(16)+2^3" : "Type here… e.g. 25*4+10"}
          autoFocus
          spellCheck={false}
          inputMode="text"
        />
        {preview && preview !== expression.trim() && !hasError && (
          <div className="calc-preview" aria-live="polite">= {preview}</div>
        )}
        {!preview && <div className="calc-preview" aria-hidden>{"\u00A0"}</div>}
      </div>
      {(error || (hasError && expression.trim())) && (
        <p className="error-box">⚠️ {error || "Invalid expression — check parentheses and operators."}</p>
      )}
      <div className={`keypad${variant === "sci" ? " sci" : ""}`}>
        {keys.map((k) => (
          <button key={k.label} type="button" className={k.cls ?? ""} onClick={() => press(k)}>
            {k.label}
          </button>
        ))}
      </div>
      <p className="result-note">
        Type directly with your keyboard (numpad works too) and press Enter, or tap the buttons.
        Supported functions: sin cos tan ln log sqrt abs exp · constants: π e.
      </p>
    </div>
  );
}
