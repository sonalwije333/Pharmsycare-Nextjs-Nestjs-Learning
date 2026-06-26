import {
  ProcurementRecord,
  ProcurementStats,
  ProcurementStatus,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface ProcurementPaginated {
  data: ProcurementRecord[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export const procurementClient = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: ProcurementStatus;
    supplier_id?: number;
    product_id?: number;
    search?: string;
  }) =>
    HttpClient.get<ProcurementPaginated>(
      API_ENDPOINTS.PROCUREMENT_HISTORY,
      params,
    ),
  stats: () =>
    HttpClient.get<ProcurementStats>(API_ENDPOINTS.PROCUREMENT_HISTORY_STATS),
  markReceived: (id: number) =>
    HttpClient.put<ProcurementRecord>(
      API_ENDPOINTS.PROCUREMENT_HISTORY_RECEIVE(id),
      {},
    ),
};
