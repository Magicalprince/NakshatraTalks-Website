/**
 * Astrologer Service - Astrologer API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  Astrologer,
  AstrologerFilters,
  PaginatedResponse,
} from '@/types/api.types';

export interface GetAstrologersParams {
  page?: number;
  limit?: number;
  filters?: AstrologerFilters;
  sortBy?: 'rating' | 'price' | 'experience' | 'orders';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AstrologerReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

class AstrologerService {
  /**
   * Get all astrologers with filters and pagination
   */
  async getAstrologers(
    params: GetAstrologersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Astrologer>>> {
    const { page = 1, limit = 20, filters, sortBy, sortOrder, search } = params;

    const queryParams: Record<string, string | number | boolean | undefined> = {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    };

    // Add filter params
    if (filters) {
      if (filters.specializations?.length) {
        queryParams.specializations = filters.specializations.join(',');
      }
      if (filters.languages?.length) {
        queryParams.languages = filters.languages.join(',');
      }
      if (filters.minRating) {
        queryParams.minRating = filters.minRating;
      }
      if (filters.maxPrice) {
        queryParams.maxPrice = filters.maxPrice;
      }
      if (filters.minPrice) {
        queryParams.minPrice = filters.minPrice;
      }
      if (filters.isOnline !== undefined) {
        queryParams.isOnline = filters.isOnline;
      }
      if (filters.minExperience) {
        queryParams.minExperience = filters.minExperience;
      }
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Astrologer>>>(
      API_ENDPOINTS.ASTROLOGERS.LIST,
      { params: queryParams }
    );
  }

  /**
   * Get astrologers available for chat
   */
  async getChatAstrologers(
    params: GetAstrologersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Astrologer>>> {
    return this.getAstrologers({
      ...params,
      filters: {
        ...params.filters,
        isOnline: true,
      },
    });
  }

  /**
   * Get astrologers available for call
   */
  async getCallAstrologers(
    params: GetAstrologersParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Astrologer>>> {
    return this.getAstrologers({
      ...params,
      filters: {
        ...params.filters,
        isOnline: true,
      },
    });
  }

  /**
   * Get single astrologer details
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
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<AstrologerReview>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<AstrologerReview>>>(
      API_ENDPOINTS.ASTROLOGERS.REVIEWS(id),
      { params: { page, limit } }
    );
  }

  /**
   * Get astrologer availability slots
   */
  async getAstrologerAvailability(
    id: string,
    date?: string
  ): Promise<ApiResponse<{ slots: string[]; isOnline: boolean }>> {
    return apiClient.get<ApiResponse<{ slots: string[]; isOnline: boolean }>>(
      API_ENDPOINTS.ASTROLOGERS.AVAILABILITY(id),
      { params: { date } }
    );
  }

  /**
   * Get top rated astrologers
   */
  async getTopRatedAstrologers(
    limit: number = 10
  ): Promise<ApiResponse<Astrologer[]>> {
    return apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.ASTROLOGERS.TOP_RATED,
      { params: { limit } }
    );
  }

  /**
   * Search astrologers
   */
  async searchAstrologers(
    query: string,
    limit: number = 20
  ): Promise<ApiResponse<Astrologer[]>> {
    return apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.ASTROLOGERS.SEARCH,
      { params: { q: query, limit } }
    );
  }

  /**
   * Get filter options (specializations, languages, etc.)
   */
  async getFilterOptions(): Promise<
    ApiResponse<{
      specializations: string[];
      languages: string[];
      priceRanges: { min: number; max: number }[];
    }>
  > {
    return apiClient.get<
      ApiResponse<{
        specializations: string[];
        languages: string[];
        priceRanges: { min: number; max: number }[];
      }>
    >(API_ENDPOINTS.ASTROLOGERS.FILTERS);
  }
}

export const astrologerService = new AstrologerService();
