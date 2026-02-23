/**
 * Astrologer Dashboard Service - Real Backend Integration
 *
 * Handles astrologer-specific features: stats, availability,
 * incoming requests, waitlist, active sessions, earnings.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
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
  async getStats(astrologerId: string): Promise<ApiResponse<AstrologerStatsResponse>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.STATS(astrologerId));
  }

  // ─── Availability ────────────────────────────────────────────────
  async getAvailabilityStatus(): Promise<ApiResponse<AvailabilityStatusResponse>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.AVAILABILITY_STATUS);
  }

  async toggleAvailability(type?: 'chat' | 'call' | 'all'): Promise<ApiResponse<ToggleAvailabilityResponse>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.TOGGLE_AVAILABILITY, { type });
  }

  async updateAvailability(
    availability: { chat?: boolean; call?: boolean; video?: boolean }
  ): Promise<ApiResponse<ToggleAvailabilityResponse>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.TOGGLE_AVAILABILITY, availability);
  }

  async sendHeartbeat(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.HEARTBEAT);
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
  async getActiveChatSession(): Promise<ApiResponse<ActiveSession | null>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_ACTIVE);
  }

  async getActiveCallSession(): Promise<ApiResponse<ActiveSession | null>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.CALL_ACTIVE);
  }

  // ─── End Sessions ───────────────────────────────────────────────
  async endChatSession(sessionId: string): Promise<ApiResponse<EndSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_END_SESSION(sessionId));
  }

  async endCallSession(sessionId: string): Promise<ApiResponse<EndSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CALL_END_SESSION(sessionId));
  }

  // ─── Chat Messages (Astrologer Side) ────────────────────────────
  async getChatMessages(sessionId: string, page?: number, limit?: number): Promise<ApiResponse<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
  }>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_MESSAGES(sessionId), {
      params: { page, limit },
    });
  }

  async sendMessage(sessionId: string, content: string, type: 'text' | 'image' = 'text'): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_MESSAGES(sessionId), {
      content,
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
