'use client';

/**
 * LiveSessionsCarousel Component
 * Design matches mobile app with:
 * - Card with image background
 * - Gradient overlay at bottom
 * - LIVE indicator badge
 * - Yellow glow shadow effect
 * - Pulsing animation
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';

export function LiveSessionsCarousel() {
  const { liveSessions, loading } = useHomeData();

  // Don't render if no live sessions
  if (!loading && (!liveSessions || liveSessions.length === 0)) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-semibold text-black font-lexend">
          Live Astrologers
        </h2>
        <Link
          href="/live-sessions"
          className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium font-poppins text-sm py-2 px-3 min-h-[44px]"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[114px] h-[164px] rounded-[20px] bg-gray-200 animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Carousel */}
      {!loading && liveSessions && liveSessions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
          {liveSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.1,
                type: 'spring',
                damping: 7,
                stiffness: 40,
              }}
              className="snap-start"
            >
              <Link
                href={`/live-sessions/${session.id}`}
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-[114px] h-[164px] rounded-[20px] overflow-hidden flex-shrink-0"
                  style={{
                    boxShadow: '0 4px 24px rgba(255, 207, 13, 0.5)',
                    border: '2px solid rgba(255, 207, 13, 0.6)',
                  }}
                >
                  {/* Background Image */}
                  <Image
                    src={session.thumbnailUrl || session.astrologerImage || '/images/astrologer/astrologer3.png'}
                    alt={session.astrologerName}
                    fill
                    className="object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/2"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    }}
                  />

                  {/* LIVE Indicator */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/90 text-white px-1.5 py-0.5 rounded-[10px]">
                    <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold font-lexend tracking-wider">LIVE</span>
                  </div>

                  {/* Astrologer Name */}
                  <p
                    className="absolute bottom-2.5 left-0 right-0 px-1.5 text-white text-base font-bold font-lexend truncate"
                    style={{
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {session.astrologerName}
                  </p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
