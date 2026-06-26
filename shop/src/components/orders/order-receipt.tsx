import dayjs from 'dayjs';
import { forwardRef } from 'react';

interface OrderReceiptProps {
  order: any;
  settings: any;
}

const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(
  ({ order, settings }, ref) => {
    const currency = settings?.currency || 'LKR';
    const locale = settings?.currencyOptions?.formation || 'en-LK';
    const fractions = settings?.currencyOptions?.fractions ?? 2;

    const formatMoney = (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: fractions,
      }).format(Number(amount) || 0);

    const products = order?.products ?? [];
    const address =
      settings?.contactDetails?.location?.formattedAddress ?? '';
    const contact = settings?.contactDetails?.contact ?? '';

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
      <div
        ref={ref}
        style={{
          width: 320,
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
          {settings?.logo?.original ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo.original}
              alt={settings?.siteTitle || 'Pharmacy'}
              style={{ maxHeight: 46, margin: '0 auto 6px' }}
            />
          ) : null}
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {settings?.siteTitle || 'Pharmacy'}
          </div>
          {address ? <div style={{ fontSize: 10 }}>{address}</div> : null}
          {contact ? <div style={{ fontSize: 10 }}>{contact}</div> : null}
          <div style={{ fontSize: 11, marginTop: 4 }}>Online Order Receipt</div>
        </div>

        <div style={divider} />

        <div style={line}>
          <span>Order</span>
          <span>#{order?.tracking_number}</span>
        </div>
        <div style={line}>
          <span>Date</span>
          <span>
            {order?.created_at
              ? dayjs(order.created_at).format('MMM DD, YYYY h:mm A')
              : dayjs().format('MMM DD, YYYY h:mm A')}
          </span>
        </div>
        <div style={line}>
          <span>Customer</span>
          <span>{order?.customer_name ?? '-'}</span>
        </div>
        <div style={line}>
          <span>Payment</span>
          <span>{order?.payment_gateway ?? 'N/A'}</span>
        </div>
        {order?.payment_status ? (
          <div style={line}>
            <span>Status</span>
            <span style={{ textTransform: 'capitalize' }}>
              {String(order.payment_status).replace(/^payment-/, '')}
            </span>
          </div>
        ) : null}

        <div style={divider} />

        <div>
          {products.map((product: any, index: number) => {
            const qty = Number(product?.pivot?.order_quantity ?? 0);
            const unit = Number(product?.pivot?.unit_price ?? 0);
            const sub = Number(product?.pivot?.subtotal ?? unit * qty);
            return (
              <div key={index} style={{ marginBottom: 4 }}>
                <div>{product?.name}</div>
                <div style={line}>
                  <span>
                    {qty} x {formatMoney(unit)}
                  </span>
                  <span>{formatMoney(sub)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={divider} />

        <div style={line}>
          <span>Subtotal</span>
          <span>{formatMoney(Number(order?.amount ?? 0))}</span>
        </div>
        {Number(order?.delivery_fee ?? 0) > 0 ? (
          <div style={line}>
            <span>Shipping</span>
            <span>{formatMoney(Number(order?.delivery_fee ?? 0))}</span>
          </div>
        ) : null}
        {Number(order?.sales_tax ?? 0) > 0 ? (
          <div style={line}>
            <span>Tax</span>
            <span>{formatMoney(Number(order?.sales_tax ?? 0))}</span>
          </div>
        ) : null}
        {Number(order?.discount ?? 0) > 0 ? (
          <div style={line}>
            <span>Discount</span>
            <span>- {formatMoney(Number(order?.discount ?? 0))}</span>
          </div>
        ) : null}
        <div style={{ ...line, fontWeight: 700, fontSize: 14, marginTop: 4 }}>
          <span>TOTAL</span>
          <span>{formatMoney(Number(order?.paid_total ?? 0))}</span>
        </div>

        <div style={divider} />

        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 6 }}>
          <div>Items: {products.length}</div>
          <div style={{ marginTop: 6 }}>Thank you for shopping with us!</div>
          <div>Get well soon.</div>
        </div>
      </div>
    );
  },
);

OrderReceipt.displayName = 'OrderReceipt';

export default OrderReceipt;
