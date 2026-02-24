'use client';

/**
 * ChatInterface Component — Professional Web Chat UI
 * - Clean white/gray palette with subtle gradient background
 * - Centered max-width container for desktop readability
 * - Polished header with session info
 * - Modern message bubbles with proper spacing
 * - Sticky input bar always visible at bottom
 */

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { ChatMessage } from '@/types/api.types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { SessionHeader } from './SessionHeader';
import { SessionEndedActions } from './SessionEndedActions';
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
  initialDuration?: number;
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
  sessionStartTime,
  initialDuration,
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
  const isNearBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const isSessionActive = sessionStatus === 'active';
  const isSessionEnded = sessionStatus === 'completed' || sessionStatus === 'cancelled';

  const runningCost = sessionSummary?.totalCost || 0;

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Track whether user is near bottom of the chat
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScrollTrack = () => {
      const { scrollHeight, scrollTop, clientHeight } = container;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 150;
    };

    container.addEventListener('scroll', handleScrollTrack);
    return () => container.removeEventListener('scroll', handleScrollTrack);
  }, []);

  // Auto-scroll: only when near bottom or on initial load
  useEffect(() => {
    if (messages.length === 0) return;

    const isInitialLoad = prevMessagesLengthRef.current === 0;
    prevMessagesLengthRef.current = messages.length;

    if (isInitialLoad) {
      // Instant scroll on first load
      scrollToBottom('instant');
    } else if (isNearBottomRef.current) {
      // Smooth scroll only when user was already near bottom
      scrollToBottom('smooth');
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

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5]">
      {/* Header */}
      <SessionHeader
        astrologerName={isAstrologer ? userName : astrologerName}
        sessionStartTime={sessionStartTime}
        initialDuration={initialDuration}
        pricePerMinute={pricePerMinute}
        onEndSession={isSessionActive ? onEndSession : undefined}
        isEnding={isEnding}
        sessionEnded={isSessionEnded}
        totalCost={sessionSummary?.totalCost || 0}
        remainingBalance={remainingBalance}
        runningCost={runningCost}
        onBackPress={onBackPress}
      />

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Loading More Indicator */}
          {isFetchingMore && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-5 h-5 text-primary/60 animate-spin" />
            </div>
          )}

          {/* Load More Button */}
          {hasMoreMessages && !isFetchingMore && (
            <div className="flex justify-center py-3">
              <button
                onClick={onLoadMore}
                className="px-5 py-2 bg-white rounded-full text-xs text-primary font-medium font-lexend shadow-sm border border-primary/10 hover:bg-primary/5 transition-colors"
              >
                Load earlier messages
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary/40 animate-spin" />
            </div>
          ) : (
            <>
              {/* Empty state */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 font-lexend">
                    Start the conversation...
                  </p>
                </div>
              )}

              {/* Messages */}
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-5">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="px-4 py-1 text-[11px] text-gray-400 font-lexend font-medium uppercase tracking-wide">
                      {group.date}
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  {group.messages.map((message, index) => {
                    const isCurrentUser = isAstrologer
                      ? message.senderType === 'astrologer'
                      : message.senderType === 'user' || message.senderId === user?.id;

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

      {/* Message Input — always at bottom */}
      {isSessionActive && (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto">
            <MessageInput
              onSendMessage={onSendMessage}
              onTyping={onTyping}
              placeholder="Type a message..."
              disabled={isEnding}
            />
          </div>
        </div>
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          onClick={onClick}
          className={cn(
            'absolute bottom-20 left-1/2 -translate-x-1/2',
            'w-9 h-9 rounded-full',
            'bg-white shadow-md flex items-center justify-center',
            'border border-gray-100 hover:shadow-lg transition-shadow'
          )}
        >
          <ArrowDown className="w-4 h-4 text-gray-500" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
