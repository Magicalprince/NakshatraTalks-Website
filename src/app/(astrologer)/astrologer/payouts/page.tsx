'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpFromLine, IndianRupee, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeader, EmptyState } from '@/components/shared';
import { WithdrawModal } from '@/components/features/astrologer/earnings/WithdrawModal';
import { useEarningsSummary, useWithdrawalHistory } from '@/hooks/useAstrologerDashboard';
import { useSalaryMode } from '@/contexts/SalaryModeContext';
import { useAuthStore } from '@/stores/auth-store';
import { formatCurrency } from '@/utils/format-currency';
import type { WithdrawalStatus } from '@/lib/services/earnings.service';

const STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: 'Under review',
  processing: 'Payout in progress',
  completed: 'Paid',
  rejected: 'Could not process',
  failed: 'Could not process',
};

const STATUS_VARIANTS: Record<WithdrawalStatus, 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  rejected: 'error',
  failed: 'error',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AstrologerPayoutsPage() {
  const router = useRouter();
  const salaryMode = useSalaryMode();
  const astrologer = useAuthStore((s) => s.astrologer);
  const [page, setPage] = useState(1);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useEarningsSummary();
  const { data: historyResult, isLoading: historyLoading } = useWithdrawalHistory(page, 20);

  // Salary-mode astrologers are paid a fixed salary by the platform — the
  // payouts surface is meaningless for them. Mirror the mobile PriceLabel
  // gate by rendering a managed-account explanation instead.
  if (salaryMode.enabled) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="lg">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/astrologer/dashboard' },
              { label: 'Payouts' },
            ]}
          />
          <h1 className="font-lexend mb-1 text-2xl font-bold text-text-primary">Payouts</h1>
          <Card className="mt-6 p-6 text-center">
            <p className="text-text-primary font-medium">
              You&apos;re on a fixed-salary arrangement.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Earnings and payouts are managed directly by the NakshatraTalks team. Reach out to
              support if you have a question about your salary.
            </p>
          </Card>
        </PageContainer>
      </div>
    );
  }

  const withdrawals = historyResult?.data ?? [];
  const pagination = historyResult?.pagination;
  const hasNext = pagination?.hasNext ?? false;
  const hasPrev = pagination?.hasPrev ?? false;

  const availableBalance = summary?.availableBalance ?? 0;
  const totalWithdrawn = summary?.totalWithdrawn ?? 0;

  // Saved payout methods come from the auth-store astrologer (hydrated by
  // /auth/me). The earnings summary endpoint doesn't carry these fields,
  // so the previous read from `summary` always saw undefined and blocked
  // withdrawals even when the astrologer had saved details on mobile.
  // Summary is kept as a defensive fallback in case any future deploy
  // does include them.
  const savedMethods = {
    accountNumber: astrologer?.accountNumber ?? summary?.accountNumber,
    ifscCode: astrologer?.ifscCode ?? summary?.ifscCode,
    bankName: astrologer?.bankName ?? summary?.bankName,
    upiId: astrologer?.upiId ?? summary?.upiId,
  };
  const hasAnyMethod = !!(savedMethods.accountNumber && savedMethods.ifscCode) || !!savedMethods.upiId;

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/astrologer/dashboard' },
            { label: 'Payouts' },
          ]}
        />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-lexend mb-1 text-2xl font-bold text-text-primary">Payouts</h1>
            <p className="text-sm text-text-secondary">
              Request withdrawals and review the status of past payouts.
            </p>
          </div>
          <Button
            onClick={() => setShowWithdraw(true)}
            disabled={summaryLoading || availableBalance < 100 || !hasAnyMethod}
            size="lg"
            className="shrink-0"
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        </div>

        {/* Balance summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <IndianRupee className="h-5 w-5 text-status-success" />
                <Badge variant="success" className="text-xs">
                  Available
                </Badge>
              </div>
              {summaryLoading ? (
                <Skeleton className="mt-3 h-8 w-32" />
              ) : (
                <p className="font-lexend mt-3 text-2xl font-bold text-text-primary">
                  {formatCurrency(availableBalance)}
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">Available to withdraw</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <History className="h-5 w-5 text-status-info" />
                <Badge variant="info" className="text-xs">
                  Lifetime
                </Badge>
              </div>
              {summaryLoading ? (
                <Skeleton className="mt-3 h-8 w-32" />
              ) : (
                <p className="font-lexend mt-3 text-2xl font-bold text-text-primary">
                  {formatCurrency(totalWithdrawn)}
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">Total withdrawn</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <IndianRupee className="h-5 w-5 text-text-muted" />
                <Badge variant="default" className="text-xs">
                  Total
                </Badge>
              </div>
              {summaryLoading ? (
                <Skeleton className="mt-3 h-8 w-32" />
              ) : (
                <p className="font-lexend mt-3 text-2xl font-bold text-text-primary">
                  {formatCurrency(summary?.totalEarnings ?? 0)}
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">Lifetime earnings</p>
            </Card>
          </motion.div>
        </div>

        {!hasAnyMethod && !summaryLoading && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-800">
              You don&apos;t have a saved bank account or UPI ID yet. Add payout details in{' '}
              <Link href="/astrologer/settings" className="font-medium underline">
                Settings
              </Link>{' '}
              before requesting a withdrawal.
            </div>
          </div>
        )}

        {/* History */}
        <SectionHeader icon={History} title="Payout history" />
        {historyLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : withdrawals.length === 0 ? (
          <EmptyState
            icon={ArrowUpFromLine}
            title="No payouts yet"
            description="Your withdrawal requests will appear here."
          />
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <button
                key={w.id}
                onClick={() => router.push(`/astrologer/payouts/${w.id}`)}
                className="w-full text-left"
              >
                <Card className="p-4 transition hover:shadow-web-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-lexend text-base font-semibold text-text-primary">
                        {formatCurrency(w.amount)}
                      </div>
                      <div className="mt-1 text-xs text-text-muted">
                        Requested {formatDate(w.requestedAt)}
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANTS[w.status]} className="shrink-0">
                      {STATUS_LABELS[w.status]}
                    </Badge>
                  </div>
                </Card>
              </button>
            ))}

            {(hasNext || hasPrev) && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-xs text-text-muted">Page {pagination?.currentPage ?? 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </PageContainer>

      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        availableBalance={availableBalance}
        totalWithdrawn={totalWithdrawn}
        savedMethods={savedMethods}
        onWithdrawSuccess={() => {
          // Mutation hooks already invalidate the summary & history queries,
          // but call refetch implicitly via the useQuery refetchInterval — no
          // manual refresh needed.
        }}
      />
    </div>
  );
}
