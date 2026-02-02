'use client';

import { forwardRef, ImgHTMLAttributes, useState } from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

const avatarVariants = cva(
  'relative inline-flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20',
        '2xl': 'h-[93px] w-[89px]', // Specific size from mobile BrowseChat
      },
      bordered: {
        true: 'border-2 border-secondary',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      bordered: false,
    },
  }
);

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  onlineIndicator?: boolean;
  isOnline?: boolean;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      bordered,
      src,
      alt = 'Avatar',
      fallback,
      onlineIndicator = false,
      isOnline = false,
    },
    ref
  ) => {
    const [hasError, setHasError] = useState(false);

    // Get initials from fallback or alt
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const initials = fallback ? getInitials(fallback) : alt ? getInitials(alt) : '';

    // Size mapping for Next.js Image
    const sizeMap: Record<string, number> = {
      xs: 24,
      sm: 32,
      md: 48,
      lg: 64,
      xl: 80,
      '2xl': 93,
    };

    const sizeKey = size || 'md';
    const imageSize: number = sizeMap[sizeKey] ?? 48;

    // Online indicator size based on avatar size
    const indicatorSizeMap: Record<string, string> = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-3 w-3',
      lg: 'h-3.5 w-3.5',
      xl: 'h-4 w-4',
      '2xl': 'h-4 w-4',
    };

    const indicatorSize = indicatorSizeMap[size || 'md'] || 'h-3 w-3';

    return (
      <div
        ref={ref}
        className={cn('relative', avatarVariants({ size, bordered, className }))}
      >
        {src && !hasError ? (
          <Image
            src={src}
            alt={alt}
            width={imageSize as number}
            height={imageSize as number}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background-offWhite text-text-muted">
            {initials ? (
              <span
                className={cn(
                  'font-medium font-lexend',
                  size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm'
                )}
              >
                {initials}
              </span>
            ) : (
              <User
                className={cn(
                  size === 'xs' || size === 'sm' ? 'h-3 w-3' : 'h-5 w-5'
                )}
              />
            )}
          </div>
        )}

        {/* Online indicator */}
        {onlineIndicator && (
          <span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              indicatorSize,
              isOnline ? 'bg-status-success' : 'bg-text-muted'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar, avatarVariants };
