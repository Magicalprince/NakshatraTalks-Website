'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface QueueConfirmDialogProps {
  open: boolean;
  type: 'chat' | 'call';
  astrologerName: string;
  currentQueueSize: number;
  estimatedWaitMinutes: number;
  canJoinQueue: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * QueueConfirmDialog
 *
 * Phase 2 T10 (website parity with mobile QueueConfirmModal from T6).
 *
 * Shown when a customer taps Chat/Call on a busy astrologer and the
 * backend returns ASTROLOGER_BUSY with queue availability info. Lets
 * the customer either confirm (joins the queue via the existing
 * handleJoinQueue path) or cancel. When the queue is full, surfaces a
 * single OK button instead.
 */
export const QueueConfirmDialog: React.FC<QueueConfirmDialogProps> = ({
  open,
  type,
  astrologerName,
  currentQueueSize,
  estimatedWaitMinutes,
  canJoinQueue,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const sessionWord = type === 'chat' ? 'chat' : 'call';
  const queuePosition = currentQueueSize + 1;
  const waitText =
    estimatedWaitMinutes >= 1
      ? `~${estimatedWaitMinutes} min`
      : 'depends on the current session';

  const body = canJoinQueue
    ? `${astrologerName || 'The astrologer'} is currently in a ${sessionWord} with another customer. You'll be #${queuePosition} in queue, est. wait ${waitText}.`
    : `${astrologerName || 'The astrologer'} is currently busy and the queue is full. Please try again later or pick another astrologer.`;

  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      title={`Astrologer is in another ${sessionWord}`}
      size="md"
      closeOnBackdrop={!loading}
      closeOnEsc={!loading}
    >
      <div className="space-y-6">
        <p className="text-sm text-text-secondary leading-relaxed font-lexend">
          {body}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {canJoinQueue ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onConfirm}
                isLoading={loading}
                disabled={loading}
              >
                {loading ? 'Joining…' : 'Join Queue'}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={onCancel}>
              OK
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QueueConfirmDialog;
