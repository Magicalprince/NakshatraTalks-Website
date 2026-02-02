'use client';

import { Card } from '@/components/ui/Card';
import { ZODIAC_SIGNS, ELEMENT_COLORS } from '@/lib/services/horoscope.service';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ZodiacSelectorProps {
  selectedSign?: string;
  onSelect?: (sign: string) => void;
  linkMode?: boolean;
  className?: string;
}

export function ZodiacSelector({
  selectedSign,
  onSelect,
  linkMode = false,
  className,
}: ZodiacSelectorProps) {
  return (
    <div className={cn('grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3', className)}>
      {ZODIAC_SIGNS.map((sign, index) => {
        const isSelected = selectedSign === sign.id;
        const colors = ELEMENT_COLORS[sign.element];

        const content = (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className={cn(
                'p-4 text-center cursor-pointer transition-all',
                isSelected
                  ? 'border-2 border-primary bg-primary/5 shadow-glowPrimary'
                  : 'hover:border-primary/50 hover:shadow-md',
                colors.bg
              )}
              onClick={() => !linkMode && onSelect?.(sign.id)}
            >
              <span className="text-3xl mb-2 block">{sign.symbol}</span>
              <h3 className={cn('font-semibold text-sm', colors.text)}>{sign.name}</h3>
              <p className="text-xs text-text-muted mt-1">{sign.dateRange}</p>
            </Card>
          </motion.div>
        );

        if (linkMode) {
          return (
            <Link key={sign.id} href={`/horoscope/${sign.id}`}>
              {content}
            </Link>
          );
        }

        return <div key={sign.id}>{content}</div>;
      })}
    </div>
  );
}

// Single zodiac card for display
interface ZodiacCardProps {
  signId: string;
  size?: 'sm' | 'md' | 'lg';
  showDateRange?: boolean;
  className?: string;
}

export function ZodiacCard({
  signId,
  size = 'md',
  showDateRange = true,
  className,
}: ZodiacCardProps) {
  const sign = ZODIAC_SIGNS.find((s) => s.id === signId);
  if (!sign) return null;

  const colors = ELEMENT_COLORS[sign.element];
  const sizeClasses = {
    sm: 'p-3 text-2xl',
    md: 'p-4 text-4xl',
    lg: 'p-6 text-5xl',
  };

  return (
    <div className={cn('text-center', className)}>
      <div
        className={cn(
          'rounded-2xl inline-block mb-2',
          colors.bg,
          sizeClasses[size]
        )}
      >
        {sign.symbol}
      </div>
      <h2 className={cn('font-bold', colors.text, size === 'lg' ? 'text-2xl' : 'text-lg')}>
        {sign.name}
      </h2>
      {showDateRange && (
        <p className="text-sm text-text-muted">{sign.dateRange}</p>
      )}
    </div>
  );
}
