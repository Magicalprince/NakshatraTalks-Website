/**
 * Live Session Service - Real Backend Integration
 *
 * Handles live astrologer streaming sessions:
 * - Browse/join sessions (user side)
 * - Create/manage sessions (astrologer side)
 *
 * Ported from NakshatraTalksMobile liveSession.service.ts
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  LiveSession,
  LiveSessionMessage,
  LiveSessionViewer,
  CreateLiveSessionData,
  JoinLiveSessionResponse,
  StartLiveSessionResponse,
  EndLiveSessionResponse,
  AstrologerScheduledSession,
  AstrologerSessionHistory,
} from '@/types/api.types';

class LiveSessionService {
  // ─── Public / User ───────────────────────────────────────────────
  async getSessions(status?: 'live' | 'scheduled'): Promise<ApiResponse<LiveSession[]>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.LIST, {
      params: status ? { status } : {},
    });
  }

  async getSession(sessionId: string): Promise<ApiResponse<LiveSession>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.DETAILS(sessionId));
  }

  async joinSession(sessionId: string): Promise<ApiResponse<JoinLiveSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.JOIN(sessionId));
  }

  async leaveSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.LEAVE(sessionId));
  }

  async getMessages(sessionId: string, page = 1, limit = 50): Promise<ApiResponse<LiveSessionMessage[]>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.MESSAGES(sessionId), {
      params: { page, limit },
    });
  }

  async sendMessage(sessionId: string, message: string, type: 'text' | 'emoji' = 'text'): Promise<ApiResponse<LiveSessionMessage>> {
    return apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.SEND_MESSAGE(sessionId), { message, type });
  }

  async getViewers(sessionId: string): Promise<ApiResponse<LiveSessionViewer[]>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.VIEWERS(sessionId));
  }

  // ─── Astrologer Side ────────────────────────────────────────────

  /** Create a new live session (scheduled or immediate) */
  async createSession(data: CreateLiveSessionData): Promise<ApiResponse<LiveSession>> {
    return apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.CREATE, data);
  }

  /** Update a scheduled session */
  async updateSession(sessionId: string, data: Partial<CreateLiveSessionData>): Promise<ApiResponse<LiveSession>> {
    return apiClient.put(API_ENDPOINTS.LIVE_SESSIONS.UPDATE(sessionId), data);
  }

  /** Delete/cancel a scheduled session */
  async deleteSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.LIVE_SESSIONS.DELETE(sessionId));
  }

  /** Start a live session - returns Twilio token and room info */
  async startSession(sessionId: string): Promise<ApiResponse<StartLiveSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.START(sessionId));
  }

  /** End a live session - returns session summary */
  async endSession(sessionId: string): Promise<ApiResponse<EndLiveSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.LIVE_SESSIONS.END(sessionId));
  }

  /** Get astrologer's scheduled sessions */
  async getScheduledSessions(): Promise<ApiResponse<AstrologerScheduledSession[]>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.ASTROLOGER_SCHEDULED);
  }

  /** Get astrologer's session history */
  async getSessionHistory(page = 1, limit = 20): Promise<ApiResponse<AstrologerSessionHistory[]>> {
    return apiClient.get(API_ENDPOINTS.LIVE_SESSIONS.ASTROLOGER_HISTORY, {
      params: { page, limit },
    });
  }
}

export const liveSessionService = new LiveSessionService();
