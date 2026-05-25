import { HttpClient } from './http-client';
import { API_ENDPOINTS } from './api-endpoints';
import {
  CreatePrescriptionInput,
  GetPrescriptionsQuery,
  Prescription,
  PrescriptionPaginator,
  PrescriptionStats,
  UpdatePrescriptionInput,
} from '@/types';

export const prescriptionClient = {
  create: (input: CreatePrescriptionInput) => {
    return HttpClient.post<Prescription>(API_ENDPOINTS.PRESCRIPTIONS, input);
  },
  getAll: (query: GetPrescriptionsQuery) => {
    return HttpClient.get<PrescriptionPaginator>(
      API_ENDPOINTS.PRESCRIPTIONS,
      query,
    );
  },
  getMyPrescriptions: (query: GetPrescriptionsQuery) => {
    return HttpClient.get<PrescriptionPaginator>(
      API_ENDPOINTS.PRESCRIPTIONS_MY,
      query,
    );
  },
  getById: (id: number) => {
    return HttpClient.get<Prescription>(`${API_ENDPOINTS.PRESCRIPTIONS}/${id}`);
  },
  update: (id: number, input: UpdatePrescriptionInput) => {
    return HttpClient.put<Prescription>(
      `${API_ENDPOINTS.PRESCRIPTIONS}/${id}`,
      input,
    );
  },
  delete: (id: number) => {
    return HttpClient.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.PRESCRIPTIONS}/${id}`,
    );
  },
  approve: (id: number, admin_notes?: string) => {
    return HttpClient.post<Prescription>(
      API_ENDPOINTS.PRESCRIPTIONS_APPROVE(id),
      { admin_notes },
    );
  },
  reject: (id: number, reason: string) => {
    return HttpClient.post<Prescription>(API_ENDPOINTS.PRESCRIPTIONS_REJECT(id), {
      reason,
    });
  },
  assignToShop: (id: number, shopId: number) => {
    return HttpClient.post<Prescription>(
      API_ENDPOINTS.PRESCRIPTIONS_ASSIGN_SHOP(id),
      { shopId },
    );
  },
  getStats: () => {
    return HttpClient.get<PrescriptionStats>(API_ENDPOINTS.PRESCRIPTIONS_STATS);
  },
};
