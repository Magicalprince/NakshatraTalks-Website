/**
 * Salary mode config fetcher.
 * Mirrors mobile's effective-rate contract — when enabled, every astrologer is
 * billed at the platform's flat chat/call rate instead of their own listed price.
 */

export interface SalaryModeConfig {
  enabled: boolean;
  chatRate: number;
  callRate: number;
}

const DEFAULT: SalaryModeConfig = { enabled: false, chatRate: 12, callRate: 25 };

export async function fetchSalaryMode(apiBaseUrl: string): Promise<SalaryModeConfig> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/settings/salary-mode`, { cache: 'no-store' });
    if (!res.ok) return DEFAULT;
    const json = await res.json();
    const data = json?.data ?? json;
    return {
      enabled: data?.enabled === true || data?.enabled === 'true',
      chatRate: Number(data?.chatRate) || DEFAULT.chatRate,
      callRate: Number(data?.callRate) || DEFAULT.callRate,
    };
  } catch {
    return DEFAULT;
  }
}
