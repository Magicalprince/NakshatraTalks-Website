'use client';

/**
 * BottomNavBar Component
 * Design: Premium Glassmorphic Dock with "Spotlight" Active State
 *
 * Features:
 * - Frosted Glass Background (backdrop-blur)
 * - Optical Spacing (Justify Space Between)
 * - "Spotlight" Active Indicator (Yellow Circle expands behind icon)
 * - Subtle Blue Border for Definition
 * - INSTANT tab switching (50ms indicator animation)
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Phone,
  Video,
  UserCircle2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/stores/auth-store';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: MessageSquare, label: 'Chat', href: '/browse-chat' },
  { icon: Video, label: 'Live', href: '/live-sessions' },
  { icon: Phone, label: 'Call', href: '/browse-call' },
  { icon: UserCircle2, label: 'Profile', href: '/profile' },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuthStore();

  // Don't show bottom nav on certain pages
  const hiddenPaths = ['/login', '/verify-otp', '/chat/', '/call/'];
  const shouldHide = hiddenPaths.some(path => pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex justify-center pb-6 px-4">
      {/* Glassmorphic Dock Container */}
      <div
        className="relative w-[92%] max-w-[450px] h-[68px] rounded-full overflow-hidden"
        style={{
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Glassmorphism background */}
        <div
          className="absolute inset-0 backdrop-blur-xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            borderWidth: '1.2px',
            borderStyle: 'solid',
            borderColor: 'rgba(41, 48, 166, 0.15)',
            borderRadius: '34px',
          }}
        />

        {/* Navigation Items */}
        <div className="relative flex items-center justify-between h-full px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            // For profile, only redirect to login if hydrated AND not authenticated
            // If not hydrated yet, always use the original href (profile page will handle auth)
            const href = item.href === '/profile' && isHydrated && !isAuthenticated
              ? '/login'
              : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className="flex-1 flex items-center justify-center h-full"
              >
                <motion.div
                  className="relative w-12 h-12 flex items-center justify-center"
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Yellow Spotlight Background Circle */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute w-11 h-11 rounded-full bg-secondary"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.05 }}
                        layoutId="navSpotlight"
                      />
                    )}
                  </AnimatePresence>

                  {/* Icon */}
                  <motion.div
                    animate={{
                      y: isActive ? -1 : 0,
                      opacity: isActive ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.05 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6 transition-colors',
                        isActive ? 'text-[#1A1A1A]' : 'text-[#555555]'
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </motion.div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
