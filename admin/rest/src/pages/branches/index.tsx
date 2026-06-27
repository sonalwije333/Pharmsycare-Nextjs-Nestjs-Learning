import { useState } from 'react';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import BranchForm from '@/components/branch/branch-form';
import BranchDetail from '@/components/branch/branch-detail';
import { useBranchesQuery, useBranchOverviewQuery } from '@/data/branch';
import { Branch } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border-100 px-4 py-3">
      <p className="text-2xl font-bold text-heading">{value}</p>
      <p className="text-xs text-body">{label}</p>
    </div>
  );
}

export default function BranchesPage() {
  const { t } = useTranslation();
  const { branches, loading, error } = useBranchesQuery();
  const { overview } = useBranchOverviewQuery();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <>
      <Card className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <PageHeading title="Branches" />
            <p className="mt-2 text-sm text-body">
              Manage every pharmacy location and the stock each one holds.
            </p>
          </div>
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Close' : 'Add Branch'}
          </Button>
        </div>

        {overview ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Branches" value={overview.total_branches} />
            <StatCard label="Active" value={overview.active_branches} />
            <StatCard label="Distinct drugs" value={overview.total_skus} />
            <StatCard label="Stock units" value={overview.total_stock_units} />
            <StatCard label="Low stock" value={overview.low_stock_items} />
            <StatCard label="Out of stock" value={overview.out_of_stock_items} />
          </div>
        ) : null}

        {showForm ? (
          <div className="mt-6 rounded-lg bg-gray-50 p-5">
            <h3 className="mb-4 text-sm font-bold text-heading">New Branch</h3>
            <BranchForm onClose={() => setShowForm(false)} />
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {branches.length === 0 ? (
            <Card>
              <p className="p-6 text-center text-sm text-body">
                No branches yet. Add your first location to begin.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {branches.map((branch: Branch) => {
                const selected = selectedId === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedId(branch.id)}
                    className={`rounded-lg border-2 p-4 text-left transition ${
                      selected
                        ? 'border-accent shadow-md'
                        : 'border-border-100 hover:border-accent hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-heading">
                          {branch.name}
                        </span>
                        {branch.is_main ? (
                          <Badge
                            text="Main"
                            className="bg-accent/10 text-accent"
                          />
                        ) : null}
                      </div>
                      <span className="text-xs text-body">{branch.code}</span>
                    </div>
                    <p className="mt-1 text-xs text-body">{branch.city}</p>
                    <p className="mt-1 text-xs text-body">
                      Vendor:{' '}
                      {branch.vendor ? (
                        <span className="font-medium text-heading">
                          {branch.vendor.name}
                        </span>
                      ) : (
                        <span className="text-amber-600">Not connected</span>
                      )}
                    </p>
                    <div className="mt-3 flex gap-4 text-xs">
                      <span className="text-heading">
                        <strong>{branch.sku_count ?? 0}</strong> drugs
                      </span>
                      <span className="text-heading">
                        <strong>{branch.total_units ?? 0}</strong> units
                      </span>
                      {branch.low_stock_count ? (
                        <span className="font-medium text-red-500">
                          {branch.low_stock_count} low
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Card>
          {selectedId ? (
            <BranchDetail
              key={selectedId}
              branchId={selectedId}
              onDeleted={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-heading">
                No branch selected
              </p>
              <p className="mt-1 text-xs text-body">
                Select a branch to manage its stock.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

BranchesPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
BranchesPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
