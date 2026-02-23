'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Search, X, Eye, Clock, Sparkles } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { LiveSession } from '@/types/api.types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(startedAt: string): string {
  const diff = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

// ─── Skeleton Card ──────────────────────────────────────────────────────────

function LiveSessionSkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-gray-100 shadow-web-sm">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gray-100 skeleton-shimmer flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2.5 py-1">
        <div className="h-4 w-3/4 rounded-md bg-gray-100 skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded-md bg-gray-100 skeleton-shimmer" />
        <div className="h-3 w-1/3 rounded-md bg-gray-100 skeleton-shimmer" />
      </div>
    </div>
  );
}

// ─── Live Session Card ──────────────────────────────────────────────────────

function LiveSessionCard({ session, index }: { session: LiveSession; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link
        href={`/live-sessions/${session.id}`}
        className="group flex items-center gap-4 p-3 rounded-2xl bg-white border border-gray-100 hover:border-primary/15 hover:shadow-web-md transition-all duration-300"
        aria-label={`Join ${session.title} by ${session.astrologerName}`}
      >
        {/* Thumbnail */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={session.thumbnailUrl || session.astrologerImage || '/images/astrologer/astrologer3.png'}
            alt={session.astrologerName}
            fill
            sizes="128px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* LIVE badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-md shadow-glow-live">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span className="text-[10px] font-bold font-lexend tracking-wider">LIVE</span>
          </div>

          {/* Viewer count bottom-right */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-md text-white px-1.5 py-0.5 rounded-md">
            <Eye className="w-3 h-3" />
            <span className="text-[10px] font-semibold font-lexend">{session.viewerCount}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className="font-semibold text-text-primary font-lexend text-[15px] leading-snug line-clamp-2">
            {session.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5">
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-red-200">
              <Image
                src={session.astrologerImage || '/images/astrologer/astrologer3.png'}
                alt={session.astrologerName}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <p className="text-sm text-text-secondary font-nunito truncate">{session.astrologerName}</p>
          </div>

          {session.startedAt && (
            <div className="flex items-center gap-1 mt-2 text-text-muted">
              <Clock className="w-3 h-3" />
              <span className="text-xs font-nunito">{formatDuration(session.startedAt)} ago</span>
            </div>
          )}

          {session.description && (
            <p className="text-xs text-text-muted font-nunito mt-1.5 line-clamp-1">
              {session.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LiveSessionsPage() {
  const { liveSessions, loading } = useHomeData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return liveSessions;
    const query = searchQuery.toLowerCase();
    return liveSessions.filter(
      (s) =>
        s.astrologerName.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query)
    );
  }, [liveSessions, searchQuery]);

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Live Sessions' },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
              Live Sessions
            </h1>
            <p className="mt-1 text-text-secondary font-nunito text-sm">
              Join ongoing live astrology sessions
            </p>
          </div>

          {/* Search */}
          <div className="relative flex items-center bg-white rounded-xl border border-gray-200 shadow-web-sm focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(41,48,166,0.08)] transition-all duration-200 w-full sm:w-72">
            <Search className="w-4 h-4 text-text-muted ml-4 flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm font-nunito text-text-primary placeholder:text-text-muted"
              aria-label="Search live sessions"
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

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <LiveSessionSkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-50 via-primary/5 to-secondary/10" />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-inner-soft">
                <Radio className="w-10 h-10 text-text-muted" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              {searchQuery ? 'No sessions found' : 'No Live Sessions'}
            </h3>
            <p className="text-sm text-text-secondary font-nunito max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'There are no live sessions right now. Check back later for upcoming live astrology sessions!'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        )}

        {/* Sessions List */}
        {!loading && filteredSessions.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" aria-hidden="true" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <p className="text-sm text-text-secondary font-nunito">
                <span className="font-semibold text-text-primary">{filteredSessions.length}</span> live session{filteredSessions.length !== 1 ? 's' : ''} now
              </p>
            </div>
            <div className="space-y-3 pb-12">
              {filteredSessions.map((session, index) => (
                <LiveSessionCard key={session.id} session={session} index={index} />
              ))}
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
