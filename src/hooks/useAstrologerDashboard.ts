/**
 * Astrologer Dashboard Hooks - React Query hooks for astrologer features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { astrologerDashboardService } from '@/lib/services/astrologer-dashboard.service';
import type { EarningEntry } from '@/lib/services/astrologer-dashboard.service';
import { liveSessionService } from '@/lib/services/live-session.service';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useRef, useCallback } from 'react';
import { supabaseRealtime } from '@/lib/services/supabase-realtime.service';
import type { WaitlistUpdatePayload, IncomingRequestPayload } from '@/lib/services/supabase-realtime.service';
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
  const updateAstrologer = useAuthStore((s) => s.updateAstrologer);

  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      astrologerDashboardService.toggleAvailability(isAvailable),
    onMutate: async (isAvailable) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ASTROLOGER_QUERY_KEYS.availability });

      // Snapshot previous value
      const previous = queryClient.getQueryData(ASTROLOGER_QUERY_KEYS.availability);

      // Optimistic update
      queryClient.setQueryData(ASTROLOGER_QUERY_KEYS.availability, (old: Record<string, unknown> | undefined) => ({
        ...old,
        isAvailable,
        chatAvailable: isAvailable,
        callAvailable: isAvailable,
      }));

      // Sync auth store immediately
      updateAstrologer({ isAvailable, chatAvailable: isAvailable, callAvailable: isAvailable });

      // Ghost-online prevention: clear stale data when going offline
      // so users don't see this astrologer as available with pending requests
      if (!isAvailable) {
        queryClient.setQueryData(ASTROLOGER_QUERY_KEYS.incomingRequests, null);
        queryClient.setQueryData(ASTROLOGER_QUERY_KEYS.waitlist, null);
        queryClient.setQueryData(ASTROLOGER_QUERY_KEYS.activeChat, null);
        queryClient.setQueryData(ASTROLOGER_QUERY_KEYS.activeCall, null);
      }

      return { previous };
    },
    onError: (_err, _isAvailable, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(ASTROLOGER_QUERY_KEYS.availability, context.previous);
        const prev = context.previous as { isAvailable: boolean; chatAvailable: boolean; callAvailable: boolean };
        updateAstrologer({
          isAvailable: prev.isAvailable,
          chatAvailable: prev.chatAvailable,
          callAvailable: prev.callAvailable,
        });
      }
    },
    onSettled: (_data, _error, isAvailable) => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.availability });
      // Refetch fresh data when going back online
      if (isAvailable) {
        queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
        queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      }
    },
  });
}

/** @deprecated Use useToggleAvailability instead — backend only supports a single toggle */
export const useUpdateAvailability = useToggleAvailability;

/**
 * Heartbeat hook — sends periodic heartbeat to keep astrologer "online".
 * 10s interval when tab visible, 25s when hidden (stays under backend's 30s timeout).
 * This prevents the toggle from turning off when astrologer switches tabs.
 */
export function useHeartbeat(enabled = true) {
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  const sendHeartbeat = useCallback(async () => {
    try {
      await astrologerDashboardService.sendHeartbeat();
    } catch {
      // Ignore heartbeat errors
    }
  }, []);

  const startHeartbeat = useCallback((intervalMs = 10000) => {
    if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    sendHeartbeat();
    heartbeatInterval.current = setInterval(sendHeartbeat, intervalMs);
  }, [sendHeartbeat]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    startHeartbeat(10000);

    // Slow heartbeat when tab hidden (25s stays under backend's 30s timeout),
    // resume fast (10s) when tab visible again
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      if (isVisibleRef.current) {
        startHeartbeat(10000); // Fast heartbeat when visible
      } else {
        startHeartbeat(25000); // Slow heartbeat when hidden (keeps astrologer online)
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopHeartbeat();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startHeartbeat, stopHeartbeat]);
}

export function useIncomingRequests() {
  const { user } = useAuthStore();
  const isAstrologer = user?.role === 'astrologer';
  const queryClient = useQueryClient();
  const incomingUnsubRef = useRef<(() => void) | null>(null);

  // Subscribe to Supabase realtime for instant incoming request notifications
  useEffect(() => {
    const astrologerId = user?.id;
    if (!isAstrologer || !astrologerId) return;

    if (incomingUnsubRef.current) {
      incomingUnsubRef.current();
    }

    incomingUnsubRef.current = supabaseRealtime.subscribeToIncomingRequests(
      astrologerId,
      (_update: IncomingRequestPayload) => {
        queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      },
    );

    return () => {
      if (incomingUnsubRef.current) {
        incomingUnsubRef.current();
        incomingUnsubRef.current = null;
      }
    };
  }, [isAstrologer, user?.id, queryClient]);

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
  const queryClient = useQueryClient();
  const unsubRef = useRef<(() => void) | null>(null);

  // Subscribe to Supabase realtime waitlist updates for instant notifications
  // when a user joins, leaves, or is connected from the queue.
  useEffect(() => {
    const astrologerId = user?.id;
    if (!isAstrologer || !astrologerId) return;

    // Clean up previous subscription
    if (unsubRef.current) {
      unsubRef.current();
    }

    unsubRef.current = supabaseRealtime.subscribeToWaitlistUpdates(
      astrologerId,
      (_update: WaitlistUpdatePayload) => {
        // Invalidate the waitlist query so React Query refetches immediately
        queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      },
    );

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [isAstrologer, user?.id, queryClient]);

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
  const isProcessingRef = useRef(false);

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => {
      if (isProcessingRef.current) return Promise.reject(new Error('Already processing'));
      isProcessingRef.current = true;
      return astrologerDashboardService.acceptChatRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeChat });
    },
    onSettled: () => {
      setTimeout(() => { isProcessingRef.current = false; }, 1000);
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

export function useAcceptChatRequest() {
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

export function useAcceptCallRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      astrologerDashboardService.acceptCallRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeCall });
    },
  });
}

/** @deprecated Use useAcceptChatRequest or useAcceptCallRequest instead */
export const useAcceptRequest = useAcceptChatRequest;

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, type }: { requestId: string; type: 'chat' | 'call' }) =>
      type === 'chat'
        ? astrologerDashboardService.rejectChatRequest(requestId)
        : astrologerDashboardService.rejectCallRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
    },
  });
}

export function useCallRequestActions() {
  const queryClient = useQueryClient();
  const isProcessingRef = useRef(false);

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => {
      if (isProcessingRef.current) return Promise.reject(new Error('Already processing'));
      isProcessingRef.current = true;
      return astrologerDashboardService.acceptCallRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.incomingRequests });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeCall });
    },
    onSettled: () => {
      setTimeout(() => { isProcessingRef.current = false; }, 1000);
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
  return useMutation({
    mutationFn: ({ content, type = 'text' }: { content: string; type?: 'text' | 'image' }) =>
      astrologerDashboardService.sendMessage(sessionId, content, type),
    // NOTE: Do NOT invalidateQueries here. Messages arrive via Supabase broadcast
    // and are managed in local state. Invalidating would wipe the message cache.
  });
}

export function useQueueConnect() {
  const queryClient = useQueryClient();
  const isConnectingRef = useRef(false);

  const connectChat = useMutation({
    mutationFn: (queueId: string) => {
      if (isConnectingRef.current) return Promise.reject(new Error('Already connecting'));
      isConnectingRef.current = true;
      return astrologerDashboardService.connectChatQueue(queueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeChat });
    },
    onSettled: () => {
      setTimeout(() => { isConnectingRef.current = false; }, 1000);
    },
  });

  const connectCall = useMutation({
    mutationFn: (queueId: string) => {
      if (isConnectingRef.current) return Promise.reject(new Error('Already connecting'));
      isConnectingRef.current = true;
      return astrologerDashboardService.connectCallQueue(queueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.waitlist });
      queryClient.invalidateQueries({ queryKey: ASTROLOGER_QUERY_KEYS.activeCall });
    },
    onSettled: () => {
      setTimeout(() => { isConnectingRef.current = false; }, 1000);
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

