/**
 * User Service - User Profile API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, UserProfile, UpdateProfileData } from '@/types/api.types';
import { shouldUseMockData, MOCK_USER } from '@/lib/mock';

class UserService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          userId: MOCK_USER.id,
          name: MOCK_USER.name || undefined,
          phone: MOCK_USER.phone,
          email: MOCK_USER.email || undefined,
          profileImage: MOCK_USER.profileImage || undefined,
          walletBalance: MOCK_USER.walletBalance || 0,
          dateOfBirth: MOCK_USER.dateOfBirth || undefined,
          placeOfBirth: MOCK_USER.placeOfBirth || undefined,
          timeOfBirth: MOCK_USER.timeOfBirth || undefined,
          gender: MOCK_USER.gender || undefined,
          maritalStatus: MOCK_USER.maritalStatus || undefined,
          createdAt: MOCK_USER.createdAt || new Date().toISOString(),
        },
      };
    }

    return apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          userId: MOCK_USER.id,
          name: data.name || MOCK_USER.name || undefined,
          phone: MOCK_USER.phone,
          email: data.email || MOCK_USER.email || undefined,
          profileImage: MOCK_USER.profileImage || undefined,
          walletBalance: MOCK_USER.walletBalance || 0,
          dateOfBirth: data.dateOfBirth || MOCK_USER.dateOfBirth || undefined,
          placeOfBirth: data.placeOfBirth || MOCK_USER.placeOfBirth || undefined,
          timeOfBirth: data.timeOfBirth || MOCK_USER.timeOfBirth || undefined,
          gender: data.gender || MOCK_USER.gender || undefined,
          maritalStatus: data.maritalStatus || MOCK_USER.maritalStatus || undefined,
          createdAt: MOCK_USER.createdAt || new Date().toISOString(),
        },
      };
    }

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
