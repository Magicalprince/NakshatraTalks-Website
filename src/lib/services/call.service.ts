/**
 * Call Service - Audio/Video Call API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, ChatSession, EndCallSessionResponse } from '@/types/api.types';

export interface InitiateCallParams {
  astrologerId: string;
  callType: 'audio' | 'video';
}

export interface InitiateCallResponse {
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: string;
  remainingSeconds: number;
}

export interface CallSessionResponse {
  session: ChatSession;
  astrologer: {
    id: string;
    name: string;
    image: string;
    isOnline: boolean;
  };
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  twilio: {
    roomName: string;
    token: string;
  };
}

export interface CallRequestStatusResponse {
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'cancelled';
  session?: {
    sessionId: string;
    twilioRoomName: string;
    twilioToken: string;
    pricePerMinute: number;
  };
  rejectReason?: string;
}

class CallService {
  /**
   * Initiate a call with an astrologer
   */
  async initiateCall(params: InitiateCallParams): Promise<ApiResponse<InitiateCallResponse>> {
    return apiClient.post<ApiResponse<InitiateCallResponse>>(
      API_ENDPOINTS.CALL.INITIATE,
      params
    );
  }

  /**
   * Get call session details
   */
  async getSession(sessionId: string): Promise<ApiResponse<CallSessionResponse>> {
    return apiClient.get<ApiResponse<CallSessionResponse>>(
      API_ENDPOINTS.CALL.SESSION(sessionId)
    );
  }

  /**
   * Check call request status
   */
  async getRequestStatus(requestId: string): Promise<ApiResponse<CallRequestStatusResponse>> {
    return apiClient.get<ApiResponse<CallRequestStatusResponse>>(
      API_ENDPOINTS.CALL.REQUEST_STATUS(requestId)
    );
  }

  /**
   * Get Twilio token for a session
   */
  async getTwilioToken(sessionId: string): Promise<ApiResponse<{
    token: string;
    roomName: string;
    identity: string;
  }>> {
    return apiClient.get<ApiResponse<{
      token: string;
      roomName: string;
      identity: string;
    }>>(API_ENDPOINTS.CALL.TOKEN(sessionId));
  }

  /**
   * End call session
   */
  async endSession(sessionId: string): Promise<ApiResponse<EndCallSessionResponse>> {
    return apiClient.post<ApiResponse<EndCallSessionResponse>>(
      API_ENDPOINTS.CALL.END(sessionId)
    );
  }

  /**
   * Get user's call history
   */
  async getCallHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    sessions: ChatSession[];
    totalPages: number;
    page: number;
  }>> {
    return apiClient.get<ApiResponse<{
      sessions: ChatSession[];
      totalPages: number;
      page: number;
    }>>(API_ENDPOINTS.CALL.HISTORY, { params: { page, limit } });
  }

  /**
   * Cancel call request
   */
  async cancelRequest(requestId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.CALL.CANCEL(requestId)
    );
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate estimated call cost
   */
  calculateCost(durationSeconds: number, pricePerMinute: number): number {
    const minutes = Math.ceil(durationSeconds / 60);
    return minutes * pricePerMinute;
  }
}

export const callService = new CallService();
