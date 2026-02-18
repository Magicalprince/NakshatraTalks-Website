/**
 * Auth Store - Zustand store for authentication state
 * Handles user authentication, tokens, and user data
 *
 * IMPORTANT: This store uses Zustand persist middleware.
 * The `isHydrated` flag indicates when localStorage data has been loaded.
 * Always check `isHydrated` before making auth decisions.
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
  isHydrated: boolean;
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
  _setHydrated: () => void;

  // Wallet
  updateWalletBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state - isHydrated starts false
      user: null,
      astrologer: null,
      isAuthenticated: false,
      isHydrated: false,
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
        });
      },

      // Internal: Set hydrated state (called by persist middleware)
      _setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'nakshatratalks-auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // SSR fallback
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        astrologer: state.astrologer,
        userType: state.userType,
        isAuthenticated: state.isAuthenticated,
      }),
      // Called when rehydration is complete
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setHydrated();
          if (process.env.NODE_ENV === 'development') {
            console.log('[AuthStore] Rehydrated:', {
              isAuthenticated: state.isAuthenticated,
              userName: state.user?.name,
            });
          }
        }
      },
    }
  )
);

// Subscribe to auth events (client-side only)
if (typeof window !== 'undefined') {
  authEvents.on('logout_required', (reason) => {
    if (process.env.NODE_ENV === 'development') console.log('[AuthStore] Logout required:', reason);
    useAuthStore.getState().logout();
  });

  authEvents.on('session_invalid', (reason) => {
    if (process.env.NODE_ENV === 'development') console.log('[AuthStore] Session invalid:', reason);
    useAuthStore.getState().logout();
  });
}

// Export selectors for convenience
export const selectUser = (state: AuthState) => state.user;
export const selectAstrologer = (state: AuthState) => state.astrologer;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUserType = (state: AuthState) => state.userType;
export const selectIsHydrated = (state: AuthState) => state.isHydrated;
