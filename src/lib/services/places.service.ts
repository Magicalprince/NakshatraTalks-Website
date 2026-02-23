/**
 * Places Service - Real Backend Integration
 *
 * Handles place search for kundli generation (birth place lookup).
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types/api.types';

export interface Place {
  name: string;
  fullName?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  state?: string;
}

class PlacesService {
  async searchPlaces(query: string): Promise<ApiResponse<Place[]>> {
    return apiClient.get(API_ENDPOINTS.PLACES.SEARCH, {
      params: { q: query },
    });
  }

  async getPopularPlaces(): Promise<ApiResponse<Place[]>> {
    return apiClient.get(API_ENDPOINTS.PLACES.POPULAR);
  }

  async reverseGeocode(lat: number, lon: number): Promise<ApiResponse<Place>> {
    return apiClient.get(API_ENDPOINTS.PLACES.REVERSE, {
      params: { lat, lon },
    });
  }
}

export const placesService = new PlacesService();
