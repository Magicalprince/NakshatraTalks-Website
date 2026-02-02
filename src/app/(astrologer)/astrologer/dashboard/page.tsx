'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useAstrologerStats,
  useAstrologerAvailability,
  useUpdateAvailability,
  useIncomingRequests,
  useAcceptRequest,
  useRejectRequest,
} from '@/hooks/useAstrologerDashboard';
import {
  MessageSquare,
  Phone,
  Video,
  IndianRupee,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import { formatDistanceToNow } from 'date-fns';

export default function AstrologerDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAstrologerStats();
  const { data: availability } = useAstrologerAvailability();
  const { mutate: updateAvailability, isPending: isUpdating } = useUpdateAvailability();
  const { data: requestsData, isLoading: requestsLoading } = useIncomingRequests();
  const { mutate: acceptRequest } = useAcceptRequest();
  const { mutate: rejectRequest } = useRejectRequest();

  const [selectedTab, setSelectedTab] = useState<'all' | 'chat' | 'call'>('all');

  const requests = requestsData?.requests || [];
  const filteredRequests = selectedTab === 'all'
    ? requests
    : requests.filter(r => r.type === selectedTab);

  const toggleAvailability = (type: 'chat' | 'call' | 'video') => {
    if (!availability) return;

    updateAvailability({
      chat: type === 'chat' ? !availability.chatAvailable : availability.chatAvailable,
      call: type === 'call' ? !availability.callAvailable : availability.callAvailable,
      video: type === 'video' ? !availability.isLive : availability.isLive,
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-8 h-8 rounded-full mb-2" />
                <Skeleton className="w-16 h-6 mb-1" />
                <Skeleton className="w-24 h-4" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(stats?.todayEarnings || 0)}
              </p>
              <p className="text-xs text-text-muted">Today&apos;s Earnings</p>
            </Card>

            <Card className="p-4">
              <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-status-success" />
              </div>
              <p className="text-xl font-bold text-text-primary">
                {stats?.todayConsultations || 0}
              </p>
              <p className="text-xs text-text-muted">Today&apos;s Sessions</p>
            </Card>

            <Card className="p-4">
              <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-status-warning" />
              </div>
              <p className="text-xl font-bold text-text-primary">
                {stats?.averageSessionDuration || 0}m
              </p>
              <p className="text-xs text-text-muted">Avg Duration</p>
            </Card>

            <Card className="p-4">
              <div className="w-10 h-10 rounded-full bg-status-info/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-status-info" />
              </div>
              <p className="text-xl font-bold text-text-primary">
                {stats?.averageRating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-text-muted">Average Rating</p>
            </Card>
          </>
        )}
      </div>

      {/* Availability Toggle */}
      <Card className="p-4">
        <h2 className="font-semibold text-text-primary mb-4">Availability</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => toggleAvailability('chat')}
            disabled={isUpdating}
            className="flex flex-col items-center p-3 rounded-lg border transition-colors hover:bg-gray-50"
          >
            <MessageSquare className={`w-6 h-6 mb-2 ${availability?.chatAvailable ? 'text-status-success' : 'text-text-muted'}`} />
            <span className="text-sm font-medium">Chat</span>
            {availability?.chatAvailable ? (
              <ToggleRight className="w-8 h-8 text-status-success mt-1" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-text-muted mt-1" />
            )}
          </button>

          <button
            onClick={() => toggleAvailability('call')}
            disabled={isUpdating}
            className="flex flex-col items-center p-3 rounded-lg border transition-colors hover:bg-gray-50"
          >
            <Phone className={`w-6 h-6 mb-2 ${availability?.callAvailable ? 'text-status-success' : 'text-text-muted'}`} />
            <span className="text-sm font-medium">Call</span>
            {availability?.callAvailable ? (
              <ToggleRight className="w-8 h-8 text-status-success mt-1" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-text-muted mt-1" />
            )}
          </button>

          <button
            onClick={() => toggleAvailability('video')}
            disabled={isUpdating}
            className="flex flex-col items-center p-3 rounded-lg border transition-colors hover:bg-gray-50"
          >
            <Video className={`w-6 h-6 mb-2 ${availability?.isLive ? 'text-status-success' : 'text-text-muted'}`} />
            <span className="text-sm font-medium">Video</span>
            {availability?.isLive ? (
              <ToggleRight className="w-8 h-8 text-status-success mt-1" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-text-muted mt-1" />
            )}
          </button>
        </div>
      </Card>

      {/* Incoming Requests */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Incoming Requests</h2>
          <Badge variant="secondary">{requests.length} pending</Badge>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'chat', 'call'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Request List */}
        <div className="space-y-3">
          {requestsLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <Skeleton className="w-20 h-8" />
                </div>
              ))}
            </>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted">No pending requests</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.requestId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {request.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">
                    {request.user?.name || 'User'}
                  </p>
                  <div className="flex items-center gap-2">
                    {request.type === 'chat' ? (
                      <MessageSquare className="w-3 h-3 text-text-muted" />
                    ) : (
                      <Phone className="w-3 h-3 text-text-muted" />
                    )}
                    <span className="text-xs text-text-muted">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => rejectRequest(request.requestId)}
                    className="text-status-error hover:bg-status-error/10"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => acceptRequest(request.requestId)}
                    className="bg-status-success hover:bg-status-success/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
