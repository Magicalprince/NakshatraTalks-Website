'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Home,
  MessageCircle,
  Phone,
  Radio,
  Star,
  Wallet,
  User,
  Settings,
  HelpCircle,
  LogOut,
  FileText,
  Users,
  History,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Avatar } from '@/components/ui';

const menuItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: MessageCircle, label: 'Chat with Astrologer', href: '/browse-chat' },
  { icon: Phone, label: 'Call an Astrologer', href: '/browse-call' },
  { icon: Radio, label: 'Live Sessions', href: '/live-sessions' },
  { icon: Star, label: 'Daily Horoscope', href: '/horoscope' },
  { icon: FileText, label: 'Free Kundli', href: '/kundli' },
  { icon: Users, label: 'Kundli Matching', href: '/kundli-matching' },
];

const accountItems = [
  { icon: Wallet, label: 'Wallet', href: '/wallet' },
  { icon: History, label: 'History', href: '/history/chat' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-50 h-full w-[280px] bg-white shadow-modal lg:hidden overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
                <div className="relative h-8 w-8">
                  <Image
                    src="/images/logo.png"
                    alt="NakshatraTalks"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-primary font-lexend">
                  NakshatraTalks
                </span>
              </Link>
              <button
                onClick={closeSidebar}
                className="rounded-full p-2 text-text-muted hover:bg-background-offWhite hover:text-text-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User section */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.profileImage}
                    alt={user.name || 'User'}
                    fallback={user.name || undefined}
                    size="lg"
                    bordered
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary font-lexend truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-sm text-text-secondary font-lexend truncate">
                      {user.phone}
                    </p>
                  </div>
                </div>
                <Link
                  href="/wallet"
                  onClick={closeSidebar}
                  className="mt-3 flex items-center justify-between rounded-xl bg-secondary/20 px-4 py-3"
                >
                  <span className="text-sm font-medium text-text-primary font-lexend">
                    Wallet Balance
                  </span>
                  <span className="text-lg font-semibold text-primary font-lexend">
                    ₹{user.walletBalance?.toFixed(0) || 0}
                  </span>
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium font-lexend transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-background-offWhite hover:text-text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Account section */}
              {isAuthenticated && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-medium text-text-muted uppercase tracking-wider font-lexend">
                      Account
                    </p>
                  </div>
                  {accountItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium font-lexend transition-colors',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-text-secondary hover:bg-background-offWhite hover:text-text-primary'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}

                  {/* Logout button */}
                  <button
                    onClick={() => {
                      closeSidebar();
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-status-error hover:bg-status-error/10 font-lexend transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              )}

              {/* Sign in button for non-authenticated users */}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={closeSidebar}
                  className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white font-lexend"
                >
                  <User className="h-5 w-5" />
                  Sign In / Register
                </Link>
              )}
            </nav>
          </motion.aside>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
