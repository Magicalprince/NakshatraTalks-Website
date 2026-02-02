'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  MessageCircle,
  Phone,
  Radio,
  User,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: MessageCircle, label: 'Chat', href: '/browse-chat' },
  { icon: Radio, label: 'Live', href: '/live-sessions', highlight: true },
  { icon: Phone, label: 'Call', href: '/browse-call' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Don't show bottom nav on certain pages
  const hiddenPaths = ['/login', '/verify-otp', '/chat/', '/call/'];
  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-lg border-t border-gray-100" />

      <div className="relative flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          // For profile, redirect to login if not authenticated
          const href = item.href === '/profile' && !isAuthenticated
            ? '/login'
            : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className="relative flex flex-col items-center justify-center min-w-[60px] py-1"
            >
              {/* Highlight circle for Live button */}
              {item.highlight ? (
                <motion.div
                  className={cn(
                    'relative flex items-center justify-center w-12 h-12 rounded-full -mt-4 shadow-lg',
                    isActive ? 'bg-primary' : 'bg-secondary'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      isActive ? 'text-white' : 'text-text-primary'
                    )}
                  />
                  {/* Live indicator pulse */}
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-status-error animate-pulse" />
                </motion.div>
              ) : (
                <motion.div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                    isActive ? 'bg-primary/10' : ''
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-primary' : 'text-text-muted'
                    )}
                  />
                </motion.div>
              )}

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium font-lexend mt-0.5 transition-colors',
                  item.highlight
                    ? isActive ? 'text-primary' : 'text-text-primary'
                    : isActive ? 'text-primary' : 'text-text-muted'
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && !item.highlight && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
