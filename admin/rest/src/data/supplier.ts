import { useMutation, useQuery, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { supplierClient } from './client/supplier';
import { CreateSupplierInput, UserQueryOptions } from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { toast } from 'react-toastify';

export const useSuppliersQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.SUPPLIERS_LIST, params],
    () => supplierClient.fetchSuppliers(params),
    { keepPreviousData: true },
  );

  return {
    suppliers: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any),
    loading: isLoading,
    error,
  };
};

export const useSupplierProfilesQuery = (
  params: Partial<UserQueryOptions> = {},
) => {
  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.SUPPLIERS, params],
    () => supplierClient.fetchProfiles(params),
    { keepPreviousData: true },
  );

  return {
    profiles: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
  };
};

export const useSupplierPerformanceQuery = () => {
  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.SUPPLIERS_PERFORMANCE],
    () => supplierClient.performance(),
    { keepPreviousData: true },
  );

  return {
    performance: data ?? [],
    loading: isLoading,
    error,
  };
};

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((input: CreateSupplierInput) => supplierClient.create(input), {
    onSuccess: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPLIERS_LIST);
      queryClient.invalidateQueries(API_ENDPOINTS.SUPPLIERS);
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
