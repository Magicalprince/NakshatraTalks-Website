/**
 * Kundli Service - Real Backend Integration
 *
 * Handles kundli generation, matching, and reports via ProKerala API (backend).
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  Kundli,
  KundliInput,
  KundliReport,
  MatchingInput,
  SavedMatching,
  MatchingReport,
} from '@/types/api.types';

export interface KundliReportParams {
  language?: 'en' | 'ta';
  chartStyle?: 'south_indian' | 'north_indian';
  refresh?: boolean;
}

class KundliService {
  // ─── Kundli (Birth Chart) ────────────────────────────────────────
  async generateKundli(data: KundliInput): Promise<ApiResponse<Kundli>> {
    return apiClient.post(API_ENDPOINTS.KUNDLI.GENERATE, data);
  }

  async getKundliList(): Promise<ApiResponse<Kundli[]>> {
    return apiClient.get(API_ENDPOINTS.KUNDLI.LIST);
  }

  async getKundliById(kundliId: string): Promise<ApiResponse<Kundli>> {
    return apiClient.get(API_ENDPOINTS.KUNDLI.GET_BY_ID(kundliId));
  }

  async getKundliReport(
    kundliId: string,
    params: KundliReportParams = {}
  ): Promise<ApiResponse<KundliReport>> {
    const queryParams: Record<string, string> = {};
    if (params.language) queryParams.language = params.language;
    if (params.chartStyle) {
      // Convert from 'south_indian' to 'south-indian' format for API
      queryParams.chartStyle = params.chartStyle.replace('_', '-');
    }
    if (params.refresh) queryParams.refresh = 'true';

    return apiClient.getWithParams(API_ENDPOINTS.KUNDLI.GET_REPORT(kundliId), queryParams);
  }

  async updateKundli(kundliId: string, data: Partial<KundliInput>): Promise<ApiResponse<Kundli>> {
    return apiClient.put(API_ENDPOINTS.KUNDLI.UPDATE(kundliId), data);
  }

  async deleteKundli(kundliId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.KUNDLI.DELETE(kundliId));
  }

  // ─── Matching (Compatibility) ────────────────────────────────────
  async generateMatching(data: MatchingInput): Promise<ApiResponse<SavedMatching>> {
    return apiClient.post(API_ENDPOINTS.MATCHING.GENERATE, data);
  }

  async getMatchingList(): Promise<ApiResponse<SavedMatching[]>> {
    return apiClient.get(API_ENDPOINTS.MATCHING.LIST);
  }

  async getMatchingById(matchingId: string): Promise<ApiResponse<SavedMatching>> {
    return apiClient.get(API_ENDPOINTS.MATCHING.GET_BY_ID(matchingId));
  }

  async getMatchingReport(matchingId: string): Promise<ApiResponse<MatchingReport>> {
    return apiClient.get(API_ENDPOINTS.MATCHING.GET_REPORT(matchingId));
  }

  async deleteMatching(matchingId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.MATCHING.DELETE(matchingId));
  }
}

export const kundliService = new KundliService();
