/**
 * Browse Data Hooks - React Query hooks for browse screens
 *
 * Matches mobile app's architecture for cross-device compatibility:
 * - Periodic refetch (30s) as fallback when Supabase Broadcast is delayed
 * - Real-time add/remove/update of astrologers via Supabase Broadcast
 * - Type-aware cache updates (chat vs call availability)
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

// Periodic refetch interval — ensures list stays fresh even if Supabase
// Broadcast is delayed or the subscription silently drops.
const BROWSE_REFETCH_INTERVAL_MS = 30_000;

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
    refetchInterval: BROWSE_REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
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
    refetchInterval: BROWSE_REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
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
 * Type of the infinite query cache structure used by React Query.
 */
type InfiniteAstrologerCache = {
  pages: Array<{ data: Astrologer[]; page: number; totalPages: number; totalItems: number; hasNext: boolean; hasPrev: boolean }>;
  pageParams: unknown[];
};

/**
 * Update, add, or remove an astrologer in the React Query infinite cache
 * based on a real-time availability broadcast.
 *
 * Matches mobile app behaviour (useBrowseChatData.ts:235-285):
 * - Astrologer exists + went offline for this type → update status in-place
 * - Astrologer exists + came online → update status in-place
 * - Astrologer NOT in cache + came online → add to the first page
 *   so the user sees them immediately without waiting for refetch
 *
 * @param queryClient  - React Query client
 * @param queryKeyPrefix - e.g. BROWSE_QUERY_KEYS.chatAstrologers
 * @param payload - Supabase broadcast payload
 * @param isAvailableForType - whether the astrologer is available for THIS page type
 */
function updateAstrologerInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKeyPrefix: readonly string[],
  payload: AstrologerStatusPayload,
  isAvailableForType: boolean,
) {
  queryClient.setQueriesData<InfiniteAstrologerCache>(
    { queryKey: queryKeyPrefix },
    (old) => {
      if (!old?.pages?.length) return old;

      // Check if the astrologer already exists in any page
      let found = false;
      const updatedPages = old.pages.map((page) => {
        // Guard: some pages may be null/undefined or lack a data array
        if (!page?.data) return page;

        return {
          ...page,
          data: page.data.map((astrologer) => {
            if (astrologer.id === payload.astrologerId) {
              found = true;
              return {
                ...astrologer,
                isAvailable: isAvailableForType,
                isOnline: isAvailableForType,
                chatAvailable: payload.chatAvailable,
                callAvailable: payload.callAvailable,
                ...(payload.name && { name: payload.name }),
                ...(payload.profileImage && { profileImage: payload.profileImage, image: payload.profileImage }),
                ...(payload.rating !== undefined && { rating: payload.rating }),
                ...(payload.pricePerMinute !== undefined && { pricePerMinute: payload.pricePerMinute }),
                ...(payload.chatPricePerMinute !== undefined && { chatPricePerMinute: payload.chatPricePerMinute, chatPrice: payload.chatPricePerMinute }),
                ...(payload.callPricePerMinute !== undefined && { callPricePerMinute: payload.callPricePerMinute, callPrice: payload.callPricePerMinute }),
              };
            }
            return astrologer;
          }),
        };
      });

      // If astrologer was not in cache and came online, add to first page
      // so the user sees them immediately (matches mobile app behaviour)
      if (!found && isAvailableForType && payload.name && updatedPages[0]?.data) {
        const newAstrologer: Partial<Astrologer> & { id: string; name: string; isAvailable: boolean } = {
          id: payload.astrologerId,
          name: payload.name,
          isAvailable: true,
          isOnline: true,
          chatAvailable: payload.chatAvailable,
          callAvailable: payload.callAvailable,
          image: payload.profileImage || '',
          profileImage: payload.profileImage,
          rating: payload.rating ?? 0,
          pricePerMinute: payload.pricePerMinute ?? 0,
          chatPricePerMinute: payload.chatPricePerMinute,
          callPricePerMinute: payload.callPricePerMinute,
          chatPrice: payload.chatPricePerMinute,
          callPrice: payload.callPricePerMinute,
          specialization: [],
          languages: [],
          experience: 0,
          totalCalls: 0,
          isLive: false,
        };

        updatedPages[0] = {
          ...updatedPages[0],
          data: [newAstrologer as Astrologer, ...updatedPages[0].data],
        };
      }

      return { ...old, pages: updatedPages };
    }
  );
}

/**
 * Hook that subscribes to real-time chat astrologer availability changes.
 * When an astrologer toggles on/off on mobile → the browse-chat page updates instantly.
 *
 * Uses chatAvailable for the online status (not callAvailable), matching
 * the mobile app's type-specific logic.
 */
export function useRealtimeChatAvailability() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = supabaseRealtime.subscribeToChatAvailability((payload) => {
      updateAstrologerInCache(
        queryClient,
        BROWSE_QUERY_KEYS.chatAstrologers,
        payload,
        payload.chatAvailable,
      );
    });
    return unsub;
  }, [queryClient]);
}

/**
 * Hook that subscribes to real-time call astrologer availability changes.
 * When an astrologer toggles on/off on mobile → the browse-call page updates instantly.
 *
 * Uses callAvailable for the online status (not chatAvailable), matching
 * the mobile app's type-specific logic.
 */
export function useRealtimeCallAvailability() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = supabaseRealtime.subscribeToCallAvailability((payload) => {
      updateAstrologerInCache(
        queryClient,
        BROWSE_QUERY_KEYS.callAstrologers,
        payload,
        payload.callAvailable,
      );
    });
    return unsub;
  }, [queryClient]);
}
