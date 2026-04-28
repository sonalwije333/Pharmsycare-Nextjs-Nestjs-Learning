import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
import { orderTrackingClient } from './client/order-tracking';
import type {
  OrderTrackingPaginator,
  OrderTrackingQueryOptions,
} from './client/order-tracking';

export const useOrderTrackingsQuery = (
  params: Partial<OrderTrackingQueryOptions>,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<OrderTrackingPaginator, Error>(
    [API_ENDPOINTS.ORDER_TRACKING, params],
    ({ queryKey, pageParam }) =>
      orderTrackingClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...options,
    },
  );

  return {
    orderTrackings: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useUpdateOrderTrackingStatusMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(orderTrackingClient.updateStatus, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDER_TRACKING);
    },
  });
};

export const useDeleteOrderTrackingMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(orderTrackingClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ORDER_TRACKING);
    },
  });
};