'use client';

/**
 * SessionEndedActions Component
 * Design matches mobile app with:
 * - Session ended message
 * - Rate & Review primary button (60%)
 * - Home secondary button (40%)
 * - Clean layout matching mobile design
 */

import { Star, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SessionSummary {
  duration: number;
  durationFormatted?: string;
  totalMessages?: number;
  totalCost: number;
}

interface SessionEndedActionsProps {
  sessionId: string;
  astrologerId?: string;
  astrologerName?: string;
  summary?: SessionSummary;
  variant?: 'user' | 'astrologer';
  onReview?: () => void;
  onSummary?: () => void;
  onHome?: () => void;
  onStartNewChat?: () => void;
}

export function SessionEndedActions({
  sessionId,
  variant = 'user',
  onReview,
  onHome,
}: SessionEndedActionsProps) {
  const router = useRouter();

  const handleReview = () => {
    if (onReview) {
      onReview();
    } else {
      router.push(`/rating/${sessionId}`);
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="bg-white border-t border-gray-100">
      <div className="px-4 py-3 space-y-3">
        {/* Session ended message */}
        <p className="text-sm text-[#6B7280] text-center font-lexend">
          {variant === 'user'
            ? 'Session has ended. Would you like to rate your experience?'
            : 'Session has ended.'}
        </p>

        {/* Buttons container */}
        <div className="flex gap-3">
          {variant === 'user' ? (
            <>
              {/* Rate & Review Button - 60% width */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReview}
                className="flex-[6] py-3.5 px-4 bg-primary rounded-xl flex items-center justify-center gap-2"
                style={{
                  boxShadow: '0 4px 12px rgba(41, 48, 166, 0.3)',
                }}
              >
                <Star className="w-[18px] h-[18px] text-white" fill="white" />
                <span className="text-[15px] font-semibold text-white font-lexend">
                  Rate & Review
                </span>
              </motion.button>

              {/* Home Button - 40% width */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleHome}
                className="flex-[4] py-3.5 px-4 bg-white border-2 border-primary rounded-xl flex items-center justify-center gap-1.5"
              >
                <Home className="w-[18px] h-[18px] text-primary" />
                <span className="text-[15px] font-semibold text-primary font-lexend">
                  Home
                </span>
              </motion.button>
            </>
          ) : (
            /* Astrologer variant - just Home button full width */
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleHome}
              className="flex-1 py-3.5 px-4 bg-primary rounded-xl flex items-center justify-center gap-2"
              style={{
                boxShadow: '0 4px 12px rgba(41, 48, 166, 0.3)',
              }}
            >
              <Home className="w-[18px] h-[18px] text-white" />
              <span className="text-[15px] font-semibold text-white font-lexend">
                Back to Dashboard
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
