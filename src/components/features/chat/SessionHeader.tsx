'use client';

/**
 * SessionHeader Component — Professional Web Chat Header
 * - Clean header with back, name, and end button
 * - Compact info ribbon with timer, cost, and balance
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, IndianRupee, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/navigation';

interface SessionHeaderProps {
  astrologerName: string;
  astrologerImage?: string;
  isOnline?: boolean;
  sessionStartTime?: string;
  initialDuration?: number;
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
  sessionStartTime,
  initialDuration,
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

  const [duration, setDuration] = useState(() => {
    if (initialDuration != null && initialDuration > 0) {
      return initialDuration;
    }
    if (sessionStartTime) {
      const elapsed = Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
      return Math.max(0, elapsed);
    }
    return 0;
  });

  const [timerBase] = useState(() => Date.now());

  const [hasInitialized, setHasInitialized] = useState(
    () => (initialDuration != null && initialDuration > 0) || !!sessionStartTime
  );

  useEffect(() => {
    if (hasInitialized) return;
    if (initialDuration != null && initialDuration > 0) {
      setDuration(initialDuration);
      setHasInitialized(true);
    } else if (sessionStartTime) {
      const elapsed = Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
      setDuration(Math.max(0, elapsed));
      setHasInitialized(true);
    }
  }, [initialDuration, sessionStartTime, hasInitialized]);

  useEffect(() => {
    if (sessionEnded) return;

    const interval = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
        setDuration(Math.max(0, elapsed));
      } else if (initialDuration != null) {
        const localElapsed = Math.floor((Date.now() - timerBase) / 1000);
        setDuration(initialDuration + localElapsed);
      } else {
        setDuration((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionEnded, sessionStartTime, initialDuration, timerBase]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateMinsRemaining = () => {
    if (pricePerMinute <= 0) return 0;
    const effectiveBalance = Math.max(0, remainingBalance - runningCost);
    return Math.floor(effectiveBalance / pricePerMinute);
  };

  const minsRemaining = calculateMinsRemaining();
  const isLowBalance = minsRemaining <= 3 && !sessionEnded;
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
    <div className={cn('bg-white border-b border-gray-200', className)}>
      {/* Header Row */}
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Back Button */}
        <button
          onClick={handleBackPress}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors -ml-1"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" strokeWidth={2} />
        </button>

        {/* Name + Timer info */}
        <div className="flex-1 text-center px-3">
          <h2 className="text-base font-semibold text-gray-800 font-lexend truncate">
            {astrologerName}
          </h2>
        </div>

        {/* End Button */}
        <div className="flex items-center">
          {!sessionEnded ? (
            <button
              onClick={handleEndPress}
              disabled={isEnding}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium font-lexend transition-all',
                'bg-red-500 text-white hover:bg-red-600 active:scale-95',
                'min-w-[56px] flex items-center justify-center',
                isEnding && 'opacity-70'
              )}
            >
              {isEnding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'End'
              )}
            </button>
          ) : (
            <div className="w-[56px]" />
          )}
        </div>
      </div>

      {/* Info Ribbon */}
      <div className="max-w-3xl mx-auto px-4 pb-2.5">
        <div
          className={cn(
            'px-4 py-2 rounded-lg flex items-center justify-center gap-3 text-sm',
            sessionEnded
              ? 'bg-amber-50 border border-amber-200/60'
              : 'bg-gray-50 border border-gray-100'
          )}
        >
          {sessionEnded ? (
            <>
              <span className="font-medium text-amber-600 font-lexend">
                Session Ended
              </span>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-gray-500 font-lexend tabular-nums">
                {formatDuration(duration)}
              </span>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-0.5">
                <IndianRupee className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
                <span className="font-semibold text-primary font-lexend tabular-nums">
                  {totalCost.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Live indicator + Duration */}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="font-medium text-gray-600 font-lexend tabular-nums">
                  {formatDuration(duration)}
                </span>
              </div>

              <span className="text-gray-300">|</span>

              {/* Running Cost */}
              <div className="flex items-center gap-0.5">
                <IndianRupee className="w-3 h-3 text-primary" strokeWidth={2} />
                <span className="font-semibold text-primary font-lexend tabular-nums">
                  {currentCost.toFixed(2)}
                </span>
              </div>

              <span className="text-gray-300">|</span>

              {/* Minutes Remaining */}
              <div className="flex items-center gap-1">
                {isLowBalance ? (
                  <AlertTriangle className="w-3 h-3 text-red-500" strokeWidth={2} />
                ) : (
                  <Clock className="w-3 h-3 text-gray-400" strokeWidth={2} />
                )}
                <span
                  className={cn(
                    'text-[13px] font-lexend',
                    isLowBalance ? 'text-red-500 font-semibold' : 'text-gray-500 font-medium'
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
