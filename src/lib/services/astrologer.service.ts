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
  Pagination,
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

/**
 * Reshape the backend's flat response `{ success, data: T[], pagination }`
 * into the `PaginatedResponse<T>` structure that React Query infinite scroll expects.
 */
function reshapeToPaginatedResponse<T>(
  response: ApiResponse<T[]>,
  page: number,
  limit: number,
): ApiResponse<PaginatedResponse<T>> {
  const pagination: Pagination | undefined = response.pagination;
  const items = response.data ?? [];

  return {
    success: response.success,
    message: response.message,
    data: {
      data: items,
      page: pagination?.currentPage ?? page,
      limit: pagination?.itemsPerPage ?? limit,
      totalPages: pagination?.totalPages ?? 1,
      totalItems: pagination?.totalItems ?? items.length,
      hasNext: pagination?.hasNext ?? false,
      hasPrev: pagination?.hasPrev ?? false,
    },
  };
}

/**
 * Normalize astrologer availability fields.
 *
 * The backend may return `chatAvailable`, `callAvailable`, `isAvailable`, or
 * `isOnline` depending on the endpoint. The AstrologerCard checks
 * `isOnline ?? isAvailable` to enable the action button. This ensures
 * both fields are always set correctly based on the endpoint type.
 */
function normalizeAstrologerAvailability(
  astrologers: Astrologer[],
  type: 'chat' | 'call',
): Astrologer[] {
  return astrologers.map((a) => {
    // For the "available" endpoints, the backend only returns available astrologers.
    // Determine online status from type-specific field, then general fields, then default true.
    const isOnlineForType = type === 'chat'
      ? (a.chatAvailable ?? a.isOnline ?? a.isAvailable ?? true)
      : (a.callAvailable ?? a.isOnline ?? a.isAvailable ?? true);

    return {
      ...a,
      isOnline: isOnlineForType,
      isAvailable: isOnlineForType,
    };
  });
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

    const response = await apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.ASTROLOGERS.SEARCH,
      { params: queryParams }
    );

    return reshapeToPaginatedResponse(response, page, limit);
  }

  /**
   * Get astrologers available for chat.
   *
   * The backend returns `{ success, data: Astrologer[], pagination: { ... } }`
   * (flat array + separate pagination), matching the mobile app's chat service.
   * We reshape it into `PaginatedResponse` for React Query infinite scroll.
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

    // API returns { success, data: Astrologer[], pagination }
    const response = await apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.CHAT.AVAILABLE_ASTROLOGERS,
      { params: queryParams }
    );

    // Normalize isOnline/isAvailable from chatAvailable so card buttons are enabled
    if (response.data) {
      response.data = normalizeAstrologerAvailability(response.data, 'chat');
    }

    return reshapeToPaginatedResponse(response, page, limit);
  }

  /**
   * Get astrologers available for call.
   *
   * Same response shape as chat — flat array + separate pagination.
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

    const response = await apiClient.get<ApiResponse<Astrologer[]>>(
      API_ENDPOINTS.CALL.AVAILABLE_ASTROLOGERS,
      { params: queryParams }
    );

    // Normalize isOnline/isAvailable from callAvailable so card buttons are enabled
    if (response.data) {
      response.data = normalizeAstrologerAvailability(response.data, 'call');
    }

    return reshapeToPaginatedResponse(response, page, limit);
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
    const response = await apiClient.get<ApiResponse<Review[]>>(
      API_ENDPOINTS.ASTROLOGERS.REVIEWS(id),
      { params: { page, limit } }
    );

    return reshapeToPaginatedResponse(response, page, limit);
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
   *
   * The mobile app gets these from the search results response.
   * The `/api/v1/astrologers/filters` endpoint may not exist on all backends,
   * so we try it first and fall back to the search endpoint.
   */
  async getFilterOptions(): Promise<ApiResponse<{
    specializations: string[];
    languages: string[];
    priceRange: { min: number; max: number };
  }>> {
    try {
      return await apiClient.get(API_ENDPOINTS.ASTROLOGERS.FILTERS);
    } catch {
      // Endpoint doesn't exist — return empty so the UI uses its hardcoded defaults
      return {
        success: true,
        data: {
          specializations: [],
          languages: [],
          priceRange: { min: 0, max: 0 },
        },
      };
    }
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
