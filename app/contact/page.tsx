import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Reach the CalcSphere team for feedback, corrections and partnership queries.",
  path: "/contact",
});

export default function Contact() {
  return (
    <LegalPage title="Contact">
      <p>We read everything. Typical response time: 2–3 working days.</p>
      <ul>
        <li><strong>General &amp; feedback</strong>: hello@calcsphere.example.com</li>
        <li><strong>Formula corrections</strong>: corrections@calcsphere.example.com — include the calculator name, your inputs and expected result.</li>
        <li><strong>Advertising partnerships</strong>: partners@calcsphere.example.com</li>
        <li><strong>Privacy requests</strong>: privacy@calcsphere.example.com</li>
      </ul>
      <h2>Suggest a calculator</h2>
      <p>
        Tell us the calculation, the formula source you trust, and who needs it. The most-requested
        tools jump the queue.
      </p>
    </LegalPage>
  );
}
