/**
 * NexaMart – Currency Utility
 * Single source of truth for formatting Indian Rupee amounts.
 * Usage: import { formatCurrency } from '../utils/currency';
 */

/**
 * Format a number as Indian Rupee with locale-aware thousands separator.
 * e.g. formatCurrency(12500) → "₹12,500"
 *      formatCurrency(1499.5) → "₹1,499.50"  (decimals preserved only if present)
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  // en-IN gives Indian numbering: 1,00,000 style
  return `₹{num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export default formatCurrency;
