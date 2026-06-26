import { useMutation, useQuery, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { reorderClient } from './client/reorder';
import { ReorderRequestStatus } from '@/types';
import { toast } from 'react-toastify';

export const useReorderRequestsQuery = (params?: {
  page?: number;
  limit?: number;
  status?: ReorderRequestStatus;
}) => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.REORDER_REQUESTS, params],
    () => reorderClient.list(params),
    { keepPreviousData: true },
  );

  return {
    requests: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    refetch,
  };
};

export const useReorderStatsQuery = () => {
  return useQuery([API_ENDPOINTS.REORDER_REQUESTS_STATS], () =>
    reorderClient.stats(),
  );
};

export const useRunAutoReorderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(() => reorderClient.runAuto(), {
    onSuccess: (result) => {
      queryClient.invalidateQueries(API_ENDPOINTS.REORDER_REQUESTS);
      queryClient.invalidateQueries(API_ENDPOINTS.REORDER_REQUESTS_STATS);
      toast.success(
        `Auto reorder: ${result.created} created, ${result.notified} notified`,
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useResendReorderNotifyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((id: number) => reorderClient.notify(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.REORDER_REQUESTS);
      toast.success('Supplier alert resent');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
