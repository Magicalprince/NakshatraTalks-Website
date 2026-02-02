'use client';

import { useState, useMemo } from 'react';
import { WalletBalance, TransactionList } from '@/components/features/wallet';
import { useWalletBalance, useWalletSummary, useTransactions } from '@/hooks/useWalletData';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type FilterType = 'all' | 'credit' | 'debit';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'credit', label: 'Credits' },
  { value: 'debit', label: 'Debits' },
];

export default function WalletPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

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

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-primary">My Wallet</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Wallet Balance Card */}
        <WalletBalance
          balance={balance ?? 0}
          isLoading={isBalanceLoading || isSummaryLoading}
          totalCredits={summary?.stats?.last30Days?.totalRecharged}
          totalDebits={summary?.stats?.last30Days?.totalSpent}
        />

        {/* Transaction History */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Transaction History
            </h2>
          </div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-4 overflow-x-auto"
          >
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={activeFilter === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </motion.div>

          {/* Transaction List */}
          <TransactionList
            transactions={transactions}
            isLoading={isTransactionsLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-24" />
    </div>
  );
}
