import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { OrderTrackingList } from '@/components/order-tracking/order-tracking-list';
import { adminOwnerAndStaffOnly, getAuthCredentials, hasAccess } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMeQuery } from '@/data/user';
import { useDeleteOrderTrackingMutation, useOrderTrackingsQuery, useUpdateOrderTrackingStatusMutation } from '@/data/order-tracking';
import { SortOrder } from '@/types';
import { Routes } from '@/config/routes';

export default function OrderTrackingPage() {
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: me } = useMeQuery();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { orderTrackings, paginatorInfo, loading, error } = useOrderTrackingsQuery({
    limit: 15,
    page,
    orderBy,
    sortedBy,
  });

  const updateMutation = useUpdateOrderTrackingStatusMutation();
  const deleteMutation = useDeleteOrderTrackingMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (!hasAccess(adminOwnerAndStaffOnly, permissions)) {
    router.replace(Routes.dashboard);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  function handleEdit(id: number) {
    const status = window.prompt('Enter tracking status') ?? '';
    if (!status) return;
    const notes = window.prompt('Update notes (optional)') ?? undefined;
    updateMutation.mutate({ id, status, staffId: Number(me?.id ?? 0), notes });
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this tracking record?')) {
      deleteMutation.mutate({ id });
    }
  }

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full items-center">
          <PageHeading title={t('form:input-label-order-tracking')} />
        </div>
      </Card>

      <OrderTrackingList
        trackings={orderTrackings}
        pagination={paginatorInfo as any}
        loading={loading}
        onPageChange={handlePagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}

OrderTrackingPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
OrderTrackingPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});