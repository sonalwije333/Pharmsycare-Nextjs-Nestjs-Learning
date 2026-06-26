import { useMutation, useQuery, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { supportClient } from './client/support';
import { SupportTicketCategory, SupportTicketStatus } from '@/types';
import { toast } from 'react-toastify';

export const useSupportTicketsQuery = (params?: {
  page?: number;
  limit?: number;
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
  search?: string;
}) => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.SUPPORT_TICKETS, params],
    () => supportClient.list(params),
    { keepPreviousData: true },
  );

  return {
    tickets: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    refetch,
  };
};

export const useSupportTicketStatsQuery = () => {
  return useQuery([API_ENDPOINTS.SUPPORT_TICKETS_STATS], () =>
    supportClient.stats(),
  );
};

export const useReplySupportTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      id,
      message,
      status,
    }: {
      id: number;
      message: string;
      status?: SupportTicketStatus;
    }) => supportClient.reply(id, message, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SUPPORT_TICKETS);
        queryClient.invalidateQueries(API_ENDPOINTS.SUPPORT_TICKETS_STATS);
        toast.success('Reply sent');
      },
      onError: (error: Error) => toast.error(error.message),
    },
  );
};

export const useUpdateSupportTicketStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, status }: { id: number; status: SupportTicketStatus }) =>
      supportClient.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SUPPORT_TICKETS);
        queryClient.invalidateQueries(API_ENDPOINTS.SUPPORT_TICKETS_STATS);
        toast.success('Status updated');
      },
      onError: (error: Error) => toast.error(error.message),
    },
  );
};
