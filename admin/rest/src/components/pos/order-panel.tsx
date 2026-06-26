import Button from '@/components/ui/button';
import { TrashIcon } from '@/components/icons/trash';
import cn from 'classnames';
import { Ref, useState } from 'react';
import CustomerSelect, { CustomerSelectHandle } from './customer-select';
import { PosController } from './use-pos';
import { usePosMoney } from './use-pos-money';

interface OrderPanelProps {
  controller: PosController;
  customerRef: Ref<CustomerSelectHandle>;
  onPay: () => void;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  controller,
  customerRef,
  onPay,
}) => {
  const money = usePosMoney();
  const [showHeld, setShowHeld] = useState(false);
  const {
    items,
    customer,
    setCustomer,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    increment,
    decrement,
    setQuantity,
    removeItem,
    reset,
    totals,
    heldOrders,
    holdCurrentOrder,
    restoreHeldOrder,
    removeHeldOrder,
  } = controller;

  const isEmpty = items.length === 0;

  return (
    <section className="flex h-full w-full flex-col bg-white">
      <header className="flex items-center justify-between border-b border-border-200 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-heading">Order List</h2>
          <p className="text-xs text-muted">
            {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeld((value) => !value)}
              className="rounded-md border border-border-200 px-2.5 py-1.5 text-xs font-medium text-body transition hover:border-accent hover:text-accent"
            >
              Held ({heldOrders.length})
            </button>
            {showHeld ? (
              <div className="absolute end-0 z-30 mt-1 w-72 overflow-hidden rounded-lg border border-border-200 bg-white shadow-lg">
                {heldOrders.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-muted">
                    No held orders
                  </p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto py-1 text-sm">
                    {heldOrders.map((order) => (
                      <li
                        key={order.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            restoreHeldOrder(order.id);
                            setShowHeld(false);
                          }}
                          className="flex flex-1 flex-col text-left"
                        >
                          <span className="font-medium text-heading">
                            {order.reference}
                          </span>
                          <span className="text-xs text-muted">
                            {order.items.length} items ·{' '}
                            {order.customer?.name ?? 'Walk in Customer'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHeldOrder(order.id)}
                          className="text-muted hover:text-red-500"
                          aria-label="Delete held order"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={isEmpty}
            className={cn(
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition',
              isEmpty
                ? 'cursor-not-allowed text-muted'
                : 'text-red-500 hover:bg-red-50',
            )}
          >
            Clear all
          </button>
        </div>
      </header>

      <div className="border-b border-border-200 p-4">
        <CustomerSelect
          ref={customerRef}
          customer={customer}
          onChange={setCustomer}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-muted">
            <span className="mb-1 text-base font-semibold text-heading">
              Cart is empty
            </span>
            Click a product or press Enter to add it.
          </div>
        ) : (
          <ul className="divide-y divide-border-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted">
                    {money(item.price)}
                    {item.unit ? ` · ${item.unit}` : ''}
                  </p>
                </div>
                <div className="flex items-center rounded-md border border-border-200">
                  <button
                    type="button"
                    onClick={() => decrement(item.id)}
                    className="flex h-7 w-7 items-center justify-center text-heading hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    value={item.quantity}
                    onChange={(event) => {
                      const next = parseInt(event.target.value, 10);
                      setQuantity(item.id, Number.isNaN(next) ? 1 : next);
                    }}
                    inputMode="numeric"
                    className="h-7 w-9 border-x border-border-200 text-center text-sm text-heading focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => increment(item.id)}
                    className="flex h-7 w-7 items-center justify-center text-heading hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="w-20 text-right text-sm font-semibold text-heading">
                  {money(item.price * item.quantity)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-muted hover:text-red-500"
                  aria-label="Remove item"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-medium text-muted">Discount</span>
          <div className="flex overflow-hidden rounded-md border border-border-200">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium',
                discountType === 'percent'
                  ? 'bg-accent text-white'
                  : 'text-body hover:bg-gray-50',
              )}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('flat')}
              className={cn(
                'px-2.5 py-1 text-xs font-medium',
                discountType === 'flat'
                  ? 'bg-accent text-white'
                  : 'text-body hover:bg-gray-50',
              )}
            >
              Rs
            </button>
          </div>
          <input
            value={discountValue || ''}
            onChange={(event) => {
              const next = parseFloat(event.target.value);
              setDiscountValue(Number.isNaN(next) ? 0 : next);
            }}
            inputMode="decimal"
            placeholder="0"
            className="h-8 flex-1 rounded-md border border-border-200 px-2 text-right text-sm text-heading focus:border-accent focus:outline-none"
          />
        </div>

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between text-body">
            <dt>Subtotal</dt>
            <dd>{money(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-body">
            <dt>Discount</dt>
            <dd className="text-red-500">- {money(totals.discountAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-border-200 pt-2 text-base font-bold text-heading">
            <dt>Total</dt>
            <dd className="text-accent">{money(totals.total)}</dd>
          </div>
        </dl>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="small"
            disabled={isEmpty}
            onClick={holdCurrentOrder}
          >
            Hold (F4)
          </Button>
          <Button
            variant="outline"
            size="small"
            disabled={isEmpty}
            onClick={reset}
          >
            Void (F6)
          </Button>
          <Button
            className="col-span-2 h-12 text-base"
            disabled={isEmpty}
            onClick={onPay}
          >
            Payment {money(totals.total)} (F8)
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrderPanel;
