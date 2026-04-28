import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { mapPaginatorData } from '@/utils/data-mappers';
import { prescriptionClient } from './client/prescription';
import type { PrescriptionPaginator, PrescriptionQueryOptions } from './client/prescription';

export const usePrescriptionsQuery = (
  params: Partial<PrescriptionQueryOptions>,
  options: any = {},
) => {
  const { data, error, isLoading } = useQuery<PrescriptionPaginator, Error>(
    [API_ENDPOINTS.PRESCRIPTIONS, params],
    ({ queryKey, pageParam }) =>
      prescriptionClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
      ...options,
    },
  );

  return {
    prescriptions: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useApprovePrescriptionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(prescriptionClient.approve, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRESCRIPTIONS);
    },
  });
};

export const useRejectPrescriptionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(prescriptionClient.reject, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRESCRIPTIONS);
    },
  });
};

export const useDeletePrescriptionMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation(prescriptionClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.PRESCRIPTIONS);
    },
  });
};