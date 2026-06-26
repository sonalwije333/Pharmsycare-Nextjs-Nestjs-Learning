import dayjs from 'dayjs';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import LinkButton from '@/components/ui/link-button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { Routes } from '@/config/routes';
import {
  useGrnListQuery,
  useGrnStatsQuery,
  useReceiveGrnMutation,
  useCancelGrnMutation,
} from '@/data/grn';
import { GoodsReceivedNote, GrnStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const LIMIT = 20;

const statusClass: Record<GrnStatus, string> = {
  [GrnStatus.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [GrnStatus.RECEIVED]: 'bg-green-100 text-green-800',
  [GrnStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

function formatRs(value: number | null) {
  if (value == null) return '-';
  return `Rs. ${Number(value).toLocaleString('en-LK')}`;
}

export default function GoodsReceivedNotesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: stats } = useGrnStatsQuery();
  const { notes, total, loading, error } = useGrnListQuery({
    page,
    limit: LIMIT,
    search,
  });
  const { mutate: receiveGrn, isLoading: receiving } = useReceiveGrnMutation();
  const { mutate: cancelGrn } = useCancelGrnMutation();

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
            <PageHeading title="Goods Received Notes" />
            <p className="mt-2 text-sm text-body">
              Record stock received from suppliers. Receiving a GRN updates
              product stock and procurement history.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Search
              onSearch={handleSearch}
              placeholderText="Search GRN / supplier / invoice"
              className="w-full sm:w-72"
            />
            <LinkButton
              href={Routes.goodsReceivedNoteCreate}
              size="small"
              className="h-10 shrink-0"
            >
              + New GRN
            </LinkButton>
          </div>
        </div>
        {stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat label="Total Notes" value={String(stats.total_notes)} />
            <Stat label="Draft" value={String(stats.draft)} />
            <Stat label="Received" value={String(stats.received)} />
            <Stat label="Units Received" value={String(stats.total_quantity)} />
            <Stat label="Received Value" value={formatRs(stats.total_cost)} />
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">GRN No.</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note: GoodsReceivedNote) => (
                <tr key={note.id} className="border-b border-dashed">
                  <td className="px-4 py-4 font-medium text-heading">
                    {note.grn_number}
                  </td>
                  <td className="px-4 py-4 text-xs text-body">
                    {note.created_at
                      ? dayjs(note.created_at).format('MMM DD, YYYY')
                      : '-'}
                  </td>
                  <td className="px-4 py-4 text-body">{note.supplier_name}</td>
                  <td className="px-4 py-4 text-body">
                    {note.invoice_number ?? '-'}
                  </td>
                  <td className="px-4 py-4 text-body">
                    {note.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-4 text-heading">
                    {note.total_quantity}
                  </td>
                  <td className="px-4 py-4 text-heading">
                    {formatRs(note.total_cost)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      text={note.status}
                      className={statusClass[note.status]}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {note.status === GrnStatus.DRAFT ? (
                        <>
                          <Button
                            size="small"
                            disabled={receiving}
                            onClick={() => receiveGrn(note.id)}
                          >
                            Receive
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => cancelGrn(note.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-body">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notes.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">
            No goods received notes yet. Create one to receive supplier stock.
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

GoodsReceivedNotesPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
GoodsReceivedNotesPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
