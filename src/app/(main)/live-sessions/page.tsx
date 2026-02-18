'use client';

/**
 * Live Sessions Page
 * Enhanced 2026 design with glow-live LIVE badge, ping dot animation,
 * hover Join button, Eye icon viewer count, better shimmer skeletons,
 * improved gradient overlays, and accessibility.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, Clock, Search, X, Eye, Play, Sparkles } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card } from '@/components/ui/Card';
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
    <div className="rounded-xl bg-white border border-gray-100 overflow-hidden shadow-web-sm">
      {/* Thumbnail skeleton */}
      <div className="relative aspect-video bg-gray-100 skeleton-shimmer">
        {/* LIVE badge placeholder */}
        <div className="absolute top-3 left-3 h-6 w-14 rounded-md bg-gray-200/60 skeleton-shimmer" />
        {/* Viewer count placeholder */}
        <div className="absolute top-3 right-3 h-6 w-16 rounded-md bg-gray-200/60 skeleton-shimmer" />
        {/* Duration placeholder */}
        <div className="absolute bottom-3 right-3 h-6 w-14 rounded-md bg-gray-200/60 skeleton-shimmer" />
      </div>
      {/* Info skeleton */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 skeleton-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-3/4 rounded-md bg-gray-100 skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded-md bg-gray-100 skeleton-shimmer" />
            <div className="h-3 w-full rounded-md bg-gray-100 skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Live Session Card ──────────────────────────────────────────────────────

function LiveSessionCard({ session, index }: { session: LiveSession; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link href={`/live-sessions/${session.id}`} className="block group" aria-label={`Join live session: ${session.title} by ${session.astrologerName}`}>
        <Card className="overflow-hidden border border-gray-100 hover:border-primary/15 hover:shadow-web-lg transition-all duration-300 card-hover-lift">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <Image
              src={session.thumbnailUrl || session.astrologerImage || '/images/astrologer/astrologer3.png'}
              alt={`${session.title} - ${session.astrologerName}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Gradient Overlay - stronger for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

            {/* LIVE Badge with glow + ping animation */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-md shadow-glow-live">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" aria-hidden="true" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-xs font-bold font-lexend tracking-wider">LIVE</span>
            </div>

            {/* Viewer Count with Eye icon */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white px-2.5 py-1 rounded-md">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-xs font-semibold font-lexend">{session.viewerCount}</span>
            </div>

            {/* Duration */}
            {session.startedAt && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span className="text-xs font-medium font-lexend">{formatDuration(session.startedAt)}</span>
              </div>
            )}

            {/* Hover Join Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div
                initial={false}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-primary/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 font-lexend font-semibold text-sm"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                Join Session
              </motion.div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-red-100 ring-offset-1">
                <Image
                  src={session.astrologerImage || '/images/astrologer/astrologer3.png'}
                  alt={session.astrologerName}
                  fill
                  className="object-cover"
                />
                {/* Tiny live indicator dot on avatar */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-text-primary font-lexend truncate text-base leading-snug">
                  {session.title}
                </h3>
                <p className="text-sm text-text-secondary font-nunito mt-0.5">{session.astrologerName}</p>
                {session.description && (
                  <p className="text-xs text-text-muted font-nunito mt-1.5 line-clamp-2 leading-relaxed">
                    {session.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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

        {/* Sessions Grid */}
        {!loading && filteredSessions.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" aria-hidden="true" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <p className="text-sm text-text-secondary font-nunito">
                <span className="font-semibold text-text-primary">{filteredSessions.length}</span> live session{filteredSessions.length !== 1 ? 's' : ''} now
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
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
