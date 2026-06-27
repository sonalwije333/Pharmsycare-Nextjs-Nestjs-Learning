import {
  Branch,
  BranchAvailabilityResult,
  BranchCoordination,
  BranchOverview,
  BranchTransfer,
  BranchVendor,
  CentralizedInventory,
  CreateBranchInput,
  CreateBranchTransferInput,
  UpsertBranchInventoryInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const branchClient = {
  all: () => HttpClient.get<Branch[]>(API_ENDPOINTS.BRANCHES),
  get: (id: number) =>
    HttpClient.get<Branch>(`${API_ENDPOINTS.BRANCHES}/${id}`),
  overview: () =>
    HttpClient.get<BranchOverview>(API_ENDPOINTS.BRANCHES_OVERVIEW),
  vendors: (search?: string) =>
    HttpClient.get<BranchVendor[]>(API_ENDPOINTS.BRANCHES_VENDORS, { search }),
  availability: (text: string) =>
    HttpClient.get<BranchAvailabilityResult[]>(
      API_ENDPOINTS.BRANCHES_AVAILABILITY,
      { text },
    ),
  centralizedInventory: (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    HttpClient.get<CentralizedInventory>(
      API_ENDPOINTS.BRANCHES_INVENTORY,
      params,
    ),
  coordination: () =>
    HttpClient.get<BranchCoordination>(API_ENDPOINTS.BRANCHES_COORDINATION),
  transfers: () =>
    HttpClient.get<BranchTransfer[]>(API_ENDPOINTS.BRANCHES_TRANSFERS),
  create: (input: CreateBranchInput) =>
    HttpClient.post<Branch>(API_ENDPOINTS.BRANCHES, input),
  update: (id: number, input: Partial<CreateBranchInput>) =>
    HttpClient.put<Branch>(`${API_ENDPOINTS.BRANCHES}/${id}`, input),
  remove: (id: number) =>
    HttpClient.delete<{ id: number; deleted: boolean }>(
      `${API_ENDPOINTS.BRANCHES}/${id}`,
    ),
  upsertInventory: (id: number, input: UpsertBranchInventoryInput) =>
    HttpClient.post(API_ENDPOINTS.BRANCH_INVENTORY_UPSERT(id), input),
  removeInventory: (id: number, productId: number) =>
    HttpClient.delete(API_ENDPOINTS.BRANCH_INVENTORY_REMOVE(id, productId)),
  createTransfer: (input: CreateBranchTransferInput) =>
    HttpClient.post<BranchTransfer>(API_ENDPOINTS.BRANCHES_TRANSFERS, input),
};
