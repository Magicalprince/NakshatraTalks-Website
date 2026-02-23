'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useActiveChat,
  useActiveCall,
  useEarningsHistory,
} from '@/hooks/useAstrologerDashboard';
import {
  MessageSquare,
  Phone,
  Clock,
  Video,
  Zap,
  BarChart3,
  Radio,
  Users,
  History,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
import { formatCurrency } from '@/utils/format-currency';

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

function getSessionIcon(type: string) {
  switch (type) {
    case 'chat': return <MessageSquare className="w-5 h-5 text-status-info" />;
    case 'call': return <Phone className="w-5 h-5 text-status-success" />;
    case 'video': return <Video className="w-5 h-5 text-primary" />;
    default: return <MessageSquare className="w-5 h-5 text-text-muted" />;
  }
}

function getSessionBg(type: string) {
  switch (type) {
    case 'chat': return 'bg-status-info/10';
    case 'call': return 'bg-status-success/10';
    case 'video': return 'bg-primary/10';
    default: return 'bg-gray-100';
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const INITIAL_LIMIT = 20;
const EXPANDED_LIMIT = 100; // Backend max is 100

export default function AstrologerHistoryPage() {
  const { data: activeChat, isLoading: chatLoading, refetch: refetchChat, isRefetching: chatRefetching } = useActiveChat();
  const { data: activeCall, isLoading: callLoading, refetch: refetchCall, isRefetching: callRefetching } = useActiveCall();

  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [viewAllPast, setViewAllPast] = useState(false);
  const [pastPage, setPastPage] = useState(1);

  const pastLimit = viewAllPast ? EXPANDED_LIMIT : INITIAL_LIMIT;

  // Fetch past completed sessions from the earnings history endpoint
  const { data: historyResult, isLoading: pastLoading } = useEarningsHistory(
    selectedTab === 'all' ? undefined : (selectedTab as 'chat' | 'call'),
    viewAllPast ? pastPage : 1,
    pastLimit,
  );
  const pastSessions = historyResult?.data ?? [];
  const pastPagination = historyResult?.pagination;
  const pastTotalItems = pastPagination?.totalItems ?? 0;
  const hasMorePast = !viewAllPast && (pastPagination?.hasNext || pastTotalItems > INITIAL_LIMIT);

  const isLoading = chatLoading || callLoading;
  const isRefetching = chatRefetching || callRefetching;

  const handleRefresh = () => {
    refetchChat();
    refetchCall();
  };

  const handleViewAllPast = () => {
    setViewAllPast(true);
    setPastPage(1);
  };

  const handleShowLessPast = () => {
    setViewAllPast(false);
    setPastPage(1);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setPastPage(1);
  };

  const showChat = selectedTab === 'all' || selectedTab === 'chat';
  const showCall = selectedTab === 'all' || selectedTab === 'call';

  const hasActiveSessions = (showChat && activeChat) || (showCall && activeCall);

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
                onTabChange={handleTabChange}
                layoutId="historySessionTab"
                className="mb-4"
              />

              <div className="space-y-4">
                {isLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <Card key={i} className="p-4 shadow-web-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </Card>
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

                    {/* Empty state for active sessions */}
                    {!hasActiveSessions && (
                      <EmptyState
                        icon={MessageSquare}
                        title="No active sessions"
                        description="Accept a request from the dashboard to start a chat or call"
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Past Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between">
                <SectionHeader icon={History} title="Past Sessions" />
                {!pastLoading && pastSessions.length > 0 && pastTotalItems > INITIAL_LIMIT && (
                  <Button
                    variant={viewAllPast ? 'outline' : 'primary'}
                    size="sm"
                    onClick={viewAllPast ? handleShowLessPast : handleViewAllPast}
                    className="shadow-web-sm"
                  >
                    {viewAllPast ? (
                      <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>View All ({pastTotalItems}) <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-3 mt-4">
                {pastLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4 shadow-web-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </Card>
                  ))
                ) : pastSessions.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No past sessions"
                    description="Completed consultations will appear here"
                  />
                ) : (
                  <>
                    {pastSessions.map((session, index) => (
                      <motion.div
                        key={session.sessionId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + Math.min(index, 10) * 0.03 }}
                      >
                        <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-all border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSessionBg(session.sessionType)}`}>
                              {getSessionIcon(session.sessionType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-text-primary truncate">
                                  {session.user?.name || 'User'}
                                </p>
                                <Badge variant="default" className="text-xs capitalize">
                                  {session.sessionType}
                                </Badge>
                              </div>
                              <p className="text-xs text-text-muted mt-0.5">
                                {formatDuration(session.duration)} &middot;{' '}
                                {new Date(session.startTime).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}{' '}
                                {new Date(session.startTime).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-status-success text-sm">
                                +{formatCurrency(session.earnings)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}

                    {/* View All button when not expanded */}
                    {hasMorePast && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-2 text-center"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleViewAllPast}
                          className="shadow-web-sm"
                        >
                          View All Sessions ({pastTotalItems}) <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Pagination controls when in view-all mode */}
                    {viewAllPast && pastPagination && pastPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="text-sm text-text-muted">
                          Page {pastPagination.currentPage} of {pastPagination.totalPages} ({pastTotalItems} sessions)
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPastPage((p) => Math.max(1, p - 1))}
                            disabled={!pastPagination.hasPrev}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPastPage((p) => p + 1)}
                            disabled={!pastPagination.hasNext}
                          >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
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
