'use client';

/**
 * AuthProvider Component
 * Waits for Zustand persist middleware to rehydrate from localStorage.
 * Renders nothing until hydration is complete to prevent flash of wrong content.
 */

import { useAuthStore } from '@/stores/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Subscribe to isHydrated from the store
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Don't render until hydration is complete
  // The store's onRehydrateStorage callback sets isHydrated to true
  if (!isHydrated) {
    // Return a minimal loading state or null
    return null;
  }

  return <>{children}</>;
}
