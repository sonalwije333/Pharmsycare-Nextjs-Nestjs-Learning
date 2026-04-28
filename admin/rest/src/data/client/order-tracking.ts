import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export type OrderTrackingStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'in-transit'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderTrackingQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderTrackingStatus | string;
  order_id?: number;
  orderBy?: string;
  sortedBy?: string;
}

export interface OrderTracking {
  id: number;
  order_id: number;
  tracking_number?: string;
  carrier?: string;
  current_location?: string;
  status: OrderTrackingStatus;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderTrackingPaginator {
  data: OrderTracking[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  from: number;
  to: number;
  path: string;
  links: any[];
}

export const orderTrackingClient = {
  paginated: (params: Partial<OrderTrackingQueryOptions>) => {
    return HttpClient.get<OrderTrackingPaginator>(API_ENDPOINTS.ORDER_TRACKING, {
      searchJoin: 'and',
      ...params,
    });
  },
  updateStatus: ({
    id,
    status,
    staffId,
    notes,
  }: {
    id: number;
    status: OrderTrackingStatus | string;
    staffId: number;
    notes?: string;
  }) => {
    return HttpClient.post<OrderTracking>(
      `${API_ENDPOINTS.ORDER_TRACKING}/${id}/update-status`,
      { status, staffId, notes },
    );
  },
  delete: ({ id }: { id: number }) => {
    return HttpClient.delete<boolean>(`${API_ENDPOINTS.ORDER_TRACKING}/${id}`);
  },
};