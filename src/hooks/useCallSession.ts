/**
 * Call Session Hook - React Query hooks for call sessions
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { callService, InitiateCallParams } from '@/lib/services/call.service';
import { useCallback, useEffect, useRef, useState } from 'react';

// Query keys
export const CALL_QUERY_KEYS = {
  session: (sessionId: string) => ['call', 'session', sessionId] as const,
  token: (sessionId: string) => ['call', 'token', sessionId] as const,
  requestStatus: (requestId: string) => ['call', 'request', requestId] as const,
  history: ['call', 'history'] as const,
};

/**
 * Hook for fetching call session details
 */
export function useCallSession(sessionId: string) {
  return useQuery({
    queryKey: CALL_QUERY_KEYS.session(sessionId),
    queryFn: async () => {
      const response = await callService.getSession(sessionId);
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

/**
 * Hook for fetching Twilio token
 */
export function useTwilioToken(sessionId: string) {
  return useQuery({
    queryKey: CALL_QUERY_KEYS.token(sessionId),
    queryFn: async () => {
      const response = await callService.getTwilioToken(sessionId);
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 55, // Token valid for ~1 hour, refetch at 55 mins
  });
}

/**
 * Hook for initiating a call
 */
export function useInitiateCall() {
  return useMutation({
    mutationFn: (params: InitiateCallParams) => callService.initiateCall(params),
  });
}

/**
 * Hook for polling call request status
 */
export function useCallRequestStatus(requestId: string | null, options?: {
  onAccepted?: (sessionId: string) => void;
  onRejected?: (reason?: string) => void;
  onTimeout?: () => void;
}) {
  const [isPolling, setIsPolling] = useState(!!requestId);

  const query = useQuery({
    queryKey: CALL_QUERY_KEYS.requestStatus(requestId || ''),
    queryFn: async () => {
      if (!requestId) throw new Error('No request ID');
      const response = await callService.getRequestStatus(requestId);
      return response.data;
    },
    enabled: !!requestId && isPolling,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;

      // Stop polling if status is terminal
      if (['accepted', 'rejected', 'timeout', 'cancelled'].includes(data.status)) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Handle status changes
  useEffect(() => {
    if (!query.data) return;

    const { status, session, rejectReason } = query.data;

    if (status === 'accepted' && session) {
      setIsPolling(false);
      options?.onAccepted?.(session.sessionId);
    } else if (status === 'rejected') {
      setIsPolling(false);
      options?.onRejected?.(rejectReason);
    } else if (status === 'timeout') {
      setIsPolling(false);
      options?.onTimeout?.();
    }
  }, [query.data, options]);

  return {
    ...query,
    isPolling,
    stopPolling: () => setIsPolling(false),
    startPolling: () => setIsPolling(true),
  };
}

/**
 * Hook for ending call session
 */
export function useEndCallSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => callService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CALL_QUERY_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: CALL_QUERY_KEYS.history });
    },
  });
}

/**
 * Hook for canceling call request
 */
export function useCancelCallRequest() {
  return useMutation({
    mutationFn: (requestId: string) => callService.cancelRequest(requestId),
  });
}

/**
 * Hook for call history
 */
export function useCallHistory() {
  return useInfiniteQuery({
    queryKey: CALL_QUERY_KEYS.history,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await callService.getCallHistory(pageParam, 20);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook for managing call timer and cost
 */
export function useCallTimer(
  startTime: string | undefined,
  pricePerMinute: number = 0
) {
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      setCost(0);
      return;
    }

    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000);
      setDuration(diff);
      setCost(callService.calculateCost(diff, pricePerMinute));
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, pricePerMinute]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    duration,
    cost,
    formattedDuration: formatDuration(duration),
    formattedCost: `₹${cost.toFixed(2)}`,
  };
}
