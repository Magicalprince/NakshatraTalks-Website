'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, IndianRupee, ChevronRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';
import { Button } from '@/components/ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function TopRatedAstrologers() {
  const { topRatedAstrologers, loading } = useHomeData();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
            Top Rated Astrologers
          </h2>
          <p className="mt-1 text-text-secondary font-nunito text-sm">
            Consult with our highest-rated experts
          </p>
        </div>
        <Link
          href="/browse-chat"
          className="hidden sm:flex items-center gap-1 text-primary hover:text-primary-dark font-medium font-lexend text-sm transition-colors"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Loading State — skeleton shimmer */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-gray-100 skeleton-shimmer overflow-hidden"
            >
              {/* Image placeholder */}
              <div className="w-full aspect-[4/3] bg-gray-200" />
              {/* Info placeholder */}
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && topRatedAstrologers && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {topRatedAstrologers.slice(0, 4).map((astrologer) => (
            <motion.div key={astrologer.id} variants={itemVariants}>
              <Link href={`/astrologer/${astrologer.id}`}>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover-lift group">
                  {/* Image with gradient overlay */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                      src={
                        astrologer.image ||
                        '/images/astrologer/astrologer1.png'
                      }
                      alt={astrologer.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Subtle gradient overlay at bottom for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                    {/* Online badge with glow */}
                    {astrologer.isAvailable && (
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-status-success/90 text-white px-2.5 py-1 rounded-md text-xs font-medium font-lexend shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        Online
                      </div>
                    )}

                    {/* Experience badge */}
                    {astrologer.experience > 0 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-semibold font-lexend">
                        {astrologer.experience}+ yrs
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-md font-semibold text-text-primary font-lexend truncate">
                      {astrologer.name}
                    </h3>

                    {/* Specialization tags */}
                    {astrologer.specialization &&
                      astrologer.specialization.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                          {astrologer.specialization
                            .slice(0, 2)
                            .map((spec) => (
                              <span
                                key={spec}
                                className="inline-block bg-primary/5 text-primary text-[10px] font-medium font-lexend px-2 py-0.5 rounded-full truncate max-w-[90px]"
                              >
                                {spec}
                              </span>
                            ))}
                        </div>
                      )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-text-dark font-lexend">
                          {astrologer.rating}
                        </span>
                        {astrologer.totalReviews != null && (
                          <span className="text-xs text-text-muted font-nunito">
                            ({astrologer.totalReviews})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-muted">
                        {astrologer.totalCalls || '2K'} consultations
                      </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0.5 text-sm text-text-secondary font-lexend">
                        <IndianRupee className="w-3 h-3" />
                        <span>{astrologer.pricePerMinute}/min</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs px-3 py-1.5 h-auto"
                      >
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mobile View All */}
      <div className="sm:hidden text-center mt-6">
        <Link href="/browse-chat">
          <Button variant="outline" size="md" className="gap-1">
            View All Astrologers
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
