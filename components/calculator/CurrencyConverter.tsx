"use client";

import { useState } from "react";

const CURRENCIES = [
  "USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY", "HKD",
  "SGD", "NZD", "KRW", "SEK", "NOK", "DKK", "ZAR", "BRL", "MXN", "AED",
  "SAR", "TRY", "PLN", "THB", "IDR", "MYR", "PHP",
];

export default function CurrencyConverterWidget() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [result, setResult] = useState<string | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convert = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
      if (!res.ok) throw new Error("Could not fetch exchange rates. Try again shortly.");
      const data = await res.json();
      const r: number | undefined = data.rates?.[to];
      if (!r) throw new Error(`${from} → ${to} rate not available from the ECB feed.`);
      setRate(r);
      setDate(data.date);
      const a = parseFloat(amount);
      if (Number.isNaN(a) || a < 0) throw new Error("Enter a valid amount.");
      setResult(a.toLocaleString("en-US", { maximumFractionDigits: 2 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="field">
        <label htmlFor="cc-amount">Amount</label>
        <input id="cc-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="cc-from">From</label>
          <select id="cc-from" value={from} onChange={(e) => setFrom(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cc-to">To</label>
          <select id="cc-to" value={to} onChange={(e) => setTo(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <button onClick={convert} disabled={loading} type="button">
        {loading ? "Fetching live rate…" : `Convert ${from} → ${to}`}
      </button>

      {error && <p className="error-box">⚠️ {error}</p>}

      {result && (
        <>
          <div style={{ height: 14 }} />
          <div className="result-main">
            <div className="label">{parseFloat(amount).toLocaleString()} {from} equals</div>
            <div className="value">{result} {to}</div>
          </div>
          {rate !== null && date && (
            <p className="result-note">
              Rate source: European Central Bank (via frankfurter.dev) · 1 {from} = {rate} {to} · rates dated {date}. Mid-market rates exclude bank/transfer fees.
            </p>
          )}
        </>
      )}
    </div>
  );
}
