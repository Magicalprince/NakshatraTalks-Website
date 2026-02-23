/**
 * Astrologer Service - Real Backend Integration
 *
 * Handles browsing, searching, filtering, and viewing astrologer profiles.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  Astrologer,
  AstrologerFilters,
  PaginatedResponse,
  Review,
} from '@/types/api.types';

export interface GetAstrologersParams {
  page?: number;
  limit?: number;
  filters?: AstrologerFilters;
  sortBy?: 'rating' | 'price' | 'experience' | 'orders' | 'price_per_minute' | 'total_calls' | 'chat_price_per_minute' | 'call_price_per_minute';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

class AstrologerService {
  /**
   * Get astrologers with filters and pagination
   */
  async getAstrologers(
    params: GetAstrologersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Astrologer>>> {
    const { page = 1, limit = 20, filters, sortBy, sortOrder, search } = params;

    const queryParams: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      sortBy,
      order: sortOrder,
    };

    if (search) queryParams.q = search;

    if (filters) {
      if (filters.specializations?.length) {
        queryParams.specialization = filters.specializations.join(',');
      }
      if (filters.languages?.length) {
        queryParams.languages = filters.languages.join(',');
      }
      if (filters.minRating) queryParams.minRating = filters.minRating;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
      if (filters.minPrice) queryParams.minPrice = filters.minPrice;
      if (filters.isOnline !== undefined) queryParams.isAvailable = filters.isOnline;
      if (filters.minExperience) queryParams.minExperience = filters.minExperience;
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Astrologer>>>(
      API_ENDPOINTS.ASTROLOGERS.SEARCH,
      { params: queryParams }
    );
  }

  /**
   * Get astrologers available for chat
   */
  async getChatAstrologers(
    params: GetAstrologersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Astrologer>>> {
    const { page = 1, limit = 20, filters, sortBy, sortOrder, search } = params;

    const queryParams: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      sortBy,
      order: sortOrder,
      type: 'chat',
    };

    if (search) queryParams.q = search;
    if (filters?.specializations?.length) {
      queryParams.specialization = filters.specializations.join(',');
    }
    if (filters?.languages?.length) {
      queryParams.languages = filters.languages.join(',');
    }
    if (filters?.minRating) queryParams.minRating = filters.minRating;
    if (filters?.maxPrice) queryParams.maxPrice = filters.maxPrice;
    if (filters?.minPrice) queryParams.minPrice = filters.minPrice;

    return apiClient.get<ApiResponse<PaginatedResponse<Astrologer>>>(
      API_ENDPOINTS.CHAT.AVAILABLE_ASTROLOGERS,
      { params: queryParams }
    );
  }

  /**
   * Get astrologers available for call
   */
  async getCallAstrologers(
    params: GetAstrologersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Astrologer>>> {
    const { page = 1, limit = 20, filters, sortBy, sortOrder, search } = params;

    const queryParams: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      sortBy,
      order: sortOrder,
    };

    if (search) queryParams.q = search;
    if (filters?.specializations?.length) {
      queryParams.specialization = filters.specializations.join(',');
    }
    if (filters?.languages?.length) {
      queryParams.languages = filters.languages.join(',');
    }
    if (filters?.minRating) queryParams.minRating = filters.minRating;
    if (filters?.maxPrice) queryParams.maxPrice = filters.maxPrice;
    if (filters?.minPrice) queryParams.minPrice = filters.minPrice;

    return apiClient.get<ApiResponse<PaginatedResponse<Astrologer>>>(
      API_ENDPOINTS.CALL.AVAILABLE_ASTROLOGERS,
      { params: queryParams }
    );
  }

  /**
   * Get single astrologer by ID
   */
  async getAstrologerById(id: string): Promise<ApiResponse<Astrologer>> {
    return apiClient.get<ApiResponse<Astrologer>>(
      API_ENDPOINTS.ASTROLOGERS.DETAIL(id)
    );
  }

  /**
   * Get astrologer reviews
   */
  async getAstrologerReviews(
    id: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<Review>>>(
      API_ENDPOINTS.ASTROLOGERS.REVIEWS(id),
      { params: { page, limit } }
    );
  }

  /**
   * Get top-rated astrologers
   */
  async getTopRatedAstrologers(limit = 10): Promise<ApiResponse<Astrologer[]>> {
    return apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.ASTROLOGERS.TOP_RATED,
      { params: { limit } }
    );
  }

  /**
   * Search astrologers by query
   */
  async searchAstrologers(query: string, limit = 20): Promise<ApiResponse<Astrologer[]>> {
    return apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.ASTROLOGERS.SEARCH,
      { params: { q: query, limit } }
    );
  }

  /**
   * Get filter options (specializations, languages, etc.)
   */
  async getFilterOptions(): Promise<ApiResponse<{
    specializations: string[];
    languages: string[];
    priceRange: { min: number; max: number };
  }>> {
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.FILTERS);
  }

  /**
   * Get astrologer availability / online status
   */
  async getAstrologerAvailability(
    id: string,
    date?: string
  ): Promise<ApiResponse<{ isOnline: boolean; isAvailableForChat: boolean; isAvailableForCall: boolean }>> {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    return apiClient.get(API_ENDPOINTS.ASTROLOGERS.AVAILABILITY(id), { params });
  }

  /**
   * Get astrologer photos
   */
  async getAstrologerPhotos(id: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(
      API_ENDPOINTS.ASTROLOGERS.PHOTOS(id)
    );
  }

  /**
   * Follow an astrologer
   */
  async followAstrologer(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.ASTROLOGERS.FOLLOW(id)
    );
  }

  /**
   * Unfollow an astrologer
   */
  async unfollowAstrologer(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.ASTROLOGERS.UNFOLLOW(id)
    );
  }
}

export const astrologerService = new AstrologerService();
