/**
 * useQueue Hooks
 *
 * Queue management hooks for the chat/call waitlist system.
 * Provides React Query mutations/queries combined with Supabase
 * Realtime subscriptions for instant queue position updates.
 *
 * Hooks:
 *   useJoinQueue(type)       - Join an astrologer's queue
 *   useLeaveQueue()          - Leave a queue
 *   useQueuePosition(...)    - Real-time position tracking with polling fallback
 *   useQueueInfo(...)        - Astrologer queue info (size, wait, availability)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callService } from '@/lib/services/call.service';
import { chatService } from '@/lib/services/chat.service';
import { useQueueStore } from '@/stores/queue-store';
import {
  supabaseRealtime,
  QueueUpdatePayload,
  SessionReadyPayload,
} from '@/lib/services/supabase-realtime.service';
import type {
  ApiResponse,
  JoinQueueResponse,
  QueueEntry,
  QueueInfoResponse,
  QueueStatus,
  SessionType,
} from '@/types/api.types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

const QUEUE_KEYS = {
  all: ['queue'] as const,
  info: (astrologerId: string, type: SessionType) =>
    [...QUEUE_KEYS.all, 'info', astrologerId, type] as const,
  position: (queueId: string) =>
    [...QUEUE_KEYS.all, 'position', queueId] as const,
};

// ─── Terminal statuses that require cleanup ──────────────────────────────────

const TERMINAL_STATUSES: QueueStatus[] = ['expired', 'cancelled', 'skipped', 'rejected'];

// ─── Exponential backoff helpers ─────────────────────────────────────────────

const BASE_POLL_INTERVAL_MS = 5_000;
const MAX_POLL_INTERVAL_MS = 30_000;
const BACKOFF_MULTIPLIER = 1.5;

function getBackoffInterval(consecutiveErrors: number): number {
  const interval = BASE_POLL_INTERVAL_MS * Math.pow(BACKOFF_MULTIPLIER, consecutiveErrors);
  return Math.min(interval, MAX_POLL_INTERVAL_MS);
}

// ─── 1. useJoinQueue ─────────────────────────────────────────────────────────

/**
 * React Query mutation hook to join an astrologer's queue.
 *
 * @param type - 'call' or 'chat'
 * @returns { joinQueue, isJoining, error }
 */
export function useJoinQueue(type: SessionType) {
  const queryClient = useQueryClient();
  const addToQueue = useQueueStore((s) => s.addToQueue);

  const mutation = useMutation<
    ApiResponse<JoinQueueResponse>,
    Error,
    string // astrologerId
  >({
    mutationFn: async (astrologerId: string) => {
      const service = type === 'call' ? callService : chatService;
      return service.joinQueue(astrologerId);
    },
    onSuccess: (response, astrologerId) => {
      if (response.success && response.data) {
        const { queueId, position, estimatedWaitMinutes, expiresAt, remainingSeconds, astrologer } =
          response.data;

        // Add the new queue entry to the store
        const entry: QueueEntry = {
          queueId,
          astrologerId,
          astrologerName: astrologer.name,
          astrologerImage: astrologer.image,
          position,
          status: 'waiting',
          estimatedWaitMinutes,
          expiresAt,
          remainingSeconds,
          type,
        };
        addToQueue(entry);

        // Invalidate queue info so UI refreshes size/wait
        queryClient.invalidateQueries({
          queryKey: QUEUE_KEYS.info(astrologerId, type),
        });
      }
    },
  });

  return {
    joinQueue: mutation.mutate,
    joinQueueAsync: mutation.mutateAsync,
    isJoining: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}

// ─── 2. useLeaveQueue ────────────────────────────────────────────────────────

/**
 * React Query mutation hook to leave a queue.
 *
 * @returns { leaveQueue, isLeaving }
 */
export function useLeaveQueue() {
  const queryClient = useQueryClient();
  const removeFromQueue = useQueueStore((s) => s.removeFromQueue);

  const mutation = useMutation<
    ApiResponse<{ success: boolean }>,
    Error,
    { queueId: string; type: SessionType }
  >({
    mutationFn: async ({ queueId, type }) => {
      const service = type === 'call' ? callService : chatService;
      return service.leaveQueue(queueId);
    },
    // Remove from store immediately regardless of API result
    onMutate: ({ queueId }) => {
      removeFromQueue(queueId);
    },
    onSuccess: () => {
      // Invalidate all queue info queries so sizes refresh
      queryClient.invalidateQueries({
        queryKey: QUEUE_KEYS.all,
      });
    },
    onError: (_error, { queueId }) => {
      // Already removed optimistically in onMutate — ensure it's gone
      removeFromQueue(queueId);
    },
  });

  // Convenience wrapper so callers can pass (queueId, type) positionally
  const leaveQueue = useCallback(
    (queueId: string, type: SessionType) => {
      mutation.mutate({ queueId, type });
    },
    [mutation],
  );

  return {
    leaveQueue,
    leaveQueueAsync: mutation.mutateAsync,
    isLeaving: mutation.isPending,
    error: mutation.error,
  };
}

// ─── 3. useQueuePosition ────────────────────────────────────────────────────

interface UseQueuePositionOptions {
  /** Called when user's turn comes (status = 'notified') */
  onReady?: (payload: SessionReadyPayload) => void;
  /** Called when queue entry is terminated (expired/cancelled/skipped) */
  onTerminated?: (status: QueueStatus) => void;
  /** Whether polling/subscription should be active. Defaults to true. */
  enabled?: boolean;
}

interface UseQueuePositionReturn {
  position: number | null;
  estimatedWaitMinutes: number | null;
  status: QueueStatus | null;
  /** True when the user has been notified (their turn has come) */
  isReady: boolean;
}

/**
 * Combined real-time + polling hook for tracking queue position.
 *
 * - Subscribes to `supabaseRealtime.subscribeToQueueUpdates` for instant updates.
 * - Subscribes to `supabaseRealtime.subscribeToSessionReady` for session-ready events.
 * - Falls back to HTTP polling with exponential backoff for resilience.
 * - Cleans up on terminal statuses (expired, cancelled, skipped).
 *
 * @param queueId   - The queue entry ID
 * @param userId    - The current user's ID (for Supabase channel)
 * @param type      - 'call' or 'chat'
 * @param options   - Optional callbacks and enable flag
 */
export function useQueuePosition(
  queueId: string | null | undefined,
  userId: string | null | undefined,
  type: SessionType,
  options: UseQueuePositionOptions = {},
): UseQueuePositionReturn {
  const { onReady, onTerminated, enabled = true } = options;

  const removeFromQueue = useQueueStore((s) => s.removeFromQueue);
  const updateQueuePosition = useQueueStore((s) => s.updateQueuePosition);
  const queues = useQueueStore((s) => s.queues);

  // Find the current queue entry from the store
  const queueEntry = queues.find((q) => q.queueId === queueId) ?? null;

  const [position, setPosition] = useState<number | null>(queueEntry?.position ?? null);
  const [estimatedWaitMinutes, setEstimatedWaitMinutes] = useState<number | null>(
    queueEntry?.estimatedWaitMinutes ?? null,
  );
  const [status, setStatus] = useState<QueueStatus | null>(queueEntry?.status ?? null);
  const [isReady, setIsReady] = useState(false);

  // Refs for cleanup and backoff
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const unsubQueueRef = useRef<(() => void) | null>(null);
  const unsubSessionRef = useRef<(() => void) | null>(null);
  const isCleanedUpRef = useRef(false);

  // Stable refs for callbacks to avoid re-subscribing on every render
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const onTerminatedRef = useRef(onTerminated);
  onTerminatedRef.current = onTerminated;

  // ── Cleanup helper ──
  const cleanup = useCallback(() => {
    isCleanedUpRef.current = true;

    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (unsubQueueRef.current) {
      unsubQueueRef.current();
      unsubQueueRef.current = null;
    }
    if (unsubSessionRef.current) {
      unsubSessionRef.current();
      unsubSessionRef.current = null;
    }
  }, []);

  // ── Handle terminal status ──
  const handleTerminalStatus = useCallback(
    (terminalStatus: QueueStatus) => {
      cleanup();
      setStatus(terminalStatus);
      if (queueId) {
        removeFromQueue(queueId);
      }
      onTerminatedRef.current?.(terminalStatus);
    },
    [cleanup, queueId, removeFromQueue],
  );

  // ── Handle notified/ready status ──
  const handleNotified = useCallback(() => {
    setStatus('notified');
    setIsReady(true);
  }, []);

  // ── Main effect: subscribe + poll ──
  useEffect(() => {
    if (!enabled || !queueId || !userId) {
      return;
    }

    isCleanedUpRef.current = false;
    consecutiveErrorsRef.current = 0;

    // ── Supabase Realtime: queue position updates (primary) ──
    unsubQueueRef.current = supabaseRealtime.subscribeToQueueUpdates(
      userId,
      (payload: QueueUpdatePayload) => {
        if (isCleanedUpRef.current) return;

        // Only process updates for our queue entry
        if (payload.queueId && payload.queueId !== queueId) return;

        const newStatus = (payload.status as QueueStatus) || null;

        // Update position
        if (typeof payload.position === 'number') {
          setPosition(payload.position);
          updateQueuePosition(queueId, payload.position);
        }

        // Update estimated wait
        if (typeof payload.estimatedWaitMinutes === 'number') {
          setEstimatedWaitMinutes(payload.estimatedWaitMinutes);
        }

        // Handle status transitions
        if (newStatus === 'notified') {
          handleNotified();
        } else if (newStatus && TERMINAL_STATUSES.includes(newStatus)) {
          handleTerminalStatus(newStatus);
        } else if (newStatus) {
          setStatus(newStatus);
        }

        // Reset error count on successful realtime update
        consecutiveErrorsRef.current = 0;
      },
    );

    // ── Supabase Realtime: session-ready events ──
    unsubSessionRef.current = supabaseRealtime.subscribeToSessionReady(
      userId,
      (payload: SessionReadyPayload) => {
        if (isCleanedUpRef.current) return;

        handleNotified();
        onReadyRef.current?.(payload);
      },
    );

    // ── HTTP Polling: fallback with exponential backoff ──
    const scheduleNextPoll = () => {
      if (isCleanedUpRef.current) return;

      const interval = getBackoffInterval(consecutiveErrorsRef.current);

      pollingTimerRef.current = setTimeout(async () => {
        if (isCleanedUpRef.current) return;

        try {
          // Find the astrologerId from the store entry
          const currentEntry = useQueueStore.getState().queues.find((q) => q.queueId === queueId);
          if (!currentEntry) {
            // Queue entry was removed externally — stop polling
            return;
          }

          const service = type === 'call' ? callService : chatService;
          const response = await service.getQueueInfo(currentEntry.astrologerId);

          if (isCleanedUpRef.current) return;

          if (response.success && response.data) {
            consecutiveErrorsRef.current = 0;

            // The queueInfo endpoint gives overall queue size — we can infer position change
            // but the actual position update comes from the realtime channel.
            // Still useful as a heartbeat: if queue is empty and we're still "waiting",
            // something may be stale.
          }
        } catch {
          // Increment error count for backoff, but keep polling
          consecutiveErrorsRef.current = Math.min(consecutiveErrorsRef.current + 1, 10);
        }

        // Schedule next poll
        scheduleNextPoll();
      }, interval);
    };

    // Start the first poll cycle
    scheduleNextPoll();

    // ── Cleanup on unmount or dependency change ──
    return () => {
      isCleanedUpRef.current = true;

      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      if (unsubQueueRef.current) {
        unsubQueueRef.current();
        unsubQueueRef.current = null;
      }
      if (unsubSessionRef.current) {
        unsubSessionRef.current();
        unsubSessionRef.current = null;
      }
    };
  }, [enabled, queueId, userId, type, handleNotified, handleTerminalStatus, updateQueuePosition]);

  // ── Sync local state with store when queueEntry changes externally ──
  useEffect(() => {
    if (queueEntry) {
      setPosition(queueEntry.position);
      setEstimatedWaitMinutes(queueEntry.estimatedWaitMinutes);
      setStatus(queueEntry.status);
      if (queueEntry.status === 'notified') {
        setIsReady(true);
      }
    }
  }, [queueEntry]);

  return {
    position,
    estimatedWaitMinutes,
    status,
    isReady,
  };
}

// ─── 4. useQueueInfo ─────────────────────────────────────────────────────────

interface UseQueueInfoOptions {
  /** Whether the query is enabled. Defaults to true when astrologerId is truthy. */
  enabled?: boolean;
}

/**
 * React Query hook for fetching queue info (size, estimated wait, capacity).
 *
 * Refetches every 10 seconds while the query is enabled.
 *
 * @param astrologerId - The astrologer to check queue for
 * @param type         - 'call' or 'chat'
 * @param options      - Optional enable flag
 * @returns { queueInfo, isLoading, error, refetch }
 */
export function useQueueInfo(
  astrologerId: string | null | undefined,
  type: SessionType,
  options: UseQueueInfoOptions = {},
) {
  const { enabled: enabledOverride } = options;
  const isEnabled = enabledOverride !== undefined ? enabledOverride : !!astrologerId;

  const query = useQuery<QueueInfoResponse | null, Error>({
    queryKey: QUEUE_KEYS.info(astrologerId || '', type),
    queryFn: async (): Promise<QueueInfoResponse | null> => {
      if (!astrologerId) return null;

      const service = type === 'call' ? callService : chatService;
      const response = await service.getQueueInfo(astrologerId);

      if (response.success && response.data) {
        return response.data;
      }

      // If the API returned an error message, throw so React Query marks it as error
      if (response.error?.message || response.message) {
        throw new Error(response.error?.message || response.message || 'Failed to fetch queue info');
      }

      return null;
    },
    enabled: isEnabled,
    refetchInterval: isEnabled ? 10_000 : false,
    staleTime: 5_000,
    // Don't refetch on window focus too aggressively — the interval handles freshness
    refetchOnWindowFocus: false,
  });

  return {
    queueInfo: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
