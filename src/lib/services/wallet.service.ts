/**
 * Wallet Service - Wallet and Payment API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, Transaction, RechargeOption, WalletSummary } from '@/types/api.types';
import {
  shouldUseMockData,
  MOCK_USER,
  MOCK_TRANSACTIONS,
  MOCK_WALLET_SUMMARY,
  MOCK_RECHARGE_OPTIONS,
} from '@/lib/mock';

export interface RechargeInitiateParams {
  amount: number;
  optionId?: string;
}

export interface RechargeInitiateResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  notes?: Record<string, string>;
}

export interface RechargeVerifyParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RechargeVerifyResponse {
  success: boolean;
  newBalance: number;
  transactionId: string;
}

class WalletService {
  /**
   * Get wallet balance
   */
  async getBalance(): Promise<ApiResponse<{ balance: number }>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: { balance: MOCK_USER.walletBalance || 1250 },
      };
    }

    return apiClient.get<ApiResponse<{ balance: number }>>(API_ENDPOINTS.WALLET.BALANCE);
  }

  /**
   * Get wallet summary (balance + recent transactions)
   */
  async getSummary(): Promise<ApiResponse<WalletSummary>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: MOCK_WALLET_SUMMARY,
      };
    }

    return apiClient.get<ApiResponse<WalletSummary>>(API_ENDPOINTS.WALLET.SUMMARY);
  }

  /**
   * Get recharge options
   */
  async getRechargeOptions(): Promise<ApiResponse<RechargeOption[]>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      return {
        success: true,
        data: MOCK_RECHARGE_OPTIONS,
      };
    }

    return apiClient.get<ApiResponse<RechargeOption[]>>(API_ENDPOINTS.WALLET.RECHARGE_OPTIONS);
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    type?: 'all' | 'credit' | 'debit'
  ): Promise<ApiResponse<{ transactions: Transaction[]; totalPages: number; page: number }>> {
    // Use mock data in development
    if (shouldUseMockData()) {
      let transactions = [...MOCK_TRANSACTIONS];

      // Filter by type
      if (type && type !== 'all') {
        if (type === 'credit') {
          transactions = transactions.filter(t => t.amount > 0);
        } else if (type === 'debit') {
          transactions = transactions.filter(t => t.amount < 0);
        }
      }

      return {
        success: true,
        data: {
          transactions,
          totalPages: 1,
          page,
        },
      };
    }

    return apiClient.get<ApiResponse<{ transactions: Transaction[]; totalPages: number; page: number }>>(
      API_ENDPOINTS.WALLET.TRANSACTIONS,
      { params: { page, limit, type } }
    );
  }

  /**
   * Initiate recharge (create Razorpay order)
   */
  async initiateRecharge(params: RechargeInitiateParams): Promise<ApiResponse<RechargeInitiateResponse>> {
    return apiClient.post<ApiResponse<RechargeInitiateResponse>>(
      API_ENDPOINTS.WALLET.RECHARGE_INITIATE,
      params
    );
  }

  /**
   * Verify recharge (after Razorpay payment)
   */
  async verifyRecharge(params: RechargeVerifyParams): Promise<ApiResponse<RechargeVerifyResponse>> {
    return apiClient.post<ApiResponse<RechargeVerifyResponse>>(
      API_ENDPOINTS.WALLET.RECHARGE_VERIFY,
      params
    );
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format transaction type
   */
  formatTransactionType(type: string): string {
    const typeMap: Record<string, string> = {
      credit: 'Credited',
      debit: 'Debited',
      recharge: 'Recharge',
      refund: 'Refund',
      session_debit: 'Session',
      bonus: 'Bonus',
    };
    return typeMap[type] || type;
  }
}

export const walletService = new WalletService();
