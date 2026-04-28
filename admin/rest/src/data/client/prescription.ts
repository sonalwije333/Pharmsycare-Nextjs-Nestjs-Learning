import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export type PrescriptionStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface PrescriptionQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: PrescriptionStatus | string;
  shop_id?: number;
  customer_id?: number;
  orderBy?: string;
  sortedBy?: string;
}

export interface Prescription {
  id: number;
  customer_id: number;
  shop_id: number;
  doctor_name?: string;
  hospital_name?: string;
  status: PrescriptionStatus;
  prescription_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionPaginator {
  data: Prescription[];
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

export const prescriptionClient = {
  paginated: (params: Partial<PrescriptionQueryOptions>) => {
    return HttpClient.get<PrescriptionPaginator>(API_ENDPOINTS.PRESCRIPTIONS, {
      searchJoin: 'and',
      ...params,
    });
  },
  approve: ({
    id,
    staffId,
    notes,
  }: {
    id: number;
    staffId: number;
    notes?: string;
  }) => {
    return HttpClient.post<Prescription>(
      `${API_ENDPOINTS.PRESCRIPTIONS}/${id}/approve`,
      { staffId, notes },
    );
  },
  reject: ({
    id,
    staffId,
    notes,
  }: {
    id: number;
    staffId: number;
    notes?: string;
  }) => {
    return HttpClient.post<Prescription>(
      `${API_ENDPOINTS.PRESCRIPTIONS}/${id}/reject`,
      { staffId, notes },
    );
  },
  delete: ({ id }: { id: number }) => {
    return HttpClient.delete<boolean>(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`);
  },
};