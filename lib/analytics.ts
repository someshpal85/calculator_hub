// Privacy-first analytics event architecture.
// Events are queued as no-ops until a real provider (Plausible/GA4/self-hosted)
// is configured via NEXT_PUBLIC_ANALYTICS_ENDPOINT. No cookies, no PII.

export type AnalyticsEvent =
  | "calculator_view"
  | "calculator_used"
  | "calculator_shared"
  | "calculator_search"
  | "category_view"
  | "page_view";

const ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

export function track(event: AnalyticsEvent, payload: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  if (!ENDPOINT) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, payload);
    }
    return;
  }
  try {
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...payload, ts: Date.now() }),
      keepalive: true,
    });
  } catch {
    // analytics must never break UX
  }
}
