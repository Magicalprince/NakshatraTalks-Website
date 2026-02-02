/**
 * Kundli Service - Kundli Generation & Matching API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  Kundli,
  KundliInput,
  KundliReport,
  MatchingInput,
  MatchingReport,
} from '@/types/api.types';

class KundliService {
  /**
   * Generate a new kundli
   */
  async generateKundli(data: KundliInput): Promise<ApiResponse<Kundli>> {
    return apiClient.post<ApiResponse<Kundli>>(API_ENDPOINTS.KUNDLI.GENERATE, data);
  }

  /**
   * Get user's kundli list
   */
  async getKundliList(): Promise<ApiResponse<Kundli[]>> {
    return apiClient.get<ApiResponse<Kundli[]>>(API_ENDPOINTS.KUNDLI.LIST);
  }

  /**
   * Get kundli by ID
   */
  async getKundliById(kundliId: string): Promise<ApiResponse<Kundli>> {
    return apiClient.get<ApiResponse<Kundli>>(API_ENDPOINTS.KUNDLI.GET_BY_ID(kundliId));
  }

  /**
   * Get kundli report
   */
  async getKundliReport(kundliId: string): Promise<ApiResponse<KundliReport>> {
    return apiClient.get<ApiResponse<KundliReport>>(API_ENDPOINTS.KUNDLI.GET_REPORT(kundliId));
  }

  /**
   * Update kundli
   */
  async updateKundli(kundliId: string, data: Partial<KundliInput>): Promise<ApiResponse<Kundli>> {
    return apiClient.put<ApiResponse<Kundli>>(API_ENDPOINTS.KUNDLI.UPDATE(kundliId), data);
  }

  /**
   * Delete kundli
   */
  async deleteKundli(kundliId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.KUNDLI.DELETE(kundliId)
    );
  }

  /**
   * Generate matching report
   */
  async generateMatching(data: MatchingInput): Promise<ApiResponse<MatchingReport>> {
    return apiClient.post<ApiResponse<MatchingReport>>(API_ENDPOINTS.MATCHING.GENERATE, data);
  }

  /**
   * Get user's matching reports list
   */
  async getMatchingList(): Promise<ApiResponse<MatchingReport[]>> {
    return apiClient.get<ApiResponse<MatchingReport[]>>(API_ENDPOINTS.MATCHING.LIST);
  }

  /**
   * Get matching report by ID
   */
  async getMatchingById(matchingId: string): Promise<ApiResponse<MatchingReport>> {
    return apiClient.get<ApiResponse<MatchingReport>>(
      API_ENDPOINTS.MATCHING.GET_BY_ID(matchingId)
    );
  }

  /**
   * Get detailed matching report
   */
  async getMatchingReport(matchingId: string): Promise<ApiResponse<MatchingReport>> {
    return apiClient.get<ApiResponse<MatchingReport>>(
      API_ENDPOINTS.MATCHING.GET_REPORT(matchingId)
    );
  }

  /**
   * Delete matching report
   */
  async deleteMatching(matchingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(
      API_ENDPOINTS.MATCHING.DELETE(matchingId)
    );
  }
}

export const kundliService = new KundliService();
