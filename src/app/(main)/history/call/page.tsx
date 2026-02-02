'use client';

import { useMemo } from 'react';
import { useCallHistory } from '@/hooks/useCallSession';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { RatingDisplay } from '@/components/features/rating';
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Video,
  Clock,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChatSession } from '@/types/api.types';

export default function CallHistoryPage() {
  // Fetch call history
  const {
    data: historyData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCallHistory();

  // Flatten sessions
  const sessions = useMemo(() => {
    if (!historyData?.pages) return [];
    return historyData.pages.flatMap((page) => page?.sessions || []);
  }, [historyData]);

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-primary">Call History</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link
              href="/history/chat"
              className="py-3 px-4 text-text-secondary hover:text-text-primary"
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chats
            </Link>
            <Link
              href="/history/call"
              className="py-3 px-4 border-b-2 border-primary text-primary font-medium"
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Calls
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-32 h-4 mb-2" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Call History
            </h3>
            <p className="text-text-secondary mb-4">
              Your call consultations will appear here
            </p>
            <Link href="/browse-call">
              <Button variant="primary">Start a Call</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <CallHistoryCard key={session.id} session={session} index={index} />
            ))}

            {/* Load More */}
            {hasNextPage && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom padding */}
      <div className="h-24" />
    </div>
  );
}

// Call History Card Component
function CallHistoryCard({ session, index }: { session: ChatSession; index: number }) {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isVideoCall = session.sessionType === 'video';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={undefined}
              alt={session.astrologerName || 'Astrologer'}
              size="md"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              {isVideoCall ? (
                <Video className="w-3 h-3 text-white" />
              ) : (
                <Phone className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary truncate">
              {session.astrologerName || 'Astrologer'}
            </h3>
            <p className="text-xs text-text-muted">
              {isVideoCall ? 'Video Call' : 'Audio Call'} • {formatDate(session.startTime)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <Clock className="w-4 h-4" />
            {formatDuration(session.duration)}
          </div>
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            <IndianRupee className="w-4 h-4" />
            {session.totalCost?.toFixed(2) || '0.00'}
          </div>
          {session.rating && (
            <div className="flex items-center gap-1">
              <RatingDisplay rating={session.rating} size="xs" showValue={false} />
            </div>
          )}
          {!session.rating && session.status === 'completed' && (
            <Link
              href={`/rating/${session.id}`}
              className="text-xs text-primary font-medium ml-auto"
            >
              Rate Now
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
