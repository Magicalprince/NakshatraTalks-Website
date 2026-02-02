/**
 * Astrologer Dashboard Service - API calls for astrologer-specific features
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  AstrologerStats,
  AvailabilityStatusResponse,
  ToggleAvailabilityResponse,
  IncomingRequestsResponse,
  UnifiedWaitlistResponse,
  ActiveSession,
  EndSessionResponse,
  ChatMessage,
} from '@/types/api.types';
import {
  shouldUseMockData,
  MOCK_ASTROLOGER_STATS,
  MOCK_INCOMING_REQUESTS,
  MOCK_WAITLIST,
  MOCK_ACTIVE_SESSION,
  MOCK_CHAT_MESSAGES,
} from '@/lib/mock';

class AstrologerDashboardService {
  /**
   * Get astrologer statistics
   */
  async getStats(): Promise<ApiResponse<AstrologerStats>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: MOCK_ASTROLOGER_STATS,
      };
    }

    return apiClient.get<ApiResponse<AstrologerStats>>(
      `${API_ENDPOINTS.ASTROLOGERS.LIST}/me/stats`
    );
  }

  /**
   * Get availability status
   */
  async getAvailabilityStatus(): Promise<ApiResponse<AvailabilityStatusResponse>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          isAvailable: true,
          chatAvailable: true,
          callAvailable: true,
          isLive: false,
        },
      };
    }

    return apiClient.get<ApiResponse<AvailabilityStatusResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.AVAILABILITY_STATUS
    );
  }

  /**
   * Toggle availability
   */
  async toggleAvailability(
    type?: 'chat' | 'call' | 'all'
  ): Promise<ApiResponse<ToggleAvailabilityResponse>> {
    return apiClient.post<ApiResponse<ToggleAvailabilityResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.TOGGLE_AVAILABILITY,
      { type }
    );
  }

  /**
   * Update availability with specific settings
   */
  async updateAvailability(
    availability: { chat?: boolean; call?: boolean; video?: boolean }
  ): Promise<ApiResponse<ToggleAvailabilityResponse>> {
    return apiClient.post<ApiResponse<ToggleAvailabilityResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.TOGGLE_AVAILABILITY,
      availability
    );
  }

  /**
   * Send heartbeat to maintain online status
   */
  async sendHeartbeat(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.ASTROLOGERS.ME.HEARTBEAT
    );
  }

  /**
   * Get all incoming requests (chat + call)
   */
  async getIncomingRequests(): Promise<ApiResponse<IncomingRequestsResponse>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          hasIncomingRequests: MOCK_INCOMING_REQUESTS.length > 0,
          requests: MOCK_INCOMING_REQUESTS,
        },
      };
    }

    return apiClient.get<ApiResponse<IncomingRequestsResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.INCOMING_ALL
    );
  }

  /**
   * Get unified waitlist
   */
  async getWaitlist(): Promise<ApiResponse<UnifiedWaitlistResponse>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          totalSize: MOCK_WAITLIST.length,
          callQueueSize: MOCK_WAITLIST.filter(w => w.type === 'call').length,
          chatQueueSize: MOCK_WAITLIST.filter(w => w.type === 'chat').length,
          waitlist: MOCK_WAITLIST,
        },
      };
    }

    return apiClient.get<ApiResponse<UnifiedWaitlistResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.WAITLIST
    );
  }

  /**
   * Accept chat request
   */
  async acceptChatRequest(requestId: string): Promise<ApiResponse<{
    sessionId: string;
    userId: string;
    userName: string;
  }>> {
    return apiClient.post<ApiResponse<{
      sessionId: string;
      userId: string;
      userName: string;
    }>>(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_ACCEPT(requestId));
  }

  /**
   * Reject chat request
   */
  async rejectChatRequest(requestId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CHAT_REJECT(requestId),
      { reason }
    );
  }

  /**
   * Accept call request
   */
  async acceptCallRequest(requestId: string): Promise<ApiResponse<{
    sessionId: string;
    twilioRoomName: string;
    twilioToken: string;
  }>> {
    return apiClient.post<ApiResponse<{
      sessionId: string;
      twilioRoomName: string;
      twilioToken: string;
    }>>(API_ENDPOINTS.ASTROLOGERS.ME.CALL_ACCEPT(requestId));
  }

  /**
   * Reject call request
   */
  async rejectCallRequest(requestId: string, reason?: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CALL_REJECT(requestId),
      { reason }
    );
  }

  /**
   * Get active chat session
   */
  async getActiveChatSession(): Promise<ApiResponse<ActiveSession | null>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: MOCK_ACTIVE_SESSION,
      };
    }

    return apiClient.get<ApiResponse<ActiveSession | null>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CHAT_ACTIVE
    );
  }

  /**
   * Get active call session
   */
  async getActiveCallSession(): Promise<ApiResponse<ActiveSession | null>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      // Return null for call session (no active call)
      return {
        success: true,
        data: null,
      };
    }

    return apiClient.get<ApiResponse<ActiveSession | null>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CALL_ACTIVE
    );
  }

  /**
   * End chat session
   */
  async endChatSession(sessionId: string): Promise<ApiResponse<EndSessionResponse>> {
    return apiClient.post<ApiResponse<EndSessionResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CHAT_END_SESSION(sessionId)
    );
  }

  /**
   * End call session
   */
  async endCallSession(sessionId: string): Promise<ApiResponse<EndSessionResponse>> {
    return apiClient.post<ApiResponse<EndSessionResponse>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CALL_END_SESSION(sessionId)
    );
  }

  /**
   * Get chat messages for astrologer
   */
  async getChatMessages(sessionId: string, page?: number, limit?: number): Promise<ApiResponse<{
    messages: ChatMessage[];
    hasMore: boolean;
    nextCursor?: string;
  }>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: {
          messages: MOCK_CHAT_MESSAGES,
          hasMore: false,
        },
      };
    }

    return apiClient.get<ApiResponse<{
      messages: ChatMessage[];
      hasMore: boolean;
      nextCursor?: string;
    }>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CHAT_MESSAGES(sessionId),
      { params: { page, limit } }
    );
  }

  /**
   * Send message as astrologer
   */
  async sendMessage(sessionId: string, content: string, type: 'text' | 'image' = 'text'): Promise<ApiResponse<ChatMessage>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId,
        senderId: 'astrologer-1',
        senderType: 'astrologer',
        message: content,
        content,
        type,
        isRead: false,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      return {
        success: true,
        data: newMessage,
      };
    }

    return apiClient.post<ApiResponse<ChatMessage>>(
      API_ENDPOINTS.ASTROLOGERS.ME.CHAT_MESSAGES(sessionId),
      { content, type }
    );
  }

  /**
   * Connect to queued user (chat)
   */
  async connectChatQueue(queueId: string): Promise<ApiResponse<{
    sessionId: string;
    userId: string;
    userName: string;
  }>> {
    return apiClient.post<ApiResponse<{
      sessionId: string;
      userId: string;
      userName: string;
    }>>(API_ENDPOINTS.ASTROLOGERS.ME.CHAT_QUEUE_CONNECT(queueId));
  }

  /**
   * Connect to queued user (call)
   */
  async connectCallQueue(queueId: string): Promise<ApiResponse<{
    sessionId: string;
    twilioRoomName: string;
    twilioToken: string;
  }>> {
    return apiClient.post<ApiResponse<{
      sessionId: string;
      twilioRoomName: string;
      twilioToken: string;
    }>>(API_ENDPOINTS.ASTROLOGERS.ME.CALL_QUEUE_CONNECT(queueId));
  }
}

export const astrologerDashboardService = new AstrologerDashboardService();
