'use client';

/**
 * Call History Page
 * Enhanced 2026 design with search/filter, shimmer skeletons,
 * spring tab animations, colored call type badges, quality indicator,
 * and polished card interactions.
 */

import { useState, useMemo } from 'react';
import { useCallHistory } from '@/hooks/useCallSession';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { RatingDisplay } from '@/components/features/rating';
import {
  MessageSquare,
  Phone,
  PhoneCall,
  Video,
  Clock,
  IndianRupee,
  Search,
  X,
  Sparkles,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSession } from '@/types/api.types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// ─── Tab definition ──────────────────────────────────────────────────────────

const TABS = [
  { key: 'chat', label: 'Chats', href: '/history/chat', icon: MessageSquare },
  { key: 'call', label: 'Calls', href: '/history/call', icon: Phone },
] as const;

const ACTIVE_TAB = 'call';

// ─── Call Quality Helpers ────────────────────────────────────────────────────

type CallQuality = 'excellent' | 'good' | 'fair';

function getCallQuality(duration: number | null | undefined): CallQuality {
  // Visual-only quality indicator based on duration as a heuristic
  if (!duration || duration < 120) return 'fair';
  if (duration < 600) return 'good';
  return 'excellent';
}

function CallQualityBadge({ quality }: { quality: CallQuality }) {
  const config = {
    excellent: {
      icon: Signal,
      label: 'Excellent',
      classes: 'bg-emerald-50 text-emerald-700',
    },
    good: {
      icon: SignalHigh,
      label: 'Good',
      classes: 'bg-blue-50 text-blue-700',
    },
    fair: {
      icon: SignalMedium,
      label: 'Fair',
      classes: 'bg-amber-50 text-amber-700',
    },
  };

  const { icon: Icon, label, classes } = config[quality];

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${classes}`}
      aria-label={`Call quality: ${label}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────

function CallSkeletonCard() {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-web-sm">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-100 skeleton-shimmer" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-100 skeleton-shimmer" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-md bg-gray-100 skeleton-shimmer" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-gray-100 skeleton-shimmer" />
            <div className="h-3 w-24 rounded-md bg-gray-100 skeleton-shimmer" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        <div className="h-6 w-16 rounded-full bg-gray-100 skeleton-shimmer" />
        <div className="h-6 w-20 rounded-full bg-gray-100 skeleton-shimmer" />
        <div className="h-5 w-16 rounded-full bg-gray-100 skeleton-shimmer" />
        <div className="h-4 w-14 rounded bg-gray-100 skeleton-shimmer ml-auto" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CallHistoryPage() {
  const { isReady } = useRequireAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: historyData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCallHistory();

  // Flatten sessions
  const sessions = useMemo(() => {
    if (!historyData?.pages) return [];
    return historyData.pages.flatMap((page) => page?.sessions || []);
  }, [historyData]);

  // Filter sessions by search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        (s.astrologerName || '').toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-64 h-5 mb-6 skeleton-shimmer" />
            <Skeleton className="w-52 h-8 mb-6 skeleton-shimmer" />
            <div className="flex gap-1 mb-6 border-b border-gray-100 pb-px">
              <Skeleton className="w-24 h-10 rounded-lg skeleton-shimmer" />
              <Skeleton className="w-20 h-10 rounded-lg skeleton-shimmer" />
            </div>
            <Skeleton className="w-full h-11 rounded-xl mb-6 skeleton-shimmer" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <CallSkeletonCard key={i} />
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'History', href: '/history/chat' },
            { label: 'Call History' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">
          Consultation History
        </h1>

        {/* Underline-style Tabs with spring layoutId animation */}
        <div className="flex border-b border-gray-200 mb-6" role="tablist" aria-label="History type">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === ACTIVE_TAB;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-3 px-5 text-sm font-medium font-lexend transition-colors duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="history-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Search / Filter Bar */}
        <div className="mb-6">
          <div className="relative flex items-center bg-white rounded-xl border border-gray-200 shadow-web-sm focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(41,48,166,0.08)] transition-all duration-200">
            <Search className="w-4 h-4 text-text-muted ml-4 flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by astrologer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 outline-none text-sm font-nunito text-text-primary placeholder:text-text-muted"
              aria-label="Search call history"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <CallSkeletonCard key={i} />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            /* ─── Empty State ──────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 via-primary/8 to-secondary/10" />
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
                  <PhoneCall className="w-9 h-9 text-primary/70" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
                {searchQuery ? 'No results found' : 'No Call History'}
              </h3>
              <p className="text-sm text-text-secondary mb-6 font-nunito max-w-xs mx-auto">
                {searchQuery
                  ? `No consultations matching "${searchQuery}"`
                  : 'Your call consultations with astrologers will appear here once you start a session.'}
              </p>
              {!searchQuery && (
                <Link href="/browse-call">
                  <Button variant="primary" size="md">
                    <Phone className="w-4 h-4 mr-2" />
                    Start a Call
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <div>
              {/* Results count */}
              {searchQuery && (
                <p className="text-xs text-text-muted mb-3 font-nunito">
                  {filteredSessions.length} result{filteredSessions.length !== 1 ? 's' : ''} found
                </p>
              )}

              <div className="space-y-3">
                {filteredSessions.map((session, index) => (
                  <CallHistoryCard key={session.id} session={session} index={index} />
                ))}
              </div>

              {/* Load More */}
              {hasNextPage && (
                <div className="text-center py-6">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    isLoading={isFetchingNextPage}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

// ─── Call History Card Component ─────────────────────────────────────────────

function CallHistoryCard({ session, index }: { session: ChatSession; index: number }) {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isVideoCall = session.sessionType === 'video';
  const callQuality = getCallQuality(session.duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="p-4 border border-gray-100 hover:border-primary/15 hover:shadow-web-md transition-all duration-250 card-hover-lift">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar
              src={undefined}
              alt={session.astrologerName || 'Astrologer'}
              size="md"
            />
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white ${
                isVideoCall ? 'bg-violet-500' : 'bg-primary'
              }`}
            >
              {isVideoCall ? (
                <Video className="w-2.5 h-2.5 text-white" aria-hidden="true" />
              ) : (
                <Phone className="w-2.5 h-2.5 text-white" aria-hidden="true" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate font-lexend text-base">
              {session.astrologerName || 'Astrologer'}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {/* Call Type Badge */}
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  isVideoCall
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-sky-50 text-sky-700'
                }`}
              >
                {isVideoCall ? (
                  <Video className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <Phone className="w-3 h-3" aria-hidden="true" />
                )}
                {isVideoCall ? 'Video' : 'Audio'}
              </span>
              <span className="text-xs text-text-muted font-nunito">
                {formatDate(session.startTime)} at {formatTime(session.startTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {/* Duration Badge */}
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {formatDuration(session.duration)}
          </span>

          {/* Cost Badge */}
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
            <IndianRupee className="w-3 h-3" aria-hidden="true" />
            {session.totalCost?.toFixed(2) || '0.00'}
          </span>

          {/* Call Quality Indicator */}
          {session.status === 'completed' && (
            <CallQualityBadge quality={callQuality} />
          )}

          {/* Rating */}
          {session.rating && (
            <div className="flex items-center gap-1 ml-auto">
              <RatingDisplay rating={session.rating} size="xs" showValue={false} />
            </div>
          )}

          {/* Rate Now CTA */}
          {!session.rating && session.status === 'completed' && (
            <Link
              href={`/rating/${session.id}`}
              className="text-xs text-primary font-semibold ml-auto hover:underline underline-offset-2 transition-colors"
            >
              Rate Now
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
