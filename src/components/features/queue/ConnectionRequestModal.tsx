'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useQueueStore } from '@/stores/queue-store';
import { Loader2, CheckCircle, XCircle, Clock, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectionRequestModal({ isOpen, onClose }: ConnectionRequestModalProps) {
  const {
    activeRequest,
    selectedAstrologer,
    requestStatus,
    queuePosition,
    estimatedWaitTime,
    cancelRequest,
    clearRequest,
  } = useQueueStore();

  const [countdown, setCountdown] = useState(60);

  // Countdown timer for waiting
  useEffect(() => {
    if (requestStatus !== 'waiting' && requestStatus !== 'connecting') return;

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

  // Reset countdown when status changes
  useEffect(() => {
    if (requestStatus === 'waiting') {
      setCountdown(60);
    }
  }, [requestStatus]);

  const handleCancel = () => {
    cancelRequest();
    clearRequest();
    onClose();
  };

  const handleClose = () => {
    if (requestStatus === 'connected' || requestStatus === 'rejected' || requestStatus === 'timeout') {
      clearRequest();
    }
    onClose();
  };

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
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Connecting to {selectedAstrologer?.name}
            </h3>
            <p className="text-text-secondary mb-4">
              Please wait while we connect you...
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
              <div className="absolute -bottom-1 -right-1 bg-secondary text-text-primary text-xs font-bold px-2 py-1 rounded-full">
                #{queuePosition || 1}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Waiting in Queue
            </h3>
            <p className="text-text-secondary mb-2">
              {selectedAstrologer?.name} is currently with another client
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-text-muted">
                <Clock className="w-4 h-4" />
                <span>~{estimatedWaitTime || 5} min</span>
              </div>
              <div className="text-text-muted">|</div>
              <div className="text-text-muted">
                Position: {queuePosition || 1}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(countdown / 60) * 100}%` }}
              />
            </div>
            <Button variant="outline" onClick={handleCancel}>
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
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Connected!
            </h3>
            <p className="text-text-secondary mb-4">
              You are now connected with {selectedAstrologer?.name}
            </p>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => {
                // Navigate to chat/call session
                const type = activeRequest?.type;
                const sessionId = activeRequest?.sessionId;
                if (sessionId) {
                  window.location.href = `/${type}/${sessionId}`;
                }
              }}
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
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Request Declined
            </h3>
            <p className="text-text-secondary mb-4">
              {selectedAstrologer?.name} is not available at the moment. Please try again later or choose another astrologer.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  clearRequest();
                  onClose();
                }}
              >
                Browse Others
              </Button>
            </div>
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
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Request Timed Out
            </h3>
            <p className="text-text-secondary mb-4">
              {selectedAstrologer?.name} didn&apos;t respond in time. Would you like to try again?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  // Retry the request
                  if (selectedAstrologer && activeRequest) {
                    useQueueStore.getState().createRequest(selectedAstrologer, activeRequest.type);
                  }
                }}
              >
                Try Again
              </Button>
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
      onClose={handleClose}
      showCloseButton={requestStatus !== 'connecting' && requestStatus !== 'waiting'}
      className="max-w-sm"
    >
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </Modal>
  );
}
