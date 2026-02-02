'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { DailyHoroscope } from '@/types/api.types';
import { Sparkles, TrendingUp, Palette, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface HoroscopeContentProps {
  horoscope?: DailyHoroscope | null;
  isLoading?: boolean;
}

export function HoroscopeContent({ horoscope, isLoading }: HoroscopeContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (!horoscope) {
    return (
      <Card className="p-6 text-center">
        <p className="text-text-secondary">
          Horoscope not available for this date. Please try again later.
        </p>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Date */}
      <div className="flex items-center gap-2 text-text-muted">
        <Calendar className="w-4 h-4" />
        <span className="text-sm">{formatDate(horoscope.date)}</span>
      </div>

      {/* Main Prediction */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-1">Today&apos;s Prediction</h3>
            <p className="text-text-secondary leading-relaxed">{horoscope.prediction}</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {horoscope.luckyNumber && (
          <Card className="p-4 text-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xs text-text-muted">Lucky Number</p>
            <p className="text-lg font-bold text-primary">{horoscope.luckyNumber}</p>
          </Card>
        )}

        {horoscope.luckyColor && (
          <Card className="p-4 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Palette className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-text-muted">Lucky Color</p>
            <p className="text-sm font-semibold text-text-primary">{horoscope.luckyColor}</p>
          </Card>
        )}

        {horoscope.mood && (
          <Card className="p-4 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">😊</span>
            </div>
            <p className="text-xs text-text-muted">Mood</p>
            <p className="text-sm font-semibold text-text-primary">{horoscope.mood}</p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
