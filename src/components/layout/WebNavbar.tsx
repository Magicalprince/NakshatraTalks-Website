'use client';

import { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Wallet,
  History,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui';

const formatWalletAmount = (amount: number): string => {
  if (amount <= 9999) return amount.toFixed(0);
  if (amount < 100000) return `${(amount / 1000).toFixed(amount % 1000 >= 100 ? 1 : 0)}K`;
  if (amount < 10000000) return `${(amount / 100000).toFixed(amount % 100000 >= 10000 ? 1 : 0)}L`;
  return `${(amount / 10000000).toFixed(amount % 10000000 >= 1000000 ? 1 : 0)}Cr`;
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse-chat', label: 'Chat' },
  { href: '/browse-call', label: 'Call' },
  { href: '/live-sessions', label: 'Live' },
  { href: '/horoscope', label: 'Horoscope' },
  { href: '/kundli', label: 'Kundli' },
];

export function WebNavbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const { openSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = isHydrated && isAuthenticated;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Glassmorphism scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Ctrl+K keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-web-md border-b border-gray-200/50'
          : 'bg-white border-b border-gray-200'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 hover:scale-105 transition-transform">
            <div className="relative h-8 w-8">
              <Image
                src="/images/logo.png"
                alt="NakshatraTalks"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-semibold text-primary font-lexend hidden sm:block">
              NakshatraTalks
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium font-lexend transition-colors relative',
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-offWhite rounded-lg transition-colors"
              aria-label="Search"
            >
              {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {isLoggedIn ? (
              <>
                {/* Wallet */}
                <Link
                  href="/wallet"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium font-lexend text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span>{formatWalletAmount(user?.walletBalance || 0)}</span>
                </Link>

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-background-offWhite rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-error opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-error" />
                  </span>
                </Link>

                {/* User Menu */}
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-offWhite transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name || 'User'}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-text-muted transition-transform',
                        showUserMenu && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-web-lg border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
                          <p className="font-medium text-text-primary font-lexend truncate text-sm">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-text-secondary font-lexend truncate">
                            {user?.phone}
                          </p>
                        </div>
                        <div className="py-1">
                          {[
                            { href: '/profile', label: 'My Profile', icon: User },
                            { href: '/wallet', label: 'Wallet', icon: Wallet },
                            { href: '/history/chat', label: 'History', icon: History },
                            { href: '/settings', label: 'Settings', icon: Settings },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-background-offWhite font-lexend transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <item.icon className="h-4 w-4 text-text-muted" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-status-error/5 font-lexend transition-colors"
                            onClick={() => {
                              setShowUserMenu(false);
                              logout();
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={openSidebar}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-background-offWhite rounded-lg hover:rotate-90 transition-transform duration-200"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search astrologers, services..."
                  className="w-full h-10 pl-10 pr-20 rounded-lg border border-gray-200 text-sm font-lexend text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-text-muted font-lexend">
                  Ctrl+K
                </kbd>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
