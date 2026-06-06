'use client';

import { useState, useCallback } from 'react';
import { ArrowUpFromLine, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { earningsService } from '@/lib/services/earnings.service';
import { formatCurrency } from '@/utils/format-currency';
import { cn } from '@/utils/cn';

interface SavedPayoutMethods {
  accountNumber?: string | null;
  ifscCode?: string | null;
  bankName?: string | null;
  upiId?: string | null;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  totalWithdrawn: number;
  savedMethods: SavedPayoutMethods;
  onWithdrawSuccess: () => void;
}

const MIN_WITHDRAWAL = 100;

type ModalState = 'input' | 'confirming' | 'loading' | 'success' | 'error';

/**
 * Astrologer withdrawal request modal — mirrors the mobile WithdrawModal
 * (components/astrologer/earnings/WithdrawModal.tsx) state machine:
 *   input → confirming → loading → success|error
 *
 * Method picker only offers SAVED payout methods (no inline UPI entry). The
 * astrologer maintains payout details on the Settings page; this modal just
 * picks which saved method to use. If neither bank nor UPI is saved, a
 * banner blocks submission with a pointer to settings.
 *
 * For bank withdrawals the payload uses bankAccountId: 'saved' — the
 * backend snapshots the astrologer's saved bank fields onto the withdrawal
 * row server-side, so changing bank details later never retroactively
 * mutates a historic payout.
 */
export function WithdrawModal({
  isOpen,
  onClose,
  availableBalance,
  totalWithdrawn,
  savedMethods,
  onWithdrawSuccess,
}: WithdrawModalProps) {
  const hasSavedBank = !!(savedMethods.accountNumber && savedMethods.ifscCode);
  const hasSavedUpi = !!(savedMethods.upiId && savedMethods.upiId.trim().length > 0);
  const hasAnyMethod = hasSavedBank || hasSavedUpi;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'upi'>(hasSavedBank ? 'bank' : 'upi');
  const [modalState, setModalState] = useState<ModalState>('input');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ id: string; estimatedArrival: string } | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount >= MIN_WITHDRAWAL && parsedAmount <= availableBalance;
  const methodIsUsable = method === 'bank' ? hasSavedBank : hasSavedUpi;
  const canSubmit = isValidAmount && methodIsUsable && hasAnyMethod;

  const resetAndClose = useCallback(() => {
    setAmount('');
    setMethod(hasSavedBank ? 'bank' : 'upi');
    setModalState('input');
    setErrorMessage('');
    setSuccessData(null);
    onClose();
  }, [hasSavedBank, onClose]);

  const handleConfirm = useCallback(() => {
    if (!canSubmit) return;
    setModalState('confirming');
  }, [canSubmit]);

  const submitWithdrawal = useCallback(async () => {
    try {
      setModalState('loading');
      const payload: { amount: number; bankAccountId?: string; upiId?: string } = {
        amount: parsedAmount,
      };
      if (method === 'bank') {
        payload.bankAccountId = 'saved';
      } else {
        if (!savedMethods.upiId) {
          setErrorMessage('No UPI ID saved. Add one in Settings before requesting a payout.');
          setModalState('error');
          return;
        }
        payload.upiId = savedMethods.upiId;
      }
      const response = await earningsService.requestWithdrawal(payload);
      setSuccessData({ id: response.id, estimatedArrival: response.estimatedArrival });
      setModalState('success');
      onWithdrawSuccess();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Withdrawal request failed.');
      setModalState('error');
    }
  }, [parsedAmount, method, savedMethods.upiId, onWithdrawSuccess]);

  const renderInput = () => (
    <>
      <div className="rounded-2xl bg-primary p-5 text-center text-white">
        <div className="text-xs opacity-80">Available for Withdrawal</div>
        <div className="mt-1 text-3xl font-bold">{formatCurrency(availableBalance)}</div>
        <div className="mt-2 text-xs opacity-60">
          Total withdrawn: {formatCurrency(totalWithdrawn)}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {hasAnyMethod ? (
          <div>
            <div className="mb-2 text-xs font-medium text-text-muted">Payout method</div>
            <div className="flex flex-wrap gap-2">
              {hasSavedBank && (
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition',
                    method === 'bank'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-gray-50 text-text-muted hover:border-primary',
                  )}
                >
                  Bank •••{savedMethods.accountNumber?.slice(-4) ?? ''}
                </button>
              )}
              {hasSavedUpi && (
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition',
                    method === 'upi'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-gray-50 text-text-muted hover:border-primary',
                  )}
                >
                  UPI: {(savedMethods.upiId ?? '').length > 18
                    ? `${(savedMethods.upiId ?? '').slice(0, 16)}…`
                    : savedMethods.upiId}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-xs leading-5 text-amber-800">
              Add bank details or a UPI ID in Settings before requesting a payout.
            </p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Withdrawal Amount
          </label>
          <div className="flex h-12 items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4">
            <span className="mr-2 text-lg font-semibold text-text-primary">₹</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter amount"
              maxLength={10}
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-gray-400"
            />
          </div>
          {amount.length > 0 && parsedAmount < MIN_WITHDRAWAL && (
            <p className="mt-1.5 text-xs text-status-error">
              Minimum withdrawal amount is {formatCurrency(MIN_WITHDRAWAL)}
            </p>
          )}
          {amount.length > 0 && parsedAmount > availableBalance && (
            <p className="mt-1.5 text-xs text-status-error">Amount exceeds available balance</p>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
          <p className="text-xs leading-5 text-text-muted">
            Withdrawals are processed within 2-3 business days. Minimum withdrawal:{' '}
            {formatCurrency(MIN_WITHDRAWAL)}
          </p>
        </div>

        <Button onClick={handleConfirm} disabled={!canSubmit} fullWidth size="lg">
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Withdraw {amount ? formatCurrency(parsedAmount) : ''}
        </Button>
      </div>
    </>
  );

  const renderConfirm = () => (
    <>
      <div className="rounded-2xl bg-gray-50 p-5">
        <h3 className="mb-4 text-center text-base font-semibold">Confirm Withdrawal</h3>
        <div className="space-y-2">
          <ConfirmRow label="Amount" value={formatCurrency(parsedAmount)} />
          {method === 'bank' ? (
            <ConfirmRow
              label="Payout method"
              value={`Bank •••${savedMethods.accountNumber?.slice(-4) ?? ''}`}
            />
          ) : (
            <ConfirmRow label="UPI ID" value={savedMethods.upiId ?? '—'} />
          )}
          <ConfirmRow label="Processing Time" value="2-3 business days" isLast />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Button variant="secondary" fullWidth size="lg" onClick={() => setModalState('input')}>
          Go Back
        </Button>
        <Button fullWidth size="lg" onClick={submitWithdrawal}>
          Confirm
        </Button>
      </div>
    </>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-base font-medium text-text-primary">
        Processing your withdrawal...
      </p>
      <p className="mt-1 text-sm text-text-muted">Please don&apos;t close this window</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-9 w-9 text-status-success" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-status-success">Withdrawal Requested!</h3>
      <p className="mt-1 text-2xl font-bold">{formatCurrency(parsedAmount)}</p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
        Your withdrawal request has been submitted. The amount will be credited to your account
        within 2-3 business days.
      </p>
      {successData?.id && (
        <p className="mt-2 text-xs text-text-muted">Reference: {successData.id}</p>
      )}
      <Button onClick={resetAndClose} size="lg" className="mt-6 px-12">
        Done
      </Button>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-9 w-9 text-status-error" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-status-error">Withdrawal Failed</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">{errorMessage}</p>
      <div className="mt-6 flex w-full gap-3">
        <Button variant="secondary" fullWidth size="lg" onClick={resetAndClose}>
          Cancel
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={() => {
            setErrorMessage('');
            setModalState('confirming');
          }}
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  const title =
    modalState === 'success'
      ? 'Success'
      : modalState === 'error'
        ? 'Error'
        : 'Withdraw Earnings';

  return (
    <Modal
      isOpen={isOpen}
      onClose={modalState === 'loading' ? () => undefined : resetAndClose}
      title={title}
      size="md"
      closeOnBackdrop={modalState !== 'loading'}
      closeOnEsc={modalState !== 'loading'}
      showCloseButton={modalState !== 'loading'}
    >
      {modalState === 'input' && renderInput()}
      {modalState === 'confirming' && renderConfirm()}
      {modalState === 'loading' && renderLoading()}
      {modalState === 'success' && renderSuccess()}
      {modalState === 'error' && renderError()}
    </Modal>
  );
}

function ConfirmRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2.5',
        !isLast && 'border-b border-gray-200',
      )}
    >
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}
