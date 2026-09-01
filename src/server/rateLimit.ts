import { HttpError } from './errors.js';

/**
 * A deliberately small in-process limiter for the credential endpoints. It counts
 * FAILED attempts only — a family signing in from the same phone all day should never
 * be locked out — and is enough to blunt password guessing on a single-instance MVP.
 * A real deployment would move this to the edge proxy or a shared store.
 * See docs/16-technical-architecture.md.
 */
const failures = new Map<string, { count: number; resetAt: number }>();

const MAX = 8;
const WINDOW_MS = 15 * 60 * 1000;

/** Throws 429 when this key has failed too often; otherwise does nothing. */
export function assertNotRateLimited(key: string): void {
  const entry = failures.get(key);
  if (!entry) return;
  const now = Date.now();
  if (entry.resetAt < now) {
    failures.delete(key);
    return;
  }
  if (entry.count >= MAX) {
    const mins = Math.max(1, Math.ceil((entry.resetAt - now) / 60000));
    throw new HttpError(
      429,
      `Too many failed attempts. Please wait about ${mins} minute${mins > 1 ? 's' : ''} and try again.`,
      'rate_limited'
    );
  }
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || entry.resetAt < now) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export const clearFailures = (key: string): void => void failures.delete(key);

/** Test helper. */
export const resetRateLimits = (): void => failures.clear();
