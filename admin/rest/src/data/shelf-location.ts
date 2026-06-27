import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import { shelfLocationClient } from './client/shelf-location';
import {
  AssignShelfProductInput,
  CreateShelfLocationInput,
} from '@/types';

export const useShelfLayoutQuery = () => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT],
    () => shelfLocationClient.layout(),
    { keepPreviousData: true },
  );

  return {
    layout: data,
    zones: data?.zones ?? [],
    totalShelves: data?.total_shelves ?? 0,
    totalAssignedProducts: data?.total_assigned_products ?? 0,
    loading: isLoading,
    error,
    refetch,
  };
};

export const useShelfWithProductsQuery = (id?: number) => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.SHELF_LOCATIONS, id],
    () => shelfLocationClient.get(id as number),
    { enabled: !!id, keepPreviousData: true },
  );

  return {
    shelf: data?.shelf,
    products: data?.products ?? [],
    loading: isLoading,
    error,
    refetch,
  };
};

export const useMedicineLocationSearchQuery = (text: string) => {
  const trimmed = text.trim();
  const { data, isLoading, isFetching, error } = useQuery(
    [API_ENDPOINTS.SHELF_LOCATIONS_SEARCH, trimmed],
    () => shelfLocationClient.search(trimmed),
    { enabled: trimmed.length > 0, keepPreviousData: true },
  );

  return {
    results: data ?? [],
    loading: isLoading || isFetching,
    error,
  };
};

export const useCreateShelfLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (input: CreateShelfLocationInput) => shelfLocationClient.create(input),
    {
      onSuccess: () => {
        toast.success('Shelf location created');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message ?? error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT);
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS);
      },
    },
  );
};

export const useUpdateShelfLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, input }: { id: number; input: Partial<CreateShelfLocationInput> }) =>
      shelfLocationClient.update(id, input),
    {
      onSuccess: () => {
        toast.success('Shelf location updated');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message ?? error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT);
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS);
      },
    },
  );
};

export const useDeleteShelfLocationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation((id: number) => shelfLocationClient.remove(id), {
    onSuccess: () => {
      toast.success('Shelf location deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT);
      queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS);
    },
  });
};

export const useAssignShelfProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, input }: { id: number; input: AssignShelfProductInput }) =>
      shelfLocationClient.assignProduct(id, input),
    {
      onSuccess: () => {
        toast.success('Product placed on shelf');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message ?? error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT);
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS);
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_SEARCH);
      },
    },
  );
};

export const useUnassignShelfProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (productId: number) => shelfLocationClient.unassignProduct(productId),
    {
      onSuccess: () => {
        toast.success('Product removed from shelf');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message ?? error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT);
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS);
        queryClient.invalidateQueries(API_ENDPOINTS.SHELF_LOCATIONS_SEARCH);
      },
    },
  );
};
