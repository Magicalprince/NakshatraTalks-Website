'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  IndianRupee,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui';

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'yellow';
}

// Format wallet amount like mobile app
const formatWalletAmount = (amount: number): string => {
  if (amount <= 9999) {
    return amount.toFixed(0);
  } else if (amount < 100000) {
    return `${(amount / 1000).toFixed(amount % 1000 >= 100 ? 1 : 0)}K`;
  } else if (amount < 10000000) {
    return `${(amount / 100000).toFixed(amount % 100000 >= 10000 ? 1 : 0)}L`;
  } else {
    return `${(amount / 10000000).toFixed(amount % 10000000 >= 1000000 ? 1 : 0)}Cr`;
  }
};

export function Header({ variant = 'default' }: HeaderProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { openSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Only treat as authenticated after hydration is complete
  const isLoggedIn = isHydrated && isAuthenticated;

  const bgClass = {
    default: 'bg-white border-b border-gray-100/50',
    transparent: 'bg-transparent',
    yellow: 'bg-secondary',
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/browse-chat', label: 'Chat' },
    { href: '/browse-call', label: 'Call' },
    { href: '/live-sessions', label: 'Live' },
    { href: '/horoscope', label: 'Horoscope' },
    { href: '/kundli', label: 'Kundli' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        bgClass[variant]
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between">
          {/* Left section - Profile button with menu badge (mobile app style) */}
          <div className="flex items-center gap-4">
            {/* Profile button with hamburger menu badge */}
            <button
              onClick={openSidebar}
              className="relative group"
              aria-label="Open menu"
            >
              <div className="w-11 h-11 rounded-full bg-gray-200 border-2 border-primary/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 group-active:scale-95">
                {isLoggedIn && user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.name || 'User'}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              {/* Hamburger menu badge */}
              <div className="absolute -right-0.5 -bottom-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md">
                <Menu className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </div>
            </button>
          </div>

          {/* Center section - Logo */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center"
            style={{ paddingRight: '40px' }} // Slight offset like mobile app
          >
            <div className="relative h-[38px] w-[160px]">
              <Image
                src="/images/logo.png"
                alt="NakshatraTalks"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right section - Wallet + Notifications */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Wallet button - matching mobile app style */}
                <Link
                  href="/wallet"
                  className="flex items-center gap-1 h-[34px] px-3 rounded-full bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span className="text-sm font-lexend font-normal">
                    {formatWalletAmount(user?.walletBalance || 0)}
                  </span>
                </Link>

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-status-error" />
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop navigation - hidden on mobile */}
        <nav className="hidden lg:flex items-center justify-center gap-1 pb-2 -mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium font-lexend transition-all duration-200',
                pathname === link.href
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-background-offWhite hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search bar - styled like mobile app */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 pt-2">
        <div
          className={cn(
            'flex items-center justify-between h-[46px] rounded-full px-4 transition-all duration-200',
            'bg-white border shadow-sm',
            searchFocused
              ? 'border-secondary border-2 shadow-[0_4px_12px_rgba(255,207,13,0.15)]'
              : 'border-primary/80 shadow-[0_4px_8px_rgba(41,48,166,0.1)]'
          )}
        >
          <div className="flex items-center gap-2.5 flex-1">
            <Search
              className={cn(
                "w-5 h-5 transition-colors",
                searchFocused ? "text-secondary" : "text-primary"
              )}
            />
            <input
              type="text"
              placeholder="Search astrologers..."
              className="flex-1 text-sm font-nunito text-primary placeholder:text-primary/60 bg-transparent outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
          <button className="p-1 hover:opacity-70 transition-opacity">
            <SlidersHorizontal className="w-[18px] h-[18px] text-primary" />
          </button>
        </div>
      </div>

      {/* User menu dropdown (desktop) */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-4 top-16 w-48 rounded-xl bg-white shadow-modal z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-100">
                <p className="font-medium text-text-primary font-lexend truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-sm text-text-secondary font-lexend truncate">
                  {user?.phone}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-background-offWhite font-lexend"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/wallet"
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-background-offWhite font-lexend sm:hidden"
                  onClick={() => setShowUserMenu(false)}
                >
                  Wallet (₹{user?.walletBalance?.toFixed(0) || 0})
                </Link>
                <Link
                  href="/history/chat"
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-background-offWhite font-lexend"
                  onClick={() => setShowUserMenu(false)}
                >
                  Chat History
                </Link>
                <Link
                  href="/history/call"
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-background-offWhite font-lexend"
                  onClick={() => setShowUserMenu(false)}
                >
                  Call History
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-text-primary hover:bg-background-offWhite font-lexend"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-status-error hover:bg-background-offWhite font-lexend"
                  onClick={() => {
                    setShowUserMenu(false);
                    useAuthStore.getState().logout();
                  }}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
