import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import { branchClient } from './client/branch';
import {
  CreateBranchInput,
  CreateBranchTransferInput,
  UpsertBranchInventoryInput,
} from '@/types';

const invalidateBranchData = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries(API_ENDPOINTS.BRANCHES);
  queryClient.invalidateQueries(API_ENDPOINTS.BRANCHES_OVERVIEW);
  queryClient.invalidateQueries(API_ENDPOINTS.BRANCHES_INVENTORY);
  queryClient.invalidateQueries(API_ENDPOINTS.BRANCHES_AVAILABILITY);
  queryClient.invalidateQueries(API_ENDPOINTS.BRANCHES_COORDINATION);
  queryClient.invalidateQueries(API_ENDPOINTS.BRANCHES_TRANSFERS);
};

export const useBranchesQuery = () => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.BRANCHES],
    () => branchClient.all(),
    { keepPreviousData: true },
  );
  return {
    branches: data ?? [],
    loading: isLoading,
    error,
    refetch,
  };
};

export const useBranchQuery = (id?: number) => {
  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.BRANCHES, id],
    () => branchClient.get(id as number),
    { enabled: !!id, keepPreviousData: true },
  );
  return { branch: data, loading: isLoading, error };
};

export const useBranchOverviewQuery = () => {
  const { data } = useQuery([API_ENDPOINTS.BRANCHES_OVERVIEW], () =>
    branchClient.overview(),
  );
  return { overview: data };
};

export const useBranchVendorsQuery = () => {
  const { data, isLoading } = useQuery(
    [API_ENDPOINTS.BRANCHES_VENDORS],
    () => branchClient.vendors(),
    { keepPreviousData: true },
  );
  return { vendors: data ?? [], loading: isLoading };
};

export const useBranchAvailabilityQuery = (text: string) => {
  const trimmed = text.trim();
  const { data, isLoading, isFetching, error } = useQuery(
    [API_ENDPOINTS.BRANCHES_AVAILABILITY, trimmed],
    () => branchClient.availability(trimmed),
    { enabled: trimmed.length > 0, keepPreviousData: true },
  );
  return {
    results: data ?? [],
    loading: isLoading || isFetching,
    error,
  };
};

export const useCentralizedInventoryQuery = (params?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, isLoading, error } = useQuery(
    [API_ENDPOINTS.BRANCHES_INVENTORY, params],
    () => branchClient.centralizedInventory(params),
    { keepPreviousData: true },
  );
  return {
    branches: data?.branches ?? [],
    rows: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
  };
};

export const useBranchCoordinationQuery = () => {
  const { data, isLoading, error, refetch } = useQuery(
    [API_ENDPOINTS.BRANCHES_COORDINATION],
    () => branchClient.coordination(),
    { keepPreviousData: true },
  );
  return {
    lowStock: data?.low_stock ?? [],
    suggestions: data?.suggestions ?? [],
    loading: isLoading,
    error,
    refetch,
  };
};

export const useBranchTransfersQuery = () => {
  const { data, isLoading } = useQuery(
    [API_ENDPOINTS.BRANCHES_TRANSFERS],
    () => branchClient.transfers(),
    { keepPreviousData: true },
  );
  return { transfers: data ?? [], loading: isLoading };
};

const onMutationError = (error: any) => {
  toast.error(error?.response?.data?.message ?? error.message);
};

export const useCreateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (input: CreateBranchInput) => branchClient.create(input),
    {
      onSuccess: () => {
        toast.success('Branch created');
      },
      onError: onMutationError,
      onSettled: () => invalidateBranchData(queryClient),
    },
  );
};

export const useUpdateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, input }: { id: number; input: Partial<CreateBranchInput> }) =>
      branchClient.update(id, input),
    {
      onSuccess: () => {
        toast.success('Branch updated');
      },
      onError: onMutationError,
      onSettled: () => invalidateBranchData(queryClient),
    },
  );
};

export const useDeleteBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation((id: number) => branchClient.remove(id), {
    onSuccess: () => {
      toast.success('Branch deleted');
    },
    onError: onMutationError,
    onSettled: () => invalidateBranchData(queryClient),
  });
};

export const useUpsertBranchInventoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, input }: { id: number; input: UpsertBranchInventoryInput }) =>
      branchClient.upsertInventory(id, input),
    {
      onSuccess: () => {
        toast.success('Stock updated');
      },
      onError: onMutationError,
      onSettled: () => invalidateBranchData(queryClient),
    },
  );
};

export const useRemoveBranchInventoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, productId }: { id: number; productId: number }) =>
      branchClient.removeInventory(id, productId),
    {
      onSuccess: () => {
        toast.success('Product removed from branch');
      },
      onError: onMutationError,
      onSettled: () => invalidateBranchData(queryClient),
    },
  );
};

export const useCreateBranchTransferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (input: CreateBranchTransferInput) => branchClient.createTransfer(input),
    {
      onSuccess: () => {
        toast.success('Stock transferred between branches');
      },
      onError: onMutationError,
      onSettled: () => invalidateBranchData(queryClient),
    },
  );
};
