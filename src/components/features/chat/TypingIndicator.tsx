'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

export function TypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn('flex items-center gap-2 px-4 py-2', className)}
    >
      <div className="flex items-center gap-1 px-4 py-2 bg-message-astrologer rounded-2xl rounded-bl-sm">
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 bg-text-muted rounded-full"
        />
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 bg-text-muted rounded-full"
        />
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 bg-text-muted rounded-full"
        />
      </div>
      {name && (
        <span className="text-xs text-text-muted">{name} is typing...</span>
      )}
    </motion.div>
  );
}
