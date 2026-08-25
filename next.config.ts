import type { NextConfig } from "next";

const OLD_TO_NEW: Record<string, string> = {
  "/emi": "/calculator/emi-calculator",
  "/sip": "/calculator/sip-calculator",
  "/fd": "/calculator/fd-calculator",
  "/rd": "/calculator/rd-calculator",
  "/simple-interest": "/calculator/simple-interest-calculator",
  "/compound-interest": "/calculator/compound-interest-calculator",
  "/mortgage": "/calculator/emi-calculator",
  "/gst": "/calculator/gst-calculator",
  "/salary": "/calculator/salary-calculator",
  "/percentage": "/calculator/percentage-calculator",
  "/basic": "/calculator/basic-calculator",
  "/scientific": "/calculator/scientific-calculator",
  "/bmi": "/calculator/bmi-calculator",
  "/bmr": "/calculator/bmr-calculator",
  "/calorie": "/calculator/tdee-calculator",
  "/age": "/calculator/age-calculator",
  "/dob": "/calculator/age-calculator",
  "/date-difference": "/calculator/date-difference-calculator",
  "/time": "/calculator/time-difference-calculator",
  "/unit-converter": "/calculator/length-converter",
  "/fuel-cost": "/calculator/fuel-cost-calculator",
  "/discount": "/calculator/discount-calculator",
  "/currency-converter": "/calculator/currency-converter",
};

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return Object.entries(OLD_TO_NEW).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
