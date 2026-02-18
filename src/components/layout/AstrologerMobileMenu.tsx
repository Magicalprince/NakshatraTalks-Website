'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LayoutDashboard,
  History,
  Radio,
  Wallet,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Avatar } from '@/components/ui';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/astrologer/dashboard' },
  { icon: History, label: 'History', href: '/astrologer/history' },
  { icon: Radio, label: 'Go Live', href: '/astrologer/live' },
  { icon: Wallet, label: 'Earnings', href: '/astrologer/earnings' },
];

const accountItems = [
  { icon: User, label: 'Profile', href: '/astrologer/profile' },
  { icon: Settings, label: 'Settings', href: '/astrologer/settings' },
];

export function AstrologerMobileMenu() {
  const pathname = usePathname();
  const { astrologer, logout } = useAuthStore();
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
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          />

          {/* Menu panel — slides from right */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-[300px] max-w-[85vw] bg-white shadow-modal lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href="/astrologer/dashboard" className="flex items-center gap-2" onClick={closeSidebar}>
                <div className="relative h-12 w-12">
                  <Image
                    src="/images/logo.png"
                    alt="NakshatraTalks"
                    fill
                    className="object-contain"
                  />
                </div>
              </Link>
              <button
                onClick={closeSidebar}
                className="rounded-lg p-2 text-text-muted hover:bg-background-offWhite hover:text-text-primary transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Astrologer section */}
            {astrologer && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={astrologer.image}
                    alt={astrologer.name || 'Astrologer'}
                    fallback={astrologer.name || undefined}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary font-lexend truncate text-sm">
                      {astrologer.name || 'Astrologer'}
                    </p>
                    <p className="text-xs text-primary font-lexend font-medium">
                      Astrologer
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/astrologer/dashboard'
                  ? pathname === '/astrologer/dashboard' || pathname === '/astrologer'
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium font-lexend transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-background-offWhite hover:text-text-primary'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-3 pb-1.5">
                <p className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider font-lexend">
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
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium font-lexend transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-background-offWhite hover:text-text-primary'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  closeSidebar();
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-status-error hover:bg-status-error/5 font-lexend transition-colors"
              >
                <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
                Sign Out
              </button>
            </nav>
          </motion.aside>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
