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
  Wallet,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Avatar } from '@/components/ui';
import { Button } from '@/components/ui';

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'yellow';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { openSidebar } = useUIStore();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const bgClass = {
    default: 'bg-white shadow-sm',
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
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo and menu */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={openSidebar}
              className="lg:hidden rounded-full p-2 text-text-primary hover:bg-background-offWhite transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-10">
                <Image
                  src="/images/logo.png"
                  alt="NakshatraTalks"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:block text-xl font-semibold text-primary font-lexend">
                NakshatraTalks
              </span>
            </Link>
          </div>

          {/* Center section - Navigation (desktop only) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium font-lexend transition-colors',
                  pathname === link.href
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-background-offWhite hover:text-text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="rounded-full p-2 text-text-primary hover:bg-background-offWhite transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  className="relative rounded-full p-2 text-text-primary hover:bg-background-offWhite transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-error" />
                </button>

                {/* Wallet */}
                <Link
                  href="/wallet"
                  className="hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-secondary-dark transition-colors font-lexend"
                >
                  <Wallet className="h-4 w-4" />
                  <span>₹{user?.walletBalance?.toFixed(0) || 0}</span>
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-full p-1 hover:bg-background-offWhite transition-colors"
                  >
                    <Avatar
                      src={user?.profileImage}
                      alt={user?.name || 'User'}
                      fallback={user?.name || undefined}
                      size="sm"
                      bordered
                    />
                    <ChevronDown className="hidden sm:block h-4 w-4 text-text-secondary" />
                  </button>

                  {/* Dropdown menu */}
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
                          className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-modal z-50 overflow-hidden"
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
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search astrologers, specializations..."
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-gray-200 text-base font-lexend focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
