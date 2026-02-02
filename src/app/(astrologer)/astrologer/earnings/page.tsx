'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAstrologerStats } from '@/hooks/useAstrologerDashboard';
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  MessageSquare,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency } from '@/utils/format-currency';

type Period = 'today' | 'week' | 'month' | 'all';

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
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Earnings</h1>
        <p className="text-text-secondary text-sm">Track your income and payouts</p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              period === p
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary border hover:bg-gray-50'
            }`}
          >
            {p === 'today' && 'Today'}
            {p === 'week' && 'This Week'}
            {p === 'month' && 'This Month'}
            {p === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Earnings Summary */}
      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-32 h-8 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-r from-primary to-primary/80 text-white">
          <p className="text-sm opacity-80 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold mb-4">
            {formatCurrency(stats?.todayEarnings || 0)}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm opacity-80">Sessions</span>
              </div>
              <p className="text-xl font-semibold">{stats?.todayConsultations || 0}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm opacity-80">Avg Duration</span>
              </div>
              <p className="text-xl font-semibold">{stats?.averageSessionDuration || 0}m</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-status-info" />
            <Badge variant="success" className="text-xs">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              12%
            </Badge>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {formatCurrency((stats?.todayEarnings || 0) * 0.6)}
          </p>
          <p className="text-xs text-text-muted">From Chat</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Phone className="w-5 h-5 text-status-success" />
            <Badge variant="error" className="text-xs">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              5%
            </Badge>
          </div>
          <p className="text-xl font-bold text-text-primary">
            {formatCurrency((stats?.todayEarnings || 0) * 0.4)}
          </p>
          <p className="text-xs text-text-muted">From Calls</p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="font-semibold text-text-primary mb-4">Recent Sessions</h2>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <Card key={tx.id} className="p-4">
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
                    {tx.duration} mins • {new Date(tx.date).toLocaleTimeString('en-IN', {
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
          ))}
        </div>
      </div>

      {/* Payout Info */}
      <Card className="p-4 bg-status-warning/5 border-status-warning/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center flex-shrink-0">
            <IndianRupee className="w-5 h-5 text-status-warning" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Next Payout</p>
            <p className="text-sm text-text-secondary">
              Your earnings will be transferred to your bank account on the 1st and 15th of every month.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Pending: {formatCurrency(stats?.todayEarnings || 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
