import cn from 'classnames';
import { useDisplayCurrency } from '@/lib/currency/display-currency.context';

const CurrencySwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { currency, currencies, setCurrency } = useDisplayCurrency();

  return (
    <label className={cn('relative inline-flex items-center', className)}>
      <span className="sr-only">Select currency</span>
      <select
        value={currency.code}
        onChange={(e) => setCurrency(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-border-200 bg-light py-0 pe-7 ps-3 text-sm font-medium text-heading outline-none transition-colors hover:border-accent focus:border-accent focus:ring-1 focus:ring-accent"
        aria-label="Currency"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute h-3 w-3 text-body ltr:right-2.5 rtl:left-2.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </label>
  );
};

export default CurrencySwitcher;
