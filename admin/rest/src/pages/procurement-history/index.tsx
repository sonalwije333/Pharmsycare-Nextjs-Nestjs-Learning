import dayjs from 'dayjs';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  useProcurementHistoryQuery,
  useProcurementStatsQuery,
  useMarkProcurementReceivedMutation,
} from '@/data/procurement';
import { ProcurementRecord, ProcurementStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const LIMIT = 20;

const statusClass: Record<ProcurementStatus, string> = {
  [ProcurementStatus.ORDERED]: 'bg-blue-100 text-blue-800',
  [ProcurementStatus.RECEIVED]: 'bg-green-100 text-green-800',
  [ProcurementStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

function formatRs(value: number | null) {
  if (value == null) return '-';
  return `Rs. ${Number(value).toLocaleString('en-LK')}`;
}

export default function ProcurementHistoryPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: stats } = useProcurementStatsQuery();
  const { records, total, loading, error } = useProcurementHistoryQuery({
    page,
    limit: LIMIT,
    search,
  });
  const { mutate: markReceived } = useMarkProcurementReceivedMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearch(searchText);
    setPage(1);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <PageHeading title="Procurement History" />
            <p className="mt-2 text-sm text-body">
              Record of stock procured from suppliers via fulfilled reorder
              requests.
            </p>
          </div>
          <Search
            onSearch={handleSearch}
            placeholderText="Search product or supplier"
            className="w-full md:w-72"
          />
        </div>
        {stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat label="Total Orders" value={String(stats.total_orders)} />
            <Stat label="Ordered" value={String(stats.ordered)} />
            <Stat label="Received" value={String(stats.received)} />
            <Stat label="Units Procured" value={String(stats.total_quantity)} />
            <Stat label="Total Spend" value={formatRs(stats.total_spend)} />
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record: ProcurementRecord) => (
                <tr key={record.id} className="border-b border-dashed">
                  <td className="px-4 py-4 text-xs text-body">
                    {record.ordered_at
                      ? dayjs(record.ordered_at).format('MMM DD, YYYY')
                      : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-heading">
                      {record.product_name}
                    </p>
                    <p className="text-xs text-body">
                      SKU: {record.sku ?? '-'}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-body">{record.supplier_name}</td>
                  <td className="px-4 py-4 text-heading">{record.quantity}</td>
                  <td className="px-4 py-4 text-body">
                    {formatRs(record.unit_cost)}
                  </td>
                  <td className="px-4 py-4 text-heading">
                    {formatRs(record.total_cost)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      text={record.status}
                      className={statusClass[record.status]}
                    />
                  </td>
                  <td className="px-4 py-4">
                    {record.status === ProcurementStatus.ORDERED ? (
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => markReceived(record.id)}
                      >
                        Mark Received
                      </Button>
                    ) : (
                      <span className="text-xs text-body">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {records.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">
            No procurement records yet.
          </p>
        ) : null}

        {total > LIMIT ? (
          <div className="flex justify-end gap-2 border-t p-4">
            <Button
              size="small"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outline"
              disabled={page * LIMIT >= total}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border-200 p-3">
      <p className="text-xs uppercase text-body">{label}</p>
      <p className="mt-1 text-lg font-semibold text-heading">{value}</p>
    </div>
  );
}

ProcurementHistoryPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ProcurementHistoryPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
