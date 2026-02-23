/**
 * useConnectionRequest Hook
 *
 * Manages the full connection request lifecycle:
 * 1. Validates balance with backend
 * 2. Creates a chat/call request via API
 * 3. Polls request status until accepted/rejected/timeout
 * 4. Updates queue store and navigates to session on success
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueueStore } from '@/stores/queue-store';
import { useUIStore } from '@/stores/ui-store';
import { chatService } from '@/lib/services/chat.service';
import { callService } from '@/lib/services/call.service';
import { Astrologer, SessionType } from '@/types/api.types';

export function useConnectionRequest() {
  const router = useRouter();
  const { addToast } = useUIStore();
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
  } = useQueueStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestIdRef = useRef<string | null>(null);

  // Stop any active polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Start polling request status
  const startPolling = useCallback((requestId: string, type: SessionType) => {
    stopPolling();
    requestIdRef.current = requestId;

    const pollFn = type === 'chat'
      ? () => chatService.getRequestStatus(requestId)
      : () => callService.getRequestStatus(requestId);

    pollingRef.current = setInterval(async () => {
      try {
        const response = await pollFn();
        if (!response.success || !response.data) return;

        const { status, session, rejectReason } = response.data;

        if (status === 'accepted' && session) {
          stopPolling();
          setRequestStatus('connected');
          setActiveRequest({
            ...activeRequest!,
            status: 'accepted',
            sessionId: session.sessionId,
          });
          setActiveSession(session.sessionId, type);
        } else if (status === 'rejected') {
          stopPolling();
          setRequestStatus('rejected');
          addToast({
            type: 'warning',
            title: 'Request Declined',
            message: rejectReason || 'Astrologer is unavailable right now.',
          });
        } else if (status === 'timeout' || status === 'cancelled') {
          stopPolling();
          setRequestStatus('timeout');
        } else if (status === 'pending') {
          setRequestStatus('waiting');
        }
      } catch {
        // Network error — keep polling, don't break flow
      }
    }, 2000);
  }, [stopPolling, activeRequest, setRequestStatus, setActiveRequest, setActiveSession, addToast]);

  // Initiate a connection request
  const initiateRequest = useCallback(async (astrologer: Astrologer, type: SessionType) => {
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
        stopPolling();
        setRequestStatus('rejected');
        addToast({
          type: 'warning',
          title: 'Insufficient Balance',
          message: `Minimum balance of ₹${balanceData?.minimumRequired || 50} required. Please recharge your wallet.`,
        });
        return;
      }

      // 2. Create the request via API
      const createFn = type === 'chat'
        ? () => chatService.createRequest(astrologer.id)
        : () => callService.initiateCall(astrologer.id);

      const response = await createFn();

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

        // 3. Start polling for status
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
      setRequestStatus('rejected');
      const message = err instanceof Error ? err.message : 'Connection failed';
      addToast({ type: 'error', title: 'Error', message });
    }
  }, [createRequest, setActiveRequest, setRequestStatus, startPolling, stopPolling, addToast]);

  // Cancel an active request
  const handleCancel = useCallback(async () => {
    stopPolling();
    const reqId = requestIdRef.current || activeRequest?.requestId;
    const type = activeRequest?.type;

    if (reqId && !reqId.startsWith('pending-') && type) {
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
    setIsModalOpen(false);
  }, [stopPolling, activeRequest, cancelRequest]);

  // Navigate to session when connected
  const handleNavigateToSession = useCallback(() => {
    const type = activeRequest?.type;
    const sessionId = activeRequest?.sessionId;
    if (sessionId && type) {
      clearRequest();
      setIsModalOpen(false);
      router.push(`/${type}/${sessionId}`);
    }
  }, [activeRequest, clearRequest, router]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    if (requestStatus === 'connected' || requestStatus === 'rejected' || requestStatus === 'timeout') {
      clearRequest();
    }
    setIsModalOpen(false);
    stopPolling();
  }, [requestStatus, clearRequest, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isModalOpen,
    requestStatus,
    selectedAstrologer,
    activeRequest,
    initiateRequest,
    handleCancel,
    handleNavigateToSession,
    handleCloseModal,
  };
}
