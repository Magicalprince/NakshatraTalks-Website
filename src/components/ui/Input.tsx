'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { cn } from '@/utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-text-primary font-lexend">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-text-muted">{leftIcon}</span>
            </div>
          )}
          <input
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-lexend text-text-primary',
              'placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-offWhite',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              error && 'border-status-error focus:ring-status-error',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-text-muted">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-status-error font-lexend">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-text-muted font-lexend">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
