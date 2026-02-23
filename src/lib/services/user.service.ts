/**
 * User Service - Real Backend Integration
 *
 * Handles user profile CRUD, image upload, app state.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, UserProfile, UpdateProfileData } from '@/types/api.types';

class UserService {
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return apiClient.put(API_ENDPOINTS.USER.PROFILE, data);
  }

  async uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`${API_ENDPOINTS.USER.PROFILE}/image`, formData);
  }

  async deleteAccount(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.USER.PROFILE);
  }

  async updateAppState(state: 'foreground' | 'background'): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.USER.APP_STATE, { state });
  }
}

export const userService = new UserService();
