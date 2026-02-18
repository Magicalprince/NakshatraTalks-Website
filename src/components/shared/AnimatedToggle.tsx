'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  colorScheme?: 'primary' | 'success';
  disabled?: boolean;
  className?: string;
}

export function AnimatedToggle({
  checked,
  onChange,
  label,
  colorScheme = 'primary',
  disabled,
  className,
}: AnimatedToggleProps) {
  return (
    <label className={cn('relative inline-flex items-center flex-shrink-0', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
        aria-label={label}
        disabled={disabled}
      />
      <motion.div
        className={cn(
          'w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 relative',
          checked
            ? colorScheme === 'success'
              ? 'bg-status-success'
              : 'bg-primary'
            : 'bg-gray-200'
        )}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 shadow-sm"
          animate={{
            x: checked ? 20 : 0,
            borderColor: checked ? 'rgba(255,255,255,0.8)' : 'rgba(209,213,219,1)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </label>
  );
}
