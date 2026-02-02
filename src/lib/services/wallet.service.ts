/**
 * Wallet Service - Wallet and Payment API calls
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiResponse, Transaction, RechargeOption, WalletSummary } from '@/types/api.types';

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
    return apiClient.get<ApiResponse<{ balance: number }>>(API_ENDPOINTS.WALLET.BALANCE);
  }

  /**
   * Get wallet summary (balance + recent transactions)
   */
  async getSummary(): Promise<ApiResponse<WalletSummary>> {
    return apiClient.get<ApiResponse<WalletSummary>>(API_ENDPOINTS.WALLET.SUMMARY);
  }

  /**
   * Get recharge options
   */
  async getRechargeOptions(): Promise<ApiResponse<RechargeOption[]>> {
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
