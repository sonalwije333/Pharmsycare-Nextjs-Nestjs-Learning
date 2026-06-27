import { useEffect, useState } from 'react';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useCentralizedInventoryQuery } from '@/data/branch';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const LIMIT = 20;

export default function CentralizedInventoryPage() {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(text);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [text]);

  const { branches, rows, total, loading, error } =
    useCentralizedInventoryQuery({ search, page, limit: LIMIT });

  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <>
      <Card className="mb-8">
        <PageHeading title="Centralized Inventory" />
        <p className="mt-2 text-sm text-body">
          A single source of truth for medicine stock across every branch.
        </p>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Filter by medicine name or SKU…"
          className="mt-5 h-12 w-full rounded-lg border border-border-base bg-light px-4 text-sm text-heading focus:border-accent focus:outline-none md:max-w-md"
        />
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <Loader simple={true} className="mx-auto my-10 h-8 w-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
                <tr>
                  <th className="sticky left-0 bg-gray-50 px-4 py-3">Medicine</th>
                  {branches.map((branch) => (
                    <th key={branch.id} className="px-4 py-3 text-center">
                      {branch.code}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.product_id} className="border-b border-dashed">
                    <td className="sticky left-0 bg-light px-4 py-3">
                      <p className="font-medium text-heading">{row.name}</p>
                      <p className="text-xs text-body">{row.sku ?? '—'}</p>
                    </td>
                    {branches.map((branch) => {
                      const qty = row.quantities[branch.id];
                      return (
                        <td
                          key={branch.id}
                          className={`px-4 py-3 text-center ${
                            qty === undefined
                              ? 'text-gray-300'
                              : qty === 0
                              ? 'font-semibold text-red-500'
                              : 'text-heading'
                          }`}
                        >
                          {qty === undefined ? '–' : qty}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center font-bold text-heading">
                      {row.total_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 ? (
              <p className="p-8 text-center text-sm text-body">
                {t('common:text-no-data') || 'No inventory found.'}
              </p>
            ) : null}
          </div>
        )}

        {total > LIMIT ? (
          <div className="flex items-center justify-between border-t p-4">
            <span className="text-xs text-body">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button
                size="small"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="outline"
                disabled={page * LIMIT >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}

CentralizedInventoryPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
CentralizedInventoryPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
