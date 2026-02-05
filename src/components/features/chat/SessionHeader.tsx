'use client';

/**
 * SessionHeader Component
 * Design matches mobile app with:
 * - Back button and astrologer name centered
 * - Red End button on right
 * - Timer ribbon with active indicator, duration, cost, and mins remaining
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, IndianRupee, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface SessionHeaderProps {
  astrologerName: string;
  astrologerImage?: string;
  isOnline?: boolean;
  sessionStartTime?: string;
  pricePerMinute?: number;
  onEndSession?: () => void;
  onCallClick?: () => void;
  showCallButton?: boolean;
  className?: string;
  isAstrologer?: boolean;
  isEnding?: boolean;
  sessionEnded?: boolean;
  totalCost?: number;
  remainingBalance?: number;
  runningCost?: number;
  onBackPress?: () => void;
}

export function SessionHeader({
  astrologerName,
  pricePerMinute = 0,
  onEndSession,
  className,
  isEnding = false,
  sessionEnded = false,
  totalCost = 0,
  remainingBalance = 0,
  runningCost = 0,
  onBackPress,
}: SessionHeaderProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(0);

  // Timer effect - count up from 0
  useEffect(() => {
    if (sessionEnded) return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionEnded]);

  // Format duration (mm:ss)
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate minutes remaining based on remaining balance and price
  const calculateMinsRemaining = () => {
    if (pricePerMinute <= 0) return 0;
    const effectiveBalance = Math.max(0, remainingBalance - runningCost);
    return Math.floor(effectiveBalance / pricePerMinute);
  };

  const minsRemaining = calculateMinsRemaining();
  const isLowBalance = minsRemaining <= 3 && !sessionEnded;

  // Calculate current session cost
  const currentCost = (duration / 60) * pricePerMinute;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleEndPress = () => {
    if (onEndSession && !isEnding && !sessionEnded) {
      onEndSession();
    }
  };

  return (
    <div className={cn('bg-white border-b border-black/5', className)}>
      {/* Header Row */}
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        {/* Back Button */}
        <div className="w-10">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleBackPress}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-[#595959]" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Astrologer Name (centered) */}
        <div className="flex-1 text-center px-2">
          <h2 className="text-lg font-semibold text-[#595959] font-lexend truncate">
            {astrologerName}
          </h2>
        </div>

        {/* End Button - Only show when session is active */}
        <div className="w-16 flex justify-end">
          {!sessionEnded && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleEndPress}
              disabled={isEnding}
              className={cn(
                'px-4 py-2 bg-[#EF4444] rounded-lg text-sm font-semibold text-white font-lexend',
                'min-w-[60px] flex items-center justify-center'
              )}
            >
              {isEnding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'End'
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Timer & Price Ribbon */}
      <div
        className={cn(
          'mx-4 mb-2 px-4 py-2.5 rounded-xl border',
          sessionEnded
            ? 'bg-[#FEF3C7] border-[#D97706]/20'
            : 'bg-[#F8F9FA] border-primary/10'
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {sessionEnded ? (
            /* Session Ended View */
            <>
              <span className="text-sm font-semibold text-[#D97706] font-lexend">
                Session Ended
              </span>
              <div className="w-px h-4 bg-black/10 mx-2" />
              <span className="text-sm font-medium text-[#595959] font-lexend">
                {formatDuration(duration)}
              </span>
              <div className="w-px h-4 bg-black/10 mx-2" />
              <div className="flex items-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                <span className="text-sm font-semibold text-primary font-lexend">
                  {totalCost.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            /* Active Session View */
            <>
              {/* Duration with active indicator */}
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#28A745]" />
                <span className="text-sm font-medium text-[#595959] font-lexend">
                  {formatDuration(duration)}
                </span>
              </div>

              <div className="w-px h-4 bg-black/10 mx-2" />

              {/* Running Cost */}
              <div className="flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3 text-primary" strokeWidth={2} />
                <span className="text-sm font-semibold text-primary font-lexend">
                  {currentCost.toFixed(2)}
                </span>
              </div>

              <div className="w-px h-4 bg-black/10 mx-2" />

              {/* Minutes Remaining */}
              <div className="flex items-center gap-1">
                {isLowBalance ? (
                  <AlertTriangle className="w-3 h-3 text-[#DC3545]" strokeWidth={2} />
                ) : (
                  <Clock className="w-3 h-3 text-[#595959]" strokeWidth={2} />
                )}
                <span
                  className={cn(
                    'text-[13px] font-lexend',
                    isLowBalance ? 'text-[#DC3545] font-semibold' : 'text-[#595959] font-medium'
                  )}
                >
                  {minsRemaining} min left
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
