import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  useBranchAvailabilityQuery,
  useBranchCoordinationQuery,
  useBranchesQuery,
  useBranchTransfersQuery,
  useCreateBranchTransferMutation,
} from '@/data/branch';
import { BranchTransferSuggestion } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

function ManualTransfer() {
  const { branches } = useBranchesQuery();
  const { mutate: transfer, isLoading } = useCreateBranchTransferMutation();
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [product, setProduct] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [qty, setQty] = useState('10');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const { results } = useBranchAvailabilityQuery(product ? '' : debounced);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!product || !from || !to) return;
    transfer(
      {
        product_id: product.id,
        from_branch_id: Number(from),
        to_branch_id: Number(to),
        quantity: Number(qty) || 0,
      },
      {
        onSuccess: () => {
          setProduct(null);
          setText('');
          setDebounced('');
          setQty('10');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {product ? (
        <div className="flex items-center justify-between rounded bg-gray-50 p-2">
          <span className="truncate text-sm font-medium text-heading">
            {product.name}
          </span>
          <button
            type="button"
            className="text-xs text-accent hover:underline"
            onClick={() => setProduct(null)}
          >
            Change
          </button>
        </div>
      ) : (
        <div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search medicine…"
            className="h-10 w-full rounded border border-border-base px-3 text-sm focus:border-accent focus:outline-none"
          />
          {debounced ? (
            <div className="mt-1 max-h-40 overflow-y-auto rounded border border-border-100">
              {results.length === 0 ? (
                <p className="p-2 text-xs text-body">No matches.</p>
              ) : (
                results.map((item) => (
                  <button
                    key={item.product_id}
                    type="button"
                    onClick={() =>
                      setProduct({ id: item.product_id, name: item.name })
                    }
                    className="block w-full truncate px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                  >
                    {item.name}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-10 rounded border border-border-base px-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="">From branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-10 rounded border border-border-base px-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="">To branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Qty"
          className="h-10 w-24 rounded border border-border-base px-3 text-sm focus:border-accent focus:outline-none"
        />
        <Button
          type="submit"
          size="small"
          loading={isLoading}
          className="flex-1"
          disabled={!product || !from || !to}
        >
          Transfer stock
        </Button>
      </div>
    </form>
  );
}

export default function BranchCoordinationPage() {
  const { t } = useTranslation();
  const { lowStock, suggestions, loading, error } =
    useBranchCoordinationQuery();
  const { transfers } = useBranchTransfersQuery();
  const { mutate: transfer } = useCreateBranchTransferMutation();

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const applySuggestion = (s: BranchTransferSuggestion) => {
    transfer({
      product_id: s.product_id,
      from_branch_id: s.from_branch_id,
      to_branch_id: s.to_branch_id,
      quantity: s.suggested_quantity,
      note: 'Applied from coordination suggestion',
    });
  };

  return (
    <>
      <Card className="mb-8">
        <PageHeading title="Branch Coordination" />
        <p className="mt-2 text-sm text-body">
          Balance stock across the network: review low-stock alerts, apply
          suggested transfers, or move stock manually between branches.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-heading">
              Suggested Transfers ({suggestions.length})
            </h2>
            {suggestions.length === 0 ? (
              <p className="rounded bg-gray-50 p-4 text-center text-sm text-body">
                No transfer suggestions — stock looks balanced.
              </p>
            ) : (
              <ul className="space-y-3">
                {suggestions.map((s, idx) => (
                  <li
                    key={`${s.product_id}-${s.to_branch_id}-${idx}`}
                    className="flex flex-col gap-2 rounded-lg border border-border-100 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-heading">
                        {s.product_name ?? `#${s.product_id}`}
                      </p>
                      <p className="text-xs text-body">
                        Move <strong>{s.suggested_quantity}</strong> from{' '}
                        {s.from_branch_name} → {s.to_branch_name}
                      </p>
                    </div>
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => applySuggestion(s)}
                    >
                      Apply transfer
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold text-heading">
              Low-Stock Alerts ({lowStock.length})
            </h2>
            {lowStock.length === 0 ? (
              <p className="rounded bg-gray-50 p-4 text-center text-sm text-body">
                No low-stock items across branches.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
                    <tr>
                      <th className="px-4 py-3">Medicine</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Reorder Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item, idx) => (
                      <tr
                        key={`${item.branch_id}-${item.product_id}-${idx}`}
                        className="border-b border-dashed"
                      >
                        <td className="px-4 py-3 text-heading">
                          {item.product_name ?? `#${item.product_id}`}
                        </td>
                        <td className="px-4 py-3 text-body">
                          {item.branch_name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            text={String(item.quantity)}
                            className={
                              item.quantity === 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-body">
                          {item.reorder_level}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-heading">
              Manual Transfer
            </h2>
            <ManualTransfer />
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold text-heading">
              Recent Transfers
            </h2>
            {transfers.length === 0 ? (
              <p className="rounded bg-gray-50 p-4 text-center text-xs text-body">
                No transfers yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {transfers.map((tr) => (
                  <li key={tr.id} className="border-b border-dashed pb-2">
                    <p className="text-sm font-medium text-heading">
                      {tr.product_name ?? `#${tr.product_id}`}
                    </p>
                    <p className="text-xs text-body">
                      {tr.quantity} units · {tr.from_branch_name} →{' '}
                      {tr.to_branch_name}
                    </p>
                    <p className="text-[11px] text-body">
                      {dayjs(tr.created_at).format('MMM DD, YYYY h:mm A')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

BranchCoordinationPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
BranchCoordinationPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
