'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AstrologerWebNavbar } from '@/components/layout/AstrologerWebNavbar';
import { AstrologerMobileMenu } from '@/components/layout/AstrologerMobileMenu';
import { WebFooter } from '@/components/layout/WebFooter';
import { ToastContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useHeartbeat } from '@/hooks/useAstrologerDashboard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AstrologerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, userType, isHydrated } = useAuthStore();

  // Send heartbeat to maintain online status
  useHeartbeat(isAuthenticated && userType === 'astrologer');

  // Redirect if not authenticated or not an astrologer
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || userType !== 'astrologer')) {
      router.push('/login');
    }
  }, [isAuthenticated, userType, isHydrated, router]);

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
  if (!isAuthenticated || userType !== 'astrologer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-offWhite flex flex-col">
      <AstrologerWebNavbar />
      <AstrologerMobileMenu />

      <main className="flex-1">
        {children}
      </main>

      <WebFooter />
      <ToastContainer />
    </div>
  );
}
