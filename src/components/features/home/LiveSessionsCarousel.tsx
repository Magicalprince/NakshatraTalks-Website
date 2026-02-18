'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight, Eye, Play } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';

export function LiveSessionsCarousel() {
  const { liveSessions, loading } = useHomeData();

  if (!loading && (!liveSessions || liveSessions.length === 0)) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
            Live Astrologers
          </h2>
          <p className="mt-1 text-text-secondary font-nunito text-sm">
            Join ongoing live sessions
          </p>
        </div>
        <Link
          href="/live-sessions"
          className="flex items-center gap-1 text-primary hover:text-primary-dark font-medium font-lexend text-sm transition-colors"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Loading State — skeleton shimmer */}
      {loading && (
        <>
          {/* Mobile: horizontal scroll skeleton */}
          <div className="flex gap-3 overflow-hidden md:hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] aspect-[3/4] rounded-xl bg-gray-100 skeleton-shimmer"
              />
            ))}
          </div>
          {/* Desktop: grid skeleton */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl bg-gray-100 skeleton-shimmer"
              />
            ))}
          </div>
        </>
      )}

      {/* Sessions — mobile carousel / desktop grid */}
      {!loading && liveSessions && liveSessions.length > 0 && (
        <>
          {/* Mobile: horizontal scrollable carousel */}
          <div className="flex overflow-x-auto gap-3 snap-x snap-mandatory scrollbar-hide md:hidden pb-1">
            {liveSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="snap-center flex-shrink-0 w-[160px]"
              >
                <SessionCard session={session} />
              </motion.div>
            ))}
          </div>

          {/* Desktop: grid layout */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
            {liveSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <SessionCard session={session} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Individual session card with hover overlay */
function SessionCard({
  session,
}: {
  session: {
    id: string;
    astrologerName: string;
    thumbnailUrl?: string;
    astrologerImage: string;
    viewerCount: number;
  };
}) {
  return (
    <Link href={`/live-sessions/${session.id}`} className="block group">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={
            session.thumbnailUrl ||
            session.astrologerImage ||
            '/images/astrologer/astrologer3.png'
          }
          alt={session.astrologerName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* LIVE Badge with glow */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-red-500/90 text-white px-2.5 py-1 rounded-md shadow-glow-live">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[10px] font-bold font-lexend tracking-wider">
            LIVE
          </span>
        </div>

        {/* "Watch" button overlay — appears on hover, centered at bottom */}
        <div className="absolute inset-0 flex items-end justify-center pb-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-text-primary text-xs font-semibold font-lexend px-4 py-2 rounded-full shadow-web-md">
            <Play className="h-3.5 w-3.5 fill-current" />
            Watch
          </span>
        </div>

        {/* Name & viewer count */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-semibold font-lexend truncate">
            {session.astrologerName}
          </p>
          {session.viewerCount != null && (
            <div className="flex items-center gap-1 mt-0.5">
              <Eye className="h-3 w-3 text-white/70" />
              <p className="text-white/70 text-xs font-nunito">
                {session.viewerCount} watching
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
