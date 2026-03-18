'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/features/chat';
import {
  useChatSession,
  useChatMessaging,
  useEndChatSession,
} from '@/hooks/useChatSession';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useQueueStore } from '@/stores/queue-store';
import { supabaseRealtime } from '@/lib/services/supabase-realtime.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { walletService } from '@/lib/services/wallet.service';

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const [showEndModal, setShowEndModal] = useState(false);
  // Local ended state — set immediately when endSession API succeeds,
  // so UI updates instantly without waiting for refetch (which may fall back to status: 'active')
  const [isLocallyEnded, setIsLocallyEnded] = useState(false);

  // Wallet balance for billing display
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Auth check
  const { isReady } = useRequireAuth();

  // Astrologer data from queue store (passed during acceptance flow, like mobile app's route params)
  const storeAstrologer = useQueueStore((s) => s.selectedAstrologer);
  const storeRequest = useQueueStore((s) => s.activeRequest);

  // Fetch session data (React Query — uses active session fallback if /sessions/:id doesn't exist)
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useChatSession(sessionId);

  // Unified chat messaging — local state + Supabase broadcast (matches mobile app)
  const {
    messages,
    isLoading: isMessagesLoading,
    sending,
    sendMessage,
    astrologerTyping,
    setAstrologerTyping,
    handleTyping,
  } = useChatMessaging(sessionId, user?.id);

  // End session mutation
  const { mutate: endSession } = useEndChatSession(sessionId);

  // Extract session info — merge API data with queue store data (like mobile app's route params)
  const session = sessionData?.session;
  const astrologer = useMemo(() => {
    const apiAstrologer = sessionData?.astrologer;
    // Prefer API data, fall back to queue store data (matching mobile app navigation params pattern)
    return {
      id: apiAstrologer?.id || storeAstrologer?.id || storeRequest?.astrologerId || '',
      name: apiAstrologer?.name || storeAstrologer?.name || storeRequest?.astrologerName || 'Astrologer',
      image: apiAstrologer?.image || storeAstrologer?.profileImage || storeAstrologer?.image || storeRequest?.astrologerImage || '',
      isOnline: apiAstrologer?.isOnline ?? true,
    };
  }, [sessionData?.astrologer, storeAstrologer, storeRequest]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (content: string, type: 'text' | 'image' | 'audio' = 'text') => {
      try {
        await sendMessage(content, type);
      } catch {
        addToast({
          type: 'error',
          title: 'Failed to send message',
          message: 'Please try again',
        });
      }
    },
    [sendMessage, addToast]
  );

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleSendMessage(base64, 'image');
      };
      reader.readAsDataURL(file);
    },
    [handleSendMessage]
  );

  // Handle end session — show confirmation modal
  const handleEndSession = useCallback(() => {
    setShowEndModal(true);
  }, []);

  const confirmEndSession = useCallback(() => {
    setShowEndModal(false);
    endSession(undefined, {
      onSuccess: (response) => {
        // Set locally ended IMMEDIATELY so timer stops and UI updates instantly
        // (refetchSession may fall through to last-resort data with status: 'active')
        setIsLocallyEnded(true);

        // Update wallet balance from end-session response if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (response as any)?.data;
        if (data?.remainingBalance != null) {
          setWalletBalance(data.remainingBalance);
        }

        addToast({
          type: 'success',
          title: 'Session Ended',
          message: 'Your chat session has been ended.',
        });
        refetchSession();
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Failed to end session',
          message: error instanceof Error ? error.message : 'Please try again',
        });
      },
    });
  }, [endSession, addToast, refetchSession]);

  // Handle start new chat
  const handleStartNewChat = useCallback(() => {
    if (astrologer?.id) {
      router.push(`/astrologer/${astrologer.id}`);
    }
  }, [astrologer?.id, router]);

  // Notify backend that user has connected to the chat session (starts billing)
  // Matches mobile app: calls connectToSession() on mount regardless of session data
  const hasConnectedRef = useRef(false);
  useEffect(() => {
    if (!sessionId || hasConnectedRef.current) return;
    hasConnectedRef.current = true;

    (async () => {
      try {
        await (await import('@/lib/services/chat.service')).chatService.connectSession(sessionId);
      } catch {
        // Non-critical — billing may have already started
      }
    })();
  }, [sessionId]);

  // Fetch wallet balance on mount (matching mobile app's balance monitoring)
  useEffect(() => {
    (async () => {
      try {
        const response = await walletService.getBalance();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = response?.data ?? response as any;
        const bal = data?.balance ?? data?.walletBalance ?? 0;
        setWalletBalance(bal);
      } catch {
        // Non-critical — balance display will show 0
      }
    })();
  }, []);

  // Subscribe to wallet balance updates via Supabase Broadcast (matching mobile app)
  useEffect(() => {
    if (!user?.id) return;

    const unsubWallet = supabaseRealtime.subscribeToWalletUpdates(
      user.id,
      (payload) => {
        if (payload.balance != null) {
          setWalletBalance(payload.balance);
        }
      }
    );

    return () => {
      unsubWallet();
    };
  }, [user?.id]);

  // Subscribe to billing events (low balance, session ended by system)
  useEffect(() => {
    if (!user?.id) return;

    const unsubBilling = supabaseRealtime.subscribeToBillingEvents(
      user.id,
      {
        onLowBalance: (payload) => {
          addToast({
            type: 'warning',
            title: 'Low Balance',
            message: payload.message || `Low balance! About ${payload.remainingMinutes ?? 0} minutes remaining.`,
          });
          if (payload.remainingBalance != null) {
            setWalletBalance(payload.remainingBalance);
          }
        },
        onCallEnded: (payload) => {
          // 'call_ended' event is also used for chat sessions ending due to balance
          setIsLocallyEnded(true);
          if (payload.remainingBalance != null) {
            setWalletBalance(payload.remainingBalance);
          }
          addToast({
            type: 'info',
            title: 'Session Ended',
            message: payload.message || 'Session ended due to insufficient balance.',
          });
          refetchSession();
        },
        onCallEndedBalance: (payload) => {
          setIsLocallyEnded(true);
          if (payload.remainingBalance != null) {
            setWalletBalance(payload.remainingBalance);
          }
          addToast({
            type: 'info',
            title: 'Session Ended',
            message: 'Session ended due to insufficient balance.',
          });
          refetchSession();
        },
      }
    );

    return () => {
      unsubBilling();
    };
  }, [user?.id, addToast, refetchSession]);

  // Subscribe to session status updates via Supabase Broadcast
  useEffect(() => {
    if (!sessionId) return;

    const unsubSession = supabaseRealtime.subscribeToSessionUpdate(
      sessionId,
      (payload) => {
        if (payload.status === 'completed' || payload.status === 'cancelled') {
          setIsLocallyEnded(true);
          addToast({
            type: 'info',
            title: 'Session Ended',
            message: 'The astrologer has ended the chat session.',
          });
          refetchSession();
        }
      }
    );

    return () => {
      unsubSession();
    };
  }, [sessionId, addToast, refetchSession]);

  // Auth loading state
  if (!isReady) {
    return (
      <div className="flex flex-col h-full bg-background-chat">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="w-32 h-4 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <Skeleton
                className={`h-12 ${i % 2 === 0 ? 'w-48 rounded-bl-sm' : 'w-36 rounded-br-sm'} rounded-2xl`}
              />
            </div>
          ))}
        </div>
        <div className="bg-white border-t p-3">
          <Skeleton className="w-full h-10 rounded-full" />
        </div>
      </div>
    );
  }

  // Loading state
  if (isSessionLoading) {
    return (
      <div className="flex flex-col h-full bg-background-chat">
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="w-32 h-4 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <Skeleton
                className={`h-12 ${i % 2 === 0 ? 'w-48 rounded-bl-sm' : 'w-36 rounded-br-sm'} rounded-2xl`}
              />
            </div>
          ))}
        </div>
        <div className="bg-white border-t p-3">
          <Skeleton className="w-full h-10 rounded-full" />
        </div>
      </div>
    );
  }

  // Error state — only show if we have an error AND no store data to fall back on
  if ((sessionError || !session) && !storeAstrologer && !storeRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background-offWhite p-4">
        <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-status-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Session Not Found
        </h2>
        <p className="text-text-secondary text-center mb-4">
          {sessionError instanceof Error
            ? sessionError.message
            : 'Unable to load chat session. It may have expired or been deleted.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetchSession()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Derive session props — use API data when available, fall back to defaults
  // isLocallyEnded overrides API status to ensure immediate UI update
  const sessionStatus = isLocallyEnded ? 'completed' : (session?.status || 'active');

  // Build session summary for ended sessions
  const sessionSummary =
    (session && session.status !== 'active' && session.duration !== undefined && session.duration !== null)
    || isLocallyEnded
      ? {
          duration: session?.duration ?? 0,
          totalCost: session?.totalCost || 0,
        }
      : undefined;
  const sessionStartTime = session?.startTime || new Date().toISOString();
  const pricePerMinute = session?.pricePerMinute
    || storeAstrologer?.chatPricePerMinute
    || storeAstrologer?.chatPrice
    || storeAstrologer?.pricePerMinute
    || storeRequest?.pricePerMinute
    || 0;

  return (
    <div className="h-full">
      <ChatInterface
        sessionId={sessionId}
        astrologerId={astrologer.id || session?.astrologerId || ''}
        astrologerName={astrologer.name}
        astrologerImage={astrologer.image}
        isOnline={astrologer.isOnline}
        messages={messages}
        isLoading={isMessagesLoading}
        sessionStatus={sessionStatus}
        sessionStartTime={sessionStartTime}
        pricePerMinute={pricePerMinute}
        remainingBalance={walletBalance}
        sessionSummary={sessionSummary}
        isTyping={astrologerTyping}
        isEnding={sending}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onImageUpload={handleImageUpload}
        onEndSession={handleEndSession}
        onStartNewChat={handleStartNewChat}
      />

      {/* End Session Confirmation Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        className="max-w-sm"
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-status-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-status-warning" />
          </div>
          <h3 className="text-lg font-bold text-text-primary font-lexend mb-2">
            End Chat Session?
          </h3>
          <p className="text-sm text-text-secondary mb-6">
            Are you sure you want to end this chat session? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEndModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-status-error hover:bg-status-error/90"
              onClick={confirmEndSession}
            >
              End Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
