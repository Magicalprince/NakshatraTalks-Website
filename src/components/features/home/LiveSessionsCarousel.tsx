'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Radio, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui';

// Mock data - will be replaced with API data
const liveSessions = [
  {
    id: '1',
    title: 'Love & Relationship Guidance',
    astrologerName: 'Pt. Rajesh Sharma',
    astrologerImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    viewerCount: 234,
    isLive: true,
  },
  {
    id: '2',
    title: 'Career Astrology Session',
    astrologerName: 'Dr. Priya Mehta',
    astrologerImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    viewerCount: 156,
    isLive: true,
  },
  {
    id: '3',
    title: 'Marriage Compatibility',
    astrologerName: 'Acharya Vikram',
    astrologerImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    viewerCount: 89,
    isLive: true,
  },
];

export function LiveSessionsCarousel() {
  if (liveSessions.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-red-500 animate-pulse" />
          <h2 className="text-xl font-bold text-text-primary font-lexend">
            Live Now
          </h2>
          <Badge variant="live" size="sm" dot>
            {liveSessions.length} LIVE
          </Badge>
        </div>
        <Link
          href="/live-sessions"
          className="flex items-center gap-1 text-primary hover:text-primary-dark font-medium font-lexend text-sm"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
        {liveSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Link
              href={`/live-sessions/${session.id}`}
              className="block w-[280px] lg:w-[320px] flex-shrink-0"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-primary-dark p-4 group hover:shadow-lg transition-shadow">
                {/* Live badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>

                {/* Viewer count */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 text-white px-2 py-1 rounded-full text-xs">
                  <Users className="h-3 w-3" />
                  {session.viewerCount}
                </div>

                {/* Content */}
                <div className="mt-8 flex items-end gap-3">
                  <div className="relative">
                    <Image
                      src={session.astrologerImage}
                      alt={session.astrologerName}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-secondary object-cover"
                    />
                    <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold font-lexend truncate">
                      {session.title}
                    </h3>
                    <p className="text-white/70 text-sm font-lexend truncate">
                      {session.astrologerName}
                    </p>
                  </div>
                </div>

                {/* Join button */}
                <button className="w-full mt-4 bg-secondary text-text-primary py-2 rounded-xl font-semibold font-lexend group-hover:bg-secondary-dark transition-colors">
                  Join Free
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
