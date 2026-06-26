import DashboardLayout from '@/layouts/_dashboard';
import Card from '@/components/ui/cards/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import TextArea from '@/components/ui/forms/text-area';
import ErrorMessage from '@/components/ui/error-message';
import NotFound from '@/components/ui/not-found';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import client from '@/framework/client';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { useUser } from '@/framework/user';
import { useSettings } from '@/framework/settings';
import {
  useCreateSupportTicket,
  useReplySupportTicket,
} from '@/framework/support';
import {
  CreateSupportTicketInput,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
} from '@/types';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import * as yup from 'yup';

export { getStaticProps } from '@/framework/general.ssr';

const supportSchema = yup.object().shape({
  subject: yup.string().required('error-subject-required'),
  message: yup.string().required('error-description-required'),
  category: yup.string(),
  phone: yup.string(),
});

const CATEGORY_OPTIONS: Array<{ value: SupportTicketCategory; label: string }> = [
  { value: SupportTicketCategory.GENERAL, label: 'General' },
  { value: SupportTicketCategory.PRESCRIPTION, label: 'Prescription' },
  { value: SupportTicketCategory.ORDER, label: 'Order' },
  { value: SupportTicketCategory.DELIVERY, label: 'Delivery' },
  { value: SupportTicketCategory.BILLING, label: 'Billing' },
  { value: SupportTicketCategory.OTHER, label: 'Other' },
];

const STATUS_BADGE_CLASS: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.OPEN]: 'bg-yellow-100 text-yellow-800',
  [SupportTicketStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [SupportTicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [SupportTicketStatus.CLOSED]: 'bg-gray-100 text-gray-800',
};

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.OPEN]: 'Open',
  [SupportTicketStatus.IN_PROGRESS]: 'In Progress',
  [SupportTicketStatus.RESOLVED]: 'Resolved',
  [SupportTicketStatus.CLOSED]: 'Closed',
};

function ReplyBox({ ticketId }: { ticketId: number }) {
  const [message, setMessage] = useState('');
  const { mutate: reply, isLoading } = useReplySupportTicket();

  function handleSend() {
    if (!message.trim()) return;
    reply(
      { id: ticketId, message: message.trim() },
      { onSuccess: () => setMessage('') },
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Write a reply..."
        className="h-11 flex-1 rounded border border-border-200 px-3 text-sm focus:border-accent focus:outline-none"
      />
      <Button
        size="small"
        loading={isLoading}
        disabled={isLoading || !message.trim()}
        onClick={handleSend}
      >
        Send Reply
      </Button>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: SupportTicket }) {
  return (
    <div className="rounded border border-border-200 bg-light p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-heading">
          #{ticket.id} · {ticket.subject}
        </p>
        <span
          className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${
            STATUS_BADGE_CLASS[ticket.status]
          }`}
        >
          {STATUS_LABEL[ticket.status]}
        </span>
        <span className="inline-flex rounded bg-accent/10 px-2.5 py-1 text-xs font-medium capitalize text-accent">
          {ticket.category}
        </span>
      </div>

      <p className="text-xs text-body">
        {dayjs(ticket.created_at).format('MMM DD, YYYY h:mm A')}
      </p>

      <p className="mt-2 whitespace-pre-line text-sm text-heading">
        {ticket.message}
      </p>

      {ticket.responses && ticket.responses.length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-dashed border-border-200 pt-4">
          {ticket.responses.map((response, index) => {
            const isPharmacist = response.responder_role === 'pharmacist';
            return (
              <div
                key={index}
                className={`rounded p-3 text-sm ${
                  isPharmacist
                    ? 'bg-accent/5 text-heading'
                    : 'bg-gray-50 text-body'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
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

      {ticket.status !== SupportTicketStatus.CLOSED ? (
        <ReplyBox ticketId={ticket.id} />
      ) : null}
    </div>
  );
}

export default function SupportPage() {
  const { isAuthorized, isLoading: userLoading } = useUser();
  const { settings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupportTicketInput>({
    shouldUnregister: true,
    resolver: yupResolver(supportSchema) as any,
    defaultValues: { category: SupportTicketCategory.GENERAL },
  });

  const { mutate: createTicket, isLoading: creating } = useCreateSupportTicket({
    reset,
  });

  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.SUPPORT_TICKETS_MY],
    () => client.supportTickets.getMy({ page: 1, limit: 20 }),
    {
      enabled: isAuthorized && !userLoading,
      keepPreviousData: true,
      refetchOnWindowFocus: true,
    },
  );

  const whatsappRaw =
    settings?.contactDetails?.pharmacistWhatsApp ||
    settings?.contactDetails?.contact ||
    '';
  const whatsappDigits = String(whatsappRaw).replace(/[^\d]/g, '');
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        'Hello, I need help from a pharmacist.',
      )}`
    : '';

  function onSubmit(values: CreateSupportTicketInput) {
    createTicket({ ...values, channel: 'web' });
  }

  const tickets = data?.data ?? [];

  return (
    <Card className="w-full shadow-none sm:shadow">
      <div className="mb-8 flex flex-col gap-4 border-b border-dashed border-border-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Customer Support
          </h1>
          <p className="mt-2 text-sm text-body">
            Reach our pharmacist team. Chat instantly on WhatsApp or raise a
            support request and track replies here.
          </p>
        </div>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded bg-[#25D366] px-5 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
          >
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.13 6.744 3.052 9.38L1.05 31.32l6.156-1.968A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0Zm9.318 22.594c-.386 1.09-1.92 1.994-3.142 2.258-.836.178-1.928.32-5.604-1.204-4.7-1.948-7.726-6.724-7.962-7.034-.226-.31-1.9-2.53-1.9-4.826 0-2.296 1.166-3.424 1.636-3.904.386-.394.844-.574 1.336-.574.158 0 .3.008.43.014.386.016.58.038.834.646.316.764 1.088 2.66 1.18 2.854.094.194.188.456.056.766-.124.32-.234.46-.428.708-.194.248-.378.438-.572.704-.178.232-.378.482-.154.872.224.382.996 1.64 2.138 2.656 1.474 1.312 2.668 1.718 3.098 1.898.32.132.702.1.94-.156.302-.33.674-.876 1.052-1.414.268-.386.606-.434.96-.3.36.124 2.246 1.058 2.632 1.25.386.194.642.286.736.448.092.164.092.93-.294 2.02Z" />
            </svg>
            Chat on WhatsApp
          </a>
        ) : null}
      </div>

      <div className="mb-10 rounded border border-border-200 bg-gray-50 p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-heading">
          New Support Request
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Subject"
              {...register('subject')}
              variant="outline"
              error={errors.subject?.message}
              disabled={creating}
              placeholder="Briefly describe your issue"
            />
            <div className="flex flex-col">
              <label className="mb-3 text-sm font-semibold text-body">
                Category
              </label>
              <select
                {...register('category')}
                disabled={creating}
                className="h-12 rounded border border-border-base px-4 text-sm focus:border-accent focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Phone (optional)"
            {...register('phone')}
            variant="outline"
            className="mt-5"
            disabled={creating}
            placeholder="Best number to reach you"
          />

          <TextArea
            label="How can we help?"
            {...register('message')}
            variant="outline"
            className="mt-5"
            error={errors.message?.message}
            disabled={creating}
            placeholder="Describe your question or issue in detail"
          />

          <div className="mt-6">
            <Button loading={creating} disabled={creating}>
              Submit Request
            </Button>
          </div>
        </form>
      </div>

      <h2 className="mb-4 text-base font-semibold text-heading">
        My Support Requests
      </h2>

      {error ? (
        <ErrorMessage message={(error as Error).message} />
      ) : isLoading || userLoading ? (
        <div className="my-12 flex items-center justify-center">
          <Spinner simple className="h-8 w-8" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="my-12 flex items-center justify-center">
          <NotFound text="No support requests yet" />
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </Card>
  );
}

SupportPage.authenticationRequired = true;
SupportPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
