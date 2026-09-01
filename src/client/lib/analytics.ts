import { api } from './api';

/**
 * Client-side product events. Fire-and-forget: analytics never blocks or breaks a
 * care action, and no free text or patient detail is ever sent.
 */
export function trackEvent(
  name: string,
  planId?: string | null,
  props?: Record<string, string | number | boolean | null>
): void {
  void api.post('/events', { name, plan_id: planId ?? null, props: props ?? {} }).catch(() => {});
}
