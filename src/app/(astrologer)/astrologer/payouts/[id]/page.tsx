'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useWithdrawalDetail } from '@/hooks/useAstrologerDashboard';
import { useSalaryMode } from '@/contexts/SalaryModeContext';
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

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function PayoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const salaryMode = useSalaryMode();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;

  const { data: withdrawal, isLoading, error } = useWithdrawalDetail(id);

  if (salaryMode.enabled) {
    router.replace('/astrologer/payouts');
    return null;
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/astrologer/dashboard' },
            { label: 'Payouts', href: '/astrologer/payouts' },
            { label: id ? `#${id.slice(0, 8)}` : 'Detail' },
          ]}
        />

        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to payouts
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : error || !withdrawal ? (
          <Card className="p-6 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-status-error" />
            <p className="mt-3 font-medium text-text-primary">Could not load payout</p>
            <p className="mt-1 text-sm text-text-muted">
              {error instanceof Error ? error.message : 'Withdrawal not found.'}
            </p>
          </Card>
        ) : (
          <>
            {/* Headline card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Withdrawal amount</p>
                    <p className="font-lexend mt-1 text-3xl font-bold text-text-primary">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      Requested {formatDateTime(withdrawal.created_at)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANTS[withdrawal.status]} className="shrink-0">
                    {STATUS_LABELS[withdrawal.status]}
                  </Badge>
                </div>
              </Card>
            </motion.div>

            {/* Detail rows */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4"
            >
              <Card className="p-6">
                <h2 className="font-lexend mb-4 text-base font-semibold text-text-primary">
                  Details
                </h2>
                <dl className="space-y-3">
                  <DetailRow label="Method">
                    {withdrawal.upi_id
                      ? `UPI: ${withdrawal.upi_id}`
                      : withdrawal.bank_account_id
                        ? 'Bank transfer'
                        : '—'}
                  </DetailRow>
                  <DetailRow label="Estimated arrival">
                    {formatDateTime(withdrawal.estimated_arrival)}
                  </DetailRow>
                  <DetailRow label="Processed">{formatDateTime(withdrawal.processed_at)}</DetailRow>
                  {withdrawal.reference_number && (
                    <DetailRow label="Reference">{withdrawal.reference_number}</DetailRow>
                  )}
                  {withdrawal.rejection_reason && (
                    <DetailRow label="Reason">
                      <span className="text-status-error">{withdrawal.rejection_reason}</span>
                    </DetailRow>
                  )}
                  {withdrawal.notes && <DetailRow label="Notes">{withdrawal.notes}</DetailRow>}
                </dl>
              </Card>
            </motion.div>
          </>
        )}
      </PageContainer>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-text-primary">{children}</dd>
    </div>
  );
}
