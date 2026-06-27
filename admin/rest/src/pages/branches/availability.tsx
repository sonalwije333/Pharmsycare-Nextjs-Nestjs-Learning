import { useEffect, useState } from 'react';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
import { useBranchAvailabilityQuery } from '@/data/branch';
import { BranchStock, BranchStockStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const statusStyle: Record<BranchStockStatus, string> = {
  in_stock: 'bg-green-100 text-green-700',
  low_stock: 'bg-amber-100 text-amber-700',
  out_of_stock: 'bg-red-100 text-red-700',
  not_stocked: 'bg-gray-100 text-gray-500',
};

const statusLabel: Record<BranchStockStatus, string> = {
  in_stock: 'In stock',
  low_stock: 'Low',
  out_of_stock: 'Out',
  not_stocked: 'Not stocked',
};

function BranchPill({ branch }: { branch: BranchStock }) {
  return (
    <div
      className={`flex flex-col rounded-lg px-3 py-2 ${statusStyle[branch.status]}`}
    >
      <span className="text-xs font-semibold">{branch.code}</span>
      <span className="text-sm font-bold">{branch.quantity}</span>
      <span className="text-[11px]">{statusLabel[branch.status]}</span>
    </div>
  );
}

export default function BranchAvailabilityPage() {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const { results, loading } = useBranchAvailabilityQuery(debounced);

  return (
    <>
      <Card className="mb-8">
        <PageHeading title="Cross-Branch Drug Availability" />
        <p className="mt-2 text-sm text-body">
          Search a prescription medicine to instantly see which branches have it
          in stock and how many units each one holds.
        </p>
        <div className="relative mt-5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search a medicine by name or SKU…"
            className="h-12 w-full rounded-lg border border-border-base bg-light px-4 text-sm text-heading focus:border-accent focus:outline-none"
          />
          {loading ? (
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-body">
              Searching…
            </span>
          ) : null}
        </div>
      </Card>

      {!debounced ? (
        <Card>
          <p className="p-6 text-center text-sm text-body">
            Type a medicine name above to check availability across all branches.
          </p>
        </Card>
      ) : loading && results.length === 0 ? (
        <Loader simple={true} className="mx-auto h-8 w-8" />
      ) : results.length === 0 ? (
        <Card>
          <p className="p-6 text-center text-sm text-body">
            No medicine matched “{debounced}”.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((item) => (
            <Card key={item.product_id}>
              <div className="flex flex-col gap-1 border-b pb-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-heading">
                    {item.name}
                  </h3>
                  <p className="text-xs text-body">SKU: {item.sku ?? '—'}</p>
                </div>
                <div className="text-sm text-heading">
                  <span className="font-bold">{item.total_quantity}</span> units
                  across{' '}
                  <span className="font-bold">{item.available_branch_count}</span>{' '}
                  branch(es)
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {item.branches.map((branch) => (
                  <BranchPill key={branch.branch_id} branch={branch} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

BranchAvailabilityPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
BranchAvailabilityPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
