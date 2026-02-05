'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AstrologerSidebar } from '@/components/layout/AstrologerSidebar';
import { AstrologerBottomNav } from '@/components/layout/AstrologerBottomNav';
import { useAuthStore } from '@/stores/auth-store';
import { useHeartbeat } from '@/hooks/useAstrologerDashboard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AstrologerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  // Send heartbeat to maintain online status
  useHeartbeat(isAuthenticated && user?.role === 'astrologer');

  // Redirect if not authenticated or not an astrologer
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || user?.role !== 'astrologer')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isHydrated, router]);

  // Loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthenticated || user?.role !== 'astrologer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Sidebar (Desktop) */}
      <AstrologerSidebar />

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <AstrologerBottomNav />
    </div>
  );
}
