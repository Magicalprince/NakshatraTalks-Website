'use client';

/**
 * useRequireAuth Hook
 * Use this in protected pages to redirect unauthenticated users to login.
 *
 * IMPORTANT: This hook assumes AuthProvider has already waited for hydration.
 * The AuthProvider renders nothing until isHydrated is true, so by the time
 * any component using this hook renders, hydration is already complete.
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

interface UseRequireAuthOptions {
  redirectTo?: string;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = '/login' } = options;
  const router = useRouter();
  const pathname = usePathname();

  // Get auth state - by the time this runs, hydration is complete
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Redirect if not authenticated
    // isHydrated should always be true here because AuthProvider blocks until hydration
    if (isHydrated && !isAuthenticated) {
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isHydrated, isAuthenticated, redirectTo, router, pathname]);

  return {
    isAuthenticated,
    isHydrated,
    user,
    // Since AuthProvider blocks until hydrated, isReady just means authenticated
    isReady: isAuthenticated,
    // isLoading should be false since AuthProvider already waited
    isLoading: !isHydrated,
  };
}

/**
 * useOptionalAuth Hook
 * For pages where auth is optional - just provides auth state without redirecting.
 */
export function useOptionalAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  return {
    isAuthenticated,
    isHydrated,
    user,
    isReady: isHydrated,
  };
}
