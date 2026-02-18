'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AnimatedToggle } from './AnimatedToggle';
import { cn } from '@/utils/cn';

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  isLast?: boolean;
  className?: string;
}

export function SettingRow({
  icon: Icon,
  label,
  description,
  toggle,
  checked,
  onToggle,
  onClick,
  href,
  danger,
  isLast,
  className,
}: SettingRowProps) {
  const content = (
    <div
      className={cn(
        'flex items-center justify-between p-4 transition-colors duration-200',
        !isLast && 'border-b border-gray-100',
        (onClick || href || toggle) && 'cursor-pointer hover:bg-background-offWhite',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? label : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200',
            danger ? 'bg-status-error/10' : 'bg-background-offWhite'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              danger ? 'text-status-error' : 'text-text-secondary'
            )}
          />
        </div>
        <div>
          <p
            className={cn(
              'font-medium text-sm',
              danger ? 'text-status-error' : 'text-text-primary'
            )}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {toggle ? (
        <AnimatedToggle
          checked={!!checked}
          onChange={(val) => onToggle?.(val)}
          label={`Toggle ${label}`}
        />
      ) : (
        <ChevronRight
          className={cn(
            'w-5 h-5 flex-shrink-0',
            danger ? 'text-status-error/50' : 'text-text-muted'
          )}
        />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Navigate to ${label}`}>
        {content}
      </Link>
    );
  }

  return content;
}
