/**
 * Notification Service - Real Backend Integration
 *
 * Handles notification listing, read status, and unread count.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, Notification } from '@/types/api.types';

class NotificationService {
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<{
    notifications: Notification[];
    totalPages: number;
    page: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page, limit },
    });
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  }

  async markAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  async markAllAsRead(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }
}

export const notificationService = new NotificationService();
