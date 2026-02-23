/**
 * Wallet Service - Real Backend Integration
 *
 * Handles wallet balance, transactions, and Razorpay recharge flow.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  ApiResponse,
  Transaction,
  RechargeOption,
  WalletSummary,
  InitiateRechargeResponse,
  VerifyPaymentData,
  VerifyPaymentResponse,
  PendingOrder,
} from '@/types/api.types';

class WalletService {
  async getBalance(): Promise<ApiResponse<{ balance: number; currency: string }>> {
    return apiClient.get(API_ENDPOINTS.WALLET.BALANCE);
  }

  async getSummary(): Promise<ApiResponse<WalletSummary>> {
    return apiClient.get(API_ENDPOINTS.WALLET.SUMMARY);
  }

  async getRechargeOptions(): Promise<ApiResponse<RechargeOption[]>> {
    return apiClient.get(API_ENDPOINTS.WALLET.RECHARGE_OPTIONS);
  }

  async getTransactions(
    page = 1,
    limit = 20,
    type?: 'all' | 'credit' | 'debit' | 'recharge' | 'refund'
  ): Promise<ApiResponse<{ transactions: Transaction[]; totalPages: number; page: number }>> {
    const params: Record<string, string | number> = { page, limit };
    if (type && type !== 'all') params.type = type;
    return apiClient.get(API_ENDPOINTS.WALLET.TRANSACTIONS, { params });
  }

  async getRechargeHistory(page = 1, limit = 20): Promise<ApiResponse<{ recharges: Transaction[]; totalPages: number }>> {
    return apiClient.get(API_ENDPOINTS.WALLET.RECHARGES, { params: { page, limit } });
  }

  async initiateRecharge(amount: number): Promise<ApiResponse<InitiateRechargeResponse>> {
    return apiClient.post(API_ENDPOINTS.WALLET.RECHARGE_INITIATE, { amount });
  }

  async verifyRecharge(data: VerifyPaymentData): Promise<ApiResponse<VerifyPaymentResponse>> {
    return apiClient.post(API_ENDPOINTS.WALLET.RECHARGE_VERIFY, data);
  }

  async getPendingOrders(): Promise<ApiResponse<PendingOrder[]>> {
    return apiClient.get(API_ENDPOINTS.WALLET.PENDING_ORDERS);
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post(API_ENDPOINTS.WALLET.CANCEL_ORDER(orderId));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  }

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
