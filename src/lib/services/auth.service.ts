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
import { mockApi, shouldUseMockData, MOCK_USER, MOCK_ASTROLOGERS } from '@/lib/mock';

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
    // Use mock in development
    if (shouldUseMockData()) {
      await mockApi.auth.sendOtp(params.phone);
      return {
        success: true,
        data: {
          success: true,
          message: 'OTP sent successfully',
        },
        message: 'OTP sent successfully',
      };
    }

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
    // Use mock in development
    if (shouldUseMockData()) {
      // Accept any 6-digit OTP for testing
      if (params.otp.length === 6) {
        // Check if phone matches astrologer for testing astrologer dashboard
        const isAstrologer = params.phone === '9876543210';
        const mockAstrologer = MOCK_ASTROLOGERS[0];

        apiClient.setAccessToken('mock-access-token-12345');

        return {
          success: true,
          data: {
            success: true,
            message: 'Login successful',
            userType: isAstrologer ? 'astrologer' as const : 'user' as const,
            access_token: 'mock-access-token-12345',
            refresh_token: 'mock-refresh-token-67890',
            user: isAstrologer
              ? {
                  ...MOCK_USER,
                  id: mockAstrologer.id,
                  phone: mockAstrologer.phone,
                  name: mockAstrologer.name,
                  email: mockAstrologer.email,
                  role: 'astrologer' as const,
                }
              : MOCK_USER,
            astrologer: isAstrologer
              ? {
                  id: mockAstrologer.id,
                  name: mockAstrologer.name,
                  phone: mockAstrologer.phone,
                  email: mockAstrologer.email || undefined,
                  image: mockAstrologer.image,
                  bio: mockAstrologer.bio || undefined,
                  specialization: mockAstrologer.specialization,
                  languages: mockAstrologer.languages,
                  experience: mockAstrologer.experience,
                  education: mockAstrologer.education,
                  chatPricePerMinute: mockAstrologer.chatPricePerMinute || 25,
                  callPricePerMinute: mockAstrologer.callPricePerMinute || 30,
                  rating: mockAstrologer.rating,
                  totalCalls: mockAstrologer.totalCalls,
                  totalReviews: mockAstrologer.totalReviews || 0,
                  isAvailable: mockAstrologer.isAvailable,
                  chatAvailable: mockAstrologer.chatAvailable || true,
                  callAvailable: mockAstrologer.callAvailable || true,
                  isLive: mockAstrologer.isLive,
                  workingHours: {},
                  status: 'approved' as const,
                  createdAt: mockAstrologer.createdAt || new Date().toISOString(),
                  updatedAt: mockAstrologer.updatedAt || new Date().toISOString(),
                }
              : undefined,
          },
          message: 'Login successful',
        };
      }
      return {
        success: false,
        message: 'Invalid OTP. Please try again.',
      };
    }

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
    // Use mock in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          success: true,
          user: MOCK_USER,
        },
        message: 'Success',
      };
    }

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
