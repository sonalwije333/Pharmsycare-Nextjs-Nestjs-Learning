import { useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'next-i18next';
import { toast } from 'react-toastify';
import client from './client';
import { API_ENDPOINTS } from './client/api-endpoints';

export const useCreateSupportTicket = ({ reset }: { reset?: () => void } = {}) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  return useMutation(client.supportTickets.create, {
    onSuccess: () => {
      toast.success(t('text-support-ticket-submitted'));
      reset?.();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error(message ? t(message) : t('error-something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPORT_TICKETS_MY);
    },
  });
};

export const useReplySupportTicket = () => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();

  return useMutation(client.supportTickets.reply, {
    onSuccess: () => {
      toast.success(t('text-reply-sent'));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;
      toast.error(message ? t(message) : t('error-something-wrong'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPORT_TICKETS_MY);
    },
  });
};
