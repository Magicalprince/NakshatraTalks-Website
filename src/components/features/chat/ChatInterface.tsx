'use client';

/**
 * ChatInterface Component
 * Design matches mobile app with:
 * - WhatsApp-like chat background (#ECE5DD)
 * - Session header with timer ribbon
 * - Message bubbles (blue user, yellow astrologer)
 * - Clean input area
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { ChatMessage } from '@/types/api.types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { SessionHeader } from './SessionHeader';
import { SessionEndedActions } from './SessionEndedActions';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface ChatInterfaceProps {
  sessionId: string;
  astrologerId?: string;
  astrologerName?: string;
  astrologerImage?: string;
  userName?: string;
  userImage?: string;
  isOnline?: boolean;
  messages: ChatMessage[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMoreMessages?: boolean;
  sessionStatus: 'active' | 'completed' | 'cancelled';
  sessionStartTime?: string;
  pricePerMinute?: number;
  remainingBalance?: number;
  sessionSummary?: {
    duration: number;
    durationFormatted?: string;
    totalMessages?: number;
    totalCost: number;
  };
  isTyping?: boolean;
  isAstrologer?: boolean;
  isEnding?: boolean;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio') => void;
  onTyping?: () => void;
  onImageUpload?: (file: File) => void;
  onEndSession?: () => void;
  onLoadMore?: () => void;
  onStartNewChat?: () => void;
  onSessionEnd?: () => void;
  onBackPress?: () => void;
}

export function ChatInterface({
  sessionId,
  astrologerId,
  astrologerName = 'Astrologer',
  userName = 'User',
  messages,
  isLoading,
  isFetchingMore,
  hasMoreMessages,
  sessionStatus,
  pricePerMinute = 0,
  remainingBalance = 0,
  sessionSummary,
  isTyping,
  isAstrologer = false,
  isEnding = false,
  onSendMessage,
  onTyping,
  onEndSession,
  onLoadMore,
  onBackPress,
}: ChatInterfaceProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isSessionActive = sessionStatus === 'active';
  const isSessionEnded = sessionStatus === 'completed' || sessionStatus === 'cancelled';

  // Calculate running cost based on duration (would need to track in real implementation)
  const runningCost = sessionSummary?.totalCost || 0;

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
      const date = new Date(message.createdAt);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const dateKey = isToday
        ? 'Today'
        : date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
          });

      if (dateKey !== currentDate) {
        currentDate = dateKey;
        groups.push({ date: dateKey, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  // Render date separator
  const renderDateSeparator = (date: string) => (
    <div className="flex items-center justify-center my-4">
      <span className="px-4 py-1.5 bg-white/80 rounded-lg text-xs text-[#595959] font-lexend shadow-sm">
        {date}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with Timer Ribbon */}
      <SessionHeader
        astrologerName={isAstrologer ? userName : astrologerName}
        pricePerMinute={isAstrologer ? undefined : pricePerMinute}
        onEndSession={isSessionActive ? onEndSession : undefined}
        isEnding={isEnding}
        sessionEnded={isSessionEnded}
        totalCost={sessionSummary?.totalCost || 0}
        remainingBalance={remainingBalance}
        runningCost={runningCost}
        onBackPress={onBackPress}
      />

      {/* Messages Area - WhatsApp-like background */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto py-3"
        style={{ backgroundColor: '#ECE5DD' }}
        onScroll={handleScroll}
      >
        {/* Loading More Indicator */}
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}

        {/* Load More Button */}
        {hasMoreMessages && !isFetchingMore && (
          <div className="flex justify-center py-2">
            <button
              onClick={onLoadMore}
              className="px-4 py-1.5 bg-white/80 rounded-lg text-xs text-primary font-medium font-lexend shadow-sm"
            >
              Load earlier messages
            </button>
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
                  // For astrologer view: astrologer's messages are on the right
                  // For user view: user's messages are on the right
                  const isCurrentUser = isAstrologer
                    ? message.senderType === 'astrologer'
                    : message.senderType === 'user' || message.senderId === user?.id;

                  // Check if consecutive message from same sender
                  const prevMessage = index > 0 ? group.messages[index - 1] : null;
                  const isConsecutive = prevMessage?.senderType === message.senderType;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isCurrentUser={isCurrentUser}
                      isConsecutive={isConsecutive}
                    />
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && <TypingIndicator />}
            </AnimatePresence>
          </>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Session Ended Actions */}
      {isSessionEnded && (
        <SessionEndedActions
          sessionId={sessionId}
          astrologerId={astrologerId}
          astrologerName={astrologerName}
          variant={isAstrologer ? 'astrologer' : 'user'}
          summary={sessionSummary}
        />
      )}

      {/* Message Input */}
      {isSessionActive && (
        <MessageInput
          onSendMessage={onSendMessage}
          onTyping={onTyping}
          placeholder="Message"
          disabled={isEnding}
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
          className={cn(
            'fixed bottom-24 right-4 w-10 h-10 rounded-full',
            'bg-white shadow-lg flex items-center justify-center',
            'border border-gray-200'
          )}
        >
          <ArrowDown className="w-5 h-5 text-[#595959]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
