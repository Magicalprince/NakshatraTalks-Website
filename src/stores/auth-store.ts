/**
 * Auth Store - Zustand store for authentication state
 * Handles user authentication, tokens, and user data
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AstrologerData } from '@/types/api.types';
import { apiClient, authEvents } from '@/lib/api/client';

interface AuthState {
  // State
  user: User | null;
  astrologer: AstrologerData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: 'user' | 'astrologer' | null;

  // Actions
  setUser: (user: User | null) => void;
  setAstrologer: (astrologer: AstrologerData | null) => void;
  setAuth: (data: {
    user: User;
    astrologer?: AstrologerData;
    accessToken: string;
    userType: 'user' | 'astrologer';
  }) => void;
  updateUser: (updates: Partial<User>) => void;
  updateAstrologer: (updates: Partial<AstrologerData>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Wallet
  updateWalletBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      astrologer: null,
      isAuthenticated: false,
      isLoading: true,
      userType: null,

      // Set user
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      // Set astrologer
      setAstrologer: (astrologer) => {
        set({ astrologer });
      },

      // Set auth after login
      setAuth: ({ user, astrologer, accessToken, userType }) => {
        apiClient.setAccessToken(accessToken);
        set({
          user,
          astrologer: astrologer || null,
          isAuthenticated: true,
          userType,
          isLoading: false,
        });
      },

      // Update user data
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      // Update astrologer data
      updateAstrologer: (updates) => {
        const currentAstrologer = get().astrologer;
        if (currentAstrologer) {
          set({ astrologer: { ...currentAstrologer, ...updates } });
        }
      },

      // Update wallet balance
      updateWalletBalance: (balance) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, walletBalance: balance } });
        }
      },

      // Logout
      logout: () => {
        apiClient.clearAccessToken();
        set({
          user: null,
          astrologer: null,
          isAuthenticated: false,
          userType: null,
          isLoading: false,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage for non-sensitive data
        // Access token is kept in memory only
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        // Only persist user data and userType, not tokens
        user: state.user,
        astrologer: state.astrologer,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Subscribe to auth events
if (typeof window !== 'undefined') {
  authEvents.on('logout_required', (reason) => {
    console.log('[AuthStore] Logout required:', reason);
    useAuthStore.getState().logout();
  });

  authEvents.on('session_invalid', (reason) => {
    console.log('[AuthStore] Session invalid:', reason);
    useAuthStore.getState().logout();
  });
}

// Export selectors for convenience
export const selectUser = (state: AuthState) => state.user;
export const selectAstrologer = (state: AuthState) => state.astrologer;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserType = (state: AuthState) => state.userType;
export const selectIsLoading = (state: AuthState) => state.isLoading;
