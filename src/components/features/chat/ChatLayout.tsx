'use client';

/**
 * ChatLayout Component
 * WhatsApp Web-style layout with:
 * - Conversation list on the left (desktop)
 * - Active chat on the right
 * - Responsive: full-screen chat on mobile
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Avatar } from '@/components/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Conversation {
  id: string;
  astrologerName: string;
  astrologerImage?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  status: 'active' | 'completed' | 'cancelled';
}

interface ChatLayoutProps {
  children: React.ReactNode;
  conversations?: Conversation[];
  isLoadingConversations?: boolean;
  activeSessionId?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function ChatLayout({
  children,
  conversations = [],
  isLoadingConversations = false,
  activeSessionId,
  showBackButton = false,
  onBackClick,
}: ChatLayoutProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(!activeSessionId);

  // Update mobile view based on active session
  useEffect(() => {
    setShowMobileList(!activeSessionId);
  }, [activeSessionId]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.astrologerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-[calc(100vh-73px)] bg-white overflow-hidden">
      {/* Conversation List - Desktop: always visible, Mobile: conditional */}
      <div
        className={cn(
          'flex-shrink-0 border-r border-gray-100 bg-white',
          // Desktop: fixed width, always visible
          'lg:w-[340px] lg:flex lg:flex-col',
          // Mobile: full width or hidden
          showMobileList ? 'w-full flex flex-col' : 'hidden'
        )}
      >
        {/* List Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary font-lexend">
              Chats
            </h2>
            {conversations.filter(c => c.status === 'active').length > 0 && (
              <span className="px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full font-lexend">
                {conversations.filter(c => c.status === 'active').length} Active
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-lexend placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            // Loading skeletons
            <div className="p-2 space-y-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 skeleton-shimmer" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 skeleton-shimmer" />
                    <div className="h-3 bg-gray-100 rounded w-32 skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary font-lexend mb-2">
                No conversations yet
              </h3>
              <p className="text-sm text-text-muted font-lexend">
                Start chatting with an astrologer to see your conversations here.
              </p>
              <Link
                href="/browse-chat"
                className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold font-lexend hover:bg-primary/90 transition-colors"
              >
                Browse Astrologers
              </Link>
            </div>
          ) : (
            // Conversation items
            <div className="p-2">
              {filteredConversations.map((conv) => {
                const isActive = conv.id === activeSessionId;
                return (
                  <Link key={conv.id} href={`/chat/${conv.id}`}>
                    <motion.div
                      whileHover={{ backgroundColor: 'rgba(41, 48, 166, 0.05)' }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors',
                        isActive && 'bg-primary/10'
                      )}
                    >
                      {/* Avatar with online indicator */}
                      <div className="relative flex-shrink-0">
                        <Avatar
                          src={conv.astrologerImage}
                          alt={conv.astrologerName}
                          fallback={conv.astrologerName}
                          size="lg"
                        />
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                        {conv.status === 'active' && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            'font-semibold text-sm font-lexend truncate',
                            isActive ? 'text-primary' : 'text-text-primary'
                          )}>
                            {conv.astrologerName}
                          </span>
                          <span className="text-xs text-text-muted font-lexend flex-shrink-0 ml-2">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-text-muted font-lexend truncate">
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full font-lexend flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          // Mobile: hidden when showing list
          !showMobileList ? 'flex' : 'hidden lg:flex'
        )}
      >
        {/* Mobile back button */}
        {showBackButton && !showMobileList && (
          <div className="lg:hidden absolute top-0 left-0 z-10 p-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (onBackClick) onBackClick();
                setShowMobileList(true);
              }}
              className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-md"
            >
              <ChevronLeft className="w-6 h-6 text-text-primary" />
            </motion.button>
          </div>
        )}

        {/* Chat content or empty state */}
        {activeSessionId ? (
          <div className="flex-1 relative">
            {children}
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gray-50 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <MessageCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary font-lexend mb-3">
              Welcome to NakshatraTalks Chat
            </h3>
            <p className="text-text-muted font-lexend max-w-md mb-6">
              Select a conversation from the list or start a new chat with an astrologer.
            </p>
            <Link
              href="/browse-chat"
              className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-semibold font-lexend hover:bg-primary/90 transition-colors"
              style={{ boxShadow: '0 4px 12px rgba(41, 48, 166, 0.3)' }}
            >
              Start New Chat
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
