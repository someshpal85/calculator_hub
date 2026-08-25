// Minimal i18n architecture. English today; Hindi strings slot into the same
// dictionary shape so components never hardcode user-facing chrome text.

export type Locale = "en" | "hi";

type Dict = Record<string, string>;

const en: Dict = {
  "brand.tagline": "Smart Calculators for Everyday Decisions",
  "nav.home": "Home",
  "nav.all": "All Calculators",
  "nav.popular": "Popular",
  "search.placeholder": "Search calculators… (try “emi”, “gst”, “bmi”, “कर्ज”)",
  "calc.reset": "Reset",
  "calc.copyResult": "Copy result",
  "calc.copyLink": "Copy link",
  "calc.share": "Share",
  "calc.whatsapp": "WhatsApp",
  "calc.telegram": "Telegram",
  "calc.formula": "Formula",
  "calc.howToUse": "How to use",
  "calc.faq": "Frequently Asked Questions",
  "calc.related": "Related Calculators",
  "calc.example": "Example",
  "directory.count": "{n} calculators",
};

const hi: Partial<Dict> = {
  "brand.tagline": "रोज़मर्रा के फ़ैसलों के लिए स्मार्ट कैलकुलेटर",
  "nav.home": "होम",
  "nav.all": "सभी कैलकुलेटर",
  "nav.popular": "लोकप्रिय",
  "search.placeholder": "कैलकुलेटर खोजें… (जैसे “emi”, “gst”, “bmi”)",
  "calc.reset": "रीसेट",
  "calc.copyResult": "नतीजा कॉपी करें",
  "calc.copyLink": "लिंक कॉपी करें",
  "calc.share": "शेयर करें",
  "calc.whatsapp": "व्हाट्सऐप",
  "calc.telegram": "टेलीग्राम",
  "calc.formula": "फ़ॉर्मूला",
  "calc.howToUse": "कैसे इस्तेमाल करें",
  "calc.faq": "अक्सर पूछे जाने वाले सवाल",
  "calc.related": "संबंधित कैलकुलेटर",
  "calc.example": "उदाहरण",
  "directory.count": "{n} कैलकुलेटर",
};

const DICTS: Record<Locale, Partial<Dict>> = { en, hi };

export function t(key: string, locale: Locale = "en", vars?: Record<string, string | number>): string {
  let s = DICTS[locale][key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  }
  return s;
}
