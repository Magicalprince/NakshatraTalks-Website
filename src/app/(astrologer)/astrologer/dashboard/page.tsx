'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  useAstrologerStats,
  useAstrologerAvailability,
  useUpdateAvailability,
  useIncomingRequests,
  useAcceptRequest,
  useRejectRequest,
} from '@/hooks/useAstrologerDashboard';
import {
  SectionHeader,
  AnimatedTabs,
  AnimatedToggle,
  EmptyState,
  StatCard,
  QuickLinks,
  type QuickLinkItem,
} from '@/components/shared';
import {
  MessageSquare,
  Phone,
  IndianRupee,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Sliders,
  Inbox,
  BarChart3,
  User,
  Radio,
  Settings,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';

const REQUEST_TABS = [
  { key: 'all', label: 'All' },
  { key: 'chat', label: 'Chat' },
  { key: 'call', label: 'Call' },
];

const SIDEBAR_LINKS: QuickLinkItem[] = [
  { icon: BarChart3, label: 'Earnings', href: '/astrologer/earnings', color: 'text-primary', bgColor: 'bg-primary/10' },
  { icon: Radio, label: 'Go Live', href: '/astrologer/live', color: 'text-status-error', bgColor: 'bg-status-error/10' },
  { icon: User, label: 'Profile', href: '/astrologer/profile', color: 'text-status-warning', bgColor: 'bg-status-warning/10' },
  { icon: Settings, label: 'Settings', href: '/astrologer/settings', color: 'text-text-secondary', bgColor: 'bg-gray-100' },
];

export default function AstrologerDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAstrologerStats();
  const { data: availability } = useAstrologerAvailability();
  const { mutate: updateAvailability, isPending: isUpdating } = useUpdateAvailability();
  const { data: requestsData, isLoading: requestsLoading } = useIncomingRequests();
  const { mutate: acceptRequest } = useAcceptRequest();
  const { mutate: rejectRequest } = useRejectRequest();

  const [selectedTab, setSelectedTab] = useState<string>('all');

  const requests = requestsData?.requests || [];
  const filteredRequests = selectedTab === 'all'
    ? requests
    : requests.filter(r => r.type === selectedTab);

  const toggleAvailability = (type: 'chat' | 'call') => {
    if (!availability) return;

    updateAvailability({
      chat: type === 'chat' ? !availability.chatAvailable : availability.chatAvailable,
      call: type === 'call' ? !availability.callAvailable : availability.callAvailable,
    });
  };

  const statCards = [
    { icon: IndianRupee, value: formatCurrency(stats?.todayEarnings || 0), label: "Today's Earnings", color: 'text-primary', bg: 'bg-primary/10', accent: 'bg-primary' },
    { icon: Users, value: stats?.todayConsultations || 0, label: "Today's Sessions", color: 'text-status-success', bg: 'bg-status-success/10', accent: 'bg-status-success' },
    { icon: Clock, value: `${stats?.averageSessionDuration || 0}m`, label: 'Avg Duration', color: 'text-status-warning', bg: 'bg-status-warning/10', accent: 'bg-status-warning' },
    { icon: TrendingUp, value: stats?.averageRating?.toFixed(1) || '0.0', label: 'Average Rating', color: 'text-status-info', bg: 'bg-status-info/10', accent: 'bg-status-info' },
  ];

  const availabilityItems = [
    { type: 'chat' as const, icon: MessageSquare, label: 'Chat', active: availability?.chatAvailable },
    { type: 'call' as const, icon: Phone, label: 'Call', active: availability?.callAvailable },
  ];

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-light to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,207,13,0.12),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <PageContainer size="lg" className="relative pt-8 pb-36">
          <h1 className="text-2xl font-bold text-white font-lexend mb-1">
            Welcome back!
          </h1>
          <p className="text-white/70 text-sm">Here&apos;s your overview for today.</p>
        </PageContainer>
      </div>

      <PageContainer size="lg">
        {/* Stats Grid — pulled up to overlap the banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-28 mb-8 relative z-10">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-web-md">
                  <div className="w-10 h-10 rounded-full bg-gray-100 skeleton-shimmer mb-3" />
                  <div className="h-6 w-20 rounded bg-gray-100 skeleton-shimmer mb-2" />
                  <div className="h-4 w-24 rounded bg-gray-100 skeleton-shimmer" />
                </div>
              ))}
            </>
          ) : (
            statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))
          )}
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Availability Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SectionHeader icon={Sliders} title="Availability" />
              <Card className="p-0 overflow-hidden shadow-web-sm border border-status-success/20" padding="none">
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  {availabilityItems.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => toggleAvailability(item.type)}
                      disabled={isUpdating}
                      className={`flex flex-col items-center p-6 transition-all duration-200 hover:bg-status-success/5 ${item.active ? 'bg-status-success/[0.03]' : ''} ${isUpdating ? 'opacity-60 cursor-wait' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${item.active ? 'bg-status-success/15 shadow-sm' : 'bg-gray-100'}`}>
                        <item.icon className={`w-5 h-5 transition-colors ${item.active ? 'text-status-success' : 'text-text-muted'}`} />
                      </div>
                      <span className="text-sm font-medium font-lexend mb-3">{item.label}</span>
                      <AnimatedToggle
                        checked={!!item.active}
                        onChange={() => toggleAvailability(item.type)}
                        label={`Toggle ${item.label} availability`}
                        colorScheme="success"
                        disabled={isUpdating}
                      />
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Incoming Requests Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold font-lexend uppercase tracking-wider text-text-primary">
                    Incoming Requests
                  </h2>
                </div>
                <Badge variant="secondary" className="text-xs">{requests.length} pending</Badge>
              </div>

              <Card className="p-5 shadow-web-sm" padding="none">
                <AnimatedTabs
                  tabs={REQUEST_TABS}
                  activeKey={selectedTab}
                  onTabChange={setSelectedTab}
                  layoutId="dashboardRequestTab"
                  className="mb-4 px-1"
                />

                {/* Request List */}
                <div className="space-y-3">
                  {requestsLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-gray-100 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 skeleton-shimmer" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-24 rounded bg-gray-100 skeleton-shimmer" />
                              <div className="h-3 w-16 rounded bg-gray-100 skeleton-shimmer" />
                            </div>
                            <div className="h-8 w-20 rounded-lg bg-gray-100 skeleton-shimmer" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : filteredRequests.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="No pending requests"
                      description="New requests will appear here"
                    />
                  ) : (
                    filteredRequests.map((request, index) => (
                      <motion.div
                        key={request.requestId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="p-4 rounded-lg border border-gray-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold text-sm">
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
                                aria-label={`Reject request from ${request.user?.name || 'User'}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => acceptRequest(request.requestId)}
                                className="bg-status-success hover:bg-status-success/90"
                                aria-label={`Accept request from ${request.user?.name || 'User'}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QuickLinks items={SIDEBAR_LINKS} />
            </motion.div>

            {/* Today's Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-primary/30 via-secondary/40 to-primary/20 shadow-web-sm">
                <Card className="p-5 rounded-[10px]">
                  <h3 className="text-sm font-semibold font-lexend text-text-primary mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Total Reviews</span>
                      <span className="font-semibold text-sm font-lexend">{stats?.totalReviews || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Total Sessions</span>
                      <span className="font-semibold text-sm font-lexend">{stats?.totalConsultations || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Weekly Earnings</span>
                      <span className="font-semibold text-sm font-lexend">{formatCurrency(stats?.weeklyEarnings || 0)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
