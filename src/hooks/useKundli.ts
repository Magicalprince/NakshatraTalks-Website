/**
 * Kundli Hook - React Query hooks for kundli and matching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kundliService } from '@/lib/services/kundli.service';
import { shouldUseMockData } from '@/lib/mock';
import { KundliInput, MatchingInput, Kundli, MatchingReport } from '@/types/api.types';
import { useAuthStore } from '@/stores/auth-store';

// Mock data for development
const MOCK_KUNDLIS: Kundli[] = [
  {
    id: 'kundli-1',
    userId: 'user-1',
    name: 'Rahul Kumar',
    dateOfBirth: '1990-05-15',
    timeOfBirth: '10:30',
    placeOfBirth: 'Mumbai, Maharashtra',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'kundli-2',
    userId: 'user-1',
    name: 'Priya Sharma',
    dateOfBirth: '1992-08-22',
    timeOfBirth: '14:45',
    placeOfBirth: 'Delhi, India',
    createdAt: '2024-01-10T08:30:00.000Z',
  },
  {
    id: 'kundli-3',
    userId: 'user-1',
    name: 'Amit Singh',
    dateOfBirth: '1988-12-03',
    timeOfBirth: '06:15',
    placeOfBirth: 'Bangalore, Karnataka',
    createdAt: '2024-01-05T15:20:00.000Z',
  },
];

// Mock matching data for development
const MOCK_MATCHINGS: (MatchingReport & { boy: { name: string }; girl: { name: string } })[] = [
  {
    id: 'matching-1',
    totalPoints: 28,
    maxPoints: 36,
    percentage: 78,
    categories: {},
    recommendation: 'Good match with minor adjustments needed.',
    createdAt: '2024-01-15T10:00:00.000Z',
    boy: { name: 'Rahul Kumar' },
    girl: { name: 'Priya Sharma' },
  },
  {
    id: 'matching-2',
    totalPoints: 32,
    maxPoints: 36,
    percentage: 89,
    categories: {},
    recommendation: 'Excellent match! Highly compatible.',
    createdAt: '2024-01-10T08:30:00.000Z',
    boy: { name: 'Amit Singh' },
    girl: { name: 'Neha Patel' },
  },
];

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
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_KUNDLIS;
      }
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
    mutationFn: async (data: KundliInput) => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return {
          success: true,
          data: {
            id: `kundli-${Date.now()}`,
            userId: 'user-1',
            name: data.name,
            dateOfBirth: data.dateOfBirth,
            timeOfBirth: data.timeOfBirth,
            placeOfBirth: data.placeOfBirth,
            createdAt: new Date().toISOString(),
          } as Kundli,
          message: 'Success',
        };
      }
      return kundliService.generateKundli(data);
    },
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
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_MATCHINGS;
      }
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
    mutationFn: async (data: MatchingInput) => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const boyName = data.boyDetails?.name || 'Boy';
        const girlName = data.girlDetails?.name || 'Girl';
        return {
          success: true,
          data: {
            id: `matching-${Date.now()}`,
            totalPoints: 26,
            maxPoints: 36,
            percentage: 72,
            categories: {},
            recommendation: 'Good match with some areas of compatibility.',
            createdAt: new Date().toISOString(),
            boy: { name: boyName },
            girl: { name: girlName },
          } as MatchingReport,
          message: 'Success',
        };
      }
      return kundliService.generateMatching(data);
    },
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
