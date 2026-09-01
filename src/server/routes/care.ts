import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { requireAuth, requireMembership, type AuthedRequest } from '../auth.js';
import { badRequest, conflict, forbidden, notFound } from '../errors.js';
import { istDate, istTime, newId, nowIso, parseJson, slotForTime, toBool, p } from '../util.js';
import { getPlanBundle, slotForWindow } from '../services/record.js';
import { isOutOfRange, raiseAlert, severityForVital } from '../services/alerts.js';
import { track } from '../services/events.js';
import type { ShiftSlot, VitalType } from '../../shared/types.js';

export const careRouter = Router();
careRouter.use(requireAuth);

/** Accept an attendant/family invite code and bind it to the signed-in user. */
careRouter.post('/invites/accept', (req: AuthedRequest, res) => {
  const parsed = z
    .object({ code: z.string().trim().toUpperCase().length(6, 'Invite codes are 6 characters.') })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Check the invite code.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  const member = db.prepare('SELECT * FROM plan_members WHERE invite_code = ?').get(parsed.data.code) as any;
  if (!member) throw notFound('That invite code is not valid. Ask the family to send it again.');
  if (member.status === 'ended') throw conflict('That invite is no longer active.');
  if (member.user_id && member.user_id !== req.userId) throw conflict('That invite has already been used.');
  const now = nowIso();
  db.prepare(`UPDATE plan_members SET user_id = ?, status = 'active', started_at = COALESCE(started_at, ?) WHERE id = ?`).run(
    req.userId!,
    now,
    member.id
  );
  track({ name: 'invite_accepted', userId: req.userId, planId: member.plan_id, role: member.role });
  res.json({ plan_id: member.plan_id, role: member.role });
});

function currentSlot(): ShiftSlot {
  return slotForTime(istTime());
}

/** The attendant's working screen: what to do right now, on this shift. */
careRouter.get('/plans/:id/today', (req: AuthedRequest, res) => {
  const membership = requireMembership(p(req, 'id'), req.userId!);
  const db = getDb();
  const bundle = getPlanBundle(p(req, 'id'));
  if (!bundle) throw notFound();
  const date = istDate();
  const slot = currentSlot();

  const openShift = db
    .prepare(
      `SELECT s.*, m.display_name AS attendant_name FROM shifts s JOIN plan_members m ON m.id = s.member_id
       WHERE s.plan_id = ? AND s.date = ? AND s.slot = ?`
    )
    .get(p(req, 'id'), date, slot) as any;

  const myOpenShift =
    openShift && openShift.member_id === membership.id && !openShift.ended_at ? openShift : null;

  const tasks = bundle.tasks
    .filter((t) => slotForWindow(t.window) === slot)
    .map((t) => {
      const log = myOpenShift
        ? (db.prepare('SELECT status, reason FROM task_logs WHERE shift_id = ? AND task_id = ?').get(myOpenShift.id, t.id) as any)
        : null;
      return { ...t, status: log?.status ?? 'pending', reason: log?.reason ?? null };
    });

  const meds = bundle.medications.flatMap((m) =>
    m.times
      .filter((t) => slotForTime(t) === slot)
      .map((t) => {
        const log = db
          .prepare('SELECT status, reason FROM med_logs WHERE medication_id = ? AND date = ? AND scheduled_time = ?')
          .get(m.id, date, t) as any;
        return {
          medication_id: m.id,
          name: m.name,
          dose: m.dose,
          instruction: m.instruction,
          critical: m.critical,
          scheduled_time: t,
          status: log?.status ?? 'pending',
          reason: log?.reason ?? null
        };
      })
  );
  meds.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const vitalsDue = bundle.vitals
    .filter((v) => v.times.some((t) => slotForTime(t) === slot))
    .map((v) => {
      const last = db
        .prepare(
          `SELECT value1, value2, logged_at FROM vital_logs WHERE plan_id = ? AND type = ?
             AND date(logged_at, '+330 minutes') = ? ORDER BY logged_at DESC LIMIT 1`
        )
        .get(p(req, 'id'), v.type, date) as any;
      return { ...v, last_today: last ?? null };
    });

  const lastHandoverNote = db
    .prepare(
      `SELECT s.handover_note, s.date, s.slot, m.display_name FROM shifts s
       JOIN plan_members m ON m.id = s.member_id
       WHERE s.plan_id = ? AND s.handover_note IS NOT NULL ORDER BY s.started_at DESC LIMIT 1`
    )
    .get(p(req, 'id')) as any;

  res.json({
    plan: bundle.plan,
    date,
    slot,
    my_role: membership.role,
    my_member_id: membership.id,
    shift: openShift ?? null,
    is_my_shift: Boolean(myOpenShift),
    tasks,
    meds,
    vitals: vitalsDue,
    red_flags: bundle.redFlags,
    last_handover_note: lastHandoverNote ?? null,
    open_alerts: db
      .prepare(`SELECT * FROM alerts WHERE plan_id = ? AND status = 'open' ORDER BY created_at DESC LIMIT 10`)
      .all(p(req, 'id'))
  });
});

careRouter.post('/plans/:id/shifts', (req: AuthedRequest, res) => {
  const membership = requireMembership(p(req, 'id'), req.userId!, ['attendant']);
  const db = getDb();
  const plan = db.prepare('SELECT status FROM care_plans WHERE id = ?').get(p(req, 'id')) as { status: string };
  if (plan.status !== 'active') throw conflict('This care plan is not active.');
  const date = istDate();
  const slot = currentSlot();
  const existing = db
    .prepare('SELECT * FROM shifts WHERE plan_id = ? AND date = ? AND slot = ?')
    .get(p(req, 'id'), date, slot) as any;
  if (existing) {
    if (existing.member_id === membership.id && !existing.ended_at) return res.json({ shift_id: existing.id, resumed: true });
    throw conflict('Another attendant has already started this shift. Ask the family to check the roster.');
  }
  const id = newId('shf');
  db.prepare('INSERT INTO shifts (id, plan_id, member_id, date, slot, started_at) VALUES (?,?,?,?,?,?)').run(
    id,
    p(req, 'id'),
    membership.id,
    date,
    slot,
    nowIso()
  );
  db.prepare(
    `UPDATE alerts SET status = 'resolved', resolved_at = ?, resolution_note = 'Shift started'
     WHERE plan_id = ? AND type = 'shift_not_started' AND source_id = ? AND status != 'resolved'`
  ).run(nowIso(), p(req, 'id'), `${date}:${slot}`);
  track({ name: 'shift_started', userId: req.userId, planId: p(req, 'id'), role: 'attendant', props: { slot } });
  res.status(201).json({ shift_id: id, resumed: false });
});

function loadOwnShift(shiftId: string, userId: string) {
  const db = getDb();
  const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(shiftId) as any;
  if (!shift) throw notFound('That shift does not exist.');
  const membership = requireMembership(shift.plan_id, userId);
  if (membership.role === 'attendant' && shift.member_id !== membership.id) {
    throw forbidden('You can only record care on your own shift.');
  }
  if (membership.role !== 'attendant') {
    throw forbidden('Only the attendant on duty can record care. Family members can add notes and observations.');
  }
  if (shift.ended_at) throw conflict('This shift is already closed. Start your next shift to keep recording.');
  return { shift, membership };
}

careRouter.post('/shifts/:shiftId/tasks', (req: AuthedRequest, res) => {
  const { shift } = loadOwnShift(p(req, 'shiftId'), req.userId!);
  const parsed = z
    .object({
      task_id: z.string().min(1),
      status: z.enum(['done', 'missed', 'not_applicable']),
      reason: z.string().trim().max(200).nullish()
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Could not save that.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  const task = db
    .prepare('SELECT * FROM care_tasks WHERE id = ? AND plan_id = ? AND active = 1')
    .get(parsed.data.task_id, shift.plan_id) as any;
  if (!task) throw notFound('That task is not on this plan.');
  if (parsed.data.status !== 'done' && !parsed.data.reason?.trim()) {
    throw badRequest('Please say briefly why it could not be done — the family will see this.');
  }
  db.prepare(
    `INSERT INTO task_logs (id, plan_id, shift_id, task_id, status, reason, logged_at, logged_by)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(shift_id, task_id) DO UPDATE SET status = excluded.status, reason = excluded.reason, logged_at = excluded.logged_at`
  ).run(newId('tlg'), shift.plan_id, shift.id, task.id, parsed.data.status, parsed.data.reason ?? null, nowIso(), req.userId!);

  if (parsed.data.status === 'missed' && toBool(task.critical)) {
    raiseAlert({
      planId: shift.plan_id,
      type: 'shift_incomplete',
      severity: 'watch',
      title: `Important task missed: ${task.title_en}`,
      detail: parsed.data.reason || 'No reason given.',
      sourceId: `${shift.id}:${task.id}`
    });
  }
  track({ name: 'task_logged', userId: req.userId, planId: shift.plan_id, role: 'attendant', props: { status: parsed.data.status, critical: toBool(task.critical) } });
  res.json({ ok: true });
});

careRouter.post('/shifts/:shiftId/meds', (req: AuthedRequest, res) => {
  const { shift } = loadOwnShift(p(req, 'shiftId'), req.userId!);
  const parsed = z
    .object({
      medication_id: z.string().min(1),
      scheduled_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      status: z.enum(['given', 'missed', 'refused', 'held_on_advice']),
      reason: z.string().trim().max(200).nullish()
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Could not save that.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  const med = db
    .prepare('SELECT * FROM medications WHERE id = ? AND plan_id = ? AND active = 1')
    .get(parsed.data.medication_id, shift.plan_id) as any;
  if (!med) throw notFound('That medicine is not on this plan.');
  if (!parseJson<string[]>(med.times, []).includes(parsed.data.scheduled_time)) {
    throw badRequest('That dose time is not on the schedule for this medicine.');
  }
  if (parsed.data.status !== 'given' && !parsed.data.reason?.trim()) {
    throw badRequest('Please say briefly what happened — the family will see this.');
  }
  db.prepare(
    `INSERT INTO med_logs (id, plan_id, shift_id, medication_id, date, scheduled_time, status, reason, logged_at, logged_by)
     VALUES (?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(medication_id, date, scheduled_time) DO UPDATE SET
       status = excluded.status, reason = excluded.reason, logged_at = excluded.logged_at, shift_id = excluded.shift_id`
  ).run(
    newId('mlg'), shift.plan_id, shift.id, med.id, shift.date, parsed.data.scheduled_time,
    parsed.data.status, parsed.data.reason ?? null, nowIso(), req.userId!
  );

  db.prepare(
    `UPDATE alerts SET status = 'resolved', resolved_at = ?, resolution_note = 'Recorded by attendant'
     WHERE plan_id = ? AND type = 'critical_med_missed' AND source_id = ? AND status != 'resolved'`
  ).run(nowIso(), shift.plan_id, `${med.id}:${shift.date}:${parsed.data.scheduled_time}`);

  if (parsed.data.status !== 'given') {
    raiseAlert({
      planId: shift.plan_id,
      type: 'critical_med_missed',
      severity: toBool(med.critical) ? 'urgent' : 'watch',
      title: `${med.name} ${parsed.data.status === 'refused' ? 'refused' : 'not given'} at ${parsed.data.scheduled_time}`,
      detail: parsed.data.reason || 'No reason given.',
      sourceId: `${med.id}:${shift.date}:${parsed.data.scheduled_time}:not_given`
    });
  }
  track({ name: 'medication_logged', userId: req.userId, planId: shift.plan_id, role: 'attendant', props: { status: parsed.data.status, critical: toBool(med.critical) } });
  res.json({ ok: true });
});

careRouter.post('/shifts/:shiftId/vitals', (req: AuthedRequest, res) => {
  const { shift } = loadOwnShift(p(req, 'shiftId'), req.userId!);
  const parsed = z
    .object({
      type: z.enum(['bp', 'sugar', 'temp', 'spo2', 'pulse', 'weight']),
      value1: z.number().positive('Enter a number.').max(500),
      value2: z.number().positive().max(300).nullish()
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Check the reading.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  const check = db
    .prepare('SELECT * FROM vital_checks WHERE plan_id = ? AND type = ? AND active = 1')
    .get(shift.plan_id, parsed.data.type) as any;
  const band = check ?? { low: null, high: null, low2: null, high2: null };
  const type = parsed.data.type as VitalType;
  const v2 = parsed.data.value2 ?? null;
  if (type === 'bp' && v2 === null) throw badRequest('Blood pressure needs both the upper and lower reading.');
  const out = isOutOfRange(type, parsed.data.value1, v2, band);
  const id = newId('vlg');
  db.prepare(
    `INSERT INTO vital_logs (id, plan_id, shift_id, type, value1, value2, out_of_range, logged_at, logged_by)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(id, shift.plan_id, shift.id, type, parsed.data.value1, v2, out ? 1 : 0, nowIso(), req.userId!);

  if (out) {
    const severity = severityForVital(type, parsed.data.value1, v2);
    raiseAlert({
      planId: shift.plan_id,
      type: 'vital_out_of_range',
      severity,
      title: `${type.toUpperCase()} reading outside the expected range`,
      detail: `Recorded ${parsed.data.value1}${v2 ? `/${v2}` : ''} at ${istTime()}. Expected ${band.low ?? '—'}–${band.high ?? '—'}.`,
      sourceId: id
    });
  }
  track({ name: 'vital_logged', userId: req.userId, planId: shift.plan_id, role: 'attendant', props: { type, out_of_range: out } });
  res.json({ ok: true, out_of_range: out });
});

/** Red-flag / free-text observation. Family members may also add these. */
careRouter.post('/plans/:id/observations', (req: AuthedRequest, res) => {
  const membership = requireMembership(p(req, 'id'), req.userId!);
  const parsed = z
    .object({
      red_flag_id: z.string().nullish(),
      note: z.string().trim().min(3, 'Please describe what you saw.').max(500),
      severity: z.enum(['urgent', 'watch']).default('watch')
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Could not save that note.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  let severity = parsed.data.severity;
  let label: string | null = null;
  if (parsed.data.red_flag_id) {
    const flag = db
      .prepare('SELECT * FROM red_flags WHERE id = ? AND plan_id = ?')
      .get(parsed.data.red_flag_id, p(req, 'id')) as any;
    if (!flag) throw notFound('That warning sign is not on this plan.');
    severity = flag.severity;
    label = flag.label_en;
  }
  const openShift = db
    .prepare(`SELECT id FROM shifts WHERE plan_id = ? AND date = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1`)
    .get(p(req, 'id'), istDate()) as any;
  const id = newId('obs');
  db.prepare(
    `INSERT INTO observations (id, plan_id, shift_id, red_flag_id, note, severity, logged_at, logged_by)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(id, p(req, 'id'), openShift?.id ?? null, parsed.data.red_flag_id ?? null, parsed.data.note, severity, nowIso(), req.userId!);

  raiseAlert({
    planId: p(req, 'id'),
    type: 'red_flag',
    severity,
    title: label ? `Warning sign reported: ${label}` : 'Something was reported',
    detail: parsed.data.note,
    sourceId: id
  });
  track({ name: 'observation_reported', userId: req.userId, planId: p(req, 'id'), role: membership.role, props: { severity, from_flag: Boolean(label) } });
  res.status(201).json({ id, severity });
});

careRouter.post('/shifts/:shiftId/close', (req: AuthedRequest, res) => {
  const { shift } = loadOwnShift(p(req, 'shiftId'), req.userId!);
  const parsed = z.object({ handover_note: z.string().trim().max(500).nullish() }).safeParse(req.body);
  if (!parsed.success) throw badRequest('Could not close the shift.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  const bundle = getPlanBundle(shift.plan_id)!;
  const slotTasks = bundle.tasks.filter((t) => slotForWindow(t.window) === shift.slot);
  const logs = db.prepare('SELECT task_id, status FROM task_logs WHERE shift_id = ?').all(shift.id) as any[];
  const unlogged = slotTasks.filter((t) => !logs.find((l) => l.task_id === t.id));
  const unloggedCritical = unlogged.filter((t) => t.critical);

  db.prepare('UPDATE shifts SET ended_at = ?, handover_note = ? WHERE id = ?').run(
    nowIso(),
    parsed.data.handover_note ?? null,
    shift.id
  );

  if (unloggedCritical.length) {
    raiseAlert({
      planId: shift.plan_id,
      type: 'shift_incomplete',
      severity: 'watch',
      title: `${unloggedCritical.length} important item${unloggedCritical.length > 1 ? 's' : ''} left unrecorded`,
      detail: `${shift.slot === 'day' ? 'Day' : 'Night'} shift on ${shift.date} closed without recording: ${unloggedCritical
        .map((t) => t.title_en)
        .join(', ')}.`,
      sourceId: `${shift.id}:incomplete`
    });
  }
  track({
    name: 'shift_closed',
    userId: req.userId,
    planId: shift.plan_id,
    role: 'attendant',
    props: { slot: shift.slot, unlogged: unlogged.length, has_note: Boolean(parsed.data.handover_note) }
  });
  res.json({ ok: true, unlogged: unlogged.length });
});
