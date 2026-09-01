import { getDb } from '../db.js';
import { newId, nowIso } from '../util.js';

/**
 * Minimal first-party analytics. Events are written to the same SQLite file so the
 * MVP has no third-party dependency and no personal data leaves the deployment.
 * Only IDs and low-cardinality properties are stored — never patient names,
 * clinical notes or free text. See docs/13-metrics.md.
 */
export interface TrackInput {
  name: string;
  userId?: string | null;
  planId?: string | null;
  role?: string | null;
  props?: Record<string, string | number | boolean | null>;
}

const ALLOWED_PROP_LENGTH = 64;

export function track(e: TrackInput): void {
  const props: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(e.props ?? {})) {
    props[k] = typeof v === 'string' ? v.slice(0, ALLOWED_PROP_LENGTH) : v;
  }
  try {
    getDb()
      .prepare(
        'INSERT INTO analytics_events (id, name, user_id, plan_id, role, props, created_at) VALUES (?,?,?,?,?,?,?)'
      )
      .run(newId('evt'), e.name, e.userId ?? null, e.planId ?? null, e.role ?? null, JSON.stringify(props), nowIso());
  } catch {
    // Analytics must never break a care action.
  }
}

export function eventCounts(): Array<{ name: string; count: number }> {
  return getDb()
    .prepare('SELECT name, COUNT(*) AS count FROM analytics_events GROUP BY name ORDER BY count DESC')
    .all() as Array<{ name: string; count: number }>;
}
