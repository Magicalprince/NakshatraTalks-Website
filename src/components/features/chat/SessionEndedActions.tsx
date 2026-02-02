'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Star, Clock, IndianRupee, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
  summary: SessionSummary;
  onStartNewChat?: () => void;
}

export function SessionEndedActions({
  sessionId,
  astrologerId,
  astrologerName = 'Astrologer',
  summary,
  onStartNewChat,
}: SessionEndedActionsProps) {
  // Format duration if not provided
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) {
      return `${mins} min ${secs} sec`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const durationText = summary.durationFormatted || formatDuration(summary.duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-background-offWhite"
    >
      {/* Session Summary Card */}
      <Card className="p-6 mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
          Session Ended
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Duration */}
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">{durationText}</p>
            <p className="text-xs text-text-muted">Duration</p>
          </div>

          {/* Messages */}
          {summary.totalMessages !== undefined && (
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-text-primary">
                {summary.totalMessages}
              </p>
              <p className="text-xs text-text-muted">Messages</p>
            </div>
          )}

          {/* Cost */}
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <IndianRupee className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">
              ₹{summary.totalCost.toFixed(2)}
            </p>
            <p className="text-xs text-text-muted">Total Cost</p>
          </div>
        </div>

        {/* Rate Experience */}
        <div className="text-center mb-4">
          <p className="text-sm text-text-secondary mb-2">
            How was your experience with {astrologerName}?
          </p>
          <Link href={`/rating/${sessionId}`}>
            <Button variant="outline" className="gap-2">
              <Star className="w-4 h-4" />
              Rate & Review
            </Button>
          </Link>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {onStartNewChat && (
          <Button
            variant="primary"
            className="w-full"
            onClick={onStartNewChat}
          >
            Start New Chat with {astrologerName}
          </Button>
        )}

        {astrologerId && (
          <Link href={`/astrologer/${astrologerId}`} className="block">
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        )}

        <Link href="/" className="block">
          <Button variant="ghost" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
