'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
  totalCredits?: number;
  totalDebits?: number;
}

export function WalletBalance({ balance, isLoading, totalCredits, totalDebits }: WalletBalanceProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary to-primary-dark text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
            <Skeleton className="h-10 w-32 bg-white/20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-primary to-primary-dark text-white overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Wallet Balance</p>
              <h2 className="text-3xl font-bold">{formatCurrency(balance)}</h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          {/* Stats */}
          {(totalCredits !== undefined || totalDebits !== undefined) && (
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
              {totalCredits !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-status-success/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-status-success" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Total Credits</p>
                    <p className="text-sm font-semibold">{formatCurrency(totalCredits)}</p>
                  </div>
                </div>
              )}
              {totalDebits !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-status-error/20 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-status-error" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Total Debits</p>
                    <p className="text-sm font-semibold">{formatCurrency(totalDebits)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recharge Button */}
          <Link href="/recharge" className="block mt-4">
            <Button
              variant="secondary"
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Money
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
