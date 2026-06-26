import dayjs from 'dayjs';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  useSupportTicketsQuery,
  useSupportTicketStatsQuery,
  useReplySupportTicketMutation,
  useUpdateSupportTicketStatusMutation,
} from '@/data/support';
import { SupportTicket, SupportTicketStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

const LIMIT = 15;

const statusClass: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.OPEN]: 'bg-yellow-100 text-yellow-800',
  [SupportTicketStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [SupportTicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [SupportTicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

const STATUS_OPTIONS: Array<{ value: '' | SupportTicketStatus; label: string }> =
  [
    { value: '', label: 'All Statuses' },
    { value: SupportTicketStatus.OPEN, label: 'Open' },
    { value: SupportTicketStatus.IN_PROGRESS, label: 'In Progress' },
    { value: SupportTicketStatus.RESOLVED, label: 'Resolved' },
    { value: SupportTicketStatus.CLOSED, label: 'Closed' },
  ];

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border-200 p-3 text-center">
      <p className="text-xs uppercase text-body">{label}</p>
      <p className="mt-1 text-lg font-semibold text-heading">{value}</p>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState('');
  const { mutate: sendReply, isLoading: replying } =
    useReplySupportTicketMutation();
  const { mutate: updateStatus } = useUpdateSupportTicketStatusMutation();

  function handleReply() {
    if (!reply.trim()) return;
    sendReply(
      { id: ticket.id, message: reply.trim() },
      { onSuccess: () => setReply('') },
    );
  }

  return (
    <div className="border-b border-dashed last:border-0">
      <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-heading">#{ticket.id}</span>
            <span className="font-medium text-heading">{ticket.subject}</span>
            <Badge
              text={ticket.category}
              className="bg-accent/10 capitalize text-accent"
            />
          </div>
          <p className="mt-1 text-xs text-body">
            {ticket.name} · {ticket.email}
            {ticket.phone ? ` · ${ticket.phone}` : ''}
          </p>
          <p className="mt-1 text-xs text-body">
            {dayjs(ticket.created_at).format('MMM DD, YYYY h:mm A')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge text={ticket.status} className={statusClass[ticket.status]} />
          <select
            value={ticket.status}
            onChange={(event) =>
              updateStatus({
                id: ticket.id,
                status: event.target.value as SupportTicketStatus,
              })
            }
            className="h-9 rounded border border-border-200 px-2 text-xs focus:border-accent focus:outline-none"
          >
            {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            size="small"
            variant="outline"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Hide' : 'View'}
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="bg-gray-50 px-4 py-4">
          <p className="whitespace-pre-line text-sm text-heading">
            {ticket.message}
          </p>

          {ticket.responses && ticket.responses.length > 0 ? (
            <div className="mt-4 space-y-2">
              {ticket.responses.map((response, index) => {
                const isPharmacist = response.responder_role === 'pharmacist';
                return (
                  <div
                    key={index}
                    className={`rounded p-3 text-sm ${
                      isPharmacist
                        ? 'bg-accent/5 text-heading'
                        : 'bg-white text-body'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-heading">
                        {isPharmacist ? '🧑‍⚕️ ' : ''}
                        {response.responder}
                      </span>
                      <span className="text-[11px] text-body">
                        {dayjs(response.created_at).format('MMM DD, h:mm A')}
                      </span>
                    </div>
                    <p className="whitespace-pre-line">{response.message}</p>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Reply to the customer..."
              className="h-10 flex-1 rounded border border-border-200 px-3 text-sm focus:border-accent focus:outline-none"
            />
            <Button
              size="small"
              loading={replying}
              disabled={replying || !reply.trim()}
              onClick={handleReply}
            >
              Send Reply
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SupportTicketsPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'' | SupportTicketStatus>('');
  const [search, setSearch] = useState('');

  const { data: stats } = useSupportTicketStatsQuery();
  const { tickets, total, loading, error } = useSupportTicketsQuery({
    page,
    limit: LIMIT,
    status: status || undefined,
    search,
  });

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
            <PageHeading title="Customer Support Inbox" />
            <p className="mt-2 text-sm text-body">
              Customer support requests and pharmacist conversations.
            </p>
          </div>
          <Search
            onSearch={handleSearch}
            placeholderText="Search by subject, name or email"
            className="w-full md:w-80"
          />
        </div>
        {stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat label="Open" value={stats.open} />
            <Stat label="In Progress" value={stats.in_progress} />
            <Stat label="Resolved" value={stats.resolved} />
            <Stat label="Closed" value={stats.closed} />
            <Stat label="Total" value={stats.total} />
          </div>
        ) : null}
      </Card>

      <Card className="!p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-body">
            <span>Status:</span>
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as '' | SupportTicketStatus);
              }}
              className="h-9 rounded border border-border-200 px-3 text-sm focus:border-accent focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {tickets.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">
            No support tickets found.
          </p>
        ) : (
          <div>
            {tickets.map((ticket: SupportTicket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

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

SupportTicketsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
SupportTicketsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
