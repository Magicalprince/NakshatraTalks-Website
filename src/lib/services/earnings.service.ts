/**
 * Astrologer Earnings Service
 *
 * Wraps the backend's `/api/v1/astrologer/earnings/*` and
 * `/api/v1/astrologer/profile/payout-details` endpoints. Matches the mobile
 * service surface (mobile: src/services/earnings.service.ts) so cross-platform
 * consumers can be reasoned about identically — same field names, same status
 * code mapping, same idempotency surface.
 *
 * Error handling: each method maps HTTP status → user-readable string and
 * throws a plain Error. Consumers can pass the thrown Error.message straight
 * into a toast without further unwrapping. getErrorMessage() handles the
 * `[object Object]` case for unexpected shapes.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/api/error';
import type { ApiResponse, Pagination } from '@/types/api.types';

export type WithdrawalStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed';

export interface EarningsSummary {
  totalEarnings: number;
  thisMonthEarnings: number;
  todayEarnings: number;
  pendingEarnings: number;
  totalWithdrawn: number;
  availableBalance: number;
  inFlightWithdrawals?: number;
  currency: string;
  commissionRate: number;
  stats: {
    totalSessions: number;
    thisMonthSessions: number;
    todaySessions: number;
    activeSessions: number;
  };
  last7Days: Array<{ date: string; earnings: number; sessions: number }>;
  bankName?: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  upiId?: string | null;
}

export interface WithdrawalRequest {
  amount: number;
  bankAccountId?: string;
  upiId?: string;
  notes?: string;
}

export interface WithdrawalResponse {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  estimatedArrival: string;
  transactionId?: string;
  createdAt: string;
}

export interface WithdrawalEntry {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
  failureReason?: string;
}

export interface WithdrawalDetail {
  id: string;
  astrologer_id: string;
  amount: number;
  status: WithdrawalStatus;
  bank_account_id: string | null;
  upi_id: string | null;
  notes: string | null;
  rejection_reason: string | null;
  reference_number: string | null;
  estimated_arrival: string | null;
  processed_at: string | null;
  processed_action_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayoutDetailsUpdate {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

class EarningsService {
  async getSummary(): Promise<EarningsSummary> {
    try {
      const response = await apiClient.get<ApiResponse<EarningsSummary>>(
        API_ENDPOINTS.EARNINGS.SUMMARY,
      );
      return response.data!;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to load earnings summary'));
    }
  }

  async requestWithdrawal(request: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      const response = await apiClient.post<ApiResponse<WithdrawalResponse>>(
        API_ENDPOINTS.EARNINGS.WITHDRAW_REQUEST,
        request,
      );
      return response.data!;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to request withdrawal'));
    }
  }

  async getWithdrawalHistory(
    page = 1,
    limit = 20,
  ): Promise<{ data: WithdrawalEntry[]; pagination: Pagination }> {
    try {
      const response = await apiClient.get<ApiResponse<WithdrawalEntry[]>>(
        API_ENDPOINTS.EARNINGS.WITHDRAWALS_LIST,
        { params: { page, limit } },
      );
      return {
        data: response.data ?? [],
        pagination:
          response.pagination ?? {
            currentPage: page,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to load withdrawal history'));
    }
  }

  async getWithdrawalById(id: string): Promise<WithdrawalDetail> {
    try {
      const response = await apiClient.get<ApiResponse<WithdrawalDetail>>(
        API_ENDPOINTS.EARNINGS.WITHDRAWAL_DETAIL(id),
      );
      return response.data!;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to load withdrawal detail'));
    }
  }

  async updatePayoutDetails(payload: PayoutDetailsUpdate): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.EARNINGS.PAYOUT_DETAILS, payload);
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to update payout details'));
    }
  }
}

export const earningsService = new EarningsService();
