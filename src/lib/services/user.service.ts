/**
 * User Service - User Profile API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, UserProfile, UpdateProfileData } from '@/types/api.types';

class UserService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<ApiResponse<UserProfile>>(
      API_ENDPOINTS.USER.PROFILE,
      data
    );
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post<ApiResponse<{ imageUrl: string }>>(
      `${API_ENDPOINTS.USER.PROFILE}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Delete account
   */
  async deleteAccount(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.USER.PROFILE
    );
  }

  /**
   * Get app state (used for restoring session state)
   */
  async getAppState(): Promise<ApiResponse<{
    activeSession?: {
      sessionId: string;
      type: 'chat' | 'call';
    };
    pendingRequest?: {
      requestId: string;
      type: 'chat' | 'call';
    };
    queueEntries?: Array<{
      queueId: string;
      astrologerId: string;
      type: 'chat' | 'call';
    }>;
  }>> {
    return apiClient.get<ApiResponse<{
      activeSession?: {
        sessionId: string;
        type: 'chat' | 'call';
      };
      pendingRequest?: {
        requestId: string;
        type: 'chat' | 'call';
      };
      queueEntries?: Array<{
        queueId: string;
        astrologerId: string;
        type: 'chat' | 'call';
      }>;
    }>>(API_ENDPOINTS.USER.APP_STATE);
  }
}

export const userService = new UserService();
