'use client';

import React from 'react';
import { useSalaryMode } from '../../contexts/SalaryModeContext';
import { effectivePricePerMinute } from '../../utils/effectivePrice';

interface Astrologer {
  chatPrice?: number | null;
  callPrice?: number | null;
  chatPricePerMinute?: number | null;
  callPricePerMinute?: number | null;
  pricePerMinute?: number | null;
}

interface PriceLabelProps {
  astrologer: Astrologer;
  type: 'chat' | 'call';
  suffix?: string;
  className?: string;
}

export const PriceLabel: React.FC<PriceLabelProps> = ({
  astrologer,
  type,
  suffix = '/min',
  className,
}) => {
  const salary = useSalaryMode();
  const rate = effectivePricePerMinute(astrologer, type, salary);
  return <span className={className}>{`${rate}${suffix}`}</span>;
};
