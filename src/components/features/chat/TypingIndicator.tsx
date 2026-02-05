'use client';

/**
 * TypingIndicator Component
 * Design matches mobile app with:
 * - Yellow semi-transparent bubble
 * - Animated bouncing dots
 * - Positioned on the left (astrologer side)
 */

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn('w-full flex justify-start px-2 mb-2', className)}
    >
      <div
        className="px-4 py-3 shadow-sm"
        style={{
          backgroundColor: 'rgba(250, 204, 21, 0.5)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          boxShadow: '0 2px 5px rgba(35, 35, 35, 0.05)',
        }}
      >
        <div className="flex items-center gap-1">
          <motion.span
            animate={{
              opacity: [0.3, 1, 0.3],
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0,
            }}
            className="w-2 h-2 rounded-full bg-black/40"
          />
          <motion.span
            animate={{
              opacity: [0.3, 1, 0.3],
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.15,
            }}
            className="w-2 h-2 rounded-full bg-black/40"
          />
          <motion.span
            animate={{
              opacity: [0.3, 1, 0.3],
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: 0.3,
            }}
            className="w-2 h-2 rounded-full bg-black/40"
          />
        </div>
      </div>
    </motion.div>
  );
}
