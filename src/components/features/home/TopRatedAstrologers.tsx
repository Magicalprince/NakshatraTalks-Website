'use client';

/**
 * TopRatedAstrologers Component
 * Design matches mobile app with:
 * - Card with deep shadow
 * - Square astrologer image with rounded corners
 * - Rating with star icon
 * - Price and Chat button
 */

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, IndianRupee, ChevronRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      damping: 7,
      stiffness: 40,
    },
  },
};

export function TopRatedAstrologers() {
  const { topRatedAstrologers, loading } = useHomeData();

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-semibold text-black font-lexend">
          Top Rated Astrologers
        </h2>
        <Link
          href="/browse-chat"
          className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium font-poppins text-sm py-2 px-3 min-h-[44px]"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[140px] rounded-[20px] bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && topRatedAstrologers && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {topRatedAstrologers.map((astrologer, index) => (
            <motion.div
              key={astrologer.id}
              variants={itemVariants}
              transition={{ delay: 0.5 + index * 0.15 }}
            >
              <Link href={`/astrologer/${astrologer.id}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-[20px] p-3 h-[140px] flex items-center gap-2.5"
                  style={{
                    boxShadow: '0 8px 32px rgba(41, 48, 166, 0.35)',
                    border: '0.5px solid rgba(41, 48, 166, 0.08)',
                  }}
                >
                  {/* Astrologer Image */}
                  <div
                    className="w-[115px] h-[115px] rounded-2xl overflow-hidden flex-shrink-0"
                    style={{
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      border: '2px solid #FFFFFF',
                    }}
                  >
                    <Image
                      src={astrologer.image || '/images/astrologer/astrologer1.png'}
                      alt={astrologer.name}
                      width={115}
                      height={115}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Astrologer Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-semibold text-[#1a1a1a] font-lexend truncate tracking-tight">
                      {astrologer.name}
                    </h3>

                    {/* Rating Row */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="text-[13px] font-medium text-[#333333] font-lexend ml-0.5">
                        {astrologer.rating}
                      </span>
                      <span className="text-[13px] text-[#666666] font-lexend ml-2">
                        {astrologer.totalCalls || '2K'} calls
                      </span>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-center gap-0.5 mt-1">
                      <IndianRupee className="w-3 h-3 text-black" />
                      <span className="text-[13px] font-medium text-[#333333] font-lexend">
                        {astrologer.pricePerMinute}/minute
                      </span>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2.5 bg-primary rounded-xl text-[13px] font-bold text-white font-lexend tracking-wide"
                    style={{
                      boxShadow: '0 3px 10px rgba(41, 48, 166, 0.25)',
                    }}
                  >
                    Chat
                  </motion.button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
