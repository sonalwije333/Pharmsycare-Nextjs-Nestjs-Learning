import Button from '@/components/ui/button';
import { useSettings } from '@/contexts/settings.context';
import { siteSettings } from '@/settings/site.settings';
import { printElement } from '@/utils/print-element';
import dayjs from 'dayjs';
import { useRef } from 'react';

export interface PosReceiptData {
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  tendered: number;
  change: number;
  customerName: string;
  cashierName?: string;
  createdAt: string;
}

interface PosReceiptModalProps {
  open: boolean;
  data: PosReceiptData | null;
  onClose: () => void;
  onNewSale: () => void;
}

const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  open,
  data,
  onClose,
  onNewSale,
}) => {
  const { siteTitle, currency, currencyOptions, logo } = useSettings();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!open || !data) return null;

  const locale = currencyOptions?.formation ?? siteSettings.defaultLanguage;
  const fractions = currencyOptions?.fractions ?? 2;
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'LKR',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: fractions,
    }).format(Number(amount) || 0);

  const line: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
  };
  const divider: React.CSSProperties = {
    borderTop: '1px dashed #000',
    margin: '8px 0',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border-200 px-5 py-3">
          <h2 className="text-base font-semibold text-heading">
            Sale Complete
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-muted hover:text-heading"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div
            ref={receiptRef}
            style={{
              width: 300,
              margin: '0 auto',
              background: '#fff',
              padding: 16,
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              lineHeight: 1.5,
              color: '#000',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              {logo?.original ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.original}
                  alt={siteTitle}
                  style={{ maxHeight: 44, margin: '0 auto 6px' }}
                />
              ) : null}
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {siteTitle || 'Pharmacy'}
              </div>
              <div style={{ fontSize: 11 }}>Sales Receipt</div>
            </div>

            <div style={divider} />

            <div style={line}>
              <span>Receipt</span>
              <span>#{data.orderNumber}</span>
            </div>
            <div style={line}>
              <span>Date</span>
              <span>{dayjs(data.createdAt).format('MMM DD, YYYY h:mm A')}</span>
            </div>
            {data.cashierName ? (
              <div style={line}>
                <span>Cashier</span>
                <span>{data.cashierName}</span>
              </div>
            ) : null}
            <div style={line}>
              <span>Customer</span>
              <span>{data.customerName}</span>
            </div>

            <div style={divider} />

            <div>
              {data.items.map((item, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  <div>{item.name}</div>
                  <div style={line}>
                    <span>
                      {item.quantity} x {formatMoney(item.price)}
                    </span>
                    <span>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={divider} />

            <div style={line}>
              <span>Subtotal</span>
              <span>{formatMoney(data.subtotal)}</span>
            </div>
            {data.discount > 0 ? (
              <div style={line}>
                <span>Discount</span>
                <span>- {formatMoney(data.discount)}</span>
              </div>
            ) : null}
            {data.tax > 0 ? (
              <div style={line}>
                <span>Tax</span>
                <span>{formatMoney(data.tax)}</span>
              </div>
            ) : null}
            <div
              style={{ ...line, fontWeight: 700, fontSize: 14, marginTop: 4 }}
            >
              <span>TOTAL</span>
              <span>{formatMoney(data.total)}</span>
            </div>

            <div style={divider} />

            <div style={line}>
              <span>Cash</span>
              <span>{formatMoney(data.tendered)}</span>
            </div>
            <div style={line}>
              <span>Change</span>
              <span>{formatMoney(data.change)}</span>
            </div>

            <div style={divider} />

            <div
              style={{ textAlign: 'center', fontSize: 11, marginTop: 6 }}
            >
              <div>Items: {data.items.length}</div>
              <div style={{ marginTop: 6 }}>Thank you for your purchase!</div>
              <div>Get well soon.</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border-200 px-5 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => printElement(receiptRef.current, 'Receipt')}
          >
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onNewSale}>
            New Sale
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PosReceiptModal;
