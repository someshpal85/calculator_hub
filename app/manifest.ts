import type { MetadataRoute } from "next";

// Minimal valid Web App Manifest. Relative paths only — no production domain
// dependency. NOTE: presence of this manifest does NOT claim offline support;
// no service worker exists in this phase.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calculator ProHub — Smart Calculators for Everyday Decisions",
    short_name: "Calculator ProHub",
    description:
      "Free online calculators for finance, loans, tax, salary, health, math, education, conversions and everyday life.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#3457ff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
