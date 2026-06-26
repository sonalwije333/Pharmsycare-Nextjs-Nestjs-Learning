import { useSettings } from '@/contexts/settings.context';
import { siteSettings } from '@/settings/site.settings';
import { formatPrice } from '@/utils/use-price';
import { useCallback } from 'react';

export function usePosMoney() {
  const { currency, currencyOptions } = useSettings();
  const { formation, fractions } = currencyOptions;
  const locale = formation ?? siteSettings.defaultLanguage;

  return useCallback(
    (amount: number) =>
      formatPrice({
        amount: Number(amount) || 0,
        currencyCode: currency,
        locale,
        fractions,
      }),
    [currency, locale, fractions],
  );
}
