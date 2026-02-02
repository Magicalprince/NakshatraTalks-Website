'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useActiveCall } from '@/hooks/useAstrologerDashboard';
import { Phone, Clock, ChevronRight, Users, Video } from 'lucide-react';

export default function AstrologerCallPage() {
  const { data: activeSession, isLoading, refetch, isRefetching } = useActiveCall();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Call Sessions</h1>
          <p className="text-text-secondary text-sm">Manage your voice and video consultations</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Active Session */}
      <div>
        <h2 className="font-semibold text-text-primary mb-3">Active Session</h2>
        {isLoading ? (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-32 h-5 mb-2" />
                <Skeleton className="w-24 h-4" />
              </div>
              <Skeleton className="w-20 h-8" />
            </div>
          </Card>
        ) : activeSession ? (
          <Link href={`/astrologer/call/${activeSession.sessionId}`}>
            <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-status-success">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {activeSession.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary truncate">
                      {activeSession.user?.name || 'User'}
                    </p>
                    <Badge variant="success" className="text-xs">
                      Active
                    </Badge>
                    {activeSession.twilioRoomName && (
                      <Video className="w-4 h-4 text-status-info" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(activeSession.duration / 60)}:{(activeSession.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs text-status-success">
                      ₹{activeSession.currentCost?.toFixed(2)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary">No active call session</p>
            <p className="text-xs text-text-muted mt-1">
              Accept a call request from the dashboard to start
            </p>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-text-primary mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/astrologer/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              View Requests
            </Button>
          </Link>
          <Link href="/astrologer/waitlist">
            <Button variant="outline" className="w-full justify-start">
              <Clock className="w-4 h-4 mr-2" />
              Waitlist
            </Button>
          </Link>
        </div>
      </Card>

      {/* Info */}
      <Card className="p-4 bg-status-info/5 border-status-info/20">
        <p className="text-sm text-text-secondary">
          <strong>Tip:</strong> Make sure you have a stable internet connection and allow camera/microphone
          permissions for the best call experience.
        </p>
      </Card>
    </div>
  );
}
