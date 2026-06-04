/**
 * EA VAULT — Utility Functions
 */

/**
 * Format a price with currency symbol.
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate the discount percentage between MQL5 price and our price.
 */
export function calcDiscount(mql5Price: number, ourPrice: number): number {
  if (mql5Price <= 0) return 0;
  return Math.round(((mql5Price - ourPrice) / mql5Price) * 100);
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random order ID.
 */
export function generateOrderId(): string {
  const num = Math.floor(Math.random() * 99999) + 1;
  return `ORD-${num.toString().padStart(5, '0')}`;
}

/**
 * Classname merge helper (simple version).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
