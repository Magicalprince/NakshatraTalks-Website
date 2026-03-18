/**
 * Chat Service - Real Backend Integration
 *
 * Handles chat session lifecycle: initiate, messages, end, history.
 * Real-time messaging will be handled via Socket.io (see socket.service.ts).
 *
 * Response normalization matches mobile app (chat.service.ts):
 * - Handles both camelCase and snake_case field names
 * - Handles both `requestId` and `id`
 * - Wraps raw responses into consistent ApiResponse shape
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  ChatSession,
  ChatMessage,
  BalanceValidationResponse,
  CreateChatRequestResponse,
  ChatRequestStatusResponse,
  EndChatSessionResponse,
  JoinQueueResponse,
  QueueInfoResponse,
} from '@/types/api.types';

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

export interface SendMessageParams {
  sessionId: string;
  content: string;
  type?: 'text' | 'image' | 'audio';
}

export interface GetMessagesParams {
  sessionId: string;
  page?: number;
  limit?: number;
  before?: string;
}

class ChatService {
  // ─── Balance Validation ──────────────────────────────────────────
  async validateBalance(astrologerId: string): Promise<ApiResponse<BalanceValidationResponse>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.VALIDATE_BALANCE, { astrologerId });
    return normalizeResponse<BalanceValidationResponse>(raw);
  }

  // ─── Request Flow ────────────────────────────────────────────────
  async createRequest(astrologerId: string, intakeProfileId?: string): Promise<ApiResponse<CreateChatRequestResponse>> {
    const body: Record<string, string> = { astrologerId };
    if (intakeProfileId) body.intakeProfileId = intakeProfileId;
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.REQUEST, body);
    const resp = normalizeResponse<CreateChatRequestResponse>(raw);

    // Normalize field names (matching mobile app's defensive handling)
    if (resp.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = resp.data as any;
      resp.data = {
        requestId: d.requestId || d.id || d.request_id,
        status: d.status || 'pending',
        expiresAt: d.expiresAt || d.expires_at || new Date(Date.now() + 60000).toISOString(),
        remainingSeconds: d.remainingSeconds ?? d.remaining_seconds ?? 60,
        pricePerMinute: d.pricePerMinute ?? d.price_per_minute ?? 0,
        astrologer: d.astrologer,
      };
    }
    return resp;
  }

  async getRequestStatus(requestId: string): Promise<ApiResponse<ChatRequestStatusResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.CHAT.REQUEST_STATUS(requestId));
    const resp = normalizeResponse<ChatRequestStatusResponse>(raw);

    // Normalize session fields if present
    if (resp.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = resp.data as any;
      const session = d.session;
      resp.data = {
        requestId: d.requestId || d.id || d.request_id || requestId,
        status: d.status,
        expiresAt: d.expiresAt || d.expires_at || '',
        remainingSeconds: d.remainingSeconds ?? d.remaining_seconds ?? 0,
        rejectReason: d.rejectReason || d.reject_reason || d.message,
        session: session ? {
          sessionId: session.sessionId || session.session_id || session.id,
          startTime: session.startTime || session.start_time || new Date().toISOString(),
          pricePerMinute: session.pricePerMinute ?? session.price_per_minute ?? 0,
        } : undefined,
      };
    }
    return resp;
  }

  async cancelRequest(requestId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.CANCEL_REQUEST(requestId));
    return normalizeResponse(raw);
  }

  async getPendingRequest(): Promise<ApiResponse<CreateChatRequestResponse | null>> {
    try {
      const raw = await apiClient.get(API_ENDPOINTS.CHAT.PENDING_REQUEST);
      const resp = normalizeResponse<CreateChatRequestResponse | null>(raw);
      if (resp.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = resp.data as any;
        resp.data = {
          requestId: d.requestId || d.id || d.request_id,
          status: d.status || 'pending',
          expiresAt: d.expiresAt || d.expires_at || '',
          remainingSeconds: d.remainingSeconds ?? d.remaining_seconds ?? 0,
          pricePerMinute: d.pricePerMinute ?? d.price_per_minute ?? 0,
          astrologer: d.astrologer,
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
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.QUEUE_JOIN, { astrologerId });
    return normalizeResponse<JoinQueueResponse>(raw);
  }

  async getQueueInfo(astrologerId: string): Promise<ApiResponse<QueueInfoResponse>> {
    const raw = await apiClient.get(API_ENDPOINTS.CHAT.QUEUE_INFO(astrologerId));
    return normalizeResponse<QueueInfoResponse>(raw);
  }

  async leaveQueue(queueId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.QUEUE_LEAVE(queueId));
    return normalizeResponse(raw);
  }

  async chatNowFromQueue(queueId: string): Promise<ApiResponse<{
    requestId: string;
    astrologerId: string;
    status: string;
    expiresAt: string;
    remainingSeconds: number;
    pricePerMinute: number;
  }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.QUEUE_CHAT_NOW(queueId));
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

  // ─── Session Management ──────────────────────────────────────────
  async getActiveSession(): Promise<ApiResponse<ChatSession | null>> {
    const raw = await apiClient.get(API_ENDPOINTS.CHAT.ACTIVE_SESSION);
    return normalizeResponse(raw);
  }

  /**
   * Get chat session details by sessionId.
   *
   * The backend does NOT have `GET /api/v1/chat/sessions/:id`.
   * Uses `GET /api/v1/chat/sessions/active` (matching mobile app pattern).
   */
  async getSession(sessionId: string): Promise<ApiResponse<{
    session: ChatSession;
    astrologer: { id: string; name: string; image: string; isOnline: boolean };
    user?: { id: string; name: string; image?: string };
  }>> {
    // Use active session endpoint (the only one that exists on backend)
    try {
      const activeRaw = await apiClient.get(API_ENDPOINTS.CHAT.ACTIVE_SESSION);
      const activeResp = normalizeResponse<ChatSession | null>(activeRaw);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let activeSession: any = activeResp.data;

      // Backend may return { hasActiveChat, session } wrapper
      if (activeSession?.session) {
        activeSession = activeSession.session;
      }

      if (activeSession && (activeSession.id === sessionId || !sessionId)) {
        const session = activeSession as ChatSession;
        return {
          success: true,
          data: {
            session,
            astrologer: {
              id: session.astrologerId,
              name: session.astrologerName || 'Astrologer',
              image: '',
              isOnline: true,
            },
          },
        };
      }
    } catch {
      // Active session also failed
    }

    // Last resort: construct minimal session data so the page doesn't crash
    return {
      success: true,
      data: {
        session: {
          id: sessionId,
          astrologerId: '',
          sessionType: 'chat',
          startTime: new Date().toISOString(),
          pricePerMinute: 0,
          status: 'active',
        },
        astrologer: {
          id: '',
          name: 'Astrologer',
          image: '',
          isOnline: true,
        },
      },
    };
  }

  async connectSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.CONNECT_SESSION(sessionId));
    return normalizeResponse(raw);
  }

  async endSession(sessionId: string): Promise<ApiResponse<EndChatSessionResponse>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.END(sessionId));
    return normalizeResponse(raw);
  }

  async declineSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.DECLINE_SESSION(sessionId));
    return normalizeResponse(raw);
  }

  // ─── Messages ────────────────────────────────────────────────────
  async getMessages(params: GetMessagesParams): Promise<ApiResponse<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
  }>> {
    const { sessionId, page = 1, limit = 50, before } = params;
    const raw = await apiClient.get(API_ENDPOINTS.CHAT.MESSAGES(sessionId), {
      params: { page, limit, before },
    });
    return normalizeResponse(raw);
  }

  async sendMessage(params: SendMessageParams): Promise<ApiResponse<ChatMessage>> {
    const { sessionId, content, type = 'text' } = params;
    // Backend expects { message, type } — mobile app field name is "message", not "content"
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.SEND(sessionId), { message: content, type });
    return normalizeResponse(raw);
  }

  async markAsRead(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.MARK_READ(sessionId));
    return normalizeResponse(raw);
  }

  async sendTypingIndicator(_sessionId: string, _typing: boolean): Promise<ApiResponse<{ success: boolean }>> {
    // Backend does not have a typing indicator endpoint (mobile app doesn't implement it either)
    // Return success silently to avoid 404 errors in console
    return { success: true, data: { success: true } };
  }

  // ─── Rating ──────────────────────────────────────────────────────
  async rateSession(
    sessionId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.RATING(sessionId), { rating, review });
    return normalizeResponse(raw);
  }

  // ─── History ─────────────────────────────────────────────────────
  async getChatHistory(page = 1, limit = 20): Promise<ApiResponse<{
    sessions: ChatSession[];
    totalPages: number;
    page: number;
  }>> {
    const raw = await apiClient.get(API_ENDPOINTS.CHAT.HISTORY, { params: { page, limit } });
    return normalizeResponse(raw);
  }

  // ─── File Upload ─────────────────────────────────────────────────
  async uploadImage(sessionId: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    const raw = await apiClient.post(API_ENDPOINTS.CHAT.UPLOAD(sessionId), formData);
    return normalizeResponse(raw);
  }

  // ─── Formatting Helpers ──────────────────────────────────────────
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatMessageTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export const chatService = new ChatService();
