'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ConnectionRequestStatus } from '@/stores/queue-store';
import { Loader2, CheckCircle, XCircle, Clock, Phone, MessageCircle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Astrologer, SessionType } from '@/types/api.types';

interface ActiveRequestInfo {
  type: SessionType;
  sessionId?: string;
}

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onNavigateToSession: () => void;
  onJoinQueue?: (astrologerId: string, type: SessionType) => void;
  requestStatus: ConnectionRequestStatus;
  selectedAstrologer: Astrologer | null;
  activeRequest: ActiveRequestInfo | null;
  astrologerId?: string;
  type?: SessionType;
  queueData?: {
    queueId: string;
    position: number;
    estimatedWaitMinutes: number;
  } | null;
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  onCancel,
  onNavigateToSession,
  onJoinQueue,
  requestStatus,
  selectedAstrologer,
  activeRequest,
  astrologerId,
  type,
  queueData,
}: ConnectionRequestModalProps) {
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for waiting state
  useEffect(() => {
    if (requestStatus !== 'waiting' && requestStatus !== 'connecting') return;

    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [requestStatus]);

  const renderContent = () => {
    switch (requestStatus) {
      case 'connecting':
        return (
          <motion.div
            key="connecting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Avatar
                src={selectedAstrologer?.profileImage}
                fallback={selectedAstrologer?.name}
                size="xl"
              />
              <motion.div
                className="absolute inset-0 border-4 border-primary rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Connecting to {selectedAstrologer?.name}
            </h3>
            <p className="text-text-secondary mb-4 font-nunito">
              Checking availability and balance...
            </p>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </motion.div>
        );

      case 'waiting':
        return (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Avatar
                src={selectedAstrologer?.profileImage}
                fallback={selectedAstrologer?.name}
                size="xl"
              />
              {/* Pulsing ring animation (matching mobile) */}
              <motion.div
                className="absolute inset-0 border-4 border-primary/30 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Waiting for {selectedAstrologer?.name}
            </h3>
            <p className="text-text-secondary mb-2 font-nunito text-sm">
              Your request has been sent. Waiting for the astrologer to accept...
            </p>

            {/* Countdown timer */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden">
              <motion.div
                className={`h-2.5 rounded-full ${countdown <= 10 ? 'bg-red-500' : 'bg-primary'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(countdown / 60) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className={`text-sm font-semibold mb-4 font-lexend ${countdown <= 10 ? 'text-red-500' : 'text-text-muted'}`}>
              {countdown}s remaining
            </p>

            <Button variant="outline" onClick={onCancel} className="gap-2">
              Cancel Request
            </Button>
          </motion.div>
        );

      case 'connected':
        return (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <motion.div
              className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-8 h-8 text-status-success" />
            </motion.div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Connected!
            </h3>
            <p className="text-text-secondary mb-2 font-nunito text-sm">
              You are now connected with {selectedAstrologer?.name}
            </p>
            <p className="text-xs text-text-muted mb-4 font-nunito">
              Redirecting automatically...
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={onNavigateToSession}
            >
              {activeRequest?.type === 'chat' ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Start Chat Now
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Start Call Now
                </>
              )}
            </Button>
          </motion.div>
        );

      case 'queued':
        return (
          <motion.div
            key="queued"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-indigo-50 flex items-center justify-center">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <motion.div
                className="absolute inset-0 border-4 border-indigo-200 rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              You&apos;re in the Queue
            </h3>
            <p className="text-text-secondary mb-4 font-nunito text-sm">
              Waiting for {selectedAstrologer?.name} to be available
            </p>

            {queueData && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary font-nunito">Your Position</span>
                  <span className="text-lg font-bold text-indigo-600 font-lexend">
                    #{queueData.position}
                  </span>
                </div>
                {queueData.estimatedWaitMinutes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary font-nunito">Est. Wait</span>
                    <span className="text-sm font-semibold text-text-primary font-lexend">
                      ~{queueData.estimatedWaitMinutes} min
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-text-muted mb-4 font-nunito">
              We&apos;ll automatically connect you when it&apos;s your turn. You can close this and continue browsing.
            </p>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose} className="gap-2">
                Continue Browsing
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={onCancel}
              >
                Leave Queue
              </Button>
            </div>
          </motion.div>
        );

      case 'rejected':
        return (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-status-error" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Request Declined
            </h3>
            <p className="text-text-secondary mb-4 font-nunito text-sm">
              {selectedAstrologer?.name} is not available at the moment. You can join the queue to be notified when they&apos;re free.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onJoinQueue && astrologerId && type && (
                <Button
                  variant="primary"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => onJoinQueue(astrologerId, type)}
                >
                  <Users className="w-4 h-4" />
                  Join Queue
                </Button>
              )}
            </div>
          </motion.div>
        );

      case 'timeout':
        return (
          <motion.div
            key="timeout"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-status-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-status-warning" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Request Timed Out
            </h3>
            <p className="text-text-secondary mb-4 font-nunito text-sm">
              {selectedAstrologer?.name} didn&apos;t respond in time. You can join the queue to try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onJoinQueue && astrologerId && type && (
                <Button
                  variant="primary"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => onJoinQueue(astrologerId, type)}
                >
                  <Users className="w-4 h-4" />
                  Join Queue
                </Button>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={requestStatus !== 'connecting' && requestStatus !== 'waiting'}
      className="max-w-sm"
    >
      <div className="p-6">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
