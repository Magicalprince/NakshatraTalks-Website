'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Transaction } from '@/types/api.types';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Gift,
  MessageCircle,
  Phone,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
}

const getTransactionIcon = (type: string, category?: string) => {
  if (category === 'chat_session' || category === 'chat') {
    return <MessageCircle className="w-4 h-4" />;
  }
  if (category === 'call_session' || category === 'call') {
    return <Phone className="w-4 h-4" />;
  }
  switch (type) {
    case 'credit':
    case 'recharge':
      return <ArrowDownLeft className="w-4 h-4" />;
    case 'debit':
    case 'session_debit':
      return <ArrowUpRight className="w-4 h-4" />;
    case 'refund':
      return <RefreshCw className="w-4 h-4" />;
    case 'bonus':
      return <Gift className="w-4 h-4" />;
    default:
      return <CreditCard className="w-4 h-4" />;
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'credit':
    case 'recharge':
    case 'bonus':
      return 'text-status-success bg-status-success/10';
    case 'debit':
    case 'session_debit':
      return 'text-status-error bg-status-error/10';
    case 'refund':
      return 'text-status-warning bg-status-warning/10';
    default:
      return 'text-text-secondary bg-gray-100';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
};

export function TransactionList({
  transactions,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: TransactionListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-text-muted" />
        </div>
        <h3 className="font-semibold text-text-primary mb-2">No Transactions Yet</h3>
        <p className="text-text-secondary text-sm">
          Your transaction history will appear here
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                {getTransactionIcon(transaction.type, transaction.category)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {transaction.description || transaction.category || transaction.type}
                </p>
                <p className="text-xs text-text-muted">
                  {formatDate(transaction.createdAt)}
                  {transaction.astrologerName && ` • ${transaction.astrologerName}`}
                </p>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'credit' || transaction.type === 'recharge' || transaction.type === 'refund' || transaction.type === 'bonus'
                    ? 'text-status-success'
                    : 'text-status-error'
                }`}>
                  {transaction.type === 'credit' || transaction.type === 'recharge' || transaction.type === 'refund' || transaction.type === 'bonus'
                    ? '+'
                    : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                {transaction.balance !== undefined && (
                  <p className="text-xs text-text-muted">
                    Bal: {formatCurrency(transaction.balance)}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-2">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
