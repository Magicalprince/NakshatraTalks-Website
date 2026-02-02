'use client';

import { RechargeOption } from '@/types/api.types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Check, Sparkles, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface RechargeGridProps {
  options: RechargeOption[];
  selectedOption: RechargeOption | null;
  onSelectOption: (option: RechargeOption) => void;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function RechargeGrid({
  options,
  selectedOption,
  onSelectOption,
  isLoading,
}: RechargeGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!options.length) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No recharge options available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {options.map((option, index) => {
        const isSelected = selectedOption?.id === option.id;
        const hasBonus = option.bonus && option.bonus > 0;
        const isPopular = option.isPopular || option.tag === 'POPULAR';

        return (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={cn(
                'relative p-4 cursor-pointer transition-all duration-200',
                isSelected
                  ? 'border-2 border-primary bg-primary/5 shadow-glowPrimary'
                  : 'hover:border-primary/50 hover:shadow-md'
              )}
              onClick={() => onSelectOption(option)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 gap-1 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  Popular
                </Badge>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Amount */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee className="w-5 h-5 text-text-primary" />
                  <span className="text-2xl font-bold text-text-primary">
                    {formatCurrency(option.amount)}
                  </span>
                </div>

                {/* Bonus */}
                {hasBonus && (
                  <p className="text-sm text-status-success font-medium">
                    +{formatCurrency(option.bonus!)} Bonus
                  </p>
                )}

                {/* Total Value */}
                {hasBonus && (
                  <p className="text-xs text-text-muted mt-1">
                    Total: {formatCurrency(option.amount + option.bonus!)}
                  </p>
                )}

                {/* Description */}
                {option.description && (
                  <p className="text-xs text-text-secondary mt-2">
                    {option.description}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// Custom amount input component
interface CustomAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  minAmount?: number;
  maxAmount?: number;
}

export function CustomAmountInput({
  value,
  onChange,
  minAmount = 100,
  maxAmount = 50000,
}: CustomAmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '' || (Number(val) >= 0 && Number(val) <= maxAmount)) {
      onChange(val);
    }
  };

  const isValid = value === '' || (Number(value) >= minAmount && Number(value) <= maxAmount);

  return (
    <Card className="p-4">
      <label className="text-sm font-medium text-text-primary mb-2 block">
        Or enter custom amount
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">₹</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          placeholder="Enter amount"
          className={cn(
            'w-full h-12 pl-8 pr-4 rounded-lg border text-lg font-semibold focus:outline-none focus:ring-2',
            isValid
              ? 'border-gray-300 focus:border-primary focus:ring-primary/20'
              : 'border-status-error focus:border-status-error focus:ring-status-error/20'
          )}
        />
      </div>
      <p className="text-xs text-text-muted mt-2">
        Min: ₹{formatCurrency(minAmount)} • Max: ₹{formatCurrency(maxAmount)}
      </p>
    </Card>
  );
}
