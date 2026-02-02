'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Wallet, IndianRupee, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredBalance: number;
  currentBalance: number;
  pricePerMinute: number;
  astrologerName?: string;
}

export function InsufficientBalanceModal({
  isOpen,
  onClose,
  requiredBalance,
  currentBalance,
  pricePerMinute,
  astrologerName,
}: InsufficientBalanceModalProps) {
  const minimumRecharge = requiredBalance - currentBalance;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Insufficient Balance"
      className="max-w-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-status-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-status-warning" />
        </div>

        {/* Message */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Low Wallet Balance
        </h3>
        <p className="text-text-secondary mb-4">
          You need a minimum of <span className="font-semibold text-text-primary">5 minutes</span> worth of balance to{' '}
          {astrologerName ? `chat with ${astrologerName}` : 'start a session'}.
        </p>

        {/* Balance Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Current Balance</span>
            <span className="font-medium text-text-primary flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {currentBalance}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Price per minute</span>
            <span className="font-medium text-text-primary flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {pricePerMinute}/min
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Required (5 min)</span>
            <span className="font-medium text-text-primary flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {requiredBalance}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="text-text-secondary font-medium">Minimum Recharge</span>
            <span className="font-bold text-status-error flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {minimumRecharge}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Link href="/recharge" className="flex-1">
            <Button variant="primary" className="w-full gap-2">
              <Wallet className="w-4 h-4" />
              Recharge Now
            </Button>
          </Link>
        </div>
      </motion.div>
    </Modal>
  );
}
