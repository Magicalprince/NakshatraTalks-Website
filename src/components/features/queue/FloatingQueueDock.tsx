'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageCircle, Clock, Users, AlertTriangle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface FloatingQueueDockProps {
  queueEntry: {
    queueId: string;
    astrologerName: string;
    astrologerImage?: string;
    position: number;
    estimatedWaitMinutes: number;
    expiresAt: string;
    status: string;
    type: 'call' | 'chat';
  };
  sessionId?: string;
  onLeave: (queueId: string) => void;
  onStartSession?: () => void;
}

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function FloatingQueueDock({
  queueEntry,
  sessionId,
  onLeave,
  onStartSession,
}: FloatingQueueDockProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const diff = Math.floor(
      (new Date(queueEntry.expiresAt).getTime() - Date.now()) / 1000
    );
    return Math.max(0, diff);
  });
  const [showConfirm, setShowConfirm] = useState(false);

  // Recalculate remaining seconds when expiresAt changes
  useEffect(() => {
    const diff = Math.floor(
      (new Date(queueEntry.expiresAt).getTime() - Date.now()) / 1000
    );
    setRemainingSeconds(Math.max(0, diff));
  }, [queueEntry.expiresAt]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queueEntry.expiresAt]);

  const handleLeaveClick = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    setShowConfirm(false);
    onLeave(queueEntry.queueId);
  }, [onLeave, queueEntry.queueId]);

  const handleCancelLeave = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const isReady = queueEntry.status === 'notified';
  const isExpiring = !isReady && remainingSeconds > 0 && remainingSeconds < 60;

  // Determine background based on state
  const getBackgroundClass = (): string => {
    if (isReady) {
      return 'bg-emerald-900/95 backdrop-blur-xl border-t border-emerald-500/30';
    }
    if (isExpiring) {
      return 'bg-amber-900/95 backdrop-blur-xl border-t border-amber-500/30';
    }
    return 'bg-gray-900/95 backdrop-blur-xl border-t border-white/10';
  };

  const TypeIcon = queueEntry.type === 'call' ? Phone : MessageCircle;
  const typeLabel = queueEntry.type === 'call' ? 'Call' : 'Chat';
  const sessionPath = queueEntry.type === 'call' ? `/call/${sessionId}` : `/chat/${sessionId}`;

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="floating-queue-dock"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] ${getBackgroundClass()}`}
        >
          <div className="mx-auto max-w-screen-xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Astrologer info */}
              <div className="flex items-center gap-2.5 min-w-0 shrink">
                <Avatar
                  src={queueEntry.astrologerImage}
                  fallback={queueEntry.astrologerName}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate font-lexend">
                    {queueEntry.astrologerName}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 font-lexend">
                    <TypeIcon className="h-3 w-3" />
                    {typeLabel}
                  </span>
                </div>
              </div>

              {/* Center: Position & wait time */}
              <div className="flex flex-col items-center shrink-0">
                {isReady ? (
                  <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm font-semibold text-emerald-300 font-lexend"
                  >
                    Your Turn!
                  </motion.p>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white font-lexend">
                      <Users className="h-3.5 w-3.5 text-white/60" />
                      <span>Queue #{queueEntry.position}</span>
                    </div>
                    <p className="text-xs text-white/60 font-lexend">
                      ~{queueEntry.estimatedWaitMinutes} min
                    </p>
                  </>
                )}
              </div>

              {/* Right: Timer + Action */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Timer */}
                <div
                  className={`flex items-center gap-1 text-sm font-mono ${
                    isExpiring
                      ? 'text-amber-300'
                      : isReady
                        ? 'text-emerald-300'
                        : 'text-white/70'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(remainingSeconds)}</span>
                </div>

                {/* Action button */}
                {isReady ? (
                  sessionId ? (
                    <Link href={sessionPath}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={onStartSession}
                        className="gap-1.5 font-lexend"
                      >
                        <TypeIcon className="h-3.5 w-3.5" />
                        Start Now
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={onStartSession}
                      className="gap-1.5 font-lexend"
                    >
                      <TypeIcon className="h-3.5 w-3.5" />
                      Start Now
                    </Button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleLeaveClick}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                    aria-label="Leave queue"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Leave Queue Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              key="confirm-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={handleCancelLeave}
            />
            {/* Dialog */}
            <motion.div
              key="confirm-dialog"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-lexend mb-2">
                  Leave Queue?
                </h3>
                <p className="text-sm text-gray-500 font-nunito mb-6">
                  You are <span className="font-semibold text-gray-700">#{queueEntry.position}</span> in queue for{' '}
                  <span className="font-semibold text-gray-700">{queueEntry.astrologerName}</span>.
                  Leaving will cancel your position and the astrologer will be notified.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelLeave}
                  >
                    Stay in Queue
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    onClick={handleConfirmLeave}
                  >
                    Leave Queue
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
