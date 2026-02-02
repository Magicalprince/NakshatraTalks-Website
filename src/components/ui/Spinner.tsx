'use client';

import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'white' | 'secondary';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
};

const colorClasses = {
  primary: 'border-primary/20 border-t-primary',
  white: 'border-white/20 border-t-white',
  secondary: 'border-secondary/20 border-t-secondary',
};

export function Spinner({ size = 'md', className, color = 'primary' }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading spinner
export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-text-secondary font-lexend">{message}</p>
      )}
    </div>
  );
}

// Inline loading indicator
export function LoadingInline({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Spinner size="sm" />
      {message && (
        <span className="text-sm text-text-secondary font-lexend">{message}</span>
      )}
    </div>
  );
}
