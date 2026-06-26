import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import AdminsList from '@/components/user/user-admin-list';
import { useSuppliersUserQuery } from '@/data/user';
import { SortOrder } from '@/types';
import { adminOnly } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LinkButton from '@/components/ui/link-button';
import { Routes } from '@/config/routes';
import { useState } from 'react';

export default function SuppliersPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [orderBy, setOrder] = useState('created_at');
  const [sortedBy, setColumn] = useState<SortOrder>(SortOrder.Desc);

  const { suppliers, paginatorInfo, loading, error } = useSuppliersUserQuery({
    limit: 20,
    page,
    name: searchTerm,
    orderBy,
    sortedBy,
    is_active: true,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handlePagination(current: number) {
    setPage(current);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="w-full">
          <PageHeading title="Suppliers" />
          <p className="mt-2 text-sm text-body">
            Manage supplier accounts for automated low-stock reorder alerts.
          </p>
        </div>
        <LinkButton href={Routes.supplierCreate} className="shrink-0">
          + Add Supplier
        </LinkButton>
      </Card>

      <AdminsList
        admins={suppliers}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        onOrder={setOrder}
        onSort={setColumn}
      />
    </>
  );
}

SuppliersPage.authenticate = {
  permissions: adminOnly,
};
SuppliersPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
