import Button from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePosMoney } from './use-pos-money';

interface PaymentModalProps {
  open: boolean;
  total: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (tendered: number) => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  total,
  loading,
  onClose,
  onConfirm,
}) => {
  const money = usePosMoney();
  const [tendered, setTendered] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTendered(String(total));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 20);
    }
  }, [open, total]);

  const tenderedNumber = parseFloat(tendered) || 0;
  const change = useMemo(
    () => Math.max(0, tenderedNumber - total),
    [tenderedNumber, total],
  );
  const isValid = tenderedNumber >= total && !loading;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
        if (event.key === 'Enter' && isValid) {
          event.stopPropagation();
          event.preventDefault();
          onConfirm(tenderedNumber);
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-heading">Payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-muted hover:text-heading"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-lg bg-accent/10 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted">
              Amount due
            </p>
            <p className="text-3xl font-bold text-accent">{money(total)}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Cash received
            </label>
            <input
              ref={inputRef}
              value={tendered}
              onChange={(event) => setTendered(event.target.value)}
              inputMode="decimal"
              className="block w-full rounded-lg border border-border-200 px-4 py-3 text-right text-2xl font-semibold text-heading focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setTendered(String(total))}
              className="rounded-md border border-border-200 py-2 text-xs font-medium text-body hover:border-accent hover:text-accent"
            >
              Exact
            </button>
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTendered(String(amount))}
                className="rounded-md border border-border-200 py-2 text-xs font-medium text-body hover:border-accent hover:text-accent"
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <span className="text-sm font-medium text-body">Change</span>
            <span className="text-xl font-bold text-heading">
              {money(change)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border-200 px-5 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel (Esc)
          </Button>
          <Button
            className="flex-1"
            disabled={!isValid}
            loading={loading}
            onClick={() => onConfirm(tenderedNumber)}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
