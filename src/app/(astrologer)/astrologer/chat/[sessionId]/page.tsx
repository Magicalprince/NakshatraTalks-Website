'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/features/chat';
import {
  useChatSession,
  useChatMessages,
  useSendMessage,
  useEndChatSession,
  useChatState,
} from '@/hooks/useChatSession';
import { useUIStore } from '@/stores/ui-store';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AstrologerChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();

  // Fetch session data
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useChatSession(sessionId);

  // Fetch messages with infinite scroll
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useChatMessages(sessionId);

  // Send message mutation
  const { mutate: sendMessage } = useSendMessage(sessionId);

  // End session mutation
  const { mutate: endSession } = useEndChatSession(sessionId);

  // Chat state (typing indicators, real-time updates)
  const {
    astrologerTyping: userTyping,
    handleTyping,
    addMessage,
    updateMessageStatus,
  } = useChatState(sessionId);

  // Flatten messages from infinite query
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages
      .flatMap((page) => page?.messages || [])
      .reverse(); // Reverse to show oldest first
  }, [messagesData]);

  // Extract session info
  const session = sessionData?.session;
  const user = sessionData?.user;

  // Handle send message
  const handleSendMessage = useCallback(
    (content: string, type: 'text' | 'image' | 'audio' = 'text') => {
      sendMessage(
        { content, type },
        {
          onError: (error) => {
            addToast({
              type: 'error',
              title: 'Failed to send message',
              message: error instanceof Error ? error.message : 'Please try again',
            });
          },
        }
      );
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

  // Handle end session
  const handleEndSession = useCallback(() => {
    if (window.confirm('Are you sure you want to end this chat session?')) {
      endSession(undefined, {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Session Ended',
            message: 'The chat session has been ended.',
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
    }
  }, [endSession, addToast, refetchSession]);

  // Handle session end (navigate back)
  const handleSessionEnd = useCallback(() => {
    router.push('/astrologer/chat');
  }, [router]);

  // Handle load more messages
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!sessionId) return;
    // Real-time subscriptions would be set up here
  }, [sessionId, addMessage, updateMessageStatus]);

  // Loading state
  if (isSessionLoading) {
    return (
      <div className="flex flex-col h-screen bg-background-chat">
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

  // Error state
  if (sessionError || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-offWhite p-4">
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
          <Button variant="primary" onClick={() => router.push('/astrologer/chat')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  // Build session summary for ended sessions
  const sessionSummary =
    session.status !== 'active' && session.duration !== undefined && session.duration !== null
      ? {
          duration: session.duration,
          totalCost: session.totalCost || 0,
        }
      : undefined;

  return (
    <div className="h-screen lg:h-[calc(100vh-0px)]">
      <ChatInterface
        sessionId={sessionId}
        userName={user?.name || 'User'}
        userImage={user?.image}
        isOnline={true}
        messages={messages}
        isLoading={isMessagesLoading}
        isFetchingMore={isFetchingNextPage}
        hasMoreMessages={hasNextPage}
        sessionStatus={session.status}
        sessionStartTime={session.startTime}
        sessionSummary={sessionSummary}
        isTyping={userTyping}
        isAstrologer={true}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onImageUpload={handleImageUpload}
        onEndSession={handleEndSession}
        onLoadMore={handleLoadMore}
        onSessionEnd={handleSessionEnd}
      />
    </div>
  );
}
