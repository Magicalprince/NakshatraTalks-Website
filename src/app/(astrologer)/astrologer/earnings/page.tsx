'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useEarningsSummary,
  useEarningsHistory,
} from '@/hooks/useAstrologerDashboard';
import { SectionHeader, AnimatedTabs, EmptyState, InfoCard } from '@/components/shared';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  MessageSquare,
  Phone,
  Video,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

type SessionFilter = 'all' | 'chat' | 'call';

const SESSION_FILTER_TABS = [
  { key: 'all' as SessionFilter, label: 'All' },
  { key: 'chat' as SessionFilter, label: 'Chat' },
  { key: 'call' as SessionFilter, label: 'Call' },
];

function getSessionIcon(type: string) {
  switch (type) {
    case 'chat': return <MessageSquare className="w-5 h-5 text-status-info" />;
    case 'call':
    case 'video': return <Phone className="w-5 h-5 text-status-success" />;
    default: return <MessageSquare className="w-5 h-5 text-text-muted" />;
  }
}

function getSessionBg(type: string) {
  switch (type) {
    case 'chat': return 'bg-status-info/10';
    case 'call':
    case 'video': return 'bg-status-success/10';
    default: return 'bg-gray-100';
  }
}

function formatDuration(durationMinutes: number): string {
  if (durationMinutes < 60) return `${durationMinutes}m`;
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const INITIAL_LIMIT = 20;
const EXPANDED_LIMIT = 100; // Backend max is 100

export default function AstrologerEarningsPage() {
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');
  const [viewAll, setViewAll] = useState(false);
  const [page, setPage] = useState(1);

  const limit = viewAll ? EXPANDED_LIMIT : INITIAL_LIMIT;

  const { data: summary, isLoading: summaryLoading } = useEarningsSummary();
  const { data: historyResult, isLoading: historyLoading } = useEarningsHistory(
    sessionFilter === 'all' ? undefined : sessionFilter,
    viewAll ? page : 1,
    limit,
  );

  const sessions = historyResult?.data ?? [];
  const pagination = historyResult?.pagination;
  const totalItems = pagination?.totalItems ?? 0;
  const hasMore = !viewAll && (pagination?.hasNext || totalItems > INITIAL_LIMIT);

  const handleViewAll = () => {
    setViewAll(true);
    setPage(1);
  };

  const handleShowLess = () => {
    setViewAll(false);
    setPage(1);
  };

  const handleFilterChange = (key: string) => {
    setSessionFilter(key as SessionFilter);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/astrologer/dashboard' },
          { label: 'Earnings' },
        ]} />

        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-1">Earnings</h1>
        <p className="text-text-secondary text-sm mb-6">Track your income and session history</p>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Sessions */}
          <div className="lg:col-span-2">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <IndianRupee className="w-5 h-5 text-status-success" />
                    <Badge variant="success" className="text-xs">Today</Badge>
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-7 w-24" />
                  ) : (
                    <p className="text-xl font-bold text-text-primary font-lexend">
                      {formatCurrency(summary?.todayEarnings ?? 0)}
                    </p>
                  )}
                  <p className="text-xs text-text-muted mt-0.5">Today&apos;s Earnings</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <Badge variant="info" className="text-xs">Today</Badge>
                  </div>
                  {summaryLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-xl font-bold text-text-primary font-lexend">
                      {summary?.stats?.todaySessions ?? 0}
                    </p>
                  )}
                  <p className="text-xs text-text-muted mt-0.5">Sessions Today</p>
                </Card>
              </motion.div>
            </div>

            {/* Session Earnings */}
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader icon={BarChart3} title="Session Earnings" />
              {!historyLoading && sessions.length > 0 && totalItems > INITIAL_LIMIT && (
                <Button
                  variant={viewAll ? 'outline' : 'primary'}
                  size="sm"
                  onClick={viewAll ? handleShowLess : handleViewAll}
                  className="shadow-web-sm"
                >
                  {viewAll ? (
                    <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>View All ({totalItems}) <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              )}
            </div>

            <AnimatedTabs
              tabs={SESSION_FILTER_TABS}
              activeKey={sessionFilter}
              onTabChange={handleFilterChange}
              layoutId="earningsSessionFilter"
              className="mb-4"
            />

            <div className="space-y-3">
              {historyLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-4 shadow-web-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </Card>
                ))
              ) : sessions.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No earnings yet"
                  description={`No ${sessionFilter === 'all' ? '' : sessionFilter + ' '}sessions found`}
                />
              ) : (
                <>
                  {sessions.map((session, index) => (
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
                            <p className="font-medium text-text-primary truncate">
                              {session.user?.name || 'User'}
                            </p>
                            <p className="text-xs text-text-muted">
                              {formatDuration(session.duration)} &middot;{' '}
                              {new Date(session.startTime).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}{' '}
                              {new Date(session.startTime).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-status-success">
                              +{formatCurrency(session.earnings)}
                            </p>
                            <p className="text-xs text-text-muted capitalize">
                              {session.sessionType === 'video' ? 'call' : session.sessionType}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}

                  {/* View All button when not expanded */}
                  {hasMore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-2 text-center"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleViewAll}
                        className="shadow-web-sm"
                      >
                        View All Sessions ({totalItems}) <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Pagination controls when in view-all mode */}
                  {viewAll && pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-sm text-text-muted">
                        Page {pagination.currentPage} of {pagination.totalPages} ({totalItems} sessions)
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={!pagination.hasPrev}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!pagination.hasNext}
                        >
                          Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Earnings Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Earnings Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-primary/30 via-secondary/40 to-primary/20 shadow-web-sm">
                  <Card className="p-5 rounded-[10px] bg-gradient-to-r from-primary to-primary/80 text-white">
                    <p className="text-sm opacity-80 mb-1">Total Earnings</p>
                    {summaryLoading ? (
                      <Skeleton className="h-9 w-32 bg-white/20" />
                    ) : (
                      <p className="text-3xl font-bold font-lexend mb-4">
                        {formatCurrency(summary?.totalEarnings ?? 0)}
                      </p>
                    )}
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm opacity-80">Total Sessions</span>
                        </div>
                        {summaryLoading ? (
                          <Skeleton className="h-6 w-12 bg-white/20" />
                        ) : (
                          <p className="text-xl font-semibold font-lexend">{summary?.stats?.totalSessions ?? 0}</p>
                        )}
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm opacity-80">This Month</span>
                        </div>
                        {summaryLoading ? (
                          <Skeleton className="h-6 w-16 bg-white/20" />
                        ) : (
                          <p className="text-xl font-semibold font-lexend">
                            {formatCurrency(summary?.thisMonthEarnings ?? 0)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>

              {/* Payout Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <InfoCard variant="warning" icon={IndianRupee}>
                  <p className="font-semibold text-text-primary text-sm">Payout Info</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {summary?.commissionRate != null ? (
                      <>You earn {(summary.commissionRate * 100).toFixed(0)}% of every session. Platform fee: {((1 - summary.commissionRate) * 100).toFixed(0)}%.</>
                    ) : (
                      <>Commission rate not available. Contact support for details.</>
                    )}
                    {' '}Earnings transferred on the 1st and 15th of every month.
                  </p>
                </InfoCard>
              </motion.div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
