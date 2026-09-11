"use client";

import ExpressionCalculator from "@/components/calculator/ExpressionCalculator";

export default function HomeCalculator() {
  return (
    <section aria-labelledby="home-calc-h" style={{ marginTop: 22 }}>
      <h2 id="home-calc-h" style={{ margin: "0 0 12px", fontSize: 18 }}>🧮 Quick Calculators</h2>
      <div className="home-calc-grid">
        <div className="panel home-calc-compact">
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Basic</h3>
          <ExpressionCalculator variant="basic" />
        </div>
        <div className="panel home-calc-compact">
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Scientific</h3>
          <ExpressionCalculator variant="sci" />
        </div>
      </div>
    </section>
  );
}
