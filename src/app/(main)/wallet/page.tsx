'use client';

/**
 * Wallet Page
 * Web-standard layout with:
 * - Breadcrumb navigation
 * - 2-column layout: transactions (2/3) + balance card sidebar (1/3)
 * - Underline-style filter tabs with spring-based layoutId animation
 * - Shimmer loading skeletons
 * - Gradient glow wallet balance sidebar
 */

import { useState, useMemo } from 'react';
import { WalletBalance, TransactionList } from '@/components/features/wallet';
import { useWalletBalance, useWalletSummary, useTransactions } from '@/hooks/useWalletData';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AnimatedTabs } from '@/components/shared';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

type FilterType = 'all' | 'credit' | 'debit';

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'credit', label: 'Funds Added' },
  { key: 'debit', label: 'Money Spent' },
];

export default function WalletPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Auth protection
  const { isReady } = useRequireAuth();

  // Fetch wallet data
  const { data: balance, isLoading: isBalanceLoading } = useWalletBalance();
  const { data: summary, isLoading: isSummaryLoading } = useWalletSummary();

  // Fetch transactions with filter
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTransactions(activeFilter === 'all' ? undefined : activeFilter);

  // Flatten transactions pages
  const transactions = useMemo(() => {
    if (!transactionsData?.pages) return [];
    return transactionsData.pages.flatMap((page) => page?.transactions || []);
  }, [transactionsData]);

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="lg">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 rounded-lg skeleton-shimmer" />
            <Skeleton className="w-64 h-8 mb-8 rounded-lg skeleton-shimmer" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {/* Tab skeleton */}
                <div className="flex gap-4 mb-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-lg skeleton-shimmer" />
                  ))}
                </div>
                {/* Transaction skeletons */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-web-sm">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full skeleton-shimmer" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-36 rounded skeleton-shimmer" />
                        <Skeleton className="h-3 w-24 rounded skeleton-shimmer" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <Skeleton className="h-36 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Wallet' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">My Wallet</h1>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Transactions */}
          <div className="lg:col-span-2">
            {/* Underline-style Filter Tabs */}
            <AnimatedTabs
              tabs={FILTER_OPTIONS}
              activeKey={activeFilter}
              onTabChange={(key) => setActiveFilter(key as FilterType)}
              layoutId="wallet-tab-underline"
              className="mb-6"
              ariaLabel="Transaction filter tabs"
            />

            {/* Transaction History */}
            <div role="tabpanel" id={`tabpanel-${activeFilter}`}>
              <TransactionList
                transactions={transactions}
                isLoading={isTransactionsLoading}
                isFetchingNextPage={isFetchingNextPage}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
              />
            </div>
          </div>

          {/* Sidebar - Balance Card */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              {/* Gradient glow border wrapper */}
              <div className="relative rounded-xl p-[2px] bg-gradient-to-br from-primary/30 via-secondary/40 to-primary/20 shadow-glow-primary/30">
                <div className="rounded-[10px] overflow-hidden">
                  <WalletBalance
                    balance={balance ?? 0}
                    isLoading={isBalanceLoading || isSummaryLoading}
                    totalCredits={summary?.stats?.last30Days?.totalRecharged}
                    totalDebits={summary?.stats?.last30Days?.totalSpent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
