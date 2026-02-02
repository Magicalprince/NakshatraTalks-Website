/**
 * Wallet Data Hooks - React Query hooks for wallet operations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { walletService, RechargeInitiateParams, RechargeVerifyParams } from '@/lib/services/wallet.service';
import { useAuthStore } from '@/stores/auth-store';

// Query keys
export const WALLET_QUERY_KEYS = {
  balance: ['wallet', 'balance'] as const,
  summary: ['wallet', 'summary'] as const,
  rechargeOptions: ['wallet', 'recharge-options'] as const,
  transactions: ['wallet', 'transactions'] as const,
};

/**
 * Hook for fetching wallet balance
 */
export function useWalletBalance() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: WALLET_QUERY_KEYS.balance,
    queryFn: async () => {
      const response = await walletService.getBalance();
      return response.data?.balance ?? 0;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook for fetching wallet summary
 */
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

/**
 * Hook for fetching recharge options
 */
export function useRechargeOptions() {
  return useQuery({
    queryKey: WALLET_QUERY_KEYS.rechargeOptions,
    queryFn: async () => {
      const response = await walletService.getRechargeOptions();
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for fetching transaction history with pagination
 */
export function useTransactions(type?: 'all' | 'credit' | 'debit') {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: [...WALLET_QUERY_KEYS.transactions, type],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await walletService.getTransactions(pageParam, 20, type);
      return response.data;
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

/**
 * Hook for initiating recharge
 */
export function useInitiateRecharge() {
  return useMutation({
    mutationFn: (params: RechargeInitiateParams) => walletService.initiateRecharge(params),
  });
}

/**
 * Hook for verifying recharge
 */
export function useVerifyRecharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RechargeVerifyParams) => walletService.verifyRecharge(params),
    onSuccess: () => {
      // Refetch wallet data after successful recharge
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.balance });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.summary });
      queryClient.invalidateQueries({ queryKey: WALLET_QUERY_KEYS.transactions });
    },
  });
}
