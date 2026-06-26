import { useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { stockClient } from './client/stock';

export const useStockMonitorQuery = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.PRODUCTS_STOCK, params],
    () => stockClient.list(params),
    { keepPreviousData: true },
  );

  return {
    products: data?.data ?? [],
    total: data?.total ?? 0,
    currentPage: data?.current_page ?? 1,
    perPage: data?.per_page ?? 30,
    loading: isLoading,
    error,
    refetch,
  };
};
