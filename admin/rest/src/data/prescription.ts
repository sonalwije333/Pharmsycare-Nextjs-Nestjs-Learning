import { CreatePrescriptionInput, GetPrescriptionsQuery, UpdatePrescriptionInput } from '@/types';
import { prescriptionClient } from './client/prescription';

export const prescriptionService = {
  create: (input: CreatePrescriptionInput) => prescriptionClient.create(input),
  getAll: (query: GetPrescriptionsQuery) => prescriptionClient.getAll(query),
  getMyPrescriptions: (query: GetPrescriptionsQuery) =>
    prescriptionClient.getMyPrescriptions(query),
  getById: (id: number) => prescriptionClient.getById(id),
  update: (id: number, input: UpdatePrescriptionInput) =>
    prescriptionClient.update(id, input),
  delete: (id: number) => prescriptionClient.delete(id),
  approve: (id: number, adminNotes?: string) =>
    prescriptionClient.approve(id, adminNotes),
  reject: (id: number, reason: string) => prescriptionClient.reject(id, reason),
  assignToShop: (id: number, shopId: number) =>
    prescriptionClient.assignToShop(id, shopId),
  getStats: () => prescriptionClient.getStats(),
};
