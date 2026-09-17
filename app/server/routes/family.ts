import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { requireAuth, requireMembership, type AuthedRequest } from '../auth.js';
import { badRequest, notFound } from '../errors.js';
import { istDate, nowIso, p } from '../util.js';
import { getDayRecord, isDocumentedCareDay, isCompleteCareDay, planDates, getPlanBundle } from '../services/record.js';
import { sweepPlanAlerts } from '../services/alerts.js';
import { track } from '../services/events.js';

export const familyRouter = Router();
familyRouter.use(requireAuth);

familyRouter.get('/plans/:id/days/:date', (req: AuthedRequest, res) => {
  const m = requireMembership(p(req, 'id'), req.userId!);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p(req, 'date'))) throw badRequest('Use a date like 2026-09-01.');
  if (p(req, 'date') > istDate()) throw badRequest('That day has not happened yet.');
  const record = getDayRecord(p(req, 'id'), p(req, 'date'));
  if (!record) throw notFound();
  track({ name: 'day_record_viewed', userId: req.userId, planId: p(req, 'id'), role: m.role });
  res.json({ ...record, documented: isDocumentedCareDay(record), complete: isCompleteCareDay(record) });
});

familyRouter.get('/plans/:id/alerts', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!);
  sweepPlanAlerts(p(req, 'id'));
  const status = typeof req.query.status === 'string' ? req.query.status : null;
  const db = getDb();
  const rows =
    status && ['open', 'acknowledged', 'resolved'].includes(status)
      ? db.prepare('SELECT * FROM alerts WHERE plan_id = ? AND status = ? ORDER BY created_at DESC').all(p(req, 'id'), status)
      : db.prepare('SELECT * FROM alerts WHERE plan_id = ? ORDER BY created_at DESC LIMIT 100').all(p(req, 'id'));
  res.json({ alerts: rows });
});

function loadAlert(alertId: string, userId: string) {
  const db = getDb();
  const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as any;
  if (!alert) throw notFound('That alert no longer exists.');
  const membership = requireMembership(alert.plan_id, userId, ['owner', 'family']);
  return { alert, membership, db };
}

familyRouter.post('/alerts/:alertId/ack', (req: AuthedRequest, res) => {
  const { alert, db } = loadAlert(p(req, 'alertId'), req.userId!);
  if (alert.status !== 'open') return res.json({ ok: true, status: alert.status });
  db.prepare(`UPDATE alerts SET status = 'acknowledged', acknowledged_at = ?, acknowledged_by = ? WHERE id = ?`).run(
    nowIso(),
    req.userId!,
    alert.id
  );
  const minutes = Math.round((Date.now() - new Date(alert.created_at).getTime()) / 60000);
  track({
    name: 'alert_acknowledged',
    userId: req.userId,
    planId: alert.plan_id,
    props: { type: alert.type, severity: alert.severity, minutes_to_ack: minutes }
  });
  res.json({ ok: true, status: 'acknowledged' });
});

familyRouter.post('/alerts/:alertId/resolve', (req: AuthedRequest, res) => {
  const { alert, db } = loadAlert(p(req, 'alertId'), req.userId!);
  const parsed = z
    .object({ note: z.string().trim().min(2, 'Add a short note on what you did.').max(300) })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Add a short note on what you did.', parsed.error.flatten().fieldErrors);
  db.prepare(
    `UPDATE alerts SET status = 'resolved', resolved_at = ?, resolution_note = ?,
       acknowledged_at = COALESCE(acknowledged_at, ?), acknowledged_by = COALESCE(acknowledged_by, ?) WHERE id = ?`
  ).run(nowIso(), parsed.data.note, nowIso(), req.userId!, alert.id);
  const minutes = Math.round((Date.now() - new Date(alert.created_at).getTime()) / 60000);
  track({
    name: 'alert_resolved',
    userId: req.userId,
    planId: alert.plan_id,
    props: { type: alert.type, severity: alert.severity, minutes_to_resolve: minutes }
  });
  res.json({ ok: true });
});

/** The stubbed notification outbox, shown to the family so the gap is never hidden. */
familyRouter.get('/plans/:id/notifications', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const rows = getDb()
    .prepare('SELECT * FROM notifications WHERE plan_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(p(req, 'id'));
  res.json({ notifications: rows, delivery_connected: false });
});

/**
 * The measurement definitions from docs/13-metrics.md, computed over whatever data
 * exists. Numbers here describe the seeded demo, not real-world traction.
 */
familyRouter.get('/plans/:id/metrics', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const bundle = getPlanBundle(p(req, 'id'));
  if (!bundle) throw notFound();
  const dates = planDates(bundle.plan);
  const days = dates.map((d) => getDayRecord(p(req, 'id'), d)!);
  const documented = days.filter(isDocumentedCareDay).length;
  const complete = days.filter(isCompleteCareDay).length;
  const db = getDb();

  const alerts = db.prepare('SELECT * FROM alerts WHERE plan_id = ?').all(p(req, 'id')) as any[];
  const acked = alerts.filter((a) => a.acknowledged_at);
  const ackMinutes = acked.map((a) => (new Date(a.acknowledged_at).getTime() - new Date(a.created_at).getTime()) / 60000);
  const median = (xs: number[]) => {
    if (!xs.length) return null;
    const s = [...xs].sort((a, b) => a - b);
    return Math.round(s[Math.floor(s.length / 2)]);
  };

  const shifts = db.prepare('SELECT * FROM shifts WHERE plan_id = ?').all(p(req, 'id')) as any[];
  const closed = shifts.filter((s) => s.ended_at).length;
  const withNote = shifts.filter((s) => s.handover_note).length;

  const expected = days.reduce((n, d) => n + d.score.expected, 0);
  const logged = days.reduce((n, d) => n + d.score.logged, 0);
  const missedCritical = days.reduce((n, d) => n + d.score.missed_critical, 0);

  res.json({
    days_elapsed: days.length,
    documented_care_days: documented,
    documented_rate: days.length ? Number((documented / days.length).toFixed(2)) : 0,
    complete_care_days: complete,
    complete_rate: days.length ? Number((complete / days.length).toFixed(2)) : 0,
    logging_completeness: expected ? Number((logged / expected).toFixed(2)) : 0,
    missed_critical_items: missedCritical,
    shifts_started: shifts.length,
    shift_close_rate: shifts.length ? Number((closed / shifts.length).toFixed(2)) : 0,
    handover_note_rate: shifts.length ? Number((withNote / shifts.length).toFixed(2)) : 0,
    alerts_total: alerts.length,
    alerts_open: alerts.filter((a) => a.status === 'open').length,
    urgent_alerts: alerts.filter((a) => a.severity === 'urgent').length,
    median_minutes_to_acknowledge: median(ackMinutes),
    trend: days.slice(-14).map((d) => ({
      date: d.date,
      day_number: d.day_number,
      logged: d.score.logged,
      expected: d.score.expected,
      documented: isDocumentedCareDay(d),
      complete: isCompleteCareDay(d)
    }))
  });
});
