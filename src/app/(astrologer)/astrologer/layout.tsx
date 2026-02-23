'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AstrologerWebNavbar } from '@/components/layout/AstrologerWebNavbar';
import { AstrologerMobileMenu } from '@/components/layout/AstrologerMobileMenu';
import { WebFooter } from '@/components/layout/WebFooter';
import { ToastContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useHeartbeat } from '@/hooks/useAstrologerDashboard';
import { Skeleton } from '@/components/ui/Skeleton';

// Pages that are allowed for non-approved astrologers (status pages)
const STATUS_PAGES = ['/astrologer/pending', '/astrologer/rejected', '/astrologer/inactive'];

export default function AstrologerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, astrologer, isHydrated } = useAuthStore();

  // Send heartbeat to maintain online status (only for approved astrologers)
  useHeartbeat(isAuthenticated && userType === 'astrologer' && astrologer?.status === 'approved');

  // Redirect if not authenticated or not an astrologer
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || userType !== 'astrologer')) {
      router.push('/login');
    }
  }, [isAuthenticated, userType, isHydrated, router]);

  // Enforce status-based routing: non-approved astrologers can only access their status page
  useEffect(() => {
    if (!isHydrated || !isAuthenticated || userType !== 'astrologer') return;

    const status = astrologer?.status;
    const isStatusPage = STATUS_PAGES.some((p) => pathname === p);

    if (status === 'pending' && !isStatusPage) {
      router.replace('/astrologer/pending');
    } else if (status === 'rejected' && !isStatusPage) {
      router.replace('/astrologer/rejected');
    } else if (status === 'inactive' && !isStatusPage) {
      router.replace('/astrologer/inactive');
    } else if (status === 'approved' && isStatusPage) {
      // Approved astrologer landed on a status page — redirect to dashboard
      router.replace('/astrologer/dashboard');
    }
  }, [isHydrated, isAuthenticated, userType, astrologer?.status, pathname, router]);

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
