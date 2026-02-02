'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  MessageSquare,
  Phone,
  Wallet,
  User,
  Settings,
  Radio,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/astrologer/dashboard' },
  { icon: MessageSquare, label: 'Chat Sessions', href: '/astrologer/chat' },
  { icon: Phone, label: 'Call Sessions', href: '/astrologer/call' },
  { icon: Users, label: 'Waitlist', href: '/astrologer/waitlist' },
  { icon: Radio, label: 'Go Live', href: '/astrologer/live' },
  { icon: Wallet, label: 'Earnings', href: '/astrologer/earnings' },
  { icon: User, label: 'Profile', href: '/astrologer/profile' },
  { icon: Settings, label: 'Settings', href: '/astrologer/settings' },
];

export function AstrologerSidebar() {
  const pathname = usePathname();
  const { logout, astrologer } = useAuthStore();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b px-4">
        <Link href="/astrologer/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">NakshatraTalks</span>
        </Link>
      </div>

      {/* Astrologer Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {astrologer?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {astrologer?.name || 'Astrologer'}
            </p>
            <p className="text-xs text-text-muted">Astrologer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-status-error hover:bg-status-error/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
