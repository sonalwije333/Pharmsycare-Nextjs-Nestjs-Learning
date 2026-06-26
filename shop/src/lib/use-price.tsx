import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSettings } from '@/framework/settings';
import { useDisplayCurrency } from '@/lib/currency/display-currency.context';
import { BASE_CURRENCY } from '@/lib/currency/rates';

export function formatPrice({
  amount,
  currencyCode,
  locale,
  fractions,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
  fractions: number;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: fractions,
  });

  return formatCurrency.format(amount);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
  fractions = 2,
}: {
  baseAmount: number;
  amount: number;
  currencyCode: string;
  locale: string;
  fractions: number;
}) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale, fractions });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale, fractions })
    : null;

  return { price, basePrice, discount };
}

export default function usePrice(
  data?: {
    amount: number;
    baseAmount?: number;
    currencyCode?: string;
  } | null
) {
  const { settings } = useSettings();
  // Catalog prices are stored in the shop's base currency (settings.currency).
  const baseCurrency = settings?.currency ?? BASE_CURRENCY;
  // Active display currency, auto-detected from the visitor's country (or manual override).
  const { currency: display } = useDisplayCurrency();
  const { amount, baseAmount } = { ...data };

  const { locale } = useRouter();
  const value = useMemo(() => {
    if (typeof amount !== 'number') return '';

    // Convert from the base (stored) currency into the visitor's display currency.
    const rate = display.code === baseCurrency ? 1 : display.rate;
    const convertedAmount = amount * rate;
    const convertedBase =
      typeof baseAmount === 'number' ? baseAmount * rate : undefined;

    const currencyCode = display.code;
    const currentLocale = display.locale || 'en';
    const fractionalDigit = display.fractions ?? 2;

    return convertedBase
      ? formatVariantPrice({
        amount: convertedAmount,
        baseAmount: convertedBase,
        currencyCode,
        locale: currentLocale,
        fractions: fractionalDigit,
      })
      : formatPrice({
        amount: convertedAmount,
        currencyCode,
        locale: currentLocale,
        fractions: fractionalDigit,
      });
  }, [amount, baseAmount, display, baseCurrency, locale]);

  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}
