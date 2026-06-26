import dayjs from 'dayjs';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import Badge from '@/components/ui/badge/badge';
import {
  useReorderRequestsQuery,
  useReorderStatsQuery,
  useResendReorderNotifyMutation,
  useRunAutoReorderMutation,
} from '@/data/reorder';
import { ReorderRequest, ReorderRequestStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const statusClass: Record<ReorderRequestStatus, string> = {
  [ReorderRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ReorderRequestStatus.NOTIFIED]: 'bg-blue-100 text-blue-800',
  [ReorderRequestStatus.ACKNOWLEDGED]: 'bg-green-100 text-green-800',
  [ReorderRequestStatus.FULFILLED]: 'bg-gray-100 text-gray-800',
  [ReorderRequestStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export default function ReorderRequestsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data: stats } = useReorderStatsQuery();
  const { requests, total, loading, error } = useReorderRequestsQuery({
    page,
    limit: 15,
  });
  const { mutate: runAuto, isLoading: runningAuto } = useRunAutoReorderMutation();
  const { mutate: resendNotify } = useResendReorderNotifyMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <PageHeading title="Reorder Requests" />
          <p className="mt-2 text-sm text-body">
            Automated low-stock reorders sent to suppliers via email and contact message.
          </p>
          {stats ? (
            <p className="mt-2 text-sm text-heading">
              Open alerts: {stats.total_open} ({stats.pending} pending, {stats.notified}{' '}
              notified)
            </p>
          ) : null}
        </div>
        <Button loading={runningAuto} onClick={() => runAuto()}>
          Run Auto Reorder Now
        </Button>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Request Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notified</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request: ReorderRequest) => (
                <tr key={request.id} className="border-b border-dashed">
                  <td className="px-4 py-4">
                    <p className="font-medium text-heading">{request.product_name}</p>
                    <p className="text-xs text-body">SKU: {request.sku ?? '-'}</p>
                  </td>
                  <td className="px-4 py-4">
                    {request.supplier?.company_name ?? `Supplier #${request.supplier_id}`}
                    <p className="text-xs text-body">
                      {request.supplier?.contact_email}
                    </p>
                  </td>
                  <td className="px-4 py-4">{request.current_quantity}</td>
                  <td className="px-4 py-4">{request.requested_quantity}</td>
                  <td className="px-4 py-4">
                    <Badge text={request.status} className={statusClass[request.status]} />
                  </td>
                  <td className="px-4 py-4 text-xs text-body">
                    {request.notified_at
                      ? dayjs(request.notified_at).format('MMM DD, YYYY h:mm A')
                      : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => resendNotify(request.id)}
                    >
                      Resend Alert
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {requests.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">No reorder requests yet.</p>
        ) : null}

        {total > 15 ? (
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
              disabled={page * 15 >= total}
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

ReorderRequestsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ReorderRequestsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table'])),
  },
});
