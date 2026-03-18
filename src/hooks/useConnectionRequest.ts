/**
 * useConnectionRequest Hook
 *
 * Manages the full connection request lifecycle:
 * 1. Validates balance with backend
 * 2. Creates a chat/call request via API
 * 3. Polls request status until accepted/rejected/timeout
 * 4. Listens to Supabase Broadcast for instant acceptance (cross-platform)
 * 5. Updates queue store and navigates to session on success
 *
 * Matches mobile app behaviour:
 * - 60s countdown while waiting for astrologer
 * - Auto-navigate on acceptance (500ms delay)
 * - Queue integration with session-ready listener
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueueStore } from '@/stores/queue-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { chatService } from '@/lib/services/chat.service';
import { callService } from '@/lib/services/call.service';
import { ApiError } from '@/lib/api/client';
import { supabaseRealtime, RequestStatusPayload, SessionReadyPayload } from '@/lib/services/supabase-realtime.service';
import { Astrologer, SessionType } from '@/types/api.types';

export function useConnectionRequest() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const {
    activeRequest,
    requestStatus,
    selectedAstrologer,
    createRequest,
    setRequestStatus,
    setActiveRequest,
    cancelRequest,
    clearRequest,
    setActiveSession,
    setTwilioCredentials,
    addToQueue,
  } = useQueueStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const pendingAstrologerRef = useRef<{ astrologer: Astrologer; type: SessionType } | null>(null);
  const selectedIntakeProfileIdRef = useRef<string | null>(null);
  const [queueData, setQueueData] = useState<{
    queueId: string;
    position: number;
    estimatedWaitMinutes: number;
  } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const supabaseUnsubRef = useRef<(() => void) | null>(null);
  const sessionReadyUnsubRef = useRef<(() => void) | null>(null);
  const queuePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveUnchangedRef = useRef(0);
  const lastPollStatusRef = useRef<string | null>(null);

  // Stop any active polling and Supabase subscription
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    if (supabaseUnsubRef.current) {
      supabaseUnsubRef.current();
      supabaseUnsubRef.current = null;
    }
    consecutiveUnchangedRef.current = 0;
    lastPollStatusRef.current = null;
  }, []);

  const stopQueuePolling = useCallback(() => {
    if (queuePollingRef.current) {
      clearInterval(queuePollingRef.current);
      queuePollingRef.current = null;
    }
    if (sessionReadyUnsubRef.current) {
      sessionReadyUnsubRef.current();
      sessionReadyUnsubRef.current = null;
    }
  }, []);

  const stopAll = useCallback(() => {
    stopPolling();
    stopQueuePolling();
    if (autoNavTimerRef.current) {
      clearTimeout(autoNavTimerRef.current);
      autoNavTimerRef.current = null;
    }
  }, [stopPolling, stopQueuePolling]);

  // Navigate to session
  // IMPORTANT: Do NOT call clearRequest() here — it wipes twilioToken/twilioRoomName
  // which the call page needs. Those credentials are cleared by the call page on unmount
  // or when the session ends (via clearActiveSession).
  const navigateToSession = useCallback((sessionId: string, type: SessionType) => {
    setQueueData(null);
    setIsModalOpen(false);
    stopAll();
    router.push(`/${type}/${sessionId}`);
  }, [stopAll, router]);

  // Handle acceptance: store session data + auto-navigate
  const handleAccepted = useCallback((
    sessionId: string,
    type: SessionType,
    twilioToken?: string,
    twilioRoomName?: string,
  ) => {
    stopPolling();
    setRequestStatus('connected');

    // Read current request from store to avoid stale closure
    const currentRequest = useQueueStore.getState().activeRequest;
    const base = currentRequest || {
      requestId: requestIdRef.current || '',
      type,
      astrologerId: '',
      astrologerName: '',
      astrologerImage: '',
      expiresAt: '',
      remainingSeconds: 0,
      pricePerMinute: 0,
      status: 'accepted' as const,
    };
    setActiveRequest({
      ...base,
      status: 'accepted',
      sessionId,
    });

    if (twilioToken && twilioRoomName) {
      setTwilioCredentials(twilioToken, twilioRoomName);
    }
    setActiveSession(sessionId, type);

    // Auto-navigate after 500ms (matching mobile app)
    autoNavTimerRef.current = setTimeout(() => {
      navigateToSession(sessionId, type);
    }, 1500);
  }, [stopPolling, setRequestStatus, setActiveRequest, setTwilioCredentials, setActiveSession, navigateToSession]);

  // Start polling request status + Supabase Broadcast for instant updates
  const startPolling = useCallback((requestId: string, type: SessionType) => {
    stopPolling();
    requestIdRef.current = requestId;

    // ── Supabase Broadcast: instant request status updates (primary) ──
    // IMPORTANT: Call method directly on supabaseRealtime to preserve `this` context.
    // Detaching the method (e.g., `const fn = obj.method; fn()`) loses `this`.
    const realtimeCallback = (payload: RequestStatusPayload) => {
      if (payload.status === 'accepted' && payload.sessionId) {
        handleAccepted(payload.sessionId, type, payload.twilioToken, payload.twilioRoomName);
      } else if (payload.status === 'rejected') {
        stopPolling();
        setRequestStatus('rejected');
        addToast({
          type: 'warning',
          title: 'Request Declined',
          message: payload.rejectReason || 'Astrologer is unavailable right now.',
        });
      } else if (payload.status === 'timeout' || payload.status === 'cancelled') {
        stopPolling();
        setRequestStatus('timeout');
      }
    };

    supabaseUnsubRef.current = type === 'chat'
      ? supabaseRealtime.subscribeToChatRequestUpdate(requestId, realtimeCallback)
      : supabaseRealtime.subscribeToCallRequestUpdate(requestId, realtimeCallback);

    // ── HTTP Polling with exponential backoff (matching mobile app) ──
    // Base: 2s, backs off to 8s max after 3 consecutive unchanged responses
    const BASE_POLL_MS = 2000;
    const MAX_POLL_MS = 8000;
    const BACKOFF_THRESHOLD = 3;

    const pollFn = type === 'chat'
      ? () => chatService.getRequestStatus(requestId)
      : () => callService.getRequestStatus(requestId);

    const getNextDelay = () => {
      if (consecutiveUnchangedRef.current >= BACKOFF_THRESHOLD) {
        return Math.min(BASE_POLL_MS + (consecutiveUnchangedRef.current - BACKOFF_THRESHOLD + 1) * 2000, MAX_POLL_MS);
      }
      return BASE_POLL_MS;
    };

    const handlePollResult = (response: { success: boolean; data?: Record<string, unknown> }) => {
      if (!response.success || !response.data) return;

      const { status, session, rejectReason } = response.data as {
        status: string;
        session?: { twilioToken?: string; twilioRoomName?: string; sessionId: string };
        rejectReason?: string;
      };

      if (status === 'accepted' && session) {
        handleAccepted(session.sessionId, type, session.twilioToken, session.twilioRoomName);
        return;
      } else if (status === 'rejected') {
        stopPolling();
        setRequestStatus('rejected');
        addToast({
          type: 'warning',
          title: 'Request Declined',
          message: rejectReason || 'Astrologer is unavailable right now.',
        });
        return;
      } else if (status === 'timeout' || status === 'cancelled') {
        stopPolling();
        setRequestStatus('timeout');
        return;
      } else if (status === 'pending') {
        setRequestStatus('waiting');
      }

      // Track consecutive unchanged responses for backoff
      if (status === lastPollStatusRef.current) {
        consecutiveUnchangedRef.current++;
      } else {
        consecutiveUnchangedRef.current = 0;
        lastPollStatusRef.current = status;
      }
    };

    const schedulePoll = () => {
      pollingRef.current = setTimeout(async () => {
        try {
          const response = await pollFn();
          handlePollResult(response as { success: boolean; data?: Record<string, unknown> });
        } catch {
          // Network error — keep polling
        }
        // Schedule next poll if still active
        if (pollingRef.current !== null) {
          schedulePoll();
        }
      }, getNextDelay());
    };

    // First poll immediately
    (async () => {
      try {
        const response = await pollFn();
        handlePollResult(response as { success: boolean; data?: Record<string, unknown> });
      } catch {
        // First poll failed — keep going
      }
      // Start the polling chain
      schedulePoll();
    })();
  }, [stopPolling, handleAccepted, setRequestStatus, addToast]);

  // ── Queue: session-ready listener ──
  // When the user joins a queue and the astrologer picks them,
  // the backend broadcasts session-ready. This listener creates
  // a new request flow (matching mobile app's queue→request transition).
  const startQueueListening = useCallback((queueId: string, type: SessionType) => {
    stopQueuePolling();
    const userId = user?.id;
    if (!userId) return;

    // Listen for session-ready event
    sessionReadyUnsubRef.current = supabaseRealtime.subscribeToSessionReady(
      userId,
      (payload: SessionReadyPayload) => {
        stopQueuePolling();
        // Session-ready from queue: auto-navigate directly
        if (payload.sessionId) {
          handleAccepted(payload.sessionId, payload.sessionType || type);
        }
      },
    );

    // Also poll queue status periodically
    queuePollingRef.current = setInterval(async () => {
      try {
        const service = type === 'call' ? callService : chatService;
        const storeEntry = useQueueStore.getState().queues.find(q => q.queueId === queueId);
        if (!storeEntry) {
          stopQueuePolling();
          return;
        }
        const response = await service.getQueueInfo(storeEntry.astrologerId);
        if (response.success && response.data) {
          setQueueData(prev => prev ? {
            ...prev,
            position: Math.max(1, prev.position), // Position comes from realtime
            estimatedWaitMinutes: response.data!.estimatedWaitMinutes,
          } : prev);
        }
      } catch {
        // Keep polling
      }
    }, 5000);
  }, [stopQueuePolling, user?.id, handleAccepted]);

  // Cancel any pending request from a previous attempt
  const cancelPendingRequests = useCallback(async (type: SessionType) => {
    try {
      const getPendingFn = type === 'chat'
        ? () => chatService.getPendingRequest()
        : () => callService.getPendingRequest();

      const pendingResponse = await getPendingFn();
      if (pendingResponse.success && pendingResponse.data?.requestId) {
        const cancelFn = type === 'chat'
          ? () => chatService.cancelRequest(pendingResponse.data!.requestId)
          : () => callService.cancelRequest(pendingResponse.data!.requestId);
        await cancelFn();
      }
    } catch {
      // Best effort — may not have a pending request
    }
  }, []);

  // Internal: actually send the request after profile selection (for chat) or directly (for call)
  const doInitiateRequest = useCallback(async (astrologer: Astrologer, type: SessionType) => {
    // Set local state optimistically
    createRequest(astrologer, type);
    setIsModalOpen(true);

    try {
      // 1. Validate balance first
      const validateFn = type === 'chat'
        ? () => chatService.validateBalance(astrologer.id)
        : () => callService.validateBalance(astrologer.id);

      const balanceResponse = await validateFn();
      const balanceData = balanceResponse.data;
      const canStart = type === 'chat' ? balanceData?.canStartChat : balanceData?.canStartCall;
      if (!balanceResponse.success || !canStart) {
        stopAll();
        setRequestStatus('rejected');
        addToast({
          type: 'warning',
          title: 'Insufficient Balance',
          message: `Minimum balance of ₹${balanceData?.minimumRequired || 50} required. Please recharge your wallet.`,
        });
        return;
      }

      // 2. Cancel any stale pending request before creating a new one
      await cancelPendingRequests(type);

      // 3. Create the request via API
      const createFn = type === 'chat'
        ? () => chatService.createRequest(astrologer.id, selectedIntakeProfileIdRef.current || undefined)
        : () => callService.initiateCall(astrologer.id);

      let response;
      try {
        response = await createFn();
      } catch (createErr) {
        // Backend returns 400 with "pending call/chat request" — cancel and retry once
        const errMsg = createErr instanceof Error ? createErr.message : '';
        if (errMsg.toLowerCase().includes('pending')) {
          await cancelPendingRequests(type);
          await new Promise(resolve => setTimeout(resolve, 500));
          response = await createFn(); // Retry after cancelling
        } else {
          throw createErr; // Re-throw non-pending errors
        }
      }

      if (response.success && response.data) {
        const { requestId } = response.data;

        // Update store with real request ID from backend
        setActiveRequest({
          requestId,
          type,
          astrologerId: astrologer.id,
          astrologerName: astrologer.name,
          astrologerImage: astrologer.profileImage ?? astrologer.image ?? '',
          status: 'pending',
          expiresAt: response.data.expiresAt,
          remainingSeconds: response.data.remainingSeconds,
          pricePerMinute: type === 'chat'
            ? (astrologer.chatPrice ?? astrologer.chatPricePerMinute ?? astrologer.pricePerMinute ?? 0)
            : (astrologer.callPrice ?? astrologer.callPricePerMinute ?? astrologer.pricePerMinute ?? 0),
        });

        setRequestStatus('waiting');

        // 4. Start polling for status
        startPolling(requestId, type);
      } else {
        setRequestStatus('rejected');
        addToast({
          type: 'error',
          title: 'Request Failed',
          message: response.message || 'Could not connect. Please try again.',
        });
      }
    } catch (err) {
      // Check if astrologer is busy but queue is available
      const apiErr = err instanceof ApiError ? err : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const details = (apiErr as any)?.details || (apiErr as any)?.data?.details;
      const isBusy = details?.code === 'ASTROLOGER_BUSY' ||
        (apiErr?.message || '').toLowerCase().includes('busy') ||
        (apiErr?.message || '').toLowerCase().includes('another');

      if (isBusy && details?.queueAvailable) {
        // Astrologer is busy — offer queue join
        setRequestStatus('rejected');
        addToast({
          type: 'info',
          title: 'Astrologer Busy',
          message: `Currently in another session. You can join the queue (${details.currentQueueSize || 0} waiting).`,
        });
      } else {
        setRequestStatus('rejected');
        const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Connection failed';
        addToast({ type: 'error', title: 'Error', message });
      }
    }
  }, [createRequest, setActiveRequest, setRequestStatus, startPolling, stopAll, cancelPendingRequests, addToast]);

  // Public: initiateRequest — for chat, shows profile selector first; for call, goes directly
  const initiateRequest = useCallback((astrologer: Astrologer, type: SessionType) => {
    if (type === 'chat') {
      // Show intake profile selector before chat request
      pendingAstrologerRef.current = { astrologer, type };
      setShowProfileSelector(true);
    } else {
      // Call requests go directly (no intake profile needed)
      doInitiateRequest(astrologer, type);
    }
  }, [doInitiateRequest]);

  // Called when user selects an intake profile from the selector
  const handleProfileSelected = useCallback((profileId: string) => {
    selectedIntakeProfileIdRef.current = profileId;
    setShowProfileSelector(false);
    if (pendingAstrologerRef.current) {
      const { astrologer, type } = pendingAstrologerRef.current;
      pendingAstrologerRef.current = null;
      doInitiateRequest(astrologer, type);
    }
  }, [doInitiateRequest]);

  const handleProfileSelectorClose = useCallback(() => {
    setShowProfileSelector(false);
    pendingAstrologerRef.current = null;
  }, []);

  // Join queue and stay in modal with queue tracking
  const handleJoinQueue = useCallback(async (astrologerId: string, type: SessionType) => {
    try {
      // Cancel any pending request first — backend rejects queue join if a request is pending
      await cancelPendingRequests(type);

      const service = type === 'call' ? callService : chatService;
      const response = await service.joinQueue(astrologerId);

      if (response.success && response.data) {
        const { queueId, position, estimatedWaitMinutes, expiresAt, remainingSeconds } = response.data;

        // Add to store
        addToQueue({
          queueId,
          astrologerId,
          astrologerName: response.data.astrologer?.name || selectedAstrologer?.name || '',
          astrologerImage: response.data.astrologer?.image || selectedAstrologer?.profileImage || selectedAstrologer?.image || '',
          position,
          status: 'waiting',
          estimatedWaitMinutes,
          expiresAt,
          remainingSeconds,
          type,
        });

        // Update modal to show queue state
        setQueueData({ queueId, position, estimatedWaitMinutes });
        setRequestStatus('queued');

        // Start listening for session-ready
        startQueueListening(queueId, type);

        addToast({
          type: 'success',
          title: 'Joined Queue',
          message: `You're #${position} in queue. We'll connect you when it's your turn.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Failed to Join Queue',
          message: response.message || 'Could not join queue. Please try again.',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join queue';
      addToast({ type: 'error', title: 'Error', message });
    }
  }, [addToQueue, selectedAstrologer, setRequestStatus, startQueueListening, cancelPendingRequests, addToast]);

  // Cancel an active request or leave queue
  const handleCancel = useCallback(async () => {
    stopAll();
    const currentStatus = useQueueStore.getState().requestStatus;
    const reqId = requestIdRef.current || activeRequest?.requestId;
    const type = activeRequest?.type;

    // If user is in queue, call leaveQueue API and remove from store
    if (currentStatus === 'queued' && queueData?.queueId) {
      try {
        const service = (type === 'call') ? callService : chatService;
        await service.leaveQueue(queueData.queueId);
      } catch {
        // Best effort — remove locally even if API fails
      }
      useQueueStore.getState().removeFromQueue(queueData.queueId);
    } else if (reqId && !reqId.startsWith('pending-') && type) {
      // Cancel a pending direct request
      try {
        const cancelFn = type === 'chat'
          ? () => chatService.cancelRequest(reqId)
          : () => callService.cancelRequest(reqId);
        await cancelFn();
      } catch {
        // Best effort — cancel locally even if API fails
      }
    }

    cancelRequest();
    setQueueData(null);
    setIsModalOpen(false);
  }, [stopAll, activeRequest, queueData, cancelRequest]);

  // Navigate to session when connected (manual click fallback)
  const handleNavigateToSession = useCallback(() => {
    // Read directly from store to avoid stale closure
    const storeState = useQueueStore.getState();
    const type = storeState.activeSessionType || storeState.activeRequest?.type;
    const sessionId = storeState.activeSessionId || storeState.activeRequest?.sessionId;

    if (sessionId && type) {
      if (autoNavTimerRef.current) {
        clearTimeout(autoNavTimerRef.current);
        autoNavTimerRef.current = null;
      }
      navigateToSession(sessionId, type);
    }
  }, [navigateToSession]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    const currentStatus = useQueueStore.getState().requestStatus;
    if (currentStatus === 'connected' || currentStatus === 'rejected' || currentStatus === 'timeout') {
      clearRequest();
      setQueueData(null);
    }
    // Don't stop queue listening when closing modal in queued state —
    // the session-ready listener should keep running
    if (currentStatus !== 'queued') {
      stopAll();
    }
    setIsModalOpen(false);
  }, [clearRequest, stopAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return {
    isModalOpen,
    requestStatus,
    selectedAstrologer,
    activeRequest,
    queueData,
    initiateRequest,
    handleCancel,
    handleNavigateToSession,
    handleCloseModal,
    handleJoinQueue,
    // Intake profile selector
    showProfileSelector,
    handleProfileSelected,
    handleProfileSelectorClose,
  };
}
