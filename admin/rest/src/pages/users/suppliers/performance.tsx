import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useSupplierPerformanceQuery } from '@/data/supplier';
import { SupplierPerformance } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

function formatRs(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
}

function formatLeadTime(hours: number | null) {
  if (hours == null) return '-';
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="whitespace-nowrap">
      <span className="text-yellow-500">{'★'.repeat(full)}</span>
      <span className="text-gray-300">{'★'.repeat(Math.max(0, 5 - full))}</span>
      <span className="ms-1 text-xs text-body">{rating.toFixed(1)}</span>
    </span>
  );
}

function rateClass(rate: number) {
  if (rate >= 80) return 'bg-green-100 text-green-800';
  if (rate >= 50) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export default function SupplierPerformancePage() {
  const { t } = useTranslation();
  const { performance, loading, error } = useSupplierPerformanceQuery();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <>
      <Card className="mb-8">
        <PageHeading title="Supplier Performance" />
        <p className="mt-2 text-sm text-body">
          Fulfillment rate, lead time, procurement volume and rating per
          supplier, derived from reorder requests and procurement history.
        </p>
      </Card>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Requests</th>
                <th className="px-4 py-3">Fulfilled</th>
                <th className="px-4 py-3">Open</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Avg Lead Time</th>
                <th className="px-4 py-3">Procured Qty</th>
                <th className="px-4 py-3">Total Spend</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((row: SupplierPerformance) => (
                <tr key={row.supplier_id} className="border-b border-dashed">
                  <td className="px-4 py-4">
                    <p className="font-medium text-heading">
                      {row.company_name}
                    </p>
                    <p className="text-xs text-body">{row.contact_email}</p>
                  </td>
                  <td className="px-4 py-4 text-heading">
                    {row.total_requests}
                  </td>
                  <td className="px-4 py-4 text-body">{row.fulfilled}</td>
                  <td className="px-4 py-4 text-body">{row.open}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${rateClass(
                        row.fulfillment_rate,
                      )}`}
                    >
                      {row.fulfillment_rate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-body">
                    {formatLeadTime(row.avg_lead_time_hours)}
                  </td>
                  <td className="px-4 py-4 text-body">
                    {row.total_procured_quantity}
                  </td>
                  <td className="px-4 py-4 text-heading">
                    {formatRs(row.total_spend)}
                  </td>
                  <td className="px-4 py-4">
                    <Stars rating={row.rating} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {performance.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">
            No supplier performance data yet.
          </p>
        ) : null}
      </Card>
    </>
  );
}

SupplierPerformancePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
SupplierPerformancePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
