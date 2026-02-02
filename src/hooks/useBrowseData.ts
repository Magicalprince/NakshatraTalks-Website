/**
 * Browse Data Hooks - React Query hooks for browse screens
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { astrologerService, GetAstrologersParams } from '@/lib/services/astrologer.service';
import { AstrologerFilters } from '@/types/api.types';

// Query keys
export const BROWSE_QUERY_KEYS = {
  astrologers: ['astrologers'] as const,
  chatAstrologers: ['astrologers', 'chat'] as const,
  callAstrologers: ['astrologers', 'call'] as const,
  topRated: ['astrologers', 'top-rated'] as const,
  filters: ['astrologers', 'filters'] as const,
  search: (query: string) => ['astrologers', 'search', query] as const,
  detail: (id: string) => ['astrologers', 'detail', id] as const,
  reviews: (id: string) => ['astrologers', 'reviews', id] as const,
  availability: (id: string) => ['astrologers', 'availability', id] as const,
};

/**
 * Hook for fetching chat astrologers with infinite scroll
 */
export function useChatAstrologers(
  filters?: AstrologerFilters,
  sortBy?: GetAstrologersParams['sortBy'],
  sortOrder?: GetAstrologersParams['sortOrder']
) {
  return useInfiniteQuery({
    queryKey: [...BROWSE_QUERY_KEYS.chatAstrologers, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await astrologerService.getChatAstrologers({
        page: pageParam,
        limit: 20,
        filters,
        sortBy,
        sortOrder,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook for fetching call astrologers with infinite scroll
 */
export function useCallAstrologers(
  filters?: AstrologerFilters,
  sortBy?: GetAstrologersParams['sortBy'],
  sortOrder?: GetAstrologersParams['sortOrder']
) {
  return useInfiniteQuery({
    queryKey: [...BROWSE_QUERY_KEYS.callAstrologers, filters, sortBy, sortOrder],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await astrologerService.getCallAstrologers({
        page: pageParam,
        limit: 20,
        filters,
        sortBy,
        sortOrder,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook for fetching top rated astrologers
 */
export function useTopRatedAstrologers(limit: number = 10) {
  return useQuery({
    queryKey: [...BROWSE_QUERY_KEYS.topRated, limit],
    queryFn: async () => {
      const response = await astrologerService.getTopRatedAstrologers(limit);
      return response.data;
    },
  });
}

/**
 * Hook for fetching filter options
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: BROWSE_QUERY_KEYS.filters,
    queryFn: async () => {
      const response = await astrologerService.getFilterOptions();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for searching astrologers
 */
export function useSearchAstrologers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: BROWSE_QUERY_KEYS.search(query),
    queryFn: async () => {
      const response = await astrologerService.searchAstrologers(query);
      return response.data;
    },
    enabled: enabled && query.length >= 2,
  });
}

/**
 * Hook for fetching single astrologer details
 */
export function useAstrologerDetails(id: string) {
  return useQuery({
    queryKey: BROWSE_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await astrologerService.getAstrologerById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook for fetching astrologer reviews with infinite scroll
 */
export function useAstrologerReviews(id: string) {
  return useInfiniteQuery({
    queryKey: BROWSE_QUERY_KEYS.reviews(id),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await astrologerService.getAstrologerReviews(id, pageParam);
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!id,
  });
}

/**
 * Hook for fetching astrologer availability
 */
export function useAstrologerAvailability(id: string, date?: string) {
  return useQuery({
    queryKey: [...BROWSE_QUERY_KEYS.availability(id), date],
    queryFn: async () => {
      const response = await astrologerService.getAstrologerAvailability(id, date);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
