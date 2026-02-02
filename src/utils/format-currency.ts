/**
 * Format a number as Indian Rupees
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(amount);
}

/**
 * Format a number as compact Indian Rupees (e.g., 1.2L, 50K)
 * @param amount - The amount to format
 * @returns Formatted compact currency string
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

/**
 * Parse a currency string to a number
 * @param value - The currency string to parse
 * @returns The parsed number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol, commas, and whitespace
  const cleaned = value.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
}
