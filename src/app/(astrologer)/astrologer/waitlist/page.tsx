'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useWaitlist,
  useAcceptRequest,
  useRejectRequest,
} from '@/hooks/useAstrologerDashboard';
import {
  MessageSquare,
  Phone,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AstrologerWaitlistPage() {
  const { data: waitlistData, isLoading, refetch, isRefetching } = useWaitlist();
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptRequest();
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectRequest();

  const waitlist = waitlistData?.waitlist || [];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Waitlist</h1>
          <p className="text-text-secondary text-sm">Users waiting for consultation</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{waitlist.length}</p>
              <p className="text-xs text-text-muted">In Queue</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-status-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {waitlist.length > 0
                  ? waitlist[0]?.waitingMinutes || 0
                  : 0}m
              </p>
              <p className="text-xs text-text-muted">Longest Wait</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Waitlist */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-32 h-5 mb-2" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                  <Skeleton className="w-24 h-9" />
                </div>
              </Card>
            ))}
          </>
        ) : waitlist.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary">No users in waitlist</p>
            <p className="text-xs text-text-muted mt-1">
              Users will appear here when they request a consultation
            </p>
          </Card>
        ) : (
          waitlist.map((item, index) => (
            <Card key={item.queueId || item.id || index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {item.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {item.position || index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary truncate">
                      {item.user?.name || 'User'}
                    </p>
                    <Badge
                      variant={item.type === 'chat' ? 'secondary' : 'success'}
                      className="text-xs"
                    >
                      {item.type === 'chat' ? (
                        <MessageSquare className="w-3 h-3 mr-1" />
                      ) : (
                        <Phone className="w-3 h-3 mr-1" />
                      )}
                      {item.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.waitingMinutes
                        ? `Waiting ${item.waitingMinutes}m`
                        : item.createdAt
                        ? `Waiting ${formatDistanceToNow(new Date(item.createdAt))}`
                        : 'Just joined'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rejectRequest(item.queueId || item.id || '')}
                    disabled={isRejecting}
                    className="text-status-error hover:bg-status-error/10"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => acceptRequest(item.queueId || item.id || '')}
                    disabled={isAccepting}
                    className="bg-status-success hover:bg-status-success/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
