import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useStockMonitorQuery } from '@/data/stock';
import { useRunAutoReorderMutation } from '@/data/reorder';
import { StockProduct } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const LIMIT = 20;

function stockBadge(product: StockProduct) {
  const isOut = product.quantity <= 0 || product.in_stock === 0;
  if (isOut) {
    return <Badge text="Out of stock" className="bg-red-100 text-red-800" />;
  }
  if (product.quantity <= 3) {
    return <Badge text="Critical" className="bg-orange-100 text-orange-800" />;
  }
  return <Badge text="Low" className="bg-yellow-100 text-yellow-800" />;
}

export default function StockMonitoringPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { products, total, loading, error } = useStockMonitorQuery({
    page,
    limit: LIMIT,
    search,
  });
  const { mutate: runAuto, isLoading: runningAuto } =
    useRunAutoReorderMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearch(searchText);
    setPage(1);
  }

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-1/2">
          <PageHeading title="Stock Level Monitoring" />
          <p className="mt-2 text-sm text-body">
            Products at or below the low-stock threshold. Run an auto reorder to
            notify suppliers for items with low inventory.
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3 md:w-1/2 md:flex-row md:justify-end">
          <Search
            onSearch={handleSearch}
            placeholderText="Search products"
            className="w-full md:w-72"
          />
          <Button
            loading={runningAuto}
            onClick={() => runAuto()}
            className="shrink-0"
          >
            Run Auto Reorder
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">In Stock</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: StockProduct) => (
                <tr key={product.id} className="border-b border-dashed">
                  <td className="px-4 py-4 font-medium text-heading">
                    {product.name}
                  </td>
                  <td className="px-4 py-4 text-body">{product.sku ?? '-'}</td>
                  <td className="px-4 py-4 text-body">
                    {product.shop?.name ?? '-'}
                  </td>
                  <td className="px-4 py-4 text-heading">{product.quantity}</td>
                  <td className="px-4 py-4">{stockBadge(product)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">
            All products are sufficiently stocked.
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

StockMonitoringPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
StockMonitoringPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
