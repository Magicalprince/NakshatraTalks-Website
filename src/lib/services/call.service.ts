/**
 * Call Service - Real Backend Integration
 *
 * Handles voice call lifecycle: request, accept, Twilio room, end, history.
 *
 * Response normalization matches mobile app (call.service.ts):
 * - Handles both camelCase and snake_case field names
 * - Handles both `requestId` and `id`
 * - Wraps raw responses into consistent ApiResponse shape
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
  pricePerMinute?: number;
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

/**
 * Normalize an API response to ensure consistent { success, data } shape.
 * The backend may return either:
 *   A) { success: true, data: { ... } }        — wrapped
 *   B) { requestId, status, ... }               — direct data
 * This helper ensures callers always get format A.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResponse<T>(raw: any): ApiResponse<T> {
  // Already wrapped in { success, data }
  if (raw && typeof raw.success === 'boolean' && 'data' in raw) {
    return raw as ApiResponse<T>;
  }
  // Raw data without wrapper — wrap it
  return { success: true, data: raw as T, message: undefined };
}

class CallService {
  // ─── Balance Validation ──────────────────────────────────────────
  async validateBalance(astrologerId: string): Promise<ApiResponse<BalanceValidationResponse>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.VALIDATE_BALANCE, { astrologerId });
    return normalizeResponse<BalanceValidationResponse>(raw);
  }

  // ─── Request Flow ────────────────────────────────────────────────
  async initiateCall(astrologerId: string): Promise<ApiResponse<InitiateCallResponse>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.REQUEST, { astrologerId });
    const resp = normalizeResponse<InitiateCallResponse>(raw);

    // Normalize field names (matching mobile app's defensive handling)
    if (resp.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = resp.data as any;
      resp.data = {
        requestId: d.requestId || d.id || d.request_id,
        status: d.status || 'pending',
        expiresAt: d.expiresAt || d.expires_at || new Date(Date.now() + 60000).toISOString(),
        remainingSeconds: d.remainingSeconds ?? d.remaining_seconds ?? 60,
        pricePerMinute: d.pricePerMinute ?? d.price_per_minute,
      };
    }
    return resp;
  }

  async getRequestStatus(requestId: string): Promise<ApiResponse<CallRequestStatusResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.REQUEST_STATUS(requestId));
    const resp = normalizeResponse<CallRequestStatusResponse>(raw);

    // Normalize session fields if present
    if (resp.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = resp.data as any;
      const session = d.session;
      resp.data = {
        requestId: d.requestId || d.id || d.request_id || requestId,
        status: d.status,
        rejectReason: d.rejectReason || d.reject_reason || d.message,
        session: session ? {
          sessionId: session.sessionId || session.session_id || session.id,
          twilioRoomName: session.twilioRoomName || session.twilio_room_name || session.roomName,
          twilioToken: session.twilioToken || session.twilio_token || session.token,
          pricePerMinute: session.pricePerMinute ?? session.price_per_minute ?? 0,
        } : undefined,
      };
    }
    return resp;
  }

  async cancelRequest(requestId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.CANCEL(requestId));
    return normalizeResponse(raw);
  }

  async getPendingRequest(): Promise<ApiResponse<InitiateCallResponse | null>> {
    try {
      const raw = await apiClient.get(API_ENDPOINTS.CALL.PENDING_REQUEST);
      const resp = normalizeResponse<InitiateCallResponse | null>(raw);
      if (resp.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = resp.data as any;
        resp.data = {
          requestId: d.requestId || d.id || d.request_id,
          status: d.status || 'pending',
          expiresAt: d.expiresAt || d.expires_at || '',
          remainingSeconds: d.remainingSeconds ?? d.remaining_seconds ?? 0,
        };
      }
      return resp;
    } catch {
      // No pending request — return null
      return { success: true, data: null };
    }
  }

  // ─── Queue Flow ──────────────────────────────────────────────────
  async joinQueue(astrologerId: string): Promise<ApiResponse<JoinQueueResponse>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.QUEUE_JOIN, { astrologerId });
    return normalizeResponse<JoinQueueResponse>(raw);
  }

  async getQueueInfo(astrologerId: string): Promise<ApiResponse<QueueInfoResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.QUEUE_INFO(astrologerId));
    return normalizeResponse<QueueInfoResponse>(raw);
  }

  async leaveQueue(queueId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.QUEUE_LEAVE(queueId));
    return normalizeResponse(raw);
  }

  // ─── Session Management ──────────────────────────────────────────
  async getActiveSession(): Promise<ApiResponse<ChatSession | null>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.ACTIVE_SESSION);
    return normalizeResponse(raw);
  }

  async getSession(sessionId: string): Promise<ApiResponse<CallSessionResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.SESSION(sessionId));
    return normalizeResponse(raw);
  }

  async getSessionDetails(sessionId: string): Promise<ApiResponse<CallSessionResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.SESSION_DETAILS(sessionId));
    return normalizeResponse(raw);
  }

  async endSession(sessionId: string): Promise<ApiResponse<EndCallSessionResponse>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.END(sessionId));
    return normalizeResponse(raw);
  }

  async declineSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.DECLINE_SESSION(sessionId));
    return normalizeResponse(raw);
  }

  // ─── Connection Confirmation ────────────────────────────────────
  async confirmConnection(
    sessionId: string,
    roomSid?: string
  ): Promise<ApiResponse<{
    sessionId: string;
    participantType: 'user' | 'astrologer';
    connectionConfirmed: boolean;
    bothConnected: boolean;
  }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.CONFIRM_CONNECTION(sessionId), { roomSid });
    return normalizeResponse(raw);
  }

  // ─── Twilio Token ────────────────────────────────────────────────
  async getTwilioToken(sessionId: string): Promise<ApiResponse<{
    token: string;
    roomName: string;
    identity: string;
  }>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.TOKEN(sessionId));
    return normalizeResponse(raw);
  }

  // ─── Twilio Token Refresh (for long calls) ─────────────────────
  async refreshTwilioToken(sessionId: string): Promise<ApiResponse<{
    sessionId: string;
    twilioToken: string;
    twilioRoomName: string;
    expiresIn: number;
  }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.REFRESH_TOKEN(sessionId));
    return normalizeResponse(raw);
  }

  // ─── Queue Shortcut: Call Now From Queue ──────────────────────
  async callNowFromQueue(queueId: string): Promise<ApiResponse<{
    requestId: string;
    astrologerId: string;
    status: string;
    expiresAt: string;
    remainingSeconds: number;
    pricePerMinute: number;
  }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.QUEUE_CALL_NOW(queueId));
    const response = normalizeResponse<Record<string, unknown>>(raw);
    if (response.data) {
      const d = response.data;
      response.data = {
        requestId: (d.requestId || d.id || d.request_id) as string,
        astrologerId: d.astrologerId as string,
        status: d.status as string,
        expiresAt: (d.expiresAt || d.expires_at) as string,
        remainingSeconds: (d.remainingSeconds || d.remaining_seconds) as number,
        pricePerMinute: (d.pricePerMinute || d.price_per_minute) as number,
      } as unknown as Record<string, unknown>;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response as any;
  }

  // ─── Rating ──────────────────────────────────────────────────────
  async rateSession(
    sessionId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CALL.RATING(sessionId), { rating, review });
    return normalizeResponse(raw);
  }

  // ─── History ─────────────────────────────────────────────────────
  async getCallHistory(page = 1, limit = 20): Promise<ApiResponse<{
    sessions: ChatSession[];
    totalPages: number;
    page: number;
  }>> {
    const raw = await apiClient.get(API_ENDPOINTS.CALL.HISTORY, { params: { page, limit } });
    return normalizeResponse(raw);
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  calculateCost(durationSeconds: number, pricePerMinute: number): number {
    return Math.floor((durationSeconds / 60) * pricePerMinute);
  }
}

export const callService = new CallService();
