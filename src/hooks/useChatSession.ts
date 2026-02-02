/**
 * Chat Session Hook - React Query hooks for chat sessions
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatService, SendMessageParams } from '@/lib/services/chat.service';
import { ChatMessage } from '@/types/api.types';
import { useCallback, useEffect, useRef, useState } from 'react';

// Query keys
export const CHAT_QUERY_KEYS = {
  session: (sessionId: string) => ['chat', 'session', sessionId] as const,
  messages: (sessionId: string) => ['chat', 'messages', sessionId] as const,
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
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

/**
 * Hook for fetching chat messages with infinite scroll
 */
export function useChatMessages(sessionId: string) {
  return useInfiniteQuery({
    queryKey: CHAT_QUERY_KEYS.messages(sessionId),
    queryFn: async ({ pageParam }) => {
      const response = await chatService.getMessages({
        sessionId,
        before: pageParam as string | undefined,
        limit: 50,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasMore) return undefined;
      return lastPage.nextCursor;
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!sessionId,
  });
}

/**
 * Hook for sending messages
 */
export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<SendMessageParams, 'sessionId'>) =>
      chatService.sendMessage({ sessionId, ...params }),
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: CHAT_QUERY_KEYS.messages(sessionId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(CHAT_QUERY_KEYS.messages(sessionId));

      // Optimistically update
      queryClient.setQueryData(CHAT_QUERY_KEYS.messages(sessionId), (old: unknown) => {
        if (!old) return old;
        const data = old as { pages: Array<{ messages: ChatMessage[] }> };
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          sessionId,
          senderId: 'user',
          senderType: 'user',
          content: newMessage.content,
          type: newMessage.type || 'text',
          status: 'sending',
          createdAt: new Date().toISOString(),
        };

        return {
          ...data,
          pages: data.pages.map((page, index) => {
            if (index === 0) {
              return {
                ...page,
                messages: [optimisticMessage, ...page.messages],
              };
            }
            return page;
          }),
        };
      });

      return { previousMessages };
    },
    onError: (_err, _newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          CHAT_QUERY_KEYS.messages(sessionId),
          context.previousMessages
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.messages(sessionId) });
    },
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

/**
 * Hook for managing chat state with real-time updates
 */
export function useChatState(sessionId: string) {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [astrologerTyping, setAstrologerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Send typing indicator
  const sendTyping = useCallback(async (typing: boolean) => {
    try {
      await chatService.sendTypingIndicator(sessionId, typing);
    } catch {
      // Ignore typing indicator errors
    }
  }, [sessionId]);

  // Handle user typing
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 2000);
  }, [isTyping, sendTyping]);

  // Add message to cache (for real-time updates)
  const addMessage = useCallback((message: ChatMessage) => {
    queryClient.setQueryData(CHAT_QUERY_KEYS.messages(sessionId), (old: unknown) => {
      if (!old) return old;
      const data = old as { pages: Array<{ messages: ChatMessage[] }> };

      // Check if message already exists
      const exists = data.pages.some(page =>
        page.messages.some(m => m.id === message.id)
      );
      if (exists) return data;

      return {
        ...data,
        pages: data.pages.map((page, index) => {
          if (index === 0) {
            return {
              ...page,
              messages: [message, ...page.messages],
            };
          }
          return page;
        }),
      };
    });
  }, [queryClient, sessionId]);

  // Update message status
  const updateMessageStatus = useCallback((messageId: string, status: string) => {
    queryClient.setQueryData(CHAT_QUERY_KEYS.messages(sessionId), (old: unknown) => {
      if (!old) return old;
      const data = old as { pages: Array<{ messages: ChatMessage[] }> };

      return {
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          messages: page.messages.map(m =>
            m.id === messageId ? { ...m, status } : m
          ),
        })),
      };
    });
  }, [queryClient, sessionId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    astrologerTyping,
    setAstrologerTyping,
    handleTyping,
    addMessage,
    updateMessageStatus,
  };
}
