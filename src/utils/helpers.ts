/**
 * Utility functions for test helpers
 */

/**
 * Wait for a specific time in milliseconds
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function multiple times
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs);
      }
    }
  }

  throw lastError || new Error(`Failed after ${maxAttempts} attempts`);
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random email
 */
export function generateRandomEmail(): string {
  return `test.${generateRandomString(8)}@example.com`;
}

/**
 * Get current timestamp
 */
export function getTimestamp(): string {
  return new Date().toISOString();
}

export default {
  wait,
  retry,
  generateRandomString,
  generateRandomEmail,
  getTimestamp
};
