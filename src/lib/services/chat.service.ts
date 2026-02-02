/**
 * Chat Service - Chat Session API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, ChatSession, ChatMessage } from '@/types/api.types';

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

export interface InitiateChatParams {
  astrologerId: string;
}

export interface InitiateChatResponse {
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: string;
  remainingSeconds: number;
}

export interface ChatSessionResponse {
  session: ChatSession;
  messages: ChatMessage[];
  astrologer: {
    id: string;
    name: string;
    image: string;
    isOnline: boolean;
  };
}

class ChatService {
  /**
   * Initiate a chat session with an astrologer
   */
  async initiateChat(params: InitiateChatParams): Promise<ApiResponse<InitiateChatResponse>> {
    return apiClient.post<ApiResponse<InitiateChatResponse>>(
      API_ENDPOINTS.CHAT.INITIATE,
      params
    );
  }

  /**
   * Get chat session details
   */
  async getSession(sessionId: string): Promise<ApiResponse<ChatSessionResponse>> {
    return apiClient.get<ApiResponse<ChatSessionResponse>>(
      API_ENDPOINTS.CHAT.SESSION(sessionId)
    );
  }

  /**
   * Get chat messages
   */
  async getMessages(params: GetMessagesParams): Promise<ApiResponse<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
  }>> {
    const { sessionId, page = 1, limit = 50, before } = params;
    return apiClient.get<ApiResponse<{
      messages: ChatMessage[];
      hasMore: boolean;
      nextCursor?: string;
    }>>(
      API_ENDPOINTS.CHAT.MESSAGES(sessionId),
      { params: { page, limit, before } }
    );
  }

  /**
   * Send a message
   */
  async sendMessage(params: SendMessageParams): Promise<ApiResponse<ChatMessage>> {
    const { sessionId, content, type = 'text' } = params;
    return apiClient.post<ApiResponse<ChatMessage>>(
      API_ENDPOINTS.CHAT.SEND(sessionId),
      { content, type }
    );
  }

  /**
   * Mark messages as read
   */
  async markAsRead(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.CHAT.MARK_READ(sessionId)
    );
  }

  /**
   * End chat session
   */
  async endSession(sessionId: string): Promise<ApiResponse<{
    session: ChatSession;
    summary: {
      duration: number;
      totalMessages: number;
      totalCost: number;
    };
  }>> {
    return apiClient.post<ApiResponse<{
      session: ChatSession;
      summary: {
        duration: number;
        totalMessages: number;
        totalCost: number;
      };
    }>>(API_ENDPOINTS.CHAT.END(sessionId));
  }

  /**
   * Get user's chat history
   */
  async getChatHistory(
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
    }>>(API_ENDPOINTS.CHAT.HISTORY, { params: { page, limit } });
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(sessionId: string, isTyping: boolean): Promise<void> {
    // This would typically be handled via WebSocket/Supabase
    // Keeping as a placeholder for REST fallback
    await apiClient.post(API_ENDPOINTS.CHAT.TYPING(sessionId), { isTyping });
  }

  /**
   * Upload image for chat
   */
  async uploadImage(sessionId: string, file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post<ApiResponse<{ url: string }>>(
      API_ENDPOINTS.CHAT.UPLOAD(sessionId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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
   * Format timestamp for message display
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export const chatService = new ChatService();
