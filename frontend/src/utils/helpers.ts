/**
 * Formats a date string or Date object into a locale-specific string.
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

/**
 * Calculates the total bid price based on base price and top-up amount.
 */
export const calculateTotalBid = (basePrice: number, topUpAmount: number): number => {
  return (basePrice || 0) + (topUpAmount || 0);
};

/**
 * Formats a number as currency (INR).
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
