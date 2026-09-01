import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { requireAuth, requireMembership, type AuthedRequest } from '../auth.js';
import { badRequest, conflict, forbidden, notFound } from '../errors.js';
import { istDate, newId, newInviteCode, nowIso, p } from '../util.js';
import { getPlanBundle, planDates, getDayRecord, isVerifiedCareDay, buildHandover } from '../services/record.js';
import { sweepPlanAlerts } from '../services/alerts.js';
import { track } from '../services/events.js';
import { TEMPLATES, getTemplate } from '../templates.js';

export const planRouter = Router();
planRouter.use(requireAuth);

const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM, e.g. 08:00');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const medSchema = z.object({
  name: z.string().trim().min(1, 'Medicine name is required.').max(80),
  dose: z.string().trim().min(1, 'Dose is required.').max(40),
  times: z.array(timeStr).min(1, 'Add at least one time.').max(6),
  instruction: z.string().trim().max(120).nullish(),
  critical: z.boolean().default(false)
});

const createPlanSchema = z.object({
  patient_name: z.string().trim().min(2, "Enter the patient's name.").max(60),
  patient_age: z.number().int().min(1).max(120),
  patient_sex: z.enum(['male', 'female', 'other']),
  city: z.string().trim().min(2).max(40),
  hospital: z.string().trim().max(80).nullish(),
  template_id: z.string().default('general'),
  procedure: z.string().trim().min(2, 'Describe the surgery or condition.').max(120),
  discharge_date: dateStr,
  episode_days: z.number().int().min(7).max(90).default(30),
  doctor_name: z.string().trim().max(60).nullish(),
  doctor_phone: z.string().trim().max(15).nullish(),
  emergency_contact_name: z.string().trim().max(60).nullish(),
  emergency_contact_phone: z.string().trim().max(15).nullish(),
  notes: z.string().trim().max(1000).nullish(),
  medications: z.array(medSchema).max(20).default([])
});

planRouter.get('/templates', (_req, res) => {
  res.json({
    templates: TEMPLATES.map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
      task_count: t.tasks.length,
      red_flag_count: t.red_flags.length,
      vitals: t.vitals.map((v) => v.type)
    }))
  });
});

planRouter.get('/', (req: AuthedRequest, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.*, pm.role AS my_role FROM care_plans p
       JOIN plan_members pm ON pm.plan_id = p.id
       WHERE pm.user_id = ? AND pm.status = 'active'
       ORDER BY p.created_at DESC`
    )
    .all(req.userId!) as any[];
  res.json({ plans: rows });
});

planRouter.post('/', (req: AuthedRequest, res) => {
  if (req.userRole !== 'family') {
    throw forbidden('Only a family account can create a care plan. Attendants join with an invite code.');
  }
  const parsed = createPlanSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest('Some details need fixing.', parsed.error.flatten().fieldErrors);
  const d = parsed.data;
  if (d.discharge_date > istDate()) throw badRequest('Discharge date cannot be in the future.');

  const db = getDb();
  const tpl = getTemplate(d.template_id);
  const planId = newId('pln');
  const now = nowIso();

  const owner = db.prepare('SELECT name, phone FROM users WHERE id = ?').get(req.userId!) as {
    name: string;
    phone: string;
  };

  db.transaction(() => {
    db.prepare(
      `INSERT INTO care_plans (id, owner_user_id, patient_name, patient_age, patient_sex, city, hospital,
        procedure, discharge_date, episode_days, status, doctor_name, doctor_phone,
        emergency_contact_name, emergency_contact_phone, notes, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?, 'active', ?,?,?,?,?,?,?)`
    ).run(
      planId, req.userId!, d.patient_name, d.patient_age, d.patient_sex, d.city, d.hospital ?? null,
      d.procedure, d.discharge_date, d.episode_days, d.doctor_name ?? null, d.doctor_phone ?? null,
      d.emergency_contact_name ?? null, d.emergency_contact_phone ?? null, d.notes ?? null, now, now
    );

    db.prepare(
      `INSERT INTO plan_members (id, plan_id, user_id, role, status, display_name, phone, created_at, started_at)
       VALUES (?,?,?, 'owner', 'active', ?,?,?,?)`
    ).run(newId('mem'), planId, req.userId!, owner.name, owner.phone, now, now);

    for (const t of tpl.tasks) {
      db.prepare(
        `INSERT INTO care_tasks (id, plan_id, title_en, title_hi, window, category, critical, active, created_at)
         VALUES (?,?,?,?,?,?,?,1,?)`
      ).run(newId('tsk'), planId, t.title_en, t.title_hi, t.window, t.category, t.critical ? 1 : 0, now);
    }
    for (const v of tpl.vitals) {
      db.prepare(
        `INSERT INTO vital_checks (id, plan_id, type, times, low, high, low2, high2, active)
         VALUES (?,?,?,?,?,?,?,?,1)`
      ).run(newId('vtl'), planId, v.type, JSON.stringify(v.times), v.low ?? null, v.high ?? null, v.low2 ?? null, v.high2 ?? null);
    }
    for (const f of tpl.red_flags) {
      db.prepare(
        `INSERT INTO red_flags (id, plan_id, label_en, label_hi, severity, active) VALUES (?,?,?,?,?,1)`
      ).run(newId('flg'), planId, f.label_en, f.label_hi, f.severity);
    }
    for (const m of d.medications) {
      db.prepare(
        `INSERT INTO medications (id, plan_id, name, dose, times, instruction, critical, active, created_at)
         VALUES (?,?,?,?,?,?,?,1,?)`
      ).run(newId('med'), planId, m.name, m.dose, JSON.stringify(m.times), m.instruction ?? null, m.critical ? 1 : 0, now);
    }
  })();

  track({
    name: 'care_plan_created',
    userId: req.userId,
    planId,
    role: 'family',
    props: { template: tpl.id, medications: d.medications.length, episode_days: d.episode_days }
  });
  res.status(201).json({ plan_id: planId });
});

/** Full plan bundle: plan, medicines, tasks, vitals, red flags, members, today's status. */
planRouter.get('/:id', (req: AuthedRequest, res) => {
  const membership = requireMembership(p(req, 'id'), req.userId!);
  if (membership.role !== 'attendant') sweepPlanAlerts(p(req, 'id'));
  const bundle = getPlanBundle(p(req, 'id'));
  if (!bundle) throw notFound();
  const db = getDb();
  const alerts = db
    .prepare(`SELECT * FROM alerts WHERE plan_id = ? ORDER BY created_at DESC LIMIT 50`)
    .all(p(req, 'id'));
  const dates = planDates(bundle.plan);
  const summary = dates.slice(-7).map((date) => {
    const day = getDayRecord(p(req, 'id'), date)!;
    return {
      date,
      day_number: day.day_number,
      logged: day.score.logged,
      expected: day.score.expected,
      missed_critical: day.score.missed_critical,
      verified: isVerifiedCareDay(day),
      shifts: day.shifts.length
    };
  });
  res.json({ ...bundle, alerts, summary, my_role: membership.role, my_member_id: membership.id, today: istDate() });
});

planRouter.patch('/:id', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner']);
  const parsed = z
    .object({
      status: z.enum(['active', 'completed', 'paused']).optional(),
      notes: z.string().max(1000).nullish(),
      doctor_name: z.string().max(60).nullish(),
      doctor_phone: z.string().max(15).nullish(),
      emergency_contact_name: z.string().max(60).nullish(),
      emergency_contact_phone: z.string().max(15).nullish()
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Could not save those changes.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  const fields = Object.entries(parsed.data).filter(([, v]) => v !== undefined);
  if (!fields.length) throw badRequest('Nothing to update.');
  db.prepare(
    `UPDATE care_plans SET ${fields.map(([k]) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`
  ).run(...fields.map(([, v]) => v as any), nowIso(), p(req, 'id'));
  if (parsed.data.status) {
    track({ name: 'care_plan_status_changed', userId: req.userId, planId: p(req, 'id'), props: { status: parsed.data.status } });
  }
  res.json({ ok: true });
});

/* ---------------------------------- medicines --------------------------------- */

planRouter.post('/:id/medications', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const parsed = medSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest('Check the medicine details.', parsed.error.flatten().fieldErrors);
  const m = parsed.data;
  const id = newId('med');
  getDb()
    .prepare(
      `INSERT INTO medications (id, plan_id, name, dose, times, instruction, critical, active, created_at)
       VALUES (?,?,?,?,?,?,?,1,?)`
    )
    .run(id, p(req, 'id'), m.name, m.dose, JSON.stringify(m.times), m.instruction ?? null, m.critical ? 1 : 0, nowIso());
  track({ name: 'medication_added', userId: req.userId, planId: p(req, 'id'), props: { critical: m.critical } });
  res.status(201).json({ id });
});

planRouter.delete('/:id/medications/:medId', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const info = getDb()
    .prepare('UPDATE medications SET active = 0 WHERE id = ? AND plan_id = ?')
    .run(p(req, 'medId'), p(req, 'id'));
  if (!info.changes) throw notFound('That medicine is not on this plan.');
  track({ name: 'medication_stopped', userId: req.userId, planId: p(req, 'id') });
  res.json({ ok: true });
});

/* ------------------------------------ tasks ----------------------------------- */

planRouter.post('/:id/tasks', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const parsed = z
    .object({
      title_en: z.string().trim().min(2, 'Describe the task.').max(100),
      title_hi: z.string().trim().max(100).optional(),
      window: z.enum(['morning', 'afternoon', 'evening', 'night', 'anytime']),
      category: z.enum(['mobility', 'hygiene', 'nutrition', 'wound', 'exercise', 'observation', 'other']).default('other'),
      critical: z.boolean().default(false)
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Check the task details.', parsed.error.flatten().fieldErrors);
  const t = parsed.data;
  const id = newId('tsk');
  getDb()
    .prepare(
      `INSERT INTO care_tasks (id, plan_id, title_en, title_hi, window, category, critical, active, created_at)
       VALUES (?,?,?,?,?,?,?,1,?)`
    )
    .run(id, p(req, 'id'), t.title_en, t.title_hi?.trim() || t.title_en, t.window, t.category, t.critical ? 1 : 0, nowIso());
  track({ name: 'task_added', userId: req.userId, planId: p(req, 'id'), props: { window: t.window, critical: t.critical } });
  res.status(201).json({ id });
});

planRouter.delete('/:id/tasks/:taskId', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const info = getDb()
    .prepare('UPDATE care_tasks SET active = 0 WHERE id = ? AND plan_id = ?')
    .run(p(req, 'taskId'), p(req, 'id'));
  if (!info.changes) throw notFound('That task is not on this plan.');
  res.json({ ok: true });
});

/* ---------------------------------- attendants -------------------------------- */

planRouter.get('/:id/members', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!);
  const members = getDb()
    .prepare('SELECT * FROM plan_members WHERE plan_id = ? ORDER BY created_at')
    .all(p(req, 'id'));
  res.json({ members });
});

planRouter.post('/:id/members', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner']);
  const parsed = z
    .object({
      display_name: z.string().trim().min(2, "Enter the attendant's name.").max(60),
      phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number.').optional(),
      agency_name: z.string().trim().max(60).nullish(),
      role: z.enum(['attendant', 'family']).default('attendant')
    })
    .safeParse(req.body);
  if (!parsed.success) throw badRequest('Check the details.', parsed.error.flatten().fieldErrors);
  const db = getDb();
  if (parsed.data.role === 'attendant') {
    const active = db
      .prepare(`SELECT COUNT(*) AS n FROM plan_members WHERE plan_id = ? AND role = 'attendant' AND status IN ('active','invited')`)
      .get(p(req, 'id')) as { n: number };
    if (active.n >= 4) throw conflict('This plan already has the maximum of 4 attendants. End one first.');
  }
  const id = newId('mem');
  const code = newInviteCode();
  db.prepare(
    `INSERT INTO plan_members (id, plan_id, user_id, role, status, display_name, phone, invite_code, agency_name, created_at)
     VALUES (?,?,NULL,?,'invited',?,?,?,?,?)`
  ).run(id, p(req, 'id'), parsed.data.role, parsed.data.display_name, parsed.data.phone ?? null, code, parsed.data.agency_name ?? null, nowIso());
  track({ name: 'attendant_invited', userId: req.userId, planId: p(req, 'id'), props: { role: parsed.data.role } });
  res.status(201).json({ id, invite_code: code });
});

/** Ending a member always produces a handover snapshot — that is the whole point. */
planRouter.post('/:id/members/:memberId/end', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner']);
  const parsed = z.object({ reason: z.string().trim().max(200).optional() }).safeParse(req.body);
  const db = getDb();
  const member = db
    .prepare('SELECT * FROM plan_members WHERE id = ? AND plan_id = ?')
    .get(p(req, 'memberId'), p(req, 'id')) as any;
  if (!member) throw notFound('That person is not on this plan.');
  if (member.role === 'owner') throw badRequest('The plan owner cannot be removed.');
  if (member.status === 'ended') throw conflict('That person has already been ended on this plan.');

  const snapshot = buildHandover(p(req, 'id'));
  const now = nowIso();
  db.transaction(() => {
    db.prepare(`UPDATE plan_members SET status = 'ended', ended_at = ?, end_reason = ? WHERE id = ?`).run(
      now,
      parsed.success ? parsed.data.reason ?? null : null,
      member.id
    );
    db.prepare(`UPDATE shifts SET ended_at = ? WHERE member_id = ? AND ended_at IS NULL`).run(now, member.id);
    db.prepare(
      `INSERT INTO handovers (id, plan_id, from_member_id, to_member_id, reason, snapshot, created_at, created_by)
       VALUES (?,?,?,NULL,?,?,?,?)`
    ).run(newId('hnd'), p(req, 'id'), member.id, parsed.success ? parsed.data.reason ?? null : null, JSON.stringify(snapshot), now, req.userId!);
  })();

  track({ name: 'attendant_ended', userId: req.userId, planId: p(req, 'id'), props: { reason: (parsed.success && parsed.data.reason) || 'unspecified' } });
  res.json({ ok: true });
});

planRouter.get('/:id/handover', (req: AuthedRequest, res) => {
  const m = requireMembership(p(req, 'id'), req.userId!);
  const pack = buildHandover(p(req, 'id'));
  if (!pack) throw notFound();
  track({ name: 'handover_pack_viewed', userId: req.userId, planId: p(req, 'id'), role: m.role });
  res.json(pack);
});

planRouter.get('/:id/handovers', (req: AuthedRequest, res) => {
  requireMembership(p(req, 'id'), req.userId!, ['owner', 'family']);
  const rows = getDb()
    .prepare(
      `SELECT h.id, h.created_at, h.reason, fm.display_name AS from_name
       FROM handovers h LEFT JOIN plan_members fm ON fm.id = h.from_member_id
       WHERE h.plan_id = ? ORDER BY h.created_at DESC`
    )
    .all(p(req, 'id'));
  res.json({ handovers: rows });
});
