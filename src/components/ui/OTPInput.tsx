'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled,
  autoFocus = true,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Convert value string to array
  const valueArray = value.split('').slice(0, length);
  while (valueArray.length < length) {
    valueArray.push('');
  }

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Handle input change
  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // Only allow numbers
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    // Update value
    const newValueArray = [...valueArray];
    newValueArray[index] = digit;
    const newValue = newValueArray.join('');
    onChange(newValue);

    // Move to next input if value entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits entered
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  // Handle key down
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValueArray = [...valueArray];

      if (valueArray[index]) {
        // Clear current input
        newValueArray[index] = '';
        onChange(newValueArray.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newValueArray[index - 1] = '';
        onChange(newValueArray.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (pastedData) {
      onChange(pastedData);

      // Focus appropriate input
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();

      // Call onComplete if all digits pasted
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 sm:gap-3">
        {valueArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            className={cn(
              'h-14 w-12 sm:h-16 sm:w-14 rounded-xl border-2 text-center text-2xl font-semibold font-lexend',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-offWhite',
              error
                ? 'border-status-error focus:ring-status-error'
                : digit
                ? 'border-primary bg-primary/5'
                : focusedIndex === index
                ? 'border-primary'
                : 'border-gray-300',
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {/* Digit count indicator */}
      {!error && (
        <p className="mt-2.5 text-center text-xs text-text-muted font-lexend">
          {value.replace(/\D/g, '').length} of {length} digits entered
        </p>
      )}
      {error && (
        <p className="mt-3 text-center text-sm text-status-error font-lexend">
          {error}
        </p>
      )}
    </div>
  );
}
