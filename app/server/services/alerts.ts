import { getDb } from '../db.js';
import { istDate, istTime, newId, nowIso, parseJson } from '../util.js';
import type { AlertSeverity, VitalType } from '../../shared/types.js';

/**
 * Hard clinical bands that always escalate to "urgent", independent of the
 * per-patient normal range a family sets during setup.
 * Source: commonly used home-monitoring escalation thresholds. These are
 * escalation triggers for a human, NOT a diagnosis. See docs/12-design-decisions.md.
 */
export const URGENT_BANDS: Partial<Record<VitalType, (v1: number, v2: number | null) => boolean>> = {
  spo2: (v) => v < 90,
  temp: (v) => v >= 102 || v <= 95,
  sugar: (v) => v < 60 || v > 400,
  pulse: (v) => v > 130 || v < 45,
  bp: (v1, v2) => v1 >= 180 || v1 <= 90 || (v2 !== null && (v2 >= 120 || v2 <= 50))
};

export function isOutOfRange(
  type: VitalType,
  v1: number,
  v2: number | null,
  band: { low: number | null; high: number | null; low2: number | null; high2: number | null }
): boolean {
  const outside = (v: number, lo: number | null, hi: number | null) =>
    (lo !== null && v < lo) || (hi !== null && v > hi);
  if (outside(v1, band.low, band.high)) return true;
  if (v2 !== null && outside(v2, band.low2, band.high2)) return true;
  return URGENT_BANDS[type]?.(v1, v2) ?? false;
}

export function severityForVital(type: VitalType, v1: number, v2: number | null): AlertSeverity {
  return URGENT_BANDS[type]?.(v1, v2) ? 'urgent' : 'watch';
}

export interface NewAlert {
  planId: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  sourceId?: string | null;
}

/** Creates an alert unless an open/acknowledged one already exists for the same source. */
export function raiseAlert(a: NewAlert): string | null {
  const db = getDb();
  if (a.sourceId) {
    const dup = db
      .prepare(
        `SELECT id FROM alerts WHERE plan_id = ? AND type = ? AND source_id = ? AND status != 'resolved'`
      )
      .get(a.planId, a.type, a.sourceId) as { id: string } | undefined;
    if (dup) return dup.id;
  }
  const id = newId('alt');
  db.prepare(
    `INSERT INTO alerts (id, plan_id, type, severity, title, detail, source_id, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`
  ).run(id, a.planId, a.type, a.severity, a.title, a.detail, a.sourceId ?? null, nowIso());
  queueNotification(a.planId, id, a.severity, a.title, a.detail);
  return id;
}

/**
 * Writes the message that a real deployment would push over WhatsApp or SMS.
 * Nothing is actually delivered in this prototype — see docs/16 for why, and the
 * family's Insights screen for the visible outbox.
 */
function queueNotification(
  planId: string,
  alertId: string,
  severity: AlertSeverity,
  title: string,
  detail: string
): void {
  const db = getDb();
  const recipients = db
    .prepare(
      `SELECT pm.display_name AS name, COALESCE(pm.phone, u.phone) AS phone
       FROM plan_members pm LEFT JOIN users u ON u.id = pm.user_id
       WHERE pm.plan_id = ? AND pm.role IN ('owner','family') AND pm.status = 'active'`
    )
    .all(planId) as Array<{ name: string; phone: string | null }>;
  const patient = db.prepare('SELECT patient_name FROM care_plans WHERE id = ?').get(planId) as
    | { patient_name: string }
    | undefined;
  for (const r of recipients) {
    db.prepare(
      `INSERT INTO notifications (id, plan_id, alert_id, channel, to_name, to_phone, message, status, created_at)
       VALUES (?,?,?,?,?,?,?, 'queued_stub', ?)`
    ).run(
      newId('ntf'),
      planId,
      alertId,
      severity === 'urgent' ? 'whatsapp' : 'app',
      r.name,
      r.phone,
      `${severity === 'urgent' ? '[Urgent] ' : ''}${patient?.patient_name ?? 'Your patient'}: ${title}. ${detail}`.slice(0, 400),
      nowIso()
    );
  }
}

/**
 * Time-based checks that would run on a scheduler in production. The MVP evaluates
 * them lazily whenever a family member loads the plan, which keeps the deployment
 * to a single process. Documented as a known limitation in docs/16.
 */
export function sweepPlanAlerts(planId: string, today = istDate(), now = istTime()): void {
  const db = getDb();
  const plan = db
    .prepare('SELECT discharge_date, episode_days, status FROM care_plans WHERE id = ?')
    .get(planId) as { discharge_date: string; episode_days: number; status: string } | undefined;
  if (!plan || plan.status !== 'active') return;
  if (today < plan.discharge_date) return;

  // 1. Day shift expected by 08:00 IST, night shift by 20:00 IST.
  const expectations: Array<{ slot: 'day' | 'night'; by: string; label: string }> = [
    { slot: 'day', by: '08:00', label: 'Day shift' },
    { slot: 'night', by: '20:00', label: 'Night shift' }
  ];
  const hasAttendant = db
    .prepare(
      `SELECT COUNT(*) AS n FROM plan_members WHERE plan_id = ? AND role = 'attendant' AND status = 'active'`
    )
    .get(planId) as { n: number };
  if (hasAttendant.n > 0) {
    for (const e of expectations) {
      if (now <= e.by) continue;
      const shift = db
        .prepare('SELECT id FROM shifts WHERE plan_id = ? AND date = ? AND slot = ?')
        .get(planId, today, e.slot);
      if (shift) continue;
      raiseAlert({
        planId,
        type: 'shift_not_started',
        severity: 'watch',
        title: `${e.label} not started`,
        detail: `No attendant had started the ${e.slot} shift by ${e.by} on ${today}. Nobody may be with the patient.`,
        sourceId: `${today}:${e.slot}`
      });
    }
  }

  // 2. Critical medicines whose scheduled time passed with no entry.
  const meds = db
    .prepare('SELECT id, name, dose, times, critical FROM medications WHERE plan_id = ? AND active = 1')
    .all(planId) as Array<{ id: string; name: string; dose: string; times: string; critical: number }>;
  const graceMin = 90;
  for (const m of meds) {
    for (const t of parseJson<string[]>(m.times, [])) {
      if (minutesSince(t, now) < graceMin) continue;
      const logged = db
        .prepare('SELECT id FROM med_logs WHERE medication_id = ? AND date = ? AND scheduled_time = ?')
        .get(m.id, today, t);
      if (logged) continue;
      raiseAlert({
        planId,
        type: 'critical_med_missed',
        severity: m.critical ? 'urgent' : 'watch',
        title: `${m.name} not recorded`,
        detail: `${m.name} ${m.dose} was scheduled for ${t} and has not been recorded ${graceMin} minutes later.`,
        sourceId: `${m.id}:${today}:${t}`
      });
    }
  }
}

function minutesSince(scheduled: string, now: string): number {
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  return toMin(now) - toMin(scheduled);
}
