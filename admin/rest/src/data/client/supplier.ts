import {
  CreateSupplierInput,
  SupplierPerformance,
  SupplierProfile,
  UserPaginator,
  UserQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const supplierClient = {
  create: (input: CreateSupplierInput) =>
    HttpClient.post<SupplierProfile>(API_ENDPOINTS.SUPPLIERS, input),
  performance: () =>
    HttpClient.get<SupplierPerformance[]>(API_ENDPOINTS.SUPPLIERS_PERFORMANCE),
  fetchSuppliers: (params: Partial<UserQueryOptions>) =>
    HttpClient.get<UserPaginator>(API_ENDPOINTS.SUPPLIERS_LIST, {
      searchJoin: 'and',
      with: 'wallet;permissions;profile',
      ...params,
    }),
  fetchProfiles: (params: Partial<UserQueryOptions>) =>
    HttpClient.get<{ data: SupplierProfile[]; total: number }>(
      API_ENDPOINTS.SUPPLIERS,
      params,
    ),
};
