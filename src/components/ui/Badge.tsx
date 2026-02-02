'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium font-lexend transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/20 text-text-primary',
        success: 'bg-status-success/10 text-status-success',
        error: 'bg-status-error/10 text-status-error',
        warning: 'bg-status-warning/10 text-status-warning',
        info: 'bg-status-info/10 text-status-info',
        outline: 'border border-current bg-transparent',
        online: 'bg-status-success/10 text-status-success',
        offline: 'bg-gray-100 text-text-muted',
        live: 'bg-red-500 text-white animate-pulse',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
              variant === 'success' || variant === 'online'
                ? 'bg-status-success'
                : variant === 'error'
                ? 'bg-status-error'
                : variant === 'warning'
                ? 'bg-status-warning'
                : variant === 'info'
                ? 'bg-status-info'
                : variant === 'live'
                ? 'bg-white'
                : 'bg-current'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
