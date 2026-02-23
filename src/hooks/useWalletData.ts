/**
 * Wallet Data Hooks - React Query hooks for wallet operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { walletService } from '@/lib/services/wallet.service';
import { VerifyPaymentData, Transaction } from '@/types/api.types';
import { useAuthStore } from '@/stores/auth-store';

export const WALLET_QUERY_KEYS = {
  balance: ['wallet', 'balance'] as const,
  summary: ['wallet', 'summary'] as const,
  rechargeOptions: ['wallet', 'recharge-options'] as const,
  transactions: ['wallet', 'transactions'] as const,
};

export function useWalletBalance() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: WALLET_QUERY_KEYS.balance,
    queryFn: async () => {
      const response = await walletService.getBalance();
      return response.data?.balance ?? 0;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
}

export function useWalletSummary() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: WALLET_QUERY_KEYS.summary,
    queryFn: async () => {
      const response = await walletService.getSummary();
      return response.data;
    },
    enabled: isAuthenticated,
  });
}

export function useRechargeOptions() {
  return useQuery({
    queryKey: WALLET_QUERY_KEYS.rechargeOptions,
    queryFn: async () => {
      const response = await walletService.getRechargeOptions();
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useTransactions(type?: 'all' | 'credit' | 'debit') {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: [...WALLET_QUERY_KEYS.transactions, type],
    queryFn: async ({ pageParam = 1 }) => {
      // Backend uses sendPaginatedSuccess which returns:
      // { success: true, data: Transaction[], pagination: { currentPage, totalPages, ... } }
      // apiClient.get returns the full response body
      const response = await walletService.getTransactions(pageParam, 20, type);
      // response.data could be the nested { transactions, page, totalPages }
      // OR it could be a flat Transaction[] (from sendPaginatedSuccess)
      const rawData = response.data;
      if (rawData && 'transactions' in rawData) {
        // Already in expected format
        return rawData;
      }
      // Backend returns data as flat array with pagination at root
      const transactions = (rawData as unknown as Transaction[]) ?? [];
      const pagination = response.pagination;
      return {
        transactions,
        page: pagination?.currentPage ?? pageParam,
        totalPages: pagination?.totalPages ?? 1,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: isAuthenticated,
  });
}

export function useInitiateRecharge() {
  return useMutation({
    mutationFn: (params: { amount: number; optionId?: string }) =>
      walletService.initiateRecharge(params.amount),
  });
}

export function useVerifyRecharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentData) => walletService.verifyRecharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.balance });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.summary });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions });
    },
  });
}
