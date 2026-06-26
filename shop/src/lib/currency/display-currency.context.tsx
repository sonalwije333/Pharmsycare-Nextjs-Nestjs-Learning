import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BASE_CURRENCY,
  CURRENCIES,
  CurrencyMeta,
  detectCurrencyFromBrowser,
} from './rates';

const STORAGE_KEY = 'pharmsy_display_currency';

type DisplayCurrencyContextValue = {
  /** Active display currency meta (code, rate, locale, fractions). */
  currency: CurrencyMeta;
  /** All selectable currencies. */
  currencies: CurrencyMeta[];
  /** Whether the user manually picked a currency (vs auto-detected). */
  isManual: boolean;
  /** Override the display currency and persist the choice. */
  setCurrency: (code: string) => void;
  /** Clear the override and fall back to auto-detection. */
  resetCurrency: () => void;
};

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue | undefined>(
  undefined,
);

export const DisplayCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Start from the base currency so SSR and first client paint match (no hydration mismatch).
  const [code, setCode] = useState<string>(BASE_CURRENCY);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && CURRENCIES[stored]) {
        setCode(stored);
        setIsManual(true);
        return;
      }
    } catch {
      // ignore storage access errors
    }
    setCode(detectCurrencyFromBrowser());
  }, []);

  const setCurrency = useCallback((next: string) => {
    if (!CURRENCIES[next]) return;
    setCode(next);
    setIsManual(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const resetCurrency = useCallback(() => {
    setIsManual(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setCode(detectCurrencyFromBrowser());
  }, []);

  const value = useMemo<DisplayCurrencyContextValue>(
    () => ({
      currency: CURRENCIES[code] ?? CURRENCIES[BASE_CURRENCY],
      currencies: Object.values(CURRENCIES),
      isManual,
      setCurrency,
      resetCurrency,
    }),
    [code, isManual, setCurrency, resetCurrency],
  );

  return (
    <DisplayCurrencyContext.Provider value={value}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
};

export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const ctx = useContext(DisplayCurrencyContext);
  if (!ctx) {
    // Safe fallback so the hook works even outside the provider (e.g. tests).
    return {
      currency: CURRENCIES[BASE_CURRENCY],
      currencies: Object.values(CURRENCIES),
      isManual: false,
      setCurrency: () => {},
      resetCurrency: () => {},
    };
  }
  return ctx;
}
