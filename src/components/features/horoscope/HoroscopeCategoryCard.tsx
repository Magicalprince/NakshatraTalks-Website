'use client';

/**
 * HoroscopeCategoryCard Component
 * Displays horoscope prediction for a specific category (General, Love, Career, Health)
 */

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Heart, Briefcase, Activity, Sparkles } from 'lucide-react';

export type HoroscopeCategory = 'general' | 'love' | 'career' | 'health';

interface HoroscopeCategoryCardProps {
  category: HoroscopeCategory;
  prediction: string;
  index?: number;
  className?: string;
}

const CATEGORY_CONFIG: Record<
  HoroscopeCategory,
  { icon: typeof Sparkles; label: string; bgColor: string; iconColor: string }
> = {
  general: {
    icon: Sparkles,
    label: 'General',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  love: {
    icon: Heart,
    label: 'Love & Relationships',
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-500',
  },
  career: {
    icon: Briefcase,
    label: 'Career & Finance',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  health: {
    icon: Activity,
    label: 'Health & Wellness',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
};

export function HoroscopeCategoryCard({
  category,
  prediction,
  index = 0,
  className,
}: HoroscopeCategoryCardProps) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        'bg-white rounded-2xl p-5 shadow-sm border border-gray-100',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            config.bgColor
          )}
        >
          <Icon className={cn('w-6 h-6', config.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary mb-2">{config.label}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{prediction}</p>
        </div>
      </div>
    </motion.div>
  );
}
