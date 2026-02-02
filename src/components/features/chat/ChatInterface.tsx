'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { ChatMessage } from '@/types/api.types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { SessionHeader } from './SessionHeader';
import { SessionEndedActions } from './SessionEndedActions';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface ChatInterfaceProps {
  sessionId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerImage?: string;
  isOnline?: boolean;
  messages: ChatMessage[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMoreMessages?: boolean;
  sessionStatus: 'active' | 'completed' | 'cancelled';
  sessionStartTime?: string;
  pricePerMinute?: number;
  sessionSummary?: {
    duration: number;
    durationFormatted?: string;
    totalMessages?: number;
    totalCost: number;
  };
  isTyping?: boolean;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio') => void;
  onTyping?: () => void;
  onImageUpload?: (file: File) => void;
  onEndSession?: () => void;
  onLoadMore?: () => void;
  onStartNewChat?: () => void;
}

export function ChatInterface({
  sessionId,
  astrologerId,
  astrologerName,
  astrologerImage,
  isOnline = true,
  messages,
  isLoading,
  isFetchingMore,
  hasMoreMessages,
  sessionStatus,
  sessionStartTime,
  pricePerMinute,
  sessionSummary,
  isTyping,
  onSendMessage,
  onTyping,
  onImageUpload,
  onEndSession,
  onLoadMore,
  onStartNewChat,
}: ChatInterfaceProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isSessionActive = sessionStatus === 'active';

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || !hasMoreMessages || isFetchingMore) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100) {
      onLoadMore?.();
    }
  }, [hasMoreMessages, isFetchingMore, onLoadMore]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn('flex gap-2', i % 2 === 0 ? 'justify-start' : 'justify-end')}
        >
          {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full" />}
          <Skeleton
            className={cn(
              'h-12 rounded-2xl',
              i % 2 === 0 ? 'w-48 rounded-bl-sm' : 'w-36 rounded-br-sm'
            )}
          />
        </div>
      ))}
    </div>
  );

  // Render date separator
  const renderDateSeparator = (date: string) => (
    <div className="flex items-center justify-center my-4">
      <span className="px-3 py-1 bg-background-card rounded-full text-xs text-text-muted">
        {date}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background-chat">
      {/* Header */}
      <SessionHeader
        astrologerName={astrologerName}
        astrologerImage={astrologerImage}
        isOnline={isOnline}
        sessionStartTime={sessionStartTime}
        pricePerMinute={pricePerMinute}
        onEndSession={isSessionActive ? onEndSession : undefined}
      />

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2"
        onScroll={handleScroll}
      >
        {/* Loading More Indicator */}
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <Skeleton className="w-24 h-4 rounded" />
          </div>
        )}

        {/* Load More Button */}
        {hasMoreMessages && !isFetchingMore && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="text-xs"
            >
              Load earlier messages
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          renderLoadingSkeleton()
        ) : (
          <>
            {/* Messages */}
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {renderDateSeparator(group.date)}
                {group.messages.map((message, index) => {
                  const isCurrentUser = message.senderType === 'user' ||
                    message.senderId === user?.id;
                  const showAvatar = index === 0 ||
                    group.messages[index - 1]?.senderType !== message.senderType;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      showAvatar={showAvatar && !isCurrentUser}
                      astrologerImage={astrologerImage}
                      astrologerName={astrologerName}
                    />
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && <TypingIndicator name={astrologerName} />}
            </AnimatePresence>
          </>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Session Ended Actions */}
      {sessionStatus !== 'active' && sessionSummary && (
        <SessionEndedActions
          sessionId={sessionId}
          astrologerId={astrologerId}
          astrologerName={astrologerName}
          summary={sessionSummary}
          onStartNewChat={onStartNewChat}
        />
      )}

      {/* Message Input */}
      {isSessionActive && (
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          onImageSelect={onImageUpload}
          placeholder="Type a message..."
        />
      )}

      {/* Scroll to Bottom Button */}
      <ScrollToBottomButton
        messagesContainerRef={messagesContainerRef}
        onClick={() => scrollToBottom()}
      />
    </div>
  );
}

// Scroll to bottom floating button
function ScrollToBottomButton({
  messagesContainerRef,
  onClick,
}: {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
}) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messagesContainerRef]);

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClick}
          className="absolute bottom-24 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border"
        >
          <ArrowDown className="w-5 h-5 text-text-secondary" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

