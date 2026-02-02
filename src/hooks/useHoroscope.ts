/**
 * Horoscope Hook - React Query hooks for horoscope
 */

import { useQuery } from '@tanstack/react-query';
import { horoscopeService, ZODIAC_SIGNS } from '@/lib/services/horoscope.service';

// Query keys
export const HOROSCOPE_QUERY_KEYS = {
  signs: ['horoscope', 'signs'] as const,
  daily: (sign: string) => ['horoscope', 'daily', sign] as const,
  allDaily: ['horoscope', 'daily', 'all'] as const,
};

/**
 * Hook for fetching zodiac signs (with static fallback)
 */
export function useZodiacSigns() {
  return useQuery({
    queryKey: HOROSCOPE_QUERY_KEYS.signs,
    queryFn: async () => {
      const response = await horoscopeService.getSigns();
      return response.data || ZODIAC_SIGNS;
    },
    initialData: ZODIAC_SIGNS,
    staleTime: Infinity, // Signs don't change
  });
}

/**
 * Hook for fetching daily horoscope for a specific sign
 */
export function useDailyHoroscope(sign: string) {
  return useQuery({
    queryKey: HOROSCOPE_QUERY_KEYS.daily(sign),
    queryFn: async () => {
      const response = await horoscopeService.getDailyHoroscope(sign);
      return response.data;
    },
    enabled: !!sign,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for fetching all daily horoscopes
 */
export function useAllDailyHoroscopes() {
  return useQuery({
    queryKey: HOROSCOPE_QUERY_KEYS.allDaily,
    queryFn: async () => {
      const response = await horoscopeService.getAllDailyHoroscopes();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// Re-export static data
export { ZODIAC_SIGNS, ELEMENT_COLORS } from '@/lib/services/horoscope.service';
