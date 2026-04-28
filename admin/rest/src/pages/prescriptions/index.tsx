import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { PrescriptionList } from '@/components/prescription/prescription-list';
import { adminOwnerAndStaffOnly, getAuthCredentials, hasAccess, isAuthenticated } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useMeQuery } from '@/data/user';
import { useDeletePrescriptionMutation, useApprovePrescriptionMutation, usePrescriptionsQuery, useRejectPrescriptionMutation } from '@/data/prescription';
import { SortOrder } from '@/types';
import { Routes } from '@/config/routes';

export default function Prescriptions() {
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const { data: me } = useMeQuery();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { prescriptions, paginatorInfo, loading, error } = usePrescriptionsQuery({
    limit: 15,
    page,
    orderBy,
    sortedBy,
  });

  const approveMutation = useApprovePrescriptionMutation();
  const rejectMutation = useRejectPrescriptionMutation();
  const deleteMutation = useDeletePrescriptionMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  if (!hasAccess(adminOwnerAndStaffOnly, permissions)) {
    router.replace(Routes.dashboard);
  }

  function handlePagination(current: any) {
    setPage(current);
  }

  function handleApprove(id: number) {
    const notes = window.prompt('Approval notes (optional)') ?? undefined;
    approveMutation.mutate({ id, staffId: Number(me?.id ?? 0), notes });
  }

  function handleReject(id: number) {
    const notes = window.prompt('Rejection reason (optional)') ?? undefined;
    rejectMutation.mutate({ id, staffId: Number(me?.id ?? 0), notes });
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this prescription?')) {
      deleteMutation.mutate({ id });
    }
  }

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full items-center">
          <PageHeading title={t('form:input-label-prescriptions')} />
        </div>
      </Card>

      <PrescriptionList
        prescriptions={prescriptions}
        pagination={paginatorInfo as any}
        loading={loading}
        onPageChange={handlePagination}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    </>
  );
}

Prescriptions.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
Prescriptions.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common', 'table'])),
  },
});