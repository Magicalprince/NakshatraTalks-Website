'use client';

/**
 * DesktopSidebar Component
 * Dashboard-style sidebar for desktop/tablet views
 * Uses mobile app colors and styling but adapted for web
 */

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
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
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar } from '@/components/ui';
import { motion } from 'framer-motion';

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

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();

  // Treat as authenticated only after hydration is complete
  const isLoggedIn = isHydrated && isAuthenticated;

  return (
    <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-10 w-10">
            <Image
              src="/images/logo.png"
              alt="NakshatraTalks"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-primary font-lexend">
            NakshatraTalks
          </span>
        </Link>
      </div>

      {/* User section */}
      {isLoggedIn && user && (
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
              <p className="font-semibold text-text-primary font-lexend truncate">
                {user.name || 'User'}
              </p>
              <p className="text-sm text-text-muted font-lexend truncate">
                {user.phone}
              </p>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <Link href="/wallet" className="block mt-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 cursor-pointer"
              style={{ boxShadow: '0 2px 8px rgba(255, 207, 13, 0.3)' }}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary font-lexend">
                  Balance
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-primary font-lexend">
                  ₹{user.walletBalance?.toFixed(0) || 0}
                </span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </motion.div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Main Menu */}
        <div className="pb-2">
          <p className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider font-lexend">
            Menu
          </p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium font-lexend transition-all cursor-pointer',
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-primary'
                )}
                style={isActive ? { boxShadow: '0 4px 12px rgba(41, 48, 166, 0.25)' } : {}}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}

        {/* Account section */}
        {isLoggedIn && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider font-lexend">
                Account
              </p>
            </div>
            {accountItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium font-lexend transition-all cursor-pointer',
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-text-secondary hover:bg-gray-50 hover:text-primary'
                    )}
                    style={isActive ? { boxShadow: '0 4px 12px rgba(41, 48, 166, 0.25)' } : {}}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </motion.div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-100">
        {isLoggedIn ? (
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-status-error hover:bg-red-50 font-lexend transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </motion.button>
        ) : (
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white font-lexend cursor-pointer"
              style={{ boxShadow: '0 4px 12px rgba(41, 48, 166, 0.3)' }}
            >
              <User className="h-5 w-5" />
              Sign In / Register
            </motion.div>
          </Link>
        )}
      </div>
    </aside>
  );
}
