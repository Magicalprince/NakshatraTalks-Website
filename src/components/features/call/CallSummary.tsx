'use client';

/**
 * CallSummary — Dark-themed post-call summary overlay.
 *
 * Matches the cosmic aesthetic of the call screen.
 * Shows duration, cost, rating option, and navigation actions.
 */

import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Star, Clock, IndianRupee, Phone, Video, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CallSummaryProps {
  sessionId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerImage?: string;
  callType: 'audio' | 'video';
  duration: number;
  durationFormatted?: string;
  totalCost: number;
  /** Label for the cost field — defaults to "Total Cost" (user side), use "Amount Received" for astrologer */
  costLabel?: string;
  onStartNewCall?: () => void;
  onClose?: () => void;
}

export function CallSummary({
  sessionId,
  astrologerId,
  astrologerName,
  astrologerImage,
  callType,
  duration,
  durationFormatted,
  totalCost,
  costLabel = 'Total Cost',
  onStartNewCall,
  onClose,
}: CallSummaryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const durationText = durationFormatted || formatDuration(duration);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #070B14 0%, #0D1221 40%, #111B33 100%)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6 shadow-[0_16px_64px_rgba(0,0,0,0.5)]">
          {/* Success icon */}
          <div className="flex justify-center mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
          </div>

          {/* Title */}
          <h2 className="text-center text-lg font-bold font-lexend text-white mb-1">
            Call Ended
          </h2>
          <p className="text-center text-white/40 text-xs mb-5">Session completed successfully</p>

          {/* Astrologer info */}
          <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-5">
            <Avatar src={astrologerImage} alt={astrologerName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{astrologerName}</p>
              <p className="text-xs text-white/40 flex items-center gap-1 capitalize">
                {callType === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {callType} Call
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">{durationText}</span>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Duration</p>
            </div>
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.06] text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">{Math.round(totalCost)}</span>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{costLabel}</p>
            </div>
          </div>

          {/* Rate experience */}
          <div className="text-center mb-5 p-3 bg-amber-500/[0.06] rounded-xl border border-amber-500/[0.1]">
            <p className="text-xs text-white/50 mb-2">How was your experience?</p>
            <Link href={`/rating/${sessionId}`}>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-full text-xs font-medium transition-colors">
                <Star className="w-3.5 h-3.5" />
                Rate & Review
              </button>
            </Link>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            {onStartNewCall && (
              <Button
                variant="primary"
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={onStartNewCall}
              >
                Call Again
              </Button>
            )}
            {astrologerId && (
              <Link href={`/astrologer/${astrologerId}`} className="block">
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/[0.06]"
                >
                  View Profile
                </Button>
              </Link>
            )}
            {onClose && (
              <Button
                variant="outline"
                className="w-full border-white/10 text-white hover:bg-white/[0.06]"
                onClick={onClose}
              >
                {astrologerId ? 'Close' : 'Back to Dashboard'}
              </Button>
            )}
            {!onClose && (
              <Link href="/" className="block">
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/[0.06]"
                >
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
