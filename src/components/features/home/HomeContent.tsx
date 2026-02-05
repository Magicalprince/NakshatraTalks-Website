'use client';

/**
 * HomeContent Component
 * Dashboard-style web layout with:
 * - Welcome section with search
 * - Quick stats/actions cards
 * - Category icons in grid
 * - CTA Banner
 * - Live Sessions carousel
 * - Top Rated Astrologers grid
 */

import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { CategoryIcons } from './CategoryIcons';
import { CTABanner } from './CTABanner';
import { LiveSessionsCarousel } from './LiveSessionsCarousel';
import { TopRatedAstrologers } from './TopRatedAstrologers';
import { useAuthStore } from '@/stores/auth-store';
import { Wallet, MessageCircle, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function HomeContent() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-24 lg:pb-8"
    >
      {/* Welcome Section - Desktop */}
      <section className="hidden lg:block px-8 pt-6 pb-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-text-primary font-lexend mb-1">
            {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0] || 'User'}!` : 'Welcome to NakshatraTalks'}
          </h1>
          <p className="text-text-muted font-lexend">
            Connect with expert astrologers for personalized guidance
          </p>
        </motion.div>
      </section>

      {/* Quick Stats Cards - Desktop Only */}
      {isAuthenticated && (
        <section className="hidden lg:block px-8 pb-6">
          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
            {/* Wallet Balance */}
            <Link href="/wallet">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-secondary rounded-2xl p-5 cursor-pointer"
                style={{ boxShadow: '0 4px 16px rgba(255, 207, 13, 0.25)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary/70 font-lexend">Wallet Balance</span>
                </div>
                <p className="text-2xl font-bold text-primary font-lexend">
                  ₹{user?.walletBalance?.toFixed(0) || 0}
                </p>
              </motion.div>
            </Link>

            {/* Chat Sessions */}
            <Link href="/history/chat">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer"
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-text-muted font-lexend">Chat Sessions</span>
                </div>
                <p className="text-2xl font-bold text-text-primary font-lexend">12</p>
              </motion.div>
            </Link>

            {/* Call Sessions */}
            <Link href="/history/call">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer"
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-text-muted font-lexend">Call Sessions</span>
                </div>
                <p className="text-2xl font-bold text-text-primary font-lexend">8</p>
              </motion.div>
            </Link>

            {/* Total Minutes */}
            <Link href="/history/chat">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer"
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-text-muted font-lexend">Total Minutes</span>
                </div>
                <p className="text-2xl font-bold text-text-primary font-lexend">156</p>
              </motion.div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Search Bar Section */}
      <section className="px-5 lg:px-8 pt-4 lg:pt-0 pb-5">
        <motion.div variants={itemVariants}>
          <SearchBar showQuickFilters={false} />
        </motion.div>
      </section>

      {/* Category Icons Section */}
      <section className="px-5 lg:px-8 mb-8">
        <motion.div variants={itemVariants}>
          <CategoryIcons />
        </motion.div>
      </section>

      {/* CTA Banner Section */}
      <section className="px-5 lg:px-8 mb-8">
        <motion.div variants={itemVariants}>
          <CTABanner />
        </motion.div>
      </section>

      {/* Live Sessions Section */}
      <section className="px-5 lg:px-8">
        <motion.div variants={itemVariants}>
          <LiveSessionsCarousel />
        </motion.div>
      </section>

      {/* Top Rated Astrologers Section */}
      <section className="px-5 lg:px-8">
        <motion.div variants={itemVariants}>
          <TopRatedAstrologers />
        </motion.div>
      </section>
    </motion.div>
  );
}
