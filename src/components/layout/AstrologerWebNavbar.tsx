'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

const navLinks = [
  { href: '/astrologer/dashboard', label: 'Dashboard' },
  { href: '/astrologer/history', label: 'History' },
  { href: '/astrologer/live', label: 'Go Live' },
  { href: '/astrologer/earnings', label: 'Earnings' },
];

export function AstrologerWebNavbar() {
  const pathname = usePathname();
  const { astrologer, logout } = useAuthStore();
  const { openSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === '/astrologer/dashboard') {
      return pathname === '/astrologer/dashboard' || pathname === '/astrologer';
    }
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
        <div className="flex h-20 items-center justify-between">
          {/* Left: Logo */}
          <Link
            href="/astrologer/dashboard"
            className="flex items-center gap-2.5 flex-shrink-0 hover:scale-105 transition-transform"
          >
            <div className="relative h-28 w-28">
              <Image
                src="/images/logo.png"
                alt="NakshatraTalks"
                fill
                className="object-contain"
                priority
              />
            </div>
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
                    layoutId="astroNavUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* User Menu (Desktop) */}
            <div className="relative hidden sm:block" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-offWhite transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {astrologer?.image ? (
                    <Image
                      src={astrologer.image}
                      alt={astrologer.name || 'Astrologer'}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium text-text-primary font-lexend hidden md:block max-w-[120px] truncate">
                  {astrologer?.name || 'Astrologer'}
                </span>
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
                        {astrologer?.name || 'Astrologer'}
                      </p>
                      <p className="text-xs text-text-secondary font-lexend truncate">
                        {astrologer?.phone}
                      </p>
                    </div>
                    <div className="py-1">
                      {[
                        { href: '/astrologer/profile', label: 'My Profile', icon: User },
                        { href: '/astrologer/settings', label: 'Settings', icon: Settings },
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
    </header>
  );
}
