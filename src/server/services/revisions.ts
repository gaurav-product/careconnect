import { getDb } from '../db.js';
import { newId, nowIso } from '../util.js';
import { track } from './events.js';

/**
 * Care entries can be corrected during a shift — an attendant taps the wrong button,
 * or a dose is given later than expected. What must never happen in a record product
 * is a correction that leaves no trace: "missed — strip finished" quietly becoming
 * "given" before the shift closes would make the whole record unfalsifiable.
 *
 * Every change to an existing entry appends a revision row. The family's day record
 * shows corrections inline. Nothing is deleted, and nothing is hidden.
 */
export interface RevisionInput {
  planId: string;
  shiftId: string;
  date: string;
  entryType: 'task' | 'medication';
  entryRef: string;
  label: string;
  previous?: { status: string; reason: string | null };
  next: { status: string; reason: string | null };
  changedBy: string;
}

export function recordRevision(input: RevisionInput): boolean {
  const { previous, next } = input;
  if (!previous) return false; // first entry, not a correction
  if (previous.status === next.status && (previous.reason ?? null) === (next.reason ?? null)) {
    return false; // re-submitting the same value (a double tap on a slow connection)
  }
  getDb()
    .prepare(
      `INSERT INTO care_log_revisions
         (id, plan_id, shift_id, date, entry_type, entry_ref, label,
          previous_status, previous_reason, new_status, new_reason, changed_at, changed_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(
      newId('rev'), input.planId, input.shiftId, input.date, input.entryType, input.entryRef,
      input.label, previous.status, previous.reason ?? null, next.status, next.reason ?? null,
      nowIso(), input.changedBy
    );
  track({
    name: 'care_entry_corrected',
    userId: input.changedBy,
    planId: input.planId,
    props: { entry_type: input.entryType, from: previous.status, to: next.status }
  });
  return true;
}

export interface Revision {
  id: string;
  entry_type: 'task' | 'medication';
  entry_ref: string;
  label: string;
  previous_status: string;
  previous_reason: string | null;
  new_status: string;
  new_reason: string | null;
  changed_at: string;
  changed_by_name: string | null;
}

export function revisionsForDay(planId: string, date: string): Revision[] {
  return getDb()
    .prepare(
      `SELECT r.id, r.entry_type, r.entry_ref, r.label, r.previous_status, r.previous_reason,
              r.new_status, r.new_reason, r.changed_at, u.name AS changed_by_name
       FROM care_log_revisions r
       LEFT JOIN users u ON u.id = r.changed_by
       WHERE r.plan_id = ? AND r.date = ?
       ORDER BY r.changed_at DESC`
    )
    .all(planId, date) as Revision[];
}

export const revisionCount = (planId: string): number =>
  (getDb().prepare('SELECT COUNT(*) AS n FROM care_log_revisions WHERE plan_id = ?').get(planId) as { n: number }).n;
