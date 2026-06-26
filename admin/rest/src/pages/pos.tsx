import { SearchIcon } from '@/components/icons/search-icon';
import CategoryRail from '@/components/pos/category-rail';
import OrderPanel from '@/components/pos/order-panel';
import PaymentModal from '@/components/pos/payment-modal';
import PosReceiptModal, {
  PosReceiptData,
} from '@/components/pos/pos-receipt';
import ProductGrid from '@/components/pos/product-grid';
import { CustomerSelectHandle } from '@/components/pos/customer-select';
import { usePos } from '@/components/pos/use-pos';
import { Routes } from '@/config/routes';
import { useCategoriesQuery } from '@/data/category';
import { orderClient } from '@/data/client/order';
import { useProductsQuery } from '@/data/product';
import { useMeQuery } from '@/data/user';
import { OrderStatus, PaymentGateway, ProductStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';

const PAGE_LIMIT = 15;

function columnsForWidth(width: number): number {
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  return 2;
}

function Clock() {
  const [now, setNow] = useState<string>('');
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="rounded-md bg-accent/10 px-3 py-1.5 font-mono text-sm font-semibold text-accent">
      {now}
    </span>
  );
}

export default function PosPage() {
  const { locale } = useRouter();
  const controller = usePos();
  const { data: me } = useMeQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<PosReceiptData | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const customerRef = useRef<CustomerSelectHandle>(null);
  const saleSnapshotRef = useRef<PosReceiptData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setSelectedIndex(0);
  }, [debouncedTerm, category]);

  const { categories, loading: categoriesLoading } = useCategoriesQuery({
    limit: 200,
    language: locale,
  });

  const { products, paginatorInfo, loading } = useProductsQuery({
    language: locale,
    status: ProductStatus.Publish,
    name: debouncedTerm,
    categories: category,
    limit: PAGE_LIMIT,
    page,
  });

  const totalPages = paginatorInfo?.lastPage ?? 1;

  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    controller.items.forEach((item) => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [controller.items]);

  const addByIndex = useCallback(
    (index: number) => {
      const product = products[index];
      if (product) {
        controller.addProduct(product);
      }
    },
    [products, controller],
  );

  const openPayment = useCallback(() => {
    if (controller.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setPaymentOpen(true);
  }, [controller.items.length]);

  const { mutate: createOrder, isLoading: creating } = useMutation(
    orderClient.create,
    {
      onSuccess: (data: any) => {
        toast.success('Sale completed successfully');
        const snapshot = saleSnapshotRef.current;
        if (snapshot) {
          setReceiptData({
            ...snapshot,
            orderNumber:
              data?.tracking_number ?? data?.id ?? snapshot.orderNumber,
          });
          setReceiptOpen(true);
        }
        setPaymentOpen(false);
        controller.reset();
        setSelectedIndex(0);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? 'Failed to complete the sale',
        );
      },
    },
  );

  const completeSale = useCallback(
    (tendered: number) => {
      const customerId = controller.customer?.id ?? Number(me?.id);
      if (!customerId) {
        toast.error('Unable to resolve a customer for this sale');
        return;
      }
      const total = controller.totals.total;
      saleSnapshotRef.current = {
        orderNumber: '—',
        items: controller.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: controller.totals.subtotal,
        discount: controller.totals.discountAmount,
        tax: 0,
        total,
        tendered,
        change: Math.max(0, tendered - total),
        customerName: controller.customer?.name ?? 'Walk in Customer',
        cashierName: me?.name,
        createdAt: new Date().toISOString(),
      };
      const payload: any = {
        language: locale,
        customer_id: customerId,
        products: controller.items.map((item) => ({
          product_id: item.id,
          order_quantity: item.quantity,
          unit_price: item.price,
          subtotal: Number((item.price * item.quantity).toFixed(2)),
        })),
        amount: controller.totals.subtotal,
        sales_tax: 0,
        discount: controller.totals.discountAmount,
        delivery_fee: 0,
        total: controller.totals.total,
        paid_total: controller.totals.total,
        payment_gateway: PaymentGateway.CASH,
        order_status: OrderStatus.COMPLETED,
      };
      createOrder(payload);
    },
    [controller, me, locale, createOrder],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const tag = target?.tagName;
      const isInput =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      const isSearch = target === searchRef.current;

      switch (event.key) {
        case 'F2':
          event.preventDefault();
          searchRef.current?.focus();
          searchRef.current?.select();
          return;
        case 'F1':
          event.preventDefault();
          customerRef.current?.open();
          return;
        case 'F4':
          event.preventDefault();
          controller.holdCurrentOrder();
          return;
        case 'F6':
          event.preventDefault();
          controller.reset();
          return;
        case 'F8':
          event.preventDefault();
          openPayment();
          return;
        default:
          break;
      }

      if (paymentOpen) return;

      const navigable = !isInput || isSearch;
      if (!navigable) return;

      const columns = columnsForWidth(window.innerWidth);
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          setSelectedIndex((i) => Math.min(products.length - 1, i + 1));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setSelectedIndex((i) => Math.max(0, i - 1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((i) =>
            Math.min(products.length - 1, i + columns),
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((i) => Math.max(0, i - columns));
          break;
        case 'Enter':
          if (isSearch || !isInput) {
            event.preventDefault();
            addByIndex(selectedIndex);
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    products.length,
    selectedIndex,
    paymentOpen,
    controller,
    openPayment,
    addByIndex,
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      <header className="flex shrink-0 items-center justify-between border-b border-border-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-accent px-2.5 py-1 text-sm font-bold text-white">
            POS
          </span>
          <h1 className="text-base font-semibold text-heading">
            Point of Sale
          </h1>
          <Clock />
        </div>
        <div className="flex items-center gap-3">
          {me?.name ? (
            <span className="hidden text-sm text-body sm:inline">
              Cashier: <span className="font-medium">{me.name}</span>
            </span>
          ) : null}
          <Link
            href={Routes.dashboard}
            className="rounded-md border border-border-200 px-3 py-1.5 text-sm font-medium text-body transition hover:border-accent hover:text-accent"
          >
            Exit to Dashboard
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <CategoryRail
          categories={categories}
          activeSlug={category}
          onSelect={setCategory}
          loading={categoriesLoading}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-border-200 bg-white p-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 flex items-center text-muted ltr:left-3 rtl:right-3">
                <SearchIcon className="h-4 w-4" />
              </span>
              <input
                ref={searchRef}
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products by name… (F2)"
                className="block w-full rounded-lg border border-border-200 bg-gray-50 py-2.5 text-sm text-heading placeholder:text-gray-400 focus:border-accent focus:bg-white focus:outline-none ltr:pl-10 rtl:pr-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <ProductGrid
              products={products}
              loading={loading}
              selectedIndex={selectedIndex}
              quantities={quantities}
              onAdd={controller.addProduct}
              onSelectIndex={setSelectedIndex}
            />
          </div>

          {totalPages > 1 ? (
            <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border-200 bg-white py-2 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-border-200 px-3 py-1 text-body disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-border-200 px-3 py-1 text-body disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </main>

        <div className="w-[360px] shrink-0 border-s border-border-200">
          <OrderPanel
            controller={controller}
            customerRef={customerRef}
            onPay={openPayment}
          />
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        total={controller.totals.total}
        loading={creating}
        onClose={() => setPaymentOpen(false)}
        onConfirm={completeSale}
      />

      <PosReceiptModal
        open={receiptOpen}
        data={receiptData}
        onClose={() => {
          setReceiptOpen(false);
          searchRef.current?.focus();
        }}
        onNewSale={() => {
          setReceiptOpen(false);
          searchRef.current?.focus();
        }}
      />
    </div>
  );
}

PosPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
