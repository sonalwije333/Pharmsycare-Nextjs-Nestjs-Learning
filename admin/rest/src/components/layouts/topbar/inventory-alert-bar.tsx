import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import cn from 'classnames';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Warning } from '@/components/icons/warning';
import { useProductExpiryQuery, useProductExpiryStatsQuery } from '@/data/product';
import { useReorderRequestsQuery, useReorderStatsQuery } from '@/data/reorder';
import { ProductExpiryStatus } from '@/types';
import { Routes } from '@/config/routes';

type InventoryAlertBarProps = {
  shopId?: number | string;
  shopSlug?: string;
};

export default function InventoryAlertBar({
  shopId,
  shopSlug,
}: InventoryAlertBarProps) {
  const router = useRouter();

  const { stats: expiryStats } = useProductExpiryStatsQuery({
    shop_id: shopId,
    days_before: 30,
  });

  const { products } = useProductExpiryQuery({
    shop_id: shopId,
    limit: 5,
    page: 1,
    days_before: 30,
  });

  const { data: reorderStats } = useReorderStatsQuery();
  const { requests } = useReorderRequestsQuery({ page: 1, limit: 5 });

  const expiryCount = expiryStats?.total_alerts ?? 0;
  const reorderCount = reorderStats?.total_open ?? 0;
  const totalAlerts = expiryCount + reorderCount;
  const hasExpired = (expiryStats?.expired ?? 0) > 0;
  const hasUrgent = hasExpired || reorderCount > 0;

  const expiryHref = shopSlug
    ? `/${shopSlug}${Routes.expiryAlerts}`
    : Routes.expiryAlerts;

  const handleOpenExpiryAlerts = () => {
    router.push(expiryHref);
  };

  return (
    <Menu as="div" className="relative inline-block text-left sm:relative">
      <Menu.Button
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 focus:outline-none data-[headlessui-state=open]:bg-white data-[headlessui-state=open]:text-accent',
          totalAlerts > 0 ? 'text-status-processing' : null,
        )}
        aria-label="Inventory alerts"
      >
        <Warning className="h-5 w-5" />
        {totalAlerts > 0 ? (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white',
              hasUrgent ? 'bg-status-failed' : 'bg-[#F5A623]',
            )}
          >
            {totalAlerts > 9 ? '9+' : totalAlerts}
          </span>
        ) : null}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute top-16 z-30 w-80 rounded-lg border border-gray-200 bg-white shadow-box end-2 origin-top-end focus:outline-none sm:top-12 sm:mt-0.5 sm:end-0 lg:top-14 lg:mt-0">
          <div className="flex items-center justify-between rounded-tl-lg rounded-tr-lg border-b border-gray-200/80 px-6 py-4 font-medium">
            <span>Inventory Alerts</span>
            {totalAlerts > 0 ? (
              <span className="text-xs font-medium text-body">
                {expiryCount} expiry · {reorderCount} reorder
              </span>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {expiryCount > 0 ? (
              <div>
                <p className="bg-gray-50 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-body">
                  Drug Expiry
                </p>
                {products.map((product) => {
                  const isExpired =
                    product.expiry_status === ProductExpiryStatus.EXPIRED;

                  return (
                    <Menu.Item key={`expiry-${product.id}`}>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={handleOpenExpiryAlerts}
                          className={cn(
                            'w-full border-b border-dashed border-[#E5E5E5] px-6 py-3.5 text-left',
                            active ? 'bg-gray-50' : null,
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-heading">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-body">
                                {product.expiry_date
                                  ? `Expires ${dayjs(product.expiry_date).format('MMM DD, YYYY')}`
                                  : 'No expiry date'}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'shrink-0 rounded px-2 py-1 text-[10px] font-semibold capitalize',
                                isExpired
                                  ? 'bg-status-failed/10 text-status-failed'
                                  : 'bg-status-processing/10 text-status-processing',
                              )}
                            >
                              {isExpired
                                ? 'Expired'
                                : `${product.days_until_expiry}d left`}
                            </span>
                          </div>
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </div>
            ) : null}

            {reorderCount > 0 ? (
              <div>
                <p className="bg-gray-50 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-body">
                  Low Stock Reorder
                </p>
                {requests.map((request) => (
                  <Menu.Item key={`reorder-${request.id}`}>
                    {({ active }) => (
                      <div
                        className={cn(
                          'border-b border-dashed px-6 py-3.5 text-sm last:border-b-0',
                          active ? 'bg-gray-50' : null,
                        )}
                      >
                        <p className="font-medium text-heading">{request.product_name}</p>
                        <p className="mt-1 text-xs text-body">
                          Stock {request.current_quantity} → reorder{' '}
                          {request.requested_quantity}
                        </p>
                        <p className="mt-1 text-xs capitalize text-body">{request.status}</p>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
            ) : null}

            {totalAlerts === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-body">
                No inventory alerts right now.
              </p>
            ) : null}
          </div>

          {totalAlerts > 0 ? (
            <div className="border-t border-gray-200/80">
              {expiryCount > 0 ? (
                <Link
                  href={expiryHref}
                  className="block p-3 text-center text-sm font-medium text-accent hover:text-accent-hover"
                >
                  View expiry alerts
                </Link>
              ) : null}
              {reorderCount > 0 ? (
                <Link
                  href={Routes.reorderRequests}
                  className={cn(
                    'block p-3 text-center text-sm font-medium text-accent hover:text-accent-hover',
                    expiryCount > 0 ? 'border-t border-gray-200/80' : null,
                  )}
                >
                  View reorder requests
                </Link>
              ) : null}
            </div>
          ) : null}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
