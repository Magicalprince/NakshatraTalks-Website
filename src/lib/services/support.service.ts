/**
 * Support Service - Real Backend Integration
 *
 * Handles customer support ticket creation and management.
 */

import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'support';
  message: string;
  createdAt: string;
}

class SupportService {
  async createTicket(data: {
    subject: string;
    description: string;
    category?: string;
  }): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post('/api/v1/support/tickets', data);
  }

  async getTickets(): Promise<ApiResponse<SupportTicket[]>> {
    return apiClient.get('/api/v1/support/tickets');
  }

  async getTicket(id: string): Promise<ApiResponse<SupportTicket>> {
    return apiClient.get(`/api/v1/support/tickets/${id}`);
  }

  async addMessage(ticketId: string, message: string): Promise<ApiResponse<SupportMessage>> {
    return apiClient.post(`/api/v1/support/tickets/${ticketId}/messages`, { message });
  }
}

export const supportService = new SupportService();
