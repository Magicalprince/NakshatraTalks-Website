'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Star, Clock, IndianRupee, Phone, Video } from 'lucide-react';
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
  onStartNewCall,
  onClose,
}: CallSummaryProps) {
  // Format duration if not provided
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="w-full max-w-sm p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
              {callType === 'video' ? (
                <Video className="w-8 h-8 text-status-success" />
              ) : (
                <Phone className="w-8 h-8 text-status-success" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Call Ended</h2>
          </div>

          {/* Astrologer Info */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-background-offWhite rounded-lg">
            <Avatar src={astrologerImage} alt={astrologerName} size="md" />
            <div>
              <p className="font-medium text-text-primary">{astrologerName}</p>
              <p className="text-xs text-text-muted capitalize">{callType} Call</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-background-offWhite rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">{durationText}</span>
              </div>
              <p className="text-xs text-text-muted">Duration</p>
            </div>

            <div className="text-center p-3 bg-background-offWhite rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text-primary">
                  {totalCost.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-text-muted">Total Cost</p>
            </div>
          </div>

          {/* Rate Experience */}
          <div className="text-center mb-6">
            <p className="text-sm text-text-secondary mb-2">
              How was your experience?
            </p>
            <Link href={`/rating/${sessionId}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Star className="w-4 h-4" />
                Rate & Review
              </Button>
            </Link>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {onStartNewCall && (
              <Button variant="primary" className="w-full" onClick={onStartNewCall}>
                Call Again
              </Button>
            )}

            <Link href={`/astrologer/${astrologerId}`} className="block">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>

            {onClose ? (
              <Button variant="ghost" className="w-full" onClick={onClose}>
                Close
              </Button>
            ) : (
              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
