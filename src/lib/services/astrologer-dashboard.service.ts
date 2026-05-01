/**
 * Astrologer Dashboard Service - Real Backend Integration
 *
 * Handles astrologer-specific features: stats, availability,
 * incoming requests, waitlist, active sessions, earnings.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getOrCreateDeviceId } from '@/lib/device-id';
import {
  ApiResponse,
  AvailabilityStatusResponse,
  ToggleAvailabilityResponse,
  IncomingRequestsResponse,
  UnifiedWaitlistResponse,
  ActiveSession,
  EndSessionResponse,
  ChatMessage,
  AstrologerDashboardResponse,
  AstrologerStatsResponse,
  Pagination,
} from '@/types/api.types';

// ─── Earnings Types ─────────────────────────────────────────────
export interface EarningsSummaryResponse {
  totalEarnings: number;
  thisMonthEarnings: number;
  todayEarnings: number;
  pendingEarnings: number;
  currency: string;
  commissionRate: number;
  stats: {
    totalSessions: number;
    thisMonthSessions: number;
    todaySessions: number;
    activeSessions: number;
  };
  last7Days: Array<{ date: string; earnings: number; sessions: number }>;
}

export interface EarningEntry {
  id: string;
  sessionId: string;
  sessionType: 'chat' | 'call' | 'video';
  user: { id: string; name: string; image: string | null } | null;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  durationSeconds: number;
  pricePerMinute: number;
  totalCost: number;
  earnings: number;
  platformFee: number;
  rating: number | null;
  createdAt: string;
}

export interface EarningsHistoryResponse {
  success: boolean;
  data: EarningEntry[];
  pagination: Pagination;
}

class AstrologerDashboardService {
  // ─── Dashboard (today's data + recent sessions) ────────────────
  async getDashboard(): Promise<ApiResponse<AstrologerDashboardResponse>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.DASHBOARD);
  }

  // ─── Stats (all-time totals) ──────────────────────────────────
  // Backend returns averageRating/totalConsultations but frontend uses rating/totalSessions.
  // Normalize here so dashboard code doesn't need to check both variants.
  async getStats(astrologerId: string): Promise<ApiResponse<AstrologerStatsResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.ASTROLOGERS.STATS(astrologerId));

    // Unwrap: apiClient may return { success, data } or raw data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stats: any = raw;
    if (stats && typeof stats === 'object' && 'success' in stats && 'data' in stats) {
      stats = stats.data;
    }
    // Some endpoints double-wrap: { success, data: { success, data } }
    if (stats && typeof stats === 'object' && 'success' in stats && 'data' in stats) {
      stats = stats.data;
    }

    if (stats && typeof stats === 'object') {
      // Normalize backend field names → frontend field names
      if (stats.averageRating != null && stats.rating == null) {
        stats.rating = stats.averageRating;
      }
      if (stats.totalConsultations != null && stats.totalSessions == null) {
        stats.totalSessions = stats.totalConsultations;
      }
      if (stats.averageSessionDuration != null && stats.avgSessionDuration == null) {
        stats.avgSessionDuration = stats.averageSessionDuration;
      }
    }

    return { success: true, data: stats as AstrologerStatsResponse };
  }

  // ─── Availability ────────────────────────────────────────────────
  async getAvailabilityStatus(): Promise<ApiResponse<AvailabilityStatusResponse>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.AVAILABILITY_STATUS);
  }

  async toggleAvailability(isAvailable: boolean): Promise<ApiResponse<ToggleAvailabilityResponse>> {
    const device_id = getOrCreateDeviceId();
    return apiClient.patch(API_ENDPOINTS.ASTROLOGERS.ME.TOGGLE_AVAILABILITY, { isAvailable, device_id });
  }

  async sendHeartbeat(): Promise<ApiResponse<{ success: boolean }>> {
    const device_id = getOrCreateDeviceId();
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.HEARTBEAT, { device_id });
  }

  /**
   * Returns THIS browser's device row state. Used by the dashboard to drive
   * the local toggle UI from the per-device toggle_on value (multi-device
   * foundation), not from the aggregate (which is OR-of-all-devices and
   * would falsely flip the UI when ANOTHER device toggles on).
   */
  async getDeviceState(): Promise<ApiResponse<{
    is_online: boolean;
    toggle_on: boolean;
    is_in_background: boolean;
    last_heartbeat: string;
  }>> {
    const device_id = getOrCreateDeviceId();
    return apiClient.get(`${API_ENDPOINTS.ASTROLOGERS.ME.DEVICE_STATE}?device_id=${encodeURIComponent(device_id)}`);
  }

  // ─── Incoming Requests ───────────────────────────────────────────
  async getIncomingRequests(): Promise<ApiResponse<IncomingRequestsResponse>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.INCOMING_ALL);
  }

  // ─── Waitlist ────────────────────────────────────────────────────
  async getWaitlist(): Promise<ApiResponse<UnifiedWaitlistResponse>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.WAITLIST);
  }

  // ─── Chat Request Handling ───────────────────────────────────────
  async acceptChatRequest(requestId: string): Promise<ApiResponse<{
    sessionId: string;
    userId: string;
    userName: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_ACCEPT(requestId));
  }

  async rejectChatRequest(requestId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_REJECT(requestId), { reason });
  }

  // ─── Call Request Handling ───────────────────────────────────────
  async acceptCallRequest(requestId: string): Promise<ApiResponse<{
    sessionId: string;
    twilioRoomName: string;
    twilioToken: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CALL_ACCEPT(requestId));
  }

  async rejectCallRequest(requestId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CALL_REJECT(requestId), { reason });
  }

  // ─── Active Sessions ────────────────────────────────────────────
  // Backend may return { hasActiveChat, session } wrapper OR session directly.
  // Defensive unwrapping handles both formats (matching chat.service.ts pattern).
  async getActiveChatSession(): Promise<ApiResponse<ActiveSession | null>> {
    const response = await apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_ACTIVE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data = (response as any)?.data ?? response;

    // Unwrap ApiResponse wrapper if present
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      data = data.data;
    }

    // Unwrap { hasActiveChat, session } wrapper if present
    if (data && typeof data === 'object' && 'session' in data) {
      data = data.session ?? null;
    }

    // If data has a sessionId, it IS the session
    if (data && typeof data === 'object' && (data.sessionId || data.session_id || data.id)) {
      return { success: true, data: data as ActiveSession };
    }

    return { success: true, data: null };
  }

  async getActiveCallSession(): Promise<ApiResponse<ActiveSession | null>> {
    const response = await apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.CALL_ACTIVE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data = (response as any)?.data ?? response;

    // Unwrap ApiResponse wrapper if present
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      data = data.data;
    }

    // Unwrap { hasActiveCall, session } wrapper if present
    if (data && typeof data === 'object' && 'session' in data) {
      data = data.session ?? null;
    }

    // If data has a sessionId, it IS the session
    if (data && typeof data === 'object' && (data.sessionId || data.session_id || data.id)) {
      return { success: true, data: data as ActiveSession };
    }

    return { success: true, data: null };
  }

  // ─── End Sessions ───────────────────────────────────────────────
  async endChatSession(sessionId: string): Promise<ApiResponse<EndSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_END_SESSION(sessionId));
  }

  async endCallSession(sessionId: string): Promise<ApiResponse<EndSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CALL_END_SESSION(sessionId));
  }

  // ─── Chat Messages (Astrologer Side) ────────────────────────────
  async getChatMessages(sessionId: string, limit: number = 100): Promise<ApiResponse<{
    messages: ChatMessage[];
    hasMore: boolean;
  }>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_MESSAGES(sessionId), {
      params: { limit },
    });
  }

  async sendMessage(sessionId: string, content: string, type: 'text' | 'image' = 'text'): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_MESSAGES(sessionId), {
      message: content,
      type,
    });
  }

  // ─── Earnings ─────────────────────────────────────────────────
  async getEarningsSummary(): Promise<ApiResponse<EarningsSummaryResponse>> {
    return apiClient.get(API_ENDPOINTS.EARNINGS.SUMMARY);
  }

  async getEarningsHistory(
    page = 1,
    limit = 20,
    sessionType?: 'chat' | 'call' | 'video',
  ): Promise<EarningsHistoryResponse> {
    const params: Record<string, unknown> = { page, limit };
    if (sessionType) params.sessionType = sessionType;
    return apiClient.get(API_ENDPOINTS.EARNINGS.HISTORY, { params });
  }

  // ─── Live Session History (astrologer's ended live sessions) ──
  async getLiveSessionHistory(
    page = 1,
    limit = 20
  ): Promise<ApiResponse<unknown>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.ASTROLOGER_HISTORY, {
      params: { page, limit },
    });
  }

  // ─── Queue Connection ───────────────────────────────────────────
  async connectChatQueue(queueId: string): Promise<ApiResponse<{
    sessionId: string;
    userId: string;
    userName: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_QUEUE_CONNECT(queueId));
  }

  async connectCallQueue(queueId: string): Promise<ApiResponse<{
    sessionId: string;
    twilioRoomName: string;
    twilioToken: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CALL_QUEUE_CONNECT(queueId));
  }

  async cancelChatQueue(queueId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_QUEUE_CANCEL(queueId));
  }

  async cancelCallQueue(queueId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CALL_QUEUE_CANCEL(queueId));
  }
}

export const astrologerDashboardService = new AstrologerDashboardService();
