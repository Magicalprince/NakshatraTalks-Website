/**
 * Horoscope Service - Horoscope API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, DailyHoroscope, HoroscopeSign } from '@/types/api.types';

class HoroscopeService {
  /**
   * Get all zodiac signs
   */
  async getSigns(): Promise<ApiResponse<HoroscopeSign[]>> {
    return apiClient.get<ApiResponse<HoroscopeSign[]>>(API_ENDPOINTS.HOROSCOPE.SIGNS);
  }

  /**
   * Get daily horoscope for a sign
   */
  async getDailyHoroscope(sign: string, date?: string): Promise<ApiResponse<DailyHoroscope>> {
    const params = date ? { date } : {};
    return apiClient.get<ApiResponse<DailyHoroscope>>(
      `${API_ENDPOINTS.HOROSCOPE.DAILY}/${sign}`,
      { params }
    );
  }

  /**
   * Get horoscopes for all signs
   */
  async getAllDailyHoroscopes(date?: string): Promise<ApiResponse<DailyHoroscope[]>> {
    const params = date ? { date } : {};
    return apiClient.get<ApiResponse<DailyHoroscope[]>>(
      API_ENDPOINTS.HOROSCOPE.DAILY,
      { params }
    );
  }
}

export const horoscopeService = new HoroscopeService();

// Zodiac signs data (static for SEO)
export const ZODIAC_SIGNS: HoroscopeSign[] = [
  { id: 'aries', name: 'Aries', symbol: '♈', element: 'fire', dateRange: 'Mar 21 - Apr 19' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', element: 'earth', dateRange: 'Apr 20 - May 20' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', element: 'air', dateRange: 'May 21 - Jun 20' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', element: 'water', dateRange: 'Jun 21 - Jul 22' },
  { id: 'leo', name: 'Leo', symbol: '♌', element: 'fire', dateRange: 'Jul 23 - Aug 22' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', element: 'earth', dateRange: 'Aug 23 - Sep 22' },
  { id: 'libra', name: 'Libra', symbol: '♎', element: 'air', dateRange: 'Sep 23 - Oct 22' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', element: 'water', dateRange: 'Oct 23 - Nov 21' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', element: 'fire', dateRange: 'Nov 22 - Dec 21' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', element: 'earth', dateRange: 'Dec 22 - Jan 19' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', element: 'air', dateRange: 'Jan 20 - Feb 18' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', element: 'water', dateRange: 'Feb 19 - Mar 20' },
];

// Element colors
export const ELEMENT_COLORS: Record<string, { bg: string; text: string }> = {
  fire: { bg: 'bg-red-100', text: 'text-red-600' },
  earth: { bg: 'bg-amber-100', text: 'text-amber-700' },
  air: { bg: 'bg-sky-100', text: 'text-sky-600' },
  water: { bg: 'bg-blue-100', text: 'text-blue-600' },
};
