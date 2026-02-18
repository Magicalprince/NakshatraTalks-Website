'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useActiveChat, useActiveCall } from '@/hooks/useAstrologerDashboard';
import {
  MessageSquare,
  Phone,
  Clock,
  Users,
  Video,
  Zap,
  BarChart3,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  SectionHeader,
  AnimatedTabs,
  EmptyState,
  InfoCard,
  QuickLinks,
  type QuickLinkItem,
} from '@/components/shared';

const SESSION_TABS = [
  { key: 'all', label: 'All' },
  { key: 'chat', label: 'Chat' },
  { key: 'call', label: 'Call' },
];

const SIDEBAR_LINKS: QuickLinkItem[] = [
  {
    icon: Users,
    label: 'View Requests',
    href: '/astrologer/dashboard',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    label: 'Earnings',
    href: '/astrologer/earnings',
    color: 'text-status-success',
    bgColor: 'bg-status-success/10',
  },
  {
    icon: Radio,
    label: 'Go Live',
    href: '/astrologer/live',
    color: 'text-status-error',
    bgColor: 'bg-status-error/10',
  },
];

export default function AstrologerHistoryPage() {
  const { data: activeChat, isLoading: chatLoading, refetch: refetchChat, isRefetching: chatRefetching } = useActiveChat();
  const { data: activeCall, isLoading: callLoading, refetch: refetchCall, isRefetching: callRefetching } = useActiveCall();

  const [selectedTab, setSelectedTab] = useState<string>('all');

  const isLoading = chatLoading || callLoading;
  const isRefetching = chatRefetching || callRefetching;

  const handleRefresh = () => {
    refetchChat();
    refetchCall();
  };

  const showChat = selectedTab === 'all' || selectedTab === 'chat';
  const showCall = selectedTab === 'all' || selectedTab === 'call';

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/astrologer/dashboard' },
          { label: 'History' },
        ]} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-lexend">History</h1>
            <p className="text-text-secondary text-sm mt-1">Manage your active and past consultations</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="shadow-web-sm"
          >
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader icon={Zap} title="Active Sessions" />

              <AnimatedTabs
                tabs={SESSION_TABS}
                activeKey={selectedTab}
                onTabChange={setSelectedTab}
                layoutId="historySessionTab"
                className="mb-4"
              />

              <div className="space-y-4">
                {isLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-web-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 skeleton-shimmer" />
                          <div className="flex-1 space-y-2">
                            <div className="h-5 w-32 rounded bg-gray-100 skeleton-shimmer" />
                            <div className="h-4 w-24 rounded bg-gray-100 skeleton-shimmer" />
                          </div>
                          <div className="h-8 w-20 rounded-lg bg-gray-100 skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Active Chat Session */}
                    {showChat && activeChat && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Link href={`/astrologer/history/chat/${activeChat.sessionId}`}>
                          <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-all border-l-4 border-l-status-success">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold text-lg">
                                  {activeChat.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-text-primary truncate">
                                    {activeChat.user?.name || 'User'}
                                  </p>
                                  <Badge variant="success" className="text-xs">Active</Badge>
                                  <MessageSquare className="w-4 h-4 text-primary/60" />
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-text-muted flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(activeChat.duration / 60)}:{(activeChat.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-xs text-status-success font-medium">
                                    ₹{activeChat.currentCost?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    )}

                    {/* Active Call Session */}
                    {showCall && activeCall && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Link href={`/astrologer/history/call/${activeCall.sessionId}`}>
                          <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-all border-l-4 border-l-status-success">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold text-lg">
                                  {activeCall.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-text-primary truncate">
                                    {activeCall.user?.name || 'User'}
                                  </p>
                                  <Badge variant="success" className="text-xs">Active</Badge>
                                  <Phone className="w-4 h-4 text-primary/60" />
                                  {activeCall.twilioRoomName && (
                                    <Video className="w-4 h-4 text-status-info" />
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-text-muted flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(activeCall.duration / 60)}:{(activeCall.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-xs text-status-success font-medium">
                                    ₹{activeCall.currentCost?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </motion.div>
                    )}

                    {/* Empty states per tab */}
                    {selectedTab === 'all' && !activeChat && !activeCall && (
                      <EmptyState
                        icon={MessageSquare}
                        title="No active sessions"
                        description="Accept a request from the dashboard to start a chat or call"
                      />
                    )}

                    {selectedTab === 'chat' && !activeChat && (
                      <EmptyState
                        icon={MessageSquare}
                        title="No active chat session"
                        description="Accept a chat request from the dashboard to start"
                      />
                    )}

                    {selectedTab === 'call' && !activeCall && (
                      <EmptyState
                        icon={Phone}
                        title="No active call session"
                        description="Accept a call request from the dashboard to start"
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Tip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InfoCard variant="info">
                <p>
                  <strong className="text-text-primary">Tip:</strong> Keep your availability status updated to receive more consultation requests.
                  Make sure you have a stable internet connection for the best experience.
                </p>
              </InfoCard>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <QuickLinks items={SIDEBAR_LINKS} />
            </motion.div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
