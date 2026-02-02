/**
 * Auth Service - Authentication API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  SendOtpResponse,
  VerifyOtpResponse,
  GetMeResponse,
} from '@/types/api.types';

export interface SendOtpParams {
  phone: string;
  countryCode?: string;
}

export interface VerifyOtpParams {
  phone: string;
  otp: string;
  countryCode?: string;
}

class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOtp(params: SendOtpParams): Promise<ApiResponse<SendOtpResponse>> {
    return apiClient.post<ApiResponse<SendOtpResponse>>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      {
        phone: params.phone,
        countryCode: params.countryCode || '+91',
      }
    );
  }

  /**
   * Verify OTP and login
   */
  async verifyOtp(params: VerifyOtpParams): Promise<ApiResponse<VerifyOtpResponse>> {
    const response = await apiClient.post<ApiResponse<VerifyOtpResponse>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      {
        phone: params.phone,
        otp: params.otp,
        countryCode: params.countryCode || '+91',
      }
    );

    // If successful, set the access token
    if (response.success && response.data?.access_token) {
      apiClient.setAccessToken(response.data.access_token);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    return apiClient.get<ApiResponse<GetMeResponse>>(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Refresh access token
   */
  async refresh(): Promise<ApiResponse<{ access_token: string; refresh_token?: string }>> {
    return apiClient.post<ApiResponse<{ access_token: string; refresh_token?: string }>>(
      API_ENDPOINTS.AUTH.REFRESH
    );
  }

  /**
   * Logout - Clear tokens
   */
  logout(): void {
    apiClient.clearAccessToken();
    // Note: The httpOnly refresh token cookie should be cleared by the server
    // on a logout endpoint, or will expire naturally
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Validate phone number format
   */
  validatePhone(phone: string): boolean {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  /**
   * Format phone number for display
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  }
}

export const authService = new AuthService();
