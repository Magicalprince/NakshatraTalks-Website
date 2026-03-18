'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Users, Phone, MessageCircle, Clock, Play, X } from 'lucide-react';
import type { WaitlistEntry, SessionType } from '@/types/api.types';

interface AstrologerWaitlistProps {
  waitlist: WaitlistEntry[];
  isLoading: boolean;
  onConnect: (queueId: string, type: SessionType) => void;
  onSkip: (queueId: string, type: SessionType) => void;
  isConnecting?: boolean;
}

function WaitlistSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-14 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function AstrologerWaitlist({
  waitlist,
  isLoading,
  onConnect,
  onSkip,
  isConnecting = false,
}: AstrologerWaitlistProps) {
  const queueCount = waitlist.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-text-primary font-lexend">
            Waitlist
          </h2>
          {queueCount > 0 && (
            <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 text-xs font-semibold text-white bg-primary rounded-full font-lexend">
              {queueCount}
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <WaitlistSkeleton />}

      {/* Empty State */}
      {!isLoading && queueCount === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 bg-background-offWhite rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-sm text-text-muted font-lexend">
            No users in queue
          </p>
        </div>
      )}

      {/* Waitlist Entries */}
      {!isLoading && queueCount > 0 && (
        <div className="space-y-2" role="list" aria-label="Waitlist entries">
          {waitlist.map((entry) => {
            const entryId = entry.queueId ?? entry.id ?? '';

            return (
              <div
                key={entryId}
                role="listitem"
                className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-150 hover:bg-gray-50"
              >
                {/* Position Number */}
                <span className="flex-shrink-0 w-7 text-sm font-semibold text-text-muted font-lexend text-center">
                  #{entry.position}
                </span>

                {/* User Avatar */}
                <Avatar
                  src={entry.user.image}
                  fallback={entry.user.name}
                  alt={entry.user.name}
                  size="sm"
                />

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate font-lexend">
                    {entry.user.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted font-lexend">
                      Waiting {entry.waitingMinutes ?? 0} min
                    </span>
                  </div>
                </div>

                {/* Type Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-lexend ${
                    entry.type === 'call'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {entry.type === 'call' ? (
                    <Phone className="w-3 h-3" />
                  ) : (
                    <MessageCircle className="w-3 h-3" />
                  )}
                  {entry.type === 'call' ? 'Call' : 'Chat'}
                </span>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                    isLoading={isConnecting}
                    disabled={isConnecting}
                    onClick={() => onConnect(entryId, entry.type)}
                  >
                    Connect
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<X className="w-3.5 h-3.5" />}
                    disabled={isConnecting}
                    onClick={() => onSkip(entryId, entry.type)}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
