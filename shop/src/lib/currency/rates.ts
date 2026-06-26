// Base currency the catalog prices are stored in (matches settings.currency).
export const BASE_CURRENCY = 'LKR';

export type CurrencyMeta = {
  code: string;
  /** Units of this currency per 1 unit of BASE_CURRENCY (LKR). */
  rate: number;
  /** Locale used for number grouping when formatting. */
  locale: string;
  /** Preferred max fraction digits for this currency. */
  fractions: number;
  label: string;
};

// Static FX table (approximate). Update these as needed; no live API call is made.
// rate = how many of `code` equal 1 LKR.
export const CURRENCIES: Record<string, CurrencyMeta> = {
  LKR: { code: 'LKR', rate: 1, locale: 'en-LK', fractions: 2, label: 'Sri Lanka (Rs)' },
  USD: { code: 'USD', rate: 0.0033, locale: 'en-US', fractions: 2, label: 'United States ($)' },
  EUR: { code: 'EUR', rate: 0.0031, locale: 'de-DE', fractions: 2, label: 'Euro (€)' },
  GBP: { code: 'GBP', rate: 0.0026, locale: 'en-GB', fractions: 2, label: 'United Kingdom (£)' },
  INR: { code: 'INR', rate: 0.28, locale: 'en-IN', fractions: 2, label: 'India (₹)' },
  AUD: { code: 'AUD', rate: 0.0051, locale: 'en-AU', fractions: 2, label: 'Australia (A$)' },
  CAD: { code: 'CAD', rate: 0.0046, locale: 'en-CA', fractions: 2, label: 'Canada (C$)' },
  AED: { code: 'AED', rate: 0.012, locale: 'en-AE', fractions: 2, label: 'UAE (د.إ)' },
  SGD: { code: 'SGD', rate: 0.0044, locale: 'en-SG', fractions: 2, label: 'Singapore (S$)' },
  JPY: { code: 'JPY', rate: 0.5, locale: 'ja-JP', fractions: 0, label: 'Japan (¥)' },
  PKR: { code: 'PKR', rate: 0.93, locale: 'en-PK', fractions: 0, label: 'Pakistan (Rs)' },
  NPR: { code: 'NPR', rate: 0.44, locale: 'en-NP', fractions: 2, label: 'Nepal (Rs)' },
};

// Map of country (region) code -> currency code.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  LK: 'LKR',
  US: 'USD',
  GB: 'GBP',
  IN: 'INR',
  AU: 'AUD',
  CA: 'CAD',
  AE: 'AED',
  SG: 'SGD',
  JP: 'JPY',
  PK: 'PKR',
  NP: 'NPR',
  // Eurozone
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR',
};

export function currencyForCountry(country?: string | null): string | undefined {
  if (!country) return undefined;
  return COUNTRY_TO_CURRENCY[country.toUpperCase()];
}

/** Detect the visitor's currency from the browser locale. Client-side only. */
export function detectCurrencyFromBrowser(): string {
  if (typeof navigator === 'undefined') return BASE_CURRENCY;
  const langs =
    (navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language]) || [];
  for (const lang of langs) {
    if (!lang) continue;
    // e.g. "en-US" -> region "US"
    const parts = lang.split('-');
    const region = parts.length > 1 ? parts[parts.length - 1] : '';
    const cur = currencyForCountry(region);
    if (cur && CURRENCIES[cur]) return cur;
  }
  return BASE_CURRENCY;
}

export function convertFromBase(amount: number, currencyCode: string): number {
  const meta = CURRENCIES[currencyCode] ?? CURRENCIES[BASE_CURRENCY];
  return amount * meta.rate;
}
