'use client';

/**
 * HoroscopeDayTabs Component
 * Tab switcher for selecting horoscope day (Yesterday, Today, Tomorrow)
 */

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export type HoroscopeDay = 'yesterday' | 'today' | 'tomorrow';

interface HoroscopeDayTabsProps {
  activeDay: HoroscopeDay;
  onDayChange: (day: HoroscopeDay) => void;
  className?: string;
}

const DAYS: { id: HoroscopeDay; label: string }[] = [
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
];

export function HoroscopeDayTabs({
  activeDay,
  onDayChange,
  className,
}: HoroscopeDayTabsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {DAYS.map((day) => {
        const isActive = activeDay === day.id;
        return (
          <button
            key={day.id}
            onClick={() => onDayChange(day.id)}
            className={cn(
              'relative px-5 py-2 rounded-full text-sm font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="dayTabIndicator"
                className="absolute inset-0 bg-secondary rounded-full"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{day.label}</span>
          </button>
        );
      })}
    </div>
  );
}
