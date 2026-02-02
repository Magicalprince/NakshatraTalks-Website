/**
 * Astrologer Dashboard Hooks - React Query hooks for astrologer features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { astrologerDashboardService } from '@/lib/services/astrologer-dashboard.service';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useRef, useCallback } from 'react';

// Query keys
export const ASTROLOGER_QUERY_KEYS = {
  stats: ['astrologer', 'stats'] as const,
  availability: ['astrologer', 'availability'] as const,
  incomingRequests: ['astrologer', 'incoming'] as const,
  waitlist: ['astrologer', 'waitlist'] as const,
  activeChat: ['astrologer', 'active', 'chat'] as const,
  activeCall: ['astrologer', 'active', 'call'] as const,
  chatMessages: (sessionId: string) => ['astrologer', 'chat', 'messages', sessionId] as const,
};

/**
 * Hook for fetching astrologer statistics
 */
export function useAstrologerStats() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.stats,
    queryFn: async () => {
      const response = await astrologerDashboardService.getStats();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook for fetching availability status
 */
export function useAvailabilityStatus() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.availability,
    queryFn: async () => {
      const response = await astrologerDashboardService.getAvailabilityStatus();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Alias for backwards compatibility
export const useAstrologerAvailability = useAvailabilityStatus;

/**
 * Hook for toggling availability
 */
export function useToggleAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type?: 'chat' | 'call' | 'all') =>
      astrologerDashboardService.toggleAvailability(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.availability });
    },
  });
}

/**
 * Hook for updating availability with specific settings
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availability: { chat?: boolean; call?: boolean; video?: boolean }) =>
      astrologerDashboardService.updateAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.availability });
    },
  });
}

/**
 * Hook for sending heartbeat
 */
export function useHeartbeat(enabled: boolean = true) {
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = useCallback(async () => {
    try {
      await astrologerDashboardService.sendHeartbeat();
    } catch {
      // Ignore heartbeat errors
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval
    heartbeatInterval.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [enabled, sendHeartbeat]);
}

/**
 * Hook for fetching incoming requests
 */
export function useIncomingRequests() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests,
    queryFn: async () => {
      const response = await astrologerDashboardService.getIncomingRequests();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

/**
 * Hook for fetching waitlist
 */
export function useWaitlist() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.waitlist,
    queryFn: async () => {
      const response = await astrologerDashboardService.getWaitlist();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

/**
 * Hook for accepting/rejecting chat requests
 */
export function useChatRequestActions() {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      astrologerDashboardService.acceptChatRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeChat });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      astrologerDashboardService.rejectChatRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
    },
  });

  return {
    acceptRequest: acceptMutation.mutate,
    rejectRequest: rejectMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}

/**
 * Hook for accepting a request (generic)
 */
export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      astrologerDashboardService.acceptChatRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeChat });
    },
  });
}

/**
 * Hook for rejecting a request (generic)
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      astrologerDashboardService.rejectChatRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
    },
  });
}

/**
 * Hook for accepting/rejecting call requests
 */
export function useCallRequestActions() {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      astrologerDashboardService.acceptCallRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeCall });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      astrologerDashboardService.rejectCallRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
    },
  });

  return {
    acceptRequest: acceptMutation.mutate,
    rejectRequest: rejectMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}

/**
 * Hook for fetching active chat session
 */
export function useActiveChat() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.activeChat,
    queryFn: async () => {
      const response = await astrologerDashboardService.getActiveChatSession();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 10000,
  });
}

/**
 * Hook for fetching active call session
 */
export function useActiveCall() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.activeCall,
    queryFn: async () => {
      const response = await astrologerDashboardService.getActiveCallSession();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 10000,
  });
}

/**
 * Hook for fetching active sessions by type
 */
export function useActiveSessions(type: 'chat' | 'call') {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: type === 'chat' ? ASTROLOGER_QUERY_KEYS.activeChat : ASTROLOGER_QUERY_KEYS.activeCall,
    queryFn: async () => {
      const response = type === 'chat'
        ? await astrologerDashboardService.getActiveChatSession()
        : await astrologerDashboardService.getActiveCallSession();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 10000,
  });
}

/**
 * Hook for ending chat session (astrologer)
 */
export function useEndChatSessionAstrologer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      astrologerDashboardService.endChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeChat });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.stats });
    },
  });
}

/**
 * Hook for ending call session (astrologer)
 */
export function useEndCallSessionAstrologer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      astrologerDashboardService.endCallSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeCall });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.stats });
    },
  });
}

/**
 * Hook for sending messages (astrologer)
 */
export function useSendMessageAstrologer(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, type = 'text' }: { content: string; type?: 'text' | 'image' }) =>
      astrologerDashboardService.sendMessage(sessionId, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.chatMessages(sessionId) });
    },
  });
}

/**
 * Hook for connecting to queued users
 */
export function useQueueConnect() {
  const queryClient = useQueryClient();

  const connectChat = useMutation({
    mutationFn: (queueId: string) =>
      astrologerDashboardService.connectChatQueue(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeChat });
    },
  });

  const connectCall = useMutation({
    mutationFn: (queueId: string) =>
      astrologerDashboardService.connectCallQueue(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeCall });
    },
  });

  return {
    connectChat: connectChat.mutate,
    connectCall: connectCall.mutate,
    isConnectingChat: connectChat.isPending,
    isConnectingCall: connectCall.isPending,
  };
}
