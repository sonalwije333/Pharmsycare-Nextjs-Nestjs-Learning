import {
  CreateGrnInput,
  GoodsReceivedNote,
  GrnStats,
  GrnStatus,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface GrnPaginated {
  data: GoodsReceivedNote[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export const grnClient = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: GrnStatus;
    supplier_id?: number;
    search?: string;
  }) =>
    HttpClient.get<GrnPaginated>(API_ENDPOINTS.GOODS_RECEIVED_NOTES, params),
  stats: () =>
    HttpClient.get<GrnStats>(API_ENDPOINTS.GOODS_RECEIVED_NOTES_STATS),
  get: (id: number) =>
    HttpClient.get<GoodsReceivedNote>(
      `${API_ENDPOINTS.GOODS_RECEIVED_NOTES}/${id}`,
    ),
  create: (input: CreateGrnInput) =>
    HttpClient.post<GoodsReceivedNote>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTES,
      input,
    ),
  receive: (id: number) =>
    HttpClient.put<GoodsReceivedNote>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTE_RECEIVE(id),
      {},
    ),
  cancel: (id: number) =>
    HttpClient.put<GoodsReceivedNote>(
      API_ENDPOINTS.GOODS_RECEIVED_NOTE_CANCEL(id),
      {},
    ),
};
