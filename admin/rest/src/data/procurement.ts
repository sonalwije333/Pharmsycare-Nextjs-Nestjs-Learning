import { useMutation, useQuery, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { procurementClient } from './client/procurement';
import { ProcurementStatus } from '@/types';
import { toast } from 'react-toastify';

export const useProcurementHistoryQuery = (params?: {
  page?: number;
  limit?: number;
  status?: ProcurementStatus;
  supplier_id?: number;
  search?: string;
}) => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.PROCUREMENT_HISTORY, params],
    () => procurementClient.list(params),
    { keepPreviousData: true },
  );

  return {
    records: data?.data ?? [],
    total: data?.total ?? 0,
    currentPage: data?.current_page ?? 1,
    perPage: data?.per_page ?? 20,
    loading: isLoading,
    error,
    refetch,
  };
};

export const useProcurementStatsQuery = () => {
  return useQuery([API_ENDPOINTS.PROCUREMENT_HISTORY_STATS], () =>
    procurementClient.stats(),
  );
};

export const useMarkProcurementReceivedMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((id: number) => procurementClient.markReceived(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PROCUREMENT_HISTORY);
      queryClient.invalidateQueries(API_ENDPOINTS.PROCUREMENT_HISTORY_STATS);
      toast.success('Marked as received');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
