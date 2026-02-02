'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore, ToastType } from '@/stores/ui-store';

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-status-success" />,
  error: <AlertCircle className="h-5 w-5 text-status-error" />,
  warning: <AlertTriangle className="h-5 w-5 text-status-warning" />,
  info: <Info className="h-5 w-5 text-status-info" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-l-4 border-l-status-success',
  error: 'border-l-4 border-l-status-error',
  warning: 'border-l-4 border-l-status-warning',
  info: 'border-l-4 border-l-status-info',
};

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg bg-white p-4 shadow-modal min-w-[300px] max-w-[400px]',
              toastStyles[toast.type]
            )}
          >
            <div className="flex-shrink-0 mt-0.5">{toastIcons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary font-lexend">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-1 text-sm text-text-secondary font-lexend">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-full p-1 text-text-muted hover:bg-background-offWhite hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
