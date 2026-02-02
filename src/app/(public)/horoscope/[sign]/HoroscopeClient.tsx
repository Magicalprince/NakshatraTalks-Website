'use client';

import { HoroscopeContent } from '@/components/features/horoscope';
import { useDailyHoroscope } from '@/hooks/useHoroscope';

interface HoroscopeClientProps {
  signId: string;
}

export function HoroscopeClient({ signId }: HoroscopeClientProps) {
  const { data: horoscope, isLoading } = useDailyHoroscope(signId);

  return <HoroscopeContent horoscope={horoscope} isLoading={isLoading} />;
}
