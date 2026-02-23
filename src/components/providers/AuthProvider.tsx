'use client';

/**
 * AuthProvider - Production-Ready Auth Session Management
 *
 * On hydration:
 * 1. Waits for Zustand to rehydrate from localStorage
 * 2. If user was previously authenticated, attempts to restore session
 *    by refreshing the access token via httpOnly cookie
 * 3. If refresh fails, logs the user out cleanly
 *
 * Also connects/disconnects Socket.io based on auth state.
 */

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { authService } from '@/lib/services/auth.service';
import { socketService } from '@/lib/services/socket.service';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useAuthStore((s) => s.updateUser);
  const updateAstrologer = useAuthStore((s) => s.updateAstrologer);
  const logout = useAuthStore((s) => s.logout);
  const [isReady, setIsReady] = useState(false);
  const hasRestored = useRef(false);

  // Restore session on hydration
  useEffect(() => {
    if (!isHydrated || hasRestored.current) return;
    hasRestored.current = true;

    async function restoreSession() {
      if (!isAuthenticated) {
        setIsReady(true);
        return;
      }

      // User was previously logged in — try to refresh the access token
      try {
        const refreshResponse = await authService.refresh();
        if (refreshResponse.success && refreshResponse.data?.access_token) {
          apiClient.setAccessToken(refreshResponse.data.access_token);

          // Fetch fresh user data
          try {
            const meResponse = await authService.getMe();
            if (meResponse.success && meResponse.data?.user) {
              updateUser(meResponse.data.user);
              if (meResponse.data.astrologer) {
                updateAstrologer(meResponse.data.astrologer);
              }
            }
          } catch {
            // Non-critical — user data is already in store from last session
          }
        } else {
          // Refresh token expired or invalid — clean logout
          logout();
        }
      } catch {
        // Network error or server down — keep user logged in with stale data
        // They'll get a 401 on the first API call which triggers token refresh
      }

      setIsReady(true);
    }

    restoreSession();
  }, [isHydrated, isAuthenticated, updateUser, updateAstrologer, logout]);

  // Connect/disconnect Socket.io based on auth
  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isReady, isAuthenticated]);

  // Don't render until hydrated and session restored
  if (!isHydrated || !isReady) {
    return null;
  }

  return <>{children}</>;
}
