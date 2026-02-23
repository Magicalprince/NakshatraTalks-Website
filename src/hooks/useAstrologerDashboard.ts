/**
 * Astrologer Dashboard Hooks - React Query hooks for astrologer features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { astrologerDashboardService } from '@/lib/services/astrologer-dashboard.service';
import type { EarningEntry } from '@/lib/services/astrologer-dashboard.service';
import { liveSessionService } from '@/lib/services/live-session.service';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useRef, useCallback } from 'react';
import type {
  Pagination,
  CreateLiveSessionData,
  AstrologerScheduledSession,
  AstrologerSessionHistory,
} from '@/types/api.types';

export type { EarningEntry };

export const ASTROLOGER_QUERY_KEYS = {
  stats: ['astrologer', 'stats'] as const,
  dashboard: ['astrologer', 'dashboard'] as const,
  availability: ['astrologer', 'availability'] as const,
  incomingRequests: ['astrologer', 'incoming'] as const,
  waitlist: ['astrologer', 'waitlist'] as const,
  activeChat: ['astrologer', 'active', 'chat'] as const,
  activeCall: ['astrologer', 'active', 'call'] as const,
  chatMessages: (sessionId: string) => ['astrologer', 'chat', 'messages', sessionId] as const,
  liveSessionHistory: ['astrologer', 'live', 'history'] as const,
  liveScheduledSessions: ['astrologer', 'live', 'scheduled'] as const,
  liveActiveSession: ['astrologer', 'live', 'active'] as const,
  earningsSummary: ['astrologer', 'earnings', 'summary'] as const,
  earningsHistory: (sessionType?: string) => ['astrologer', 'earnings', 'history', sessionType ?? 'all'] as const,
};

export function useAstrologerStats() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.stats,
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await astrologerDashboardService.getStats(user.id);
      return response.data;
    },
    enabled: isAstrologer && !!user?.id,
    refetchInterval: 60000,
  });
}

/**
 * Hook for fetching the astrologer dashboard
 * Returns today's earnings, recent sessions, profile summary, etc.
 */
export function useAstrologerDashboardData() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.dashboard,
    queryFn: async () => {
      const response = await astrologerDashboardService.getDashboard();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 60000,
  });
}

/**
 * Hook for fetching the earnings summary (all-time, this month, today, pending).
 * Uses GET /api/v1/astrologer/earnings/summary
 */
export function useEarningsSummary() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.earningsSummary,
    queryFn: async () => {
      const response = await astrologerDashboardService.getEarningsSummary();
      return response.data;
    },
    enabled: isAstrologer,
    refetchInterval: 60000,
  });
}

/**
 * Hook for fetching paginated earnings history from the dedicated endpoint.
 * Uses GET /api/v1/astrologer/earnings/history with sessionType filter and pagination.
 */
export function useEarningsHistory(
  sessionType?: 'chat' | 'call' | 'video',
  page = 1,
  limit = 20,
) {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery<{ data: EarningEntry[]; pagination: Pagination }>({
    queryKey: [...ASTROLOGER_QUERY_KEYS.earningsHistory(sessionType), page, limit],
    queryFn: async () => {
      const response = await astrologerDashboardService.getEarningsHistory(page, limit, sessionType);
      return {
        data: response.data ?? [],
        pagination: response.pagination ?? {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
    enabled: isAstrologer,
  });
}

/**
 * Hook for fetching astrologer's live session history
 */
export function useLiveSessionHistory(page = 1, limit = 20) {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery<AstrologerSessionHistory[]>({
    queryKey: [...ASTROLOGER_QUERY_KEYS.liveSessionHistory, page, limit],
    queryFn: async () => {
      const response = await liveSessionService.getSessionHistory(page, limit);
      return (response.data ?? []) as AstrologerSessionHistory[];
    },
    enabled: isAstrologer,
  });
}

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
    refetchInterval: 30000,
  });
}

export const useAstrologerAvailability = useAvailabilityStatus;

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

export function useHeartbeat(enabled = true) {
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
    sendHeartbeat();
    heartbeatInterval.current = setInterval(sendHeartbeat, 30000);
    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    };
  }, [enabled, sendHeartbeat]);
}

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
    refetchInterval: 5000,
  });
}

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
    refetchInterval: 10000,
  });
}

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

// ─── Live Session Hooks ──────────────────────────────────────────

/**
 * Hook for fetching astrologer's scheduled live sessions
 */
export function useScheduledLiveSessions() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';

  return useQuery<AstrologerScheduledSession[]>({
    queryKey: ASTROLOGER_QUERY_KEYS.liveScheduledSessions,
    queryFn: async () => {
      const response = await liveSessionService.getScheduledSessions();
      return (response.data ?? []) as AstrologerScheduledSession[];
    },
    enabled: isAstrologer,
    refetchInterval: 30000,
  });
}

/**
 * Hook for creating a new live session
 */
export function useCreateLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLiveSessionData) =>
      liveSessionService.createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveScheduledSessions });
    },
  });
}

/**
 * Hook for starting a live session (get Twilio token)
 */
export function useStartLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      liveSessionService.startSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveScheduledSessions });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveActiveSession });
    },
  });
}

/**
 * Hook for ending a live session
 */
export function useEndLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      liveSessionService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveActiveSession });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveSessionHistory });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveScheduledSessions });
    },
  });
}

/**
 * Hook for canceling/deleting a scheduled live session
 */
export function useCancelLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      liveSessionService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.liveScheduledSessions });
    },
  });
}

