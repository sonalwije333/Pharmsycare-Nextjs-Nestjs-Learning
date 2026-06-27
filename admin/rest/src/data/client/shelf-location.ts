import {
  AssignShelfProductInput,
  CreateShelfLocationInput,
  ProductLocationResult,
  ShelfLayout,
  ShelfLocation,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface ShelfWithProducts {
  shelf: ShelfLocation;
  products: ProductLocationResult[];
}

export const shelfLocationClient = {
  layout: () => HttpClient.get<ShelfLayout>(API_ENDPOINTS.SHELF_LOCATIONS_LAYOUT),
  list: (params?: { search?: string; zone?: string; is_active?: boolean }) =>
    HttpClient.get<{ data: ShelfLocation[]; total: number }>(
      API_ENDPOINTS.SHELF_LOCATIONS,
      params,
    ),
  get: (id: number) =>
    HttpClient.get<ShelfWithProducts>(`${API_ENDPOINTS.SHELF_LOCATIONS}/${id}`),
  search: (text: string) =>
    HttpClient.get<ProductLocationResult[]>(
      API_ENDPOINTS.SHELF_LOCATIONS_SEARCH,
      { text },
    ),
  locate: (productId: number) =>
    HttpClient.get<ProductLocationResult>(
      API_ENDPOINTS.SHELF_LOCATION_LOCATE(productId),
    ),
  create: (input: CreateShelfLocationInput) =>
    HttpClient.post<ShelfLocation>(API_ENDPOINTS.SHELF_LOCATIONS, input),
  update: (id: number, input: Partial<CreateShelfLocationInput>) =>
    HttpClient.put<ShelfLocation>(`${API_ENDPOINTS.SHELF_LOCATIONS}/${id}`, input),
  remove: (id: number) =>
    HttpClient.delete<{ id: number; deleted: boolean }>(
      `${API_ENDPOINTS.SHELF_LOCATIONS}/${id}`,
    ),
  assignProduct: (id: number, input: AssignShelfProductInput) =>
    HttpClient.post(API_ENDPOINTS.SHELF_LOCATION_ASSIGN(id), input),
  unassignProduct: (productId: number) =>
    HttpClient.delete(API_ENDPOINTS.SHELF_LOCATION_UNASSIGN(productId)),
};
