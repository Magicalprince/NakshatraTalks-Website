'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ConnectionRequestStatus } from '@/stores/queue-store';
import { Loader2, CheckCircle, XCircle, Clock, Phone, MessageCircle } from 'lucide-react';
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
  requestStatus: ConnectionRequestStatus;
  selectedAstrologer: Astrologer | null;
  activeRequest: ActiveRequestInfo | null;
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  onCancel,
  onNavigateToSession,
  requestStatus,
  selectedAstrologer,
  activeRequest,
}: ConnectionRequestModalProps) {
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for waiting
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
            <p className="text-text-secondary mb-4 font-lexend">
              Checking availability and balance...
            </p>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </motion.div>
        );

      case 'waiting':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Avatar
                src={selectedAstrologer?.profileImage}
                fallback={selectedAstrologer?.name}
                size="xl"
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Waiting for {selectedAstrologer?.name}
            </h3>
            <p className="text-text-secondary mb-4 font-lexend">
              Your request has been sent. Waiting for the astrologer to accept...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(countdown / 60) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-xs text-text-muted mb-4 font-lexend">
              {countdown}s remaining
            </p>
            <Button variant="outline" onClick={onCancel}>
              Cancel Request
            </Button>
          </motion.div>
        );

      case 'connected':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-status-success" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Connected!
            </h3>
            <p className="text-text-secondary mb-4 font-lexend">
              You are now connected with {selectedAstrologer?.name}
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={onNavigateToSession}
            >
              {activeRequest?.type === 'chat' ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Start Chat
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Start Call
                </>
              )}
            </Button>
          </motion.div>
        );

      case 'rejected':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-status-error" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Request Declined
            </h3>
            <p className="text-text-secondary mb-4 font-lexend">
              {selectedAstrologer?.name} is not available at the moment. Please try again later or choose another astrologer.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </motion.div>
        );

      case 'timeout':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-status-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-status-warning" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-lexend">
              Request Timed Out
            </h3>
            <p className="text-text-secondary mb-4 font-lexend">
              {selectedAstrologer?.name} didn&apos;t respond in time. Please try again.
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
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
