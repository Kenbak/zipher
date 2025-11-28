/**
 * Secure Logger
 *
 * In production, sensitive data should not be logged.
 * This helper provides safe logging methods.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Safe console.log (disabled in production)
 */
export function log(...args: unknown[]): void {
  if (IS_DEV) {
    console.log(...args);
  }
}

/**
 * Safe console.error (always enabled, but sanitizes sensitive data)
 */
export function logError(message: string, error?: unknown): void {
  console.error(message, error);
}

/**
 * Log sensitive data (ONLY in dev)
 */
export function logSensitive(label: string, data: unknown): void {
  if (IS_DEV) {
    console.log(`[SENSITIVE] ${label}:`, data);
  }
}

/**
 * Log with tag (disabled in production)
 */
export function logWithTag(tag: string, ...args: unknown[]): void {
  if (IS_DEV) {
    console.log(`[${tag}]`, ...args);
  }
}
