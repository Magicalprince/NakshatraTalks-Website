'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-lexend',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary-dark shadow-button hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] ripple',
        secondary:
          'bg-secondary text-text-primary hover:bg-secondary-dark shadow-button hover:shadow-lg hover:shadow-secondary/20 active:scale-[0.98] ripple',
        outline:
          'border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-[0.98]',
        ghost:
          'text-text-primary hover:bg-background-offWhite active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline',
        danger: 'bg-status-error text-white hover:bg-red-600 shadow-button',
        success: 'bg-status-success text-white hover:bg-green-600 shadow-button',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-lg',
        md: 'h-11 px-4 text-base rounded-xl',
        lg: 'h-13 px-6 text-md rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-full',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

const spinnerSizeClasses: Record<string, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-5 w-5',
  icon: 'h-4 w-4',
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const spinnerClass = spinnerSizeClasses[size ?? 'md'] ?? 'h-4 w-4';

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn('mr-2 animate-spin', spinnerClass)} />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
