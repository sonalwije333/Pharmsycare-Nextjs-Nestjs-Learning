import {
  ReorderRequest,
  ReorderRequestStatus,
  ReorderStats,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const reorderClient = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: ReorderRequestStatus;
    supplier_id?: number;
    shop_id?: number;
  }) =>
    HttpClient.get<{ data: ReorderRequest[]; total: number }>(
      API_ENDPOINTS.REORDER_REQUESTS,
      params,
    ),
  stats: () => HttpClient.get<ReorderStats>(API_ENDPOINTS.REORDER_REQUESTS_STATS),
  runAuto: () =>
    HttpClient.post<{ scanned: number; created: number; notified: number }>(
      API_ENDPOINTS.REORDER_REQUESTS_RUN_AUTO,
      {},
    ),
  notify: (id: number) =>
    HttpClient.post<ReorderRequest>(API_ENDPOINTS.REORDER_REQUEST_NOTIFY(id), {}),
  updateStatus: (id: number, status: ReorderRequestStatus) =>
    HttpClient.put<ReorderRequest>(API_ENDPOINTS.REORDER_REQUEST_STATUS(id), {
      status,
    }),
};
