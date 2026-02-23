'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WebNavbar } from '@/components/layout/WebNavbar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { WebFooter } from '@/components/layout/WebFooter';
import { ToastContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, isHydrated } = useAuthStore();

  // Redirect astrologers away from user-side pages to their dashboard
  useEffect(() => {
    if (isHydrated && isAuthenticated && userType === 'astrologer') {
      // Allow astrologers to access public pages like horoscope, kundli, etc.
      const publicPaths = ['/horoscope', '/kundli', '/privacy', '/terms', '/refund', '/support'];
      const isPublicPage = publicPaths.some((p) => pathname.startsWith(p));

      if (!isPublicPage) {
        router.replace('/astrologer/dashboard');
      }
    }
  }, [isHydrated, isAuthenticated, userType, pathname, router]);

  return (
    <div className="min-h-screen bg-background-offWhite flex flex-col">
      <WebNavbar />
      <MobileMenu />

      <main className="flex-1">
        {children}
      </main>

      <WebFooter />
      <ToastContainer />
    </div>
  );
}
