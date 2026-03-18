'use client';

/**
 * Astrologer Chat Session Page
 *
 * Architecture matches the mobile app & user-side web (useChatSession.ts):
 * - Messages stored in local useState (NOT React Query cache)
 * - Initial fetch from REST API
 * - Real-time updates via Supabase Broadcast (channel: chat-messages-{sessionId})
 * - No optimistic temp IDs — message added from API response + broadcast deduplication
 * - Send via API → backend saves + broadcasts → broadcast arrives & deduplicates
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChatInterface } from '@/components/features/chat';
import {
  useEndChatSessionAstrologer,
  ASTROLOGER_QUERY_KEYS,
} from '@/hooks/useAstrologerDashboard';
import { astrologerDashboardService } from '@/lib/services/astrologer-dashboard.service';
import { useUIStore } from '@/stores/ui-store';
import { supabaseRealtime, ChatMessagePayload } from '@/lib/services/supabase-realtime.service';
import { ChatMessage } from '@/types/api.types';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AstrologerChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<{
    duration: number;
    totalCost: number;
  } | null>(null);

  // ── Intake profile: read from sessionStorage (stored during accept) or active session ──
  const [intakeProfile, setIntakeProfile] = useState<import('@/types/api.types').IntakeProfileInfo | null>(null);
  useEffect(() => {
    // Try sessionStorage first (set by dashboard handleAccept)
    try {
      const stored = sessionStorage.getItem(`intake-profile-${sessionId}`);
      if (stored) {
        setIntakeProfile(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, [sessionId]);

  // ── Local state for messages (matches mobile app architecture) ──────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch active session data via astrologer endpoint
  // The service already handles unwrapping { hasActiveChat, session } — no double-unwrap needed.
  const hadActiveSessionRef = useRef(false);
  const {
    data: activeSession,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ASTROLOGER_QUERY_KEYS.activeChat,
    queryFn: async () => {
      const response = await astrologerDashboardService.getActiveChatSession();
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: sessionEnded ? false : 10000,
  });

  // Detect session ended from server: only trigger when we HAD an active session
  // and then it became null (not on initial load when data hasn't arrived yet).
  useEffect(() => {
    if (activeSession) {
      hadActiveSessionRef.current = true;
    }
    if (hadActiveSessionRef.current && !isSessionLoading && !activeSession && !sessionError) {
      setSessionEnded(true);
    }
  }, [activeSession, isSessionLoading, sessionError]);

  // ── Fetch initial messages from API (like mobile app) ──────────────
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setIsMessagesLoading(true);
        const response = await astrologerDashboardService.getChatMessages(sessionId, 100);
        if (!cancelled) {
          const fetched = response.data?.messages || [];
          setMessages(fetched);
        }
      } catch (err) {
        if (!cancelled) {
          addToast({
            type: 'error',
            title: 'Failed to load messages',
            message: err instanceof Error ? err.message : 'Please try again',
          });
        }
      } finally {
        if (!cancelled) {
          setIsMessagesLoading(false);
        }
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [sessionId, addToast]);

  // End session via astrologer endpoint
  const { mutate: endSession } = useEndChatSessionAstrologer();

  // Extract session info from active session
  const sessionUser = activeSession?.user;
  const sessionStatus: 'active' | 'completed' = sessionEnded ? 'completed' : 'active';

  // ── Send message via astrologer API ─────────────────────────────────
  // No optimistic temp IDs. Message is added from the API response immediately,
  // then Supabase broadcast arrives and deduplicates by ID.
  const handleSendMessage = useCallback(
    async (content: string, type: 'text' | 'image' | 'audio' = 'text') => {
      if (!sessionId || !content.trim() || sending) return;
      try {
        setSending(true);
        const response = await astrologerDashboardService.sendMessage(
          sessionId,
          content.trim(),
          type === 'audio' ? 'text' : type
        );
        // Add message from API response immediately (has real server ID)
        if (response.data) {
          const msg = response.data;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        // Supabase broadcast will also arrive — deduplicated by ID above
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Failed to send message',
          message: err instanceof Error ? err.message : 'Please try again',
        });
      } finally {
        setSending(false);
      }
    },
    [sessionId, sending, addToast]
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
    endSession(sessionId, {
      onSuccess: (response) => {
        setSessionEnded(true);
        if (response.data) {
          setSessionSummary({
            duration: response.data.duration,
            totalCost: response.data.totalCost,
          });
        }
        addToast({
          type: 'success',
          title: 'Session Ended',
          message: 'The chat session has been ended.',
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Failed to end session',
          message: error instanceof Error ? error.message : 'Please try again',
        });
      },
    });
  }, [endSession, sessionId, addToast]);

  // Navigate back to dashboard
  const handleSessionEnd = useCallback(() => {
    router.push('/astrologer/dashboard');
  }, [router]);

  // ── Real-time subscriptions via Supabase Broadcast ──────────────────
  useEffect(() => {
    if (!sessionId) return;

    // Real-time chat messages — accept ALL messages (own + user's).
    // Matches mobile app & user-side web architecture.
    // Own messages are deduplicated (already added from API response above).
    const unsubMessages = supabaseRealtime.subscribeToChatMessages(
      sessionId,
      (payload: ChatMessagePayload) => {
        const newMessage: ChatMessage = {
          id: payload.id,
          sessionId: payload.sessionId,
          senderId: payload.senderId,
          senderType: payload.senderType,
          content: payload.message,
          type: payload.type as 'text' | 'image' | 'audio',
          status: payload.isRead ? 'read' : 'delivered',
          createdAt: payload.createdAt,
        };

        setMessages((prev) => {
          // Deduplicate by ID (same as mobile app)
          if (prev.find((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    );

    // Real-time session updates (user ends chat)
    const unsubSession = supabaseRealtime.subscribeToSessionUpdate(
      sessionId,
      (payload) => {
        if (payload.status === 'completed' || payload.status === 'cancelled') {
          setSessionEnded(true);
          if (payload.duration != null && payload.totalCost != null) {
            setSessionSummary({
              duration: payload.duration,
              totalCost: payload.totalCost,
            });
          }
          addToast({
            type: 'info',
            title: 'Session Ended',
            message: 'The user has ended the chat session.',
          });
        }
      }
    );

    return () => {
      unsubMessages();
      unsubSession();
    };
  }, [sessionId, addToast]);

  // Loading state
  if (isSessionLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-background-chat">
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

  // Error state (only show if no session data at all and not ended)
  if (sessionError && !activeSession && !sessionEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background-offWhite p-4">
        <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-status-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Session Not Found
        </h2>
        <p className="text-text-secondary text-center mb-4">
          {sessionError instanceof Error
            ? sessionError.message
            : 'Unable to load chat session.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetchSession()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="primary" onClick={() => router.push('/astrologer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)]">
      <ChatInterface
        sessionId={sessionId}
        userName={sessionUser?.name || 'User'}
        userImage={sessionUser?.image || undefined}
        isOnline={!sessionEnded}
        messages={messages}
        isLoading={isMessagesLoading}
        sessionStatus={sessionStatus}
        sessionStartTime={activeSession?.startTime}
        initialDuration={activeSession?.duration}
        pricePerMinute={activeSession?.pricePerMinute}
        sessionSummary={sessionSummary || undefined}
        isAstrologer={true}
        intakeProfile={intakeProfile || activeSession?.intakeProfile}
        onSendMessage={handleSendMessage}
        onImageUpload={handleImageUpload}
        onEndSession={handleEndSession}
        onSessionEnd={handleSessionEnd}
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
            Are you sure you want to end this chat session? The user will be notified and billing will stop.
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
