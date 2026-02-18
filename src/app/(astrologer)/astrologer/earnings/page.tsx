'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAstrologerStats } from '@/hooks/useAstrologerDashboard';
import { SectionHeader, AnimatedTabs, InfoCard } from '@/components/shared';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  MessageSquare,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

type Period = 'today' | 'week' | 'month' | 'all';

const PERIOD_TABS = [
  { key: 'today' as Period, label: 'Today' },
  { key: 'week' as Period, label: 'This Week' },
  { key: 'month' as Period, label: 'This Month' },
  { key: 'all' as Period, label: 'All Time' },
];

export default function AstrologerEarningsPage() {
  const { data: stats, isLoading } = useAstrologerStats();
  const [period, setPeriod] = useState<Period>('today');

  // Mock transaction data - would come from API in production
  const transactions = [
    {
      id: '1',
      type: 'chat',
      userName: 'Rahul Sharma',
      amount: 350,
      duration: 25,
      date: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'call',
      userName: 'Priya Singh',
      amount: 560,
      duration: 20,
      date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'chat',
      userName: 'Amit Patel',
      amount: 210,
      duration: 15,
      date: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: '4',
      type: 'call',
      userName: 'Sneha Gupta',
      amount: 840,
      duration: 30,
      date: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/astrologer/dashboard' },
          { label: 'Earnings' },
        ]} />

        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-1">Earnings</h1>
        <p className="text-text-secondary text-sm mb-6">Track your income and payouts</p>

        {/* 2-column layout (like wallet page) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Transactions */}
          <div className="lg:col-span-2">
            {/* Period Tabs */}
            <AnimatedTabs
              tabs={PERIOD_TABS}
              activeKey={period}
              onTabChange={(key) => setPeriod(key as Period)}
              layoutId="earningsPeriodTab"
              className="mb-6"
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className="w-5 h-5 text-status-info" />
                    <Badge variant="success" className="text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      12%
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-text-primary font-lexend">
                    {formatCurrency((stats?.todayEarnings || 0) * 0.6)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">From Chat</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <Phone className="w-5 h-5 text-status-success" />
                    <Badge variant="error" className="text-xs">
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                      5%
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-text-primary font-lexend">
                    {formatCurrency((stats?.todayEarnings || 0) * 0.4)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">From Calls</p>
                </Card>
              </motion.div>
            </div>

            {/* Recent Transactions */}
            <SectionHeader icon={BarChart3} title="Recent Sessions" />

            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-all border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'chat' ? 'bg-status-info/10' : 'bg-status-success/10'
                      }`}>
                        {tx.type === 'chat' ? (
                          <MessageSquare className="w-5 h-5 text-status-info" />
                        ) : (
                          <Phone className="w-5 h-5 text-status-success" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{tx.userName}</p>
                        <p className="text-xs text-text-muted">
                          {tx.duration} mins &middot; {new Date(tx.date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-status-success">
                          +{formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-text-muted capitalize">{tx.type}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
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
                    <p className="text-3xl font-bold font-lexend mb-4">
                      {formatCurrency(stats?.todayEarnings || 0)}
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm opacity-80">Sessions</span>
                        </div>
                        <p className="text-xl font-semibold font-lexend">{stats?.todayConsultations || 0}</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm opacity-80">Avg Duration</span>
                        </div>
                        <p className="text-xl font-semibold font-lexend">{stats?.averageSessionDuration || 0}m</p>
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
                  <p className="font-semibold text-text-primary text-sm">Next Payout</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Earnings transferred on the 1st and 15th of every month.
                  </p>
                  <p className="text-xs text-text-muted mt-2">
                    Pending: {formatCurrency(stats?.todayEarnings || 0)}
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
