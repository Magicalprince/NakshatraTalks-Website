/**
 * Chat Session Hooks
 *
 * Architecture matches the mobile app (useChatSession.ts):
 * - Messages stored in local useState (NOT React Query cache)
 * - Initial fetch from REST API
 * - Real-time updates via Supabase Broadcast (channel: chat-messages-{sessionId})
 * - No optimistic updates — message added only after broadcast arrives
 * - Send via API → backend saves → backend broadcasts → frontend receives & appends
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatService } from '@/lib/services/chat.service';
import { ChatMessage } from '@/types/api.types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabaseRealtime, ChatMessagePayload } from '@/lib/services/supabase-realtime.service';
import { socketService } from '@/lib/services/socket.service';

// Query keys (session & history still use React Query)
export const CHAT_QUERY_KEYS = {
  session: (sessionId: string) => ['chat', 'session', sessionId] as const,
  messages: (sessionId: string) => ['chat', 'messages', sessionId] as const,
  requestStatus: (requestId: string) => ['chat', 'request', requestId] as const,
  history: ['chat', 'history'] as const,
};

/**
 * Hook for fetching chat session details
 */
export function useChatSession(sessionId: string) {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.session(sessionId),
    queryFn: async () => {
      const response = await chatService.getSession(sessionId);
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: 10000,
  });
}

/**
 * Unified chat messaging hook — matches mobile app architecture.
 *
 * Manages messages via local state + Supabase Broadcast.
 * No React Query cache manipulation for messages.
 */
export function useChatMessaging(sessionId: string, userId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const [astrologerTyping, setAstrologerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch initial messages from API (like mobile app) ──────────────
  const fetchMessages = useCallback(async () => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      const response = await chatService.getMessages({
        sessionId,
        limit: 100,
      });
      // Backend sends raw array in data, not wrapped as { messages: [...] }
      const raw = response.data;
      const fetched = Array.isArray(raw) ? raw : (raw?.messages || []);
      // API returns newest-first; reverse to oldest-first for display
      setMessages(fetched.reverse());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ── Send message via API — add to local state from response ─────────
  const sendMessage = useCallback(
    async (content: string, type: 'text' | 'image' | 'audio' = 'text') => {
      if (!sessionId || !content.trim() || sending) return;
      try {
        setSending(true);
        const response = await chatService.sendMessage({ sessionId, content: content.trim(), type });
        // Add sent message to local state from API response
        if (response.data) {
          const saved = response.data;
          const sentMessage: ChatMessage = {
            id: saved.id,
            sessionId: saved.sessionId,
            senderId: saved.senderId,
            senderType: saved.senderType,
            content: saved.message || saved.content,
            type: saved.type as 'text' | 'image' | 'audio',
            status: 'sent',
            createdAt: saved.createdAt,
          };
          setMessages((prev) => {
            if (prev.find((m) => m.id === sentMessage.id)) return prev;
            return [...prev, sentMessage];
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        throw err; // Re-throw so caller can show toast
      } finally {
        setSending(false);
      }
    },
    [sessionId, sending]
  );

  // ── Supabase Broadcast subscription (PRIMARY real-time channel) ────
  useEffect(() => {
    if (!sessionId) return;

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

    return () => {
      unsubMessages();
    };
  }, [sessionId]);

  // ── Socket.IO fallback (for any backend Socket.IO events) ──────────
  useEffect(() => {
    if (!sessionId) return;

    socketService.joinChatSession(sessionId);

    const unsubMessage = socketService.on('chat_message', (data: unknown) => {
      const payload = data as { message: ChatMessage };
      if (payload?.message) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
      }
    });

    const unsubTyping = socketService.on('chat_typing', (data: unknown) => {
      const payload = data as { sessionId: string; isTyping: boolean };
      if (payload?.sessionId === sessionId) {
        setAstrologerTyping(payload.isTyping);
      }
    });

    const unsubStatus = socketService.on('message_status', (data: unknown) => {
      const payload = data as { messageId: string; status: string };
      if (payload?.messageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId
              ? { ...m, status: payload.status as ChatMessage['status'] }
              : m
          )
        );
      }
    });

    return () => {
      socketService.leaveChatSession(sessionId);
      unsubMessage();
      unsubTyping();
      unsubStatus();
    };
  }, [sessionId]);

  // ── Typing indicator ───────────────────────────────────────────────
  const sendTypingIndicator = useCallback(
    async (typing: boolean) => {
      try {
        await chatService.sendTypingIndicator(sessionId, typing);
      } catch {
        // Ignore typing errors
      }
    },
    [sessionId]
  );

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }, [isTyping, sendTypingIndicator]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    sending,
    error,
    sendMessage,
    refetchMessages: fetchMessages,
    astrologerTyping,
    setAstrologerTyping,
    handleTyping,
  };
}

// ─── Remaining hooks (unchanged — these work fine) ─────────────────────

/**
 * Hook for initiating a chat request
 */
export function useInitiateChatRequest() {
  return useMutation({
    mutationFn: (astrologerId: string) => chatService.createRequest(astrologerId),
  });
}

/**
 * Hook for polling chat request status
 */
export function useChatRequestStatus(requestId: string | null, options?: {
  onAccepted?: (sessionId: string) => void;
  onRejected?: (reason?: string) => void;
  onTimeout?: () => void;
}) {
  const [isPolling, setIsPolling] = useState(!!requestId);

  const query = useQuery({
    queryKey: CHAT_QUERY_KEYS.requestStatus(requestId || ''),
    queryFn: async () => {
      if (!requestId) throw new Error('No request ID');
      const response = await chatService.getRequestStatus(requestId);
      return response.data;
    },
    enabled: !!requestId && isPolling,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if (['accepted', 'rejected', 'timeout', 'cancelled'].includes(data.status)) {
        return false;
      }
      return 2000;
    },
  });

  useEffect(() => {
    if (!query.data) return;

    const { status } = query.data;

    if (status === 'accepted' && query.data.session) {
      setIsPolling(false);
      options?.onAccepted?.(query.data.session.sessionId);
    } else if (status === 'rejected') {
      setIsPolling(false);
      options?.onRejected?.(query.data.rejectReason);
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
 * Hook for canceling chat request
 */
export function useCancelChatRequest() {
  return useMutation({
    mutationFn: (requestId: string) => chatService.cancelRequest(requestId),
  });
}

/**
 * Hook for ending chat session
 */
export function useEndChatSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatService.endSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.history });
    },
  });
}

/**
 * Hook for chat history
 */
export function useChatHistory() {
  return useInfiniteQuery({
    queryKey: CHAT_QUERY_KEYS.history,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await chatService.getChatHistory(pageParam, 20);
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
