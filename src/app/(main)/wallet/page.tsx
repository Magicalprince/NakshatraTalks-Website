'use client';

/**
 * Wallet Page
 * Design matches mobile app with:
 * - Yellow header background with rounded bottom
 * - Balance card at top
 * - Filter tabs with rounded pill style
 * - Transaction history list
 */

import { useState, useMemo } from 'react';
import { WalletBalance, TransactionList } from '@/components/features/wallet';
import { useWalletBalance, useWalletSummary, useTransactions } from '@/hooks/useWalletData';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

type FilterType = 'all' | 'credit' | 'debit';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Funds Added' },
  { value: 'debit', label: 'Money Spent' },
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
      <div className="min-h-screen bg-[#F5F5F5] pb-24">
        <div className="bg-secondary rounded-b-[28px] pb-5">
          <div className="flex items-center justify-between px-4 pt-2 pb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-24 h-6" />
            <div className="w-10" />
          </div>
          <div className="px-5">
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="mx-5 mt-5">
            <Skeleton className="h-12 rounded-[25px]" />
          </div>
        </div>
        <div className="px-5 mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Yellow Header Background */}
      <div className="bg-secondary rounded-b-[28px] pb-5">
        {/* Header Row */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <ChevronLeft className="w-[26px] h-[26px] text-[#333333]" strokeWidth={2} />
            </motion.button>
          </Link>

          <h1 className="text-xl font-semibold text-[#333333] font-lexend">My Wallet</h1>

          <div className="w-10" />
        </div>

        {/* Balance Section */}
        <WalletBalance
          balance={balance ?? 0}
          isLoading={isBalanceLoading || isSummaryLoading}
          totalCredits={summary?.stats?.last30Days?.totalRecharged}
          totalDebits={summary?.stats?.last30Days?.totalSpent}
        />

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex mx-5 mt-5 bg-white rounded-[25px] p-1"
          style={{
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
          }}
        >
          {FILTER_OPTIONS.map((option, index) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveFilter(option.value)}
              className={cn(
                'flex-1 py-2.5 text-[13px] font-medium font-lexend transition-colors',
                index === 0 && 'rounded-l-[21px]',
                index === FILTER_OPTIONS.length - 1 && 'rounded-r-[21px]',
                activeFilter === option.value
                  ? 'bg-primary text-white rounded-[21px]'
                  : 'text-[#666666]'
              )}
            >
              {option.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Transaction History */}
      <div className="px-5 mt-4">
        <TransactionList
          transactions={transactions}
          isLoading={isTransactionsLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  );
}
