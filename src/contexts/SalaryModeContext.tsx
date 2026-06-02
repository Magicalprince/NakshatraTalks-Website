'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSalaryMode, type SalaryModeConfig } from '../lib/salaryMode';

const DEFAULT: SalaryModeConfig = { enabled: false, chatRate: 12, callRate: 25 };

export const SalaryModeContext = createContext<SalaryModeConfig>(DEFAULT);

export const useSalaryMode = () => useContext(SalaryModeContext);

interface SalaryModeProviderProps {
  apiBaseUrl: string;
  initial?: SalaryModeConfig;
  children: React.ReactNode;
}

export const SalaryModeProvider: React.FC<SalaryModeProviderProps> = ({
  apiBaseUrl,
  initial,
  children,
}) => {
  const [config, setConfig] = useState<SalaryModeConfig>(initial ?? DEFAULT);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      fetchSalaryMode(apiBaseUrl).then((c) => {
        if (!cancelled) setConfig(c);
      });
    };
    refresh();
    const id = setInterval(refresh, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [apiBaseUrl]);

  return (
    <SalaryModeContext.Provider value={config}>
      {children}
    </SalaryModeContext.Provider>
  );
};
