/**
 * User Profile Hook - React Query hooks for user profile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services/user.service';
import { UpdateProfileData } from '@/types/api.types';
import { useAuthStore } from '@/stores/auth-store';

// Query keys
export const USER_QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  appState: ['user', 'app-state'] as const,
};

/**
 * Hook for fetching user profile
 */
export function useUserProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: USER_QUERY_KEYS.profile,
    queryFn: async () => {
      const response = await userService.getProfile();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: (response) => {
      // Update cache with new profile data
      if (response.data) {
        queryClient.setQueryData(USER_QUERY_KEYS.profile, response.data);
      }
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
    },
  });
}

/**
 * Hook for uploading profile image
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userService.uploadProfileImage(file),
    onSuccess: () => {
      // Invalidate profile to refetch with new image
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.profile });
    },
  });
}

/**
 * Hook for deleting account
 */
export function useDeleteAccount() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      // Logout user after account deletion
      logout();
    },
  });
}

/**
 * Hook for fetching app state
 */
export function useAppState() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: USER_QUERY_KEYS.appState,
    queryFn: async () => {
      const response = await userService.getAppState();
      return response.data;
    },
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
  });
}
