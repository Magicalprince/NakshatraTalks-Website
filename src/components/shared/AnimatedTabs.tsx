'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Tab {
  key: string;
  label: string;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeKey: string;
  onTabChange: (key: string) => void;
  layoutId: string;
  className?: string;
  ariaLabel?: string;
}

export function AnimatedTabs({
  tabs,
  activeKey,
  onTabChange,
  layoutId,
  className,
  ariaLabel,
}: AnimatedTabsProps) {
  return (
    <div
      className={cn('flex border-b border-gray-200', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeKey === tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            'py-3 px-5 text-sm font-medium font-lexend transition-colors relative whitespace-nowrap',
            activeKey === tab.key
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {tab.label}
          {activeKey === tab.key && (
            <motion.div
              layoutId={layoutId}
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
