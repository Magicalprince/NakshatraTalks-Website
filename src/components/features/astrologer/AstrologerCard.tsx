'use client';

/**
 * AstrologerCard Component
 * Web-friendly card with:
 * - Hover effects and transitions
 * - Desktop-optimized layout
 * - Mobile app styling (colors, fonts, etc.)
 */

import { Astrologer } from '@/types/api.types';
import { IndianRupee, BadgeCheck, Star, MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface AstrologerCardProps {
  astrologer: Astrologer;
  variant?: 'chat' | 'call' | 'grid';
  onAction?: (astrologer: Astrologer) => void;
  isLoading?: boolean;
}

export function AstrologerCard({ astrologer, variant = 'chat', onAction, isLoading }: AstrologerCardProps) {
  // Handle both property naming conventions
  const isOnline = astrologer.isOnline ?? astrologer.isAvailable;
  const profileImage = astrologer.profileImage ?? astrologer.image;
  const specializations = astrologer.specializations ?? astrologer.specialization ?? [];
  const chatPrice = astrologer.chatPrice ?? astrologer.chatPricePerMinute ?? astrologer.pricePerMinute;
  const callPrice = astrologer.callPrice ?? astrologer.callPricePerMinute ?? astrologer.pricePerMinute;
  const price = variant === 'call' ? callPrice : chatPrice;
  const languages = astrologer.languages ?? [];
  const rating = astrologer.rating ?? 0;
  const totalCalls = astrologer.totalCalls ?? 0;
  const experience = astrologer.experience ?? 0;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAction) {
      onAction(astrologer);
    }
  };

  // Grid variant for dashboard display
  if (variant === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(41, 48, 166, 0.15)' }}
        className="w-full"
      >
        <Link href={`/astrologer/${astrologer.id}`}>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-primary/20">
            {/* Image Section */}
            <div className="relative aspect-[4/3] bg-gray-100">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={astrologer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20">
                  <span className="text-4xl font-bold text-primary/50">
                    {astrologer.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Online Badge */}
              {isOnline && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-white font-lexend uppercase">Online</span>
                </div>
              )}

              {/* Rating Badge */}
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                <span className="text-xs font-semibold text-text-primary font-lexend">{rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-text-primary truncate font-lexend">
                    {astrologer.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5 truncate font-lexend">
                    {specializations.slice(0, 2).join(', ')}
                  </p>
                </div>
                <div className="flex items-center text-primary flex-shrink-0">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold font-lexend">{price}</span>
                  <span className="text-xs text-text-muted font-lexend">/min</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs text-text-muted font-lexend">
                <span>{experience} yrs exp</span>
                <span>•</span>
                <span>{totalCalls} orders</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAction}
                  disabled={!isOnline || isLoading}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-semibold text-sm font-lexend flex items-center justify-center gap-2 transition-colors',
                    isOnline
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!isOnline}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-semibold text-sm font-lexend flex items-center justify-center gap-2 transition-colors border-2',
                    isOnline
                      ? 'border-primary text-primary hover:bg-primary/5'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Phone className="w-4 h-4" />
                  Call
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // List variant (default) - for browse pages
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        boxShadow: '0 8px 30px rgba(41, 48, 166, 0.12)',
        borderColor: 'rgba(41, 48, 166, 0.2)'
      }}
      className="w-full"
    >
      <Link href={`/astrologer/${astrologer.id}`}>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 transition-all duration-300">
          <div className="flex items-start gap-4">
            {/* Profile Image with Yellow Border */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-[3px]"
                style={{ borderColor: '#FFCF0D' }}
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={astrologer.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary/50">
                      {astrologer.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Online indicator */}
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>

            {/* Astrologer Info */}
            <div className="flex-1 min-w-0">
              {/* Name with Verified Badge */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-text-primary truncate font-lexend">
                  {astrologer.name}
                </h3>
                {isOnline && (
                  <BadgeCheck
                    className="w-5 h-5 flex-shrink-0"
                    fill="#10B981"
                    color="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
              </div>

              {/* Specializations */}
              <p className="text-sm text-text-muted mt-1 truncate font-lexend">
                {specializations.join(' • ')}
              </p>

              {/* Languages & Experience */}
              <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary font-lexend">
                <span>{languages.slice(0, 2).join(', ')}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{experience} yrs exp</span>
              </div>

              {/* Rating and Orders */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-4 h-4',
                        star <= Math.floor(rating)
                          ? 'text-secondary fill-secondary'
                          : 'text-gray-200 fill-gray-200'
                      )}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium text-text-primary font-lexend">
                    {rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-sm text-text-muted font-lexend">
                  {totalCalls.toLocaleString()} orders
                </span>
              </div>
            </div>

            {/* Right Section - Price and Button */}
            <div className="flex flex-col items-end justify-between self-stretch">
              {/* Price */}
              <div className="flex items-center bg-primary/5 px-3 py-1.5 rounded-full">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span className="text-base font-bold text-primary font-lexend">
                  {price}
                </span>
                <span className="text-xs text-primary/60 font-lexend ml-0.5">/min</span>
              </div>

              {/* Chat/Call Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAction}
                disabled={!isOnline || isLoading}
                className={cn(
                  'px-6 py-2.5 rounded-xl font-semibold text-sm font-lexend transition-all flex items-center gap-2',
                  isOnline
                    ? 'bg-primary text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                style={isOnline ? { boxShadow: '0 4px 12px rgba(41, 48, 166, 0.3)' } : {}}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {variant === 'chat' ? (
                      <MessageCircle className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    {variant === 'chat' ? 'Chat' : 'Call'}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton component for loading state
export function AstrologerCardSkeleton({ variant = 'list' }: { variant?: 'list' | 'grid' }) {
  if (variant === 'grid') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
        <div className="p-4">
          <div className="flex justify-between">
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mt-2" />
            </div>
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-3 w-28 bg-gray-100 rounded animate-pulse mt-3" />
          <div className="flex gap-2 mt-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex-1 h-10 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mt-2" />
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-10 w-20 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
