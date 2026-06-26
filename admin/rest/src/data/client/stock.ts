import { StockProduct } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface StockPaginated {
  data: StockProduct[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export const stockClient = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    HttpClient.get<StockPaginated>(API_ENDPOINTS.PRODUCTS_STOCK, params),
};
