/**
 * Auth Service - Real Backend Authentication
 *
 * Handles OTP-based phone authentication via MSG91 (backend).
 * Same auth system shared with the NakshatraTalks mobile app.
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
   * Send OTP to phone number (via MSG91 on backend)
   */
  async sendOtp(params: SendOtpParams): Promise<ApiResponse<SendOtpResponse>> {
    return apiClient.post<ApiResponse<SendOtpResponse>>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      {
        phone: params.phone,
      }
    );
  }

  /**
   * Verify OTP and login — returns JWT tokens + user/astrologer data
   *
   * NOTE: Backend returns a flat response (fields at root level, not under `data`).
   * We normalize it into ApiResponse<VerifyOtpResponse> for consistency.
   */
  async verifyOtp(params: VerifyOtpParams): Promise<ApiResponse<VerifyOtpResponse>> {
    const raw = await apiClient.post<VerifyOtpResponse & { success?: boolean; message?: string }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      {
        phone: params.phone,
        otp: params.otp,
      }
    );

    // Backend returns flat: { success, message, userType, access_token, user, ... }
    // Normalize into ApiResponse<VerifyOtpResponse>
    const isSuccess = raw.success ?? !!raw.access_token;

    if (isSuccess && raw.access_token) {
      apiClient.setAccessToken(raw.access_token);
    }

    return {
      success: isSuccess,
      message: raw.message,
      data: isSuccess ? raw : undefined,
    };
  }

  /**
   * Get current authenticated user profile
   *
   * NOTE: Backend returns flat: { success, user, astrologer? }
   */
  async getMe(): Promise<ApiResponse<GetMeResponse>> {
    const raw = await apiClient.get<GetMeResponse & { success?: boolean }>(API_ENDPOINTS.AUTH.ME);
    // Normalize: if backend returns flat, wrap in data
    if ('user' in raw && !('data' in raw)) {
      return { success: raw.success ?? true, data: raw };
    }
    return raw as unknown as ApiResponse<GetMeResponse>;
  }

  /**
   * Refresh access token using refresh token (httpOnly cookie)
   *
   * NOTE: Backend returns flat: { success, access_token }
   */
  async refresh(): Promise<ApiResponse<{ access_token: string; refresh_token?: string }>> {
    const raw = await apiClient.post<{ success?: boolean; access_token?: string; refresh_token?: string }>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    // Normalize: if backend returns flat, wrap in data
    if ('access_token' in raw && !('data' in raw)) {
      return { success: raw.success ?? !!raw.access_token, data: raw as { access_token: string; refresh_token?: string } };
    }
    return raw as unknown as ApiResponse<{ access_token: string; refresh_token?: string }>;
  }

  /**
   * Logout — clear tokens client-side
   */
  logout(): void {
    apiClient.clearAccessToken();
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Validate Indian phone number (10 digits starting with 6-9)
   */
  validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  }

  /**
   * Format phone for display: "98765 43210"
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
