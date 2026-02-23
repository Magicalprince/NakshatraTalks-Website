/**
 * Chat Service - Real Backend Integration
 *
 * Handles chat session lifecycle: initiate, messages, end, history.
 * Real-time messaging will be handled via Socket.io (see socket.service.ts).
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
    return apiClient.post(API_ENDPOINTS.CHAT.VALIDATE_BALANCE, { astrologerId });
  }

  // ─── Request Flow ────────────────────────────────────────────────
  async createRequest(astrologerId: string): Promise<ApiResponse<CreateChatRequestResponse>> {
    return apiClient.post(API_ENDPOINTS.CHAT.REQUEST, { astrologerId });
  }

  async getRequestStatus(requestId: string): Promise<ApiResponse<ChatRequestStatusResponse>> {
    return apiClient.get(API_ENDPOINTS.CHAT.REQUEST_STATUS(requestId));
  }

  async cancelRequest(requestId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.CANCEL_REQUEST(requestId));
  }

  async getPendingRequest(): Promise<ApiResponse<CreateChatRequestResponse | null>> {
    return apiClient.get(API_ENDPOINTS.CHAT.PENDING_REQUEST);
  }

  // ─── Queue Flow ──────────────────────────────────────────────────
  async joinQueue(astrologerId: string): Promise<ApiResponse<JoinQueueResponse>> {
    return apiClient.post(API_ENDPOINTS.CHAT.QUEUE_JOIN, { astrologerId });
  }

  async getQueueInfo(astrologerId: string): Promise<ApiResponse<QueueInfoResponse>> {
    return apiClient.get(API_ENDPOINTS.CHAT.QUEUE_INFO(astrologerId));
  }

  async leaveQueue(queueId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.QUEUE_LEAVE(queueId));
  }

  // ─── Session Management ──────────────────────────────────────────
  async getActiveSession(): Promise<ApiResponse<ChatSession | null>> {
    return apiClient.get(API_ENDPOINTS.CHAT.ACTIVE_SESSION);
  }

  async getSession(sessionId: string): Promise<ApiResponse<{
    session: ChatSession;
    astrologer: { id: string; name: string; image: string; isOnline: boolean };
    user?: { id: string; name: string; image?: string };
  }>> {
    return apiClient.get(API_ENDPOINTS.CHAT.SESSION(sessionId));
  }

  async connectSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.CONNECT_SESSION(sessionId));
  }

  async endSession(sessionId: string): Promise<ApiResponse<EndChatSessionResponse>> {
    return apiClient.post(API_ENDPOINTS.CHAT.END(sessionId));
  }

  async declineSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.DECLINE_SESSION(sessionId));
  }

  // ─── Messages ────────────────────────────────────────────────────
  async getMessages(params: GetMessagesParams): Promise<ApiResponse<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
  }>> {
    const { sessionId, page = 1, limit = 50, before } = params;
    return apiClient.get(API_ENDPOINTS.CHAT.MESSAGES(sessionId), {
      params: { page, limit, before },
    });
  }

  async sendMessage(params: SendMessageParams): Promise<ApiResponse<ChatMessage>> {
    const { sessionId, content, type = 'text' } = params;
    return apiClient.post(API_ENDPOINTS.CHAT.SEND(sessionId), { content, type });
  }

  async markAsRead(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.MARK_READ(sessionId));
  }

  async sendTypingIndicator(sessionId: string, typing: boolean): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.TYPING(sessionId), { typing });
  }

  // ─── Rating ──────────────────────────────────────────────────────
  async rateSession(
    sessionId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.CHAT.RATING(sessionId), { rating, review });
  }

  // ─── History ─────────────────────────────────────────────────────
  async getChatHistory(page = 1, limit = 20): Promise<ApiResponse<{
    sessions: ChatSession[];
    totalPages: number;
    page: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.CHAT.HISTORY, { params: { page, limit } });
  }

  // ─── File Upload ─────────────────────────────────────────────────
  async uploadImage(sessionId: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(API_ENDPOINTS.CHAT.UPLOAD(sessionId), formData);
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
