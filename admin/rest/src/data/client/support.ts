import {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStats,
  SupportTicketStatus,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface SupportTicketPaginated {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const supportClient = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: SupportTicketStatus;
    category?: SupportTicketCategory;
    search?: string;
  }) =>
    HttpClient.get<SupportTicketPaginated>(API_ENDPOINTS.SUPPORT_TICKETS, params),
  stats: () =>
    HttpClient.get<SupportTicketStats>(API_ENDPOINTS.SUPPORT_TICKETS_STATS),
  reply: (id: number, message: string, status?: SupportTicketStatus) =>
    HttpClient.post<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_REPLY(id), {
      message,
      status,
    }),
  updateStatus: (id: number, status: SupportTicketStatus) =>
    HttpClient.put<SupportTicket>(API_ENDPOINTS.SUPPORT_TICKET_STATUS(id), {
      status,
    }),
};
