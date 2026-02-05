'use client';

/**
 * useHomeData Hook
 * Fetches data for the home screen including live sessions and top rated astrologers
 */

import { useState, useEffect } from 'react';
import { LiveSession, Astrologer } from '@/types/api.types';
import {
  shouldUseMockData,
  MOCK_LIVE_SESSIONS,
  MOCK_ASTROLOGERS,
} from '@/lib/mock';
import { astrologerService } from '@/lib/services/astrologer.service';

interface HomeData {
  liveSessions: LiveSession[];
  topRatedAstrologers: Astrologer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHomeData(): HomeData {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [topRatedAstrologers, setTopRatedAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use mock data in development
      if (shouldUseMockData()) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get live sessions (filter to only those that are live)
        const liveSessions = MOCK_LIVE_SESSIONS.filter(s => s.status === 'live');
        setLiveSessions(liveSessions);

        // Get top rated astrologers (sorted by rating, top 4)
        const topRated = [...MOCK_ASTROLOGERS]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);
        setTopRatedAstrologers(topRated);

        setLoading(false);
        return;
      }

      // Fetch from API - only top rated astrologers (live sessions API may not exist yet)
      const topRatedResponse = await astrologerService.getTopRatedAstrologers(4);

      // Use mock live sessions for now (API may not exist)
      setLiveSessions(MOCK_LIVE_SESSIONS.filter(s => s.status === 'live'));

      if (topRatedResponse.success && topRatedResponse.data) {
        setTopRatedAstrologers(topRatedResponse.data);
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('Failed to load data');

      // Fallback to mock data on error
      setLiveSessions(MOCK_LIVE_SESSIONS.filter(s => s.status === 'live'));
      setTopRatedAstrologers(
        [...MOCK_ASTROLOGERS]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    liveSessions,
    topRatedAstrologers,
    loading,
    error,
    refetch: fetchData,
  };
}
