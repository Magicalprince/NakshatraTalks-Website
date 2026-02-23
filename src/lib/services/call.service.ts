/**
 * Call Service - Real Backend Integration
 *
 * Handles voice call lifecycle: request, accept, Twilio room, end, history.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  ChatSession,
  EndCallSessionResponse,
  BalanceValidationResponse,
  JoinQueueResponse,
  QueueInfoResponse,
} from '@/types/api.types';

export interface InitiateCallResponse {
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: string;
  remainingSeconds: number;
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

export interface CallSessionResponse {
  session: ChatSession;
  astrologer: { id: string; name: string; image: string; isOnline: boolean };
  user?: { id: string; name: string; image?: string };
  twilio: { roomName: string; token: string };
}

class CallService {
  // ─── Balance Validation ──────────────────────────────────────────
  async validateBalance(astrologerId: string): Promise<ApiResponse<BalanceValidationResponse>> {
    return apiClient.post(API_ENDPOINTS.CALL.VALIDATE_BALANCE, { astrologerId });
  }

  // ─── Request Flow ────────────────────────────────────────────────
  async initiateCall(astrologerId: string): Promise<ApiResponse<InitiateCallResponse>> {
    return apiClient.post(API_ENDPOINTS.CALL.REQUEST, { astrologerId });
  }

  async getRequestStatus(requestId: string): Promise<ApiResponse<CallRequestStatusResponse>> {
    return apiClient.get(API_ENDPOINTS.CALL.REQUEST_STATUS(requestId));
  }

  async cancelRequest(requestId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CALL.CANCEL(requestId));
  }

  async getPendingRequest(): Promise<ApiResponse<InitiateCallResponse | null>> {
    return apiClient.get(API_ENDPOINTS.CALL.PENDING_REQUEST);
  }

  // ─── Queue Flow ──────────────────────────────────────────────────
  async joinQueue(astrologerId: string): Promise<ApiResponse<JoinQueueResponse>> {
    return apiClient.post(API_ENDPOINTS.CALL.QUEUE_JOIN, { astrologerId });
  }

  async getQueueInfo(astrologerId: string): Promise<ApiResponse<QueueInfoResponse>> {
    return apiClient.get(API_ENDPOINTS.CALL.QUEUE_INFO(astrologerId));
  }

  async leaveQueue(queueId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CALL.QUEUE_LEAVE(queueId));
  }

  // ─── Session Management ──────────────────────────────────────────
  async getActiveSession(): Promise<ApiResponse<ChatSession | null>> {
    return apiClient.get(API_ENDPOINTS.CALL.ACTIVE_SESSION);
  }

  async getSession(sessionId: string): Promise<ApiResponse<CallSessionResponse>> {
    return apiClient.get(API_ENDPOINTS.CALL.SESSION(sessionId));
  }

  async getSessionDetails(sessionId: string): Promise<ApiResponse<CallSessionResponse>> {
    return apiClient.get(API_ENDPOINTS.CALL.SESSION_DETAILS(sessionId));
  }

  async endSession(sessionId: string): Promise<ApiResponse<EndCallSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.CALL.END(sessionId));
  }

  async declineSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CALL.DECLINE_SESSION(sessionId));
  }

  // ─── Twilio Token ────────────────────────────────────────────────
  async getTwilioToken(sessionId: string): Promise<ApiResponse<{
    token: string;
    roomName: string;
    identity: string;
  }>> {
    return apiClient.get(API_ENDPOINTS.CALL.TOKEN(sessionId));
  }

  // ─── Rating ──────────────────────────────────────────────────────
  async rateSession(
    sessionId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CALL.RATING(sessionId), { rating, review });
  }

  // ─── History ─────────────────────────────────────────────────────
  async getCallHistory(page = 1, limit = 20): Promise<ApiResponse<{
    sessions: ChatSession[];
    totalPages: number;
    page: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.CALL.HISTORY, { params: { page, limit } });
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  calculateCost(durationSeconds: number, pricePerMinute: number): number {
    return Math.ceil(durationSeconds / 60) * pricePerMinute;
  }
}

export const callService = new CallService();
