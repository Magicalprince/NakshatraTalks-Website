import type { SalaryModeConfig } from '../lib/salaryMode';

interface AstrologerRateShape {
  chatPricePerMinute?: number | null;
  callPricePerMinute?: number | null;
  chatPrice?: number | null;
  callPrice?: number | null;
  pricePerMinute?: number | null;
}

export function effectivePricePerMinute(
  astrologer: AstrologerRateShape,
  type: 'chat' | 'call',
  salary: SalaryModeConfig
): number {
  if (salary.enabled) {
    return type === 'chat' ? salary.chatRate : salary.callRate;
  }
  const own =
    type === 'chat'
      ? astrologer.chatPrice ?? astrologer.chatPricePerMinute ?? astrologer.pricePerMinute
      : astrologer.callPrice ?? astrologer.callPricePerMinute ?? astrologer.pricePerMinute;
  return own ?? 0;
}
