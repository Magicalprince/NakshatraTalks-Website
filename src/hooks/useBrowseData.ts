/**
 * Browse Data Hooks - React Query hooks for browse screens
 */

import { useEffect } from 'react';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { astrologerService, GetAstrologersParams } from '@/lib/services/astrologer.service';
import { AstrologerFilters, Astrologer } from '@/types/api.types';
import { supabaseRealtime, AstrologerStatusPayload } from '@/lib/services/supabase-realtime.service';

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

// ─── Real-Time Availability via Supabase Broadcast ───────────────────

/**
 * Helper to update an astrologer's availability status in React Query cache.
 * Used by the real-time hooks below.
 */
function updateAstrologerInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKeyPrefix: readonly string[],
  payload: AstrologerStatusPayload,
) {
  // Update all infinite query caches that match the prefix
  queryClient.setQueriesData<{
    pages: Array<{ data: Astrologer[] }>;
    pageParams: unknown[];
  }>(
    { queryKey: queryKeyPrefix },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((astrologer) => {
            if (astrologer.id === payload.astrologerId) {
              return {
                ...astrologer,
                isAvailable: payload.chatAvailable || payload.callAvailable,
                isOnline: payload.chatAvailable || payload.callAvailable,
                chatAvailable: payload.chatAvailable,
                callAvailable: payload.callAvailable,
              };
            }
            return astrologer;
          }),
        })),
      };
    }
  );
}

/**
 * Hook that subscribes to real-time chat astrologer availability changes.
 * When an astrologer toggles on/off on mobile → the browse-chat page updates instantly.
 */
export function useRealtimeChatAvailability() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = supabaseRealtime.subscribeToChatAvailability((payload) => {
      updateAstrologerInCache(
        queryClient,
        BROWSE_QUERY_KEYS.chatAstrologers,
        payload,
      );
    });
    return unsub;
  }, [queryClient]);
}

/**
 * Hook that subscribes to real-time call astrologer availability changes.
 * When an astrologer toggles on/off on mobile → the browse-call page updates instantly.
 */
export function useRealtimeCallAvailability() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = supabaseRealtime.subscribeToCallAvailability((payload) => {
      updateAstrologerInCache(
        queryClient,
        BROWSE_QUERY_KEYS.callAstrologers,
        payload,
      );
    });
    return unsub;
  }, [queryClient]);
}
