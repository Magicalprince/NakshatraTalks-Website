'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Gift } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function CTABanner() {
  const { isAuthenticated, user } = useAuthStore();

  // Show different banners based on auth state
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-6 lg:p-8"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-white font-lexend mb-2">
              Get Your First Consultation Free!
            </h3>
            <p className="text-white/80 font-lexend">
              Sign up now and get ₹50 wallet credit
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-text-primary px-6 py-3 rounded-xl font-semibold font-lexend hover:bg-secondary-dark transition-colors"
          >
            <Gift className="h-5 w-5" />
            Claim Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </motion.div>
    );
  }

  // Low balance banner
  if (user && (user.walletBalance || 0) < 100) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-secondary to-secondary-dark p-6 lg:p-8"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-text-primary font-lexend mb-2">
              Low Wallet Balance
            </h3>
            <p className="text-text-secondary font-lexend">
              Recharge now to continue consulting with astrologers
            </p>
          </div>
          <Link
            href="/recharge"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold font-lexend hover:bg-primary-dark transition-colors"
          >
            <Wallet className="h-5 w-5" />
            Recharge Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      </motion.div>
    );
  }

  // Default promotional banner
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/20 p-6 lg:p-8 border border-primary/20"
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-text-primary font-lexend mb-2">
            Explore Live Sessions
          </h3>
          <p className="text-text-secondary font-lexend">
            Watch free live astrology sessions from top astrologers
          </p>
        </div>
        <Link
          href="/live-sessions"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold font-lexend hover:bg-primary-dark transition-colors"
        >
          Watch Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </motion.div>
  );
}
