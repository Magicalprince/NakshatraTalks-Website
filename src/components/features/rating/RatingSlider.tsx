'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function RatingSlider({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  disabled = false,
  className,
}: RatingSliderProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const rating = index + 1;
        const isFilled = rating <= (hoverValue || value);

        return (
          <motion.button
            key={index}
            type="button"
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => !disabled && setHoverValue(rating)}
            onMouseLeave={() => !disabled && setHoverValue(0)}
            disabled={disabled}
            className={cn(
              'transition-colors focus:outline-none',
              disabled && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-300'
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

// Display-only rating component
interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = 'sm',
  showValue = true,
  className,
}: RatingDisplayProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < Math.round(rating);
        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-gray-300'
            )}
          />
        );
      })}
      {showValue && (
        <span className="text-sm text-text-secondary ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
