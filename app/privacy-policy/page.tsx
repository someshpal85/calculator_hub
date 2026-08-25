import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "CalcSphere's privacy-first approach: calculations run in your browser; no accounts, no stored inputs.",
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        CalcSphere is engineered so that we <em>cannot</em> misuse your data — because we don&apos;t
        collect it in the first place.
      </p>
      <h2>What happens to numbers you enter</h2>
      <p>
        All calculations run locally in your browser via JavaScript. Your inputs are never sent to
        our servers for processing. When you use &quot;Copy link&quot;, your input values are encoded
        into the URL itself — that link lives wherever you share it (chat apps, email), not on our
        systems. Avoid putting sensitive personal information into shared links.
      </p>
      <h2>Accounts</h2>
      <p>There are none. You can use every feature without registering anywhere.</p>
      <h2>Cookies &amp; local storage</h2>
      <ul>
        <li><strong>Theme preference</strong> is saved in your browser&apos;s local storage.</li>
        <li><strong>Analytics</strong>: when enabled, we collect aggregate, cookie-less event counts (e.g. &quot;calculator_used&quot;) without identifiers or inputs.</li>
        <li><strong>Advertising</strong>, once enabled, may involve third-party ad networks setting cookies under their own policies. See our Cookie Policy for details.</li>
      </ul>
      <h2>Third-party services</h2>
      <p>
        The currency converter fetches public ECB exchange rates via frankfurter.dev at your
        request. This request goes directly from your browser and contains only the currency codes —
        not your amounts.
      </p>
      <h2>Contact</h2>
      <p>Privacy questions: privacy@calcsphere.example.com</p>
    </LegalPage>
  );
}
