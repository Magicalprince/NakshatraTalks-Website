'use client';

/**
 * useHomeData Hook
 * Fetches data for the home screen: live sessions + top rated astrologers
 */

import { useQuery } from '@tanstack/react-query';
import { astrologerService } from '@/lib/services/astrologer.service';
import { liveSessionService } from '@/lib/services/live-session.service';

export const HOME_QUERY_KEYS = {
  liveSessions: ['home', 'live-sessions'] as const,
  topRated: ['home', 'top-rated'] as const,
};

export function useHomeData() {
  const liveSessions = useQuery({
    queryKey: HOME_QUERY_KEYS.liveSessions,
    queryFn: async () => {
      const response = await liveSessionService.getSessions('live');
      return response.data ?? [];
    },
    refetchInterval: 30000,
  });

  const topRated = useQuery({
    queryKey: HOME_QUERY_KEYS.topRated,
    queryFn: async () => {
      const response = await astrologerService.getTopRatedAstrologers(4);
      return response.data ?? [];
    },
  });

  return {
    liveSessions: liveSessions.data ?? [],
    topRatedAstrologers: topRated.data ?? [],
    loading: liveSessions.isLoading || topRated.isLoading,
    error: liveSessions.error?.message || topRated.error?.message || null,
    refetch: async () => {
      await Promise.all([liveSessions.refetch(), topRated.refetch()]);
    },
  };
}
