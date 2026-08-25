import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="text-center" style={{ padding: "80px 0" }}>
      <div style={{ fontSize: 64 }}>🧮</div>
      <h1>404 — This calculation doesn&apos;t exist</h1>
      <p className="subtitle" style={{ margin: "10px auto 24px" }}>
        The page you&apos;re looking for moved or never existed. Try one of our popular calculators instead:
      </p>
      <div className="pill-row" style={{ justifyContent: "center" }}>
        <Link href="/calculator/emi-calculator" className="btn secondary">🏦 EMI</Link>
        <Link href="/calculator/sip-calculator" className="btn secondary">📆 SIP</Link>
        <Link href="/calculator/gst-calculator" className="btn secondary">🧾 GST</Link>
        <Link href="/calculator/bmi-calculator" className="btn secondary">⚖️ BMI</Link>
        <Link href="/calculators" className="btn">Browse all →</Link>
      </div>
    </div>
  );
}
