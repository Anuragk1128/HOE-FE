/**
 * Formats a number as Indian Rupees (INR)
 * @param amount The amount to format
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
