'use client';

/**
 * WalletBalance Component
 * Design matches mobile app with:
 * - Yellow background header section
 * - Available Balance with rupee icon
 * - Recharge button on right
 * - Rounded bottom corners
 */

import { IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
  totalCredits?: number;
  totalDebits?: number;
}

export function WalletBalance({ balance, isLoading }: WalletBalanceProps) {
  if (isLoading) {
    return (
      <div className="bg-secondary rounded-b-[28px] px-5 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-24 bg-black/10 rounded animate-pulse mb-2" />
            <div className="h-6 w-20 bg-black/10 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-black/10 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-secondary rounded-b-[28px] px-5 pb-5"
    >
      <div className="flex items-center justify-between">
        {/* Balance Info */}
        <div>
          <p className="text-[13px] font-medium text-[#555555] font-lexend mb-1">
            Available Balance
          </p>
          <div className="flex items-center">
            <IndianRupee className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="text-[22px] font-bold text-primary font-lexend ml-1">
              {balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Recharge Button */}
        <Link href="/recharge">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="px-6 py-2.5 bg-primary rounded-xl text-[15px] font-semibold text-white font-lexend"
            style={{
              boxShadow: '0 4px 16px rgba(41, 48, 166, 0.3)',
            }}
          >
            Recharge
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
