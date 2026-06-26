import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import { grnClient } from './client/grn';
import { CreateGrnInput, GrnStatus } from '@/types';
import { Routes } from '@/config/routes';

export const useGrnListQuery = (params?: {
  page?: number;
  limit?: number;
  status?: GrnStatus;
  supplier_id?: number;
  search?: string;
}) => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.GOODS_RECEIVED_NOTES, params],
    () => grnClient.list(params),
    { keepPreviousData: true },
  );

  return {
    notes: data?.data ?? [],
    total: data?.total ?? 0,
    currentPage: data?.current_page ?? 1,
    perPage: data?.per_page ?? 20,
    loading: isLoading,
    error,
    refetch,
  };
};

export const useGrnStatsQuery = () => {
  return useQuery([API_ENDPOINTS.GOODS_RECEIVED_NOTES_STATS], () =>
    grnClient.stats(),
  );
};

export const useCreateGrnMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation((input: CreateGrnInput) => grnClient.create(input), {
    onSuccess: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.GOODS_RECEIVED_NOTES);
      queryClient.invalidateQueries(API_ENDPOINTS.GOODS_RECEIVED_NOTES_STATS);
      toast.success('Goods received note created');
      router.push(Routes.goodsReceivedNotes);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? 'Failed to create goods received note',
      );
    },
  });
};

export const useReceiveGrnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((id: number) => grnClient.receive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.GOODS_RECEIVED_NOTES);
      queryClient.invalidateQueries(API_ENDPOINTS.GOODS_RECEIVED_NOTES_STATS);
      toast.success('GRN received — stock updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to receive GRN');
    },
  });
};

export const useCancelGrnMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((id: number) => grnClient.cancel(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.GOODS_RECEIVED_NOTES);
      queryClient.invalidateQueries(API_ENDPOINTS.GOODS_RECEIVED_NOTES_STATS);
      toast.success('GRN cancelled');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to cancel GRN');
    },
  });
};
