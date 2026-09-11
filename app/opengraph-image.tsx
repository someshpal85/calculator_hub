import { ImageResponse } from "next/og";

// Static OG image for social sharing. Original branding only — no external
// assets, no embedded URLs (domain-independent by design).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Calculator ProHub — Smart Calculators for Everyday Decisions";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1020 0%, #232c56 60%, #3457ff 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 36,
            background: "linear-gradient(135deg, #3457ff, #9b6cff)",
            fontSize: 84,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          ∑
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: "-2px" }}>
          Calculator ProHub
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#b9c3f0",
            marginTop: 18,
          }}
        >
          Smart Calculators for Everyday Decisions
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#8f9bd4",
            marginTop: 26,
          }}
        >
          Finance · Loans · Tax · Health · Math · Conversions
        </div>
      </div>
    ),
    { ...size },
  );
}
