import Link from 'next/link';
import { useProductExpiryStatsQuery } from '@/data/product';
import { Routes } from '@/config/routes';
interface InventoryExpiryBannerProps {
  shopId?: number | string;
  shopSlug?: string;
}

export default function InventoryExpiryBanner({
  shopId,
  shopSlug,
}: InventoryExpiryBannerProps) {
  const { stats, loading } = useProductExpiryStatsQuery({
    shop_id: shopId,
    days_before: 30,
  });

  if (loading || !stats?.total_alerts) {
    return null;
  }

  const href = shopSlug
    ? `/${shopSlug}${Routes.expiryAlerts}`
    : Routes.expiryAlerts;

  return (
    <div className="mb-6 rounded-lg border border-status-processing/30 bg-status-processing/10 px-4 py-4 md:px-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-heading">Drug expiry alerts</p>
          <p className="mt-1 text-sm text-body">
            {stats.expired} expired and {stats.expiring_soon} expiring within{' '}
            {stats.days_before} days need review.
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex h-10 items-center justify-center rounded bg-accent px-4 text-sm font-semibold text-light transition hover:bg-accent-hover"
        >
          View expiry alerts
        </Link>
      </div>
    </div>
  );
}
