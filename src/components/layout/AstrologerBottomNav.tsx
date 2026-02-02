'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { LayoutDashboard, MessageSquare, Phone, Wallet, User } from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Home', href: '/astrologer/dashboard' },
  { icon: MessageSquare, label: 'Chat', href: '/astrologer/chat' },
  { icon: Phone, label: 'Call', href: '/astrologer/call' },
  { icon: Wallet, label: 'Earnings', href: '/astrologer/earnings' },
  { icon: User, label: 'Profile', href: '/astrologer/profile' },
];

export function AstrologerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-text-muted'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
