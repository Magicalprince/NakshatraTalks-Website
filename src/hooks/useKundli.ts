/**
 * Kundli Hook - React Query hooks for kundli and matching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kundliService } from '@/lib/services/kundli.service';
import { KundliInput, MatchingInput } from '@/types/api.types';
import { useAuthStore } from '@/stores/auth-store';

// Query keys
export const KUNDLI_QUERY_KEYS = {
  list: ['kundli', 'list'] as const,
  detail: (id: string) => ['kundli', 'detail', id] as const,
  report: (id: string) => ['kundli', 'report', id] as const,
  matchingList: ['matching', 'list'] as const,
  matchingDetail: (id: string) => ['matching', 'detail', id] as const,
  matchingReport: (id: string) => ['matching', 'report', id] as const,
};

/**
 * Hook for fetching user's kundli list
 */
export function useKundliList() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: KUNDLI_QUERY_KEYS.list,
    queryFn: async () => {
      const response = await kundliService.getKundliList();
      return response.data || [];
    },
    enabled: isAuthenticated,
  });
}

/**
 * Hook for fetching single kundli
 */
export function useKundli(kundliId: string) {
  return useQuery({
    queryKey: KUNDLI_QUERY_KEYS.detail(kundliId),
    queryFn: async () => {
      const response = await kundliService.getKundliById(kundliId);
      return response.data;
    },
    enabled: !!kundliId,
  });
}

/**
 * Hook for fetching kundli report
 */
export function useKundliReport(kundliId: string) {
  return useQuery({
    queryKey: KUNDLI_QUERY_KEYS.report(kundliId),
    queryFn: async () => {
      const response = await kundliService.getKundliReport(kundliId);
      return response.data;
    },
    enabled: !!kundliId,
  });
}

/**
 * Hook for generating kundli
 */
export function useGenerateKundli() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KundliInput) => kundliService.generateKundli(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNDLI_QUERY_KEYS.list });
    },
  });
}

/**
 * Hook for updating kundli
 */
export function useUpdateKundli(kundliId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<KundliInput>) =>
      kundliService.updateKundli(kundliId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNDLI_QUERY_KEYS.detail(kundliId) });
      queryClient.invalidateQueries({ queryKey: KUNDLI_QUERY_KEYS.list });
    },
  });
}

/**
 * Hook for deleting kundli
 */
export function useDeleteKundli() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (kundliId: string) => kundliService.deleteKundli(kundliId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNDLI_QUERY_KEYS.list });
    },
  });
}

/**
 * Hook for fetching matching list
 */
export function useMatchingList() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: KUNDLI_QUERY_KEYS.matchingList,
    queryFn: async () => {
      const response = await kundliService.getMatchingList();
      return response.data || [];
    },
    enabled: isAuthenticated,
  });
}

/**
 * Hook for fetching matching report
 */
export function useMatchingReport(matchingId: string) {
  return useQuery({
    queryKey: KUNDLI_QUERY_KEYS.matchingReport(matchingId),
    queryFn: async () => {
      const response = await kundliService.getMatchingReport(matchingId);
      return response.data;
    },
    enabled: !!matchingId,
  });
}

/**
 * Hook for generating matching report
 */
export function useGenerateMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MatchingInput) => kundliService.generateMatching(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNDLI_QUERY_KEYS.matchingList });
    },
  });
}

/**
 * Hook for deleting matching
 */
export function useDeleteMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchingId: string) => kundliService.deleteMatching(matchingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNDLI_QUERY_KEYS.matchingList });
    },
  });
}
