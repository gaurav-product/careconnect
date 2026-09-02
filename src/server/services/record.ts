import { getDb } from '../db.js';
import { addDays, dayNumber, istDate, parseJson, slotForTime, toBool } from '../util.js';
import { revisionsForDay } from './revisions.js';
import type {
  Alert,
  CarePlan,
  CareTask,
  DayRecord,
  MedLogStatus,
  Medication,
  Observation,
  PlanMember,
  RedFlag,
  ShiftSlot,
  TaskLogStatus,
  TaskWindow,
  VitalCheck,
  VitalLog
} from '../../shared/types.js';

/** A care task belongs to exactly one shift so a day's expectations are counted once. */
export function slotForWindow(w: TaskWindow): ShiftSlot {
  return w === 'evening' || w === 'night' ? 'night' : 'day';
}

const rowsToMeds = (rows: any[]): Medication[] =>
  rows.map((r) => ({ ...r, times: parseJson<string[]>(r.times, []), critical: toBool(r.critical), active: toBool(r.active) }));

const rowsToTasks = (rows: any[]): CareTask[] =>
  rows.map((r) => ({ ...r, critical: toBool(r.critical), active: toBool(r.active) }));

export function getPlanBundle(planId: string) {
  const db = getDb();
  const plan = db.prepare('SELECT * FROM care_plans WHERE id = ?').get(planId) as CarePlan | undefined;
  if (!plan) return null;
  const medications = rowsToMeds(
    db.prepare('SELECT * FROM medications WHERE plan_id = ? AND active = 1 ORDER BY name').all(planId)
  );
  const tasks = rowsToTasks(
    db.prepare('SELECT * FROM care_tasks WHERE plan_id = ? AND active = 1').all(planId)
  );
  const vitals = (db
    .prepare('SELECT * FROM vital_checks WHERE plan_id = ? AND active = 1')
    .all(planId) as any[]).map((v) => ({ ...v, times: parseJson<string[]>(v.times, []), active: true })) as VitalCheck[];
  const redFlags = (db
    .prepare('SELECT * FROM red_flags WHERE plan_id = ? AND active = 1')
    .all(planId) as any[]).map((r) => ({ ...r, active: true })) as RedFlag[];
  const members = db
    .prepare('SELECT * FROM plan_members WHERE plan_id = ? ORDER BY created_at')
    .all(planId) as PlanMember[];
  return { plan, medications, tasks, vitals, redFlags, members };
}

export function planDates(plan: CarePlan): string[] {
  const out: string[] = [];
  const today = istDate();
  for (let i = 0; i < plan.episode_days; i++) {
    const d = addDays(plan.discharge_date, i);
    if (d > today) break;
    out.push(d);
  }
  return out.length ? out : [plan.discharge_date];
}

/** Assembles everything that happened (and everything that was expected) on one IST day. */
export function getDayRecord(planId: string, date: string): DayRecord | null {
  const db = getDb();
  const bundle = getPlanBundle(planId);
  if (!bundle) return null;
  const { plan, medications, tasks } = bundle;

  const shiftRows = db
    .prepare(
      `SELECT s.*, m.display_name AS attendant_name
       FROM shifts s JOIN plan_members m ON m.id = s.member_id
       WHERE s.plan_id = ? AND s.date = ? ORDER BY s.slot DESC`
    )
    .all(planId, date) as any[];

  const taskLogs = db
    .prepare(
      `SELECT tl.* FROM task_logs tl JOIN shifts s ON s.id = tl.shift_id
       WHERE tl.plan_id = ? AND s.date = ?`
    )
    .all(planId, date) as Array<{ task_id: string; status: TaskLogStatus; reason: string | null; shift_id: string }>;

  const medLogs = db
    .prepare('SELECT * FROM med_logs WHERE plan_id = ? AND date = ?')
    .all(planId, date) as Array<{
    medication_id: string;
    scheduled_time: string;
    status: MedLogStatus;
    reason: string | null;
    logged_at: string;
  }>;

  const vitals = db
    .prepare(
      `SELECT * FROM vital_logs WHERE plan_id = ? AND date(logged_at, '+330 minutes') = ? ORDER BY logged_at`
    )
    .all(planId, date) as VitalLog[];

  const observations = db
    .prepare(
      `SELECT o.*, rf.label_en AS red_flag_label FROM observations o
       LEFT JOIN red_flags rf ON rf.id = o.red_flag_id
       WHERE o.plan_id = ? AND date(o.logged_at, '+330 minutes') = ? ORDER BY o.logged_at DESC`
    )
    .all(planId, date) as Array<Observation & { red_flag_label: string | null }>;

  const alerts = db
    .prepare(
      `SELECT * FROM alerts WHERE plan_id = ? AND date(created_at, '+330 minutes') = ? ORDER BY created_at DESC`
    )
    .all(planId, date) as Alert[];

  const revisions = revisionsForDay(planId, date);

  const medRows: DayRecord['meds'] = [];
  for (const m of medications) {
    for (const t of m.times) {
      const log = medLogs.find((l) => l.medication_id === m.id && l.scheduled_time === t);
      medRows.push({
        medication_id: m.id,
        name: m.name,
        dose: m.dose,
        scheduled_time: t,
        critical: m.critical,
        status: log?.status ?? 'pending',
        reason: log?.reason ?? null,
        logged_at: log?.logged_at ?? null
      });
    }
  }
  medRows.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

  const taskRows: DayRecord['tasks'] = tasks.map((t) => {
    const log = taskLogs.find((l) => l.task_id === t.id);
    return {
      task_id: t.id,
      title_en: t.title_en,
      title_hi: t.title_hi,
      window: t.window,
      critical: t.critical,
      status: log?.status ?? 'pending',
      reason: log?.reason ?? null
    };
  });

  const expected = medRows.length + taskRows.length;
  const logged =
    medRows.filter((m) => m.status !== 'pending').length +
    taskRows.filter((t) => t.status !== 'pending').length;
  const missedCritical =
    medRows.filter((m) => m.critical && (m.status === 'missed' || m.status === 'refused')).length +
    taskRows.filter((t) => t.critical && t.status === 'missed').length;

  return {
    date,
    day_number: dayNumber(plan.discharge_date, date),
    shifts: shiftRows.map((s) => {
      const slotTasks = tasks.filter((t) => slotForWindow(t.window) === s.slot);
      const done = taskLogs.filter((l) => l.shift_id === s.id && l.status === 'done').length;
      return {
        ...s,
        task_total: slotTasks.length,
        task_done: done,
        closed: Boolean(s.ended_at)
      };
    }),
    meds: medRows,
    tasks: taskRows,
    vitals,
    observations,
    alerts,
    revisions,
    score: { logged, expected, missed_critical: missedCritical }
  };
}

/**
 * North-star input: a day counts as DOCUMENTED when every critical item was recorded,
 * at least 80% of all expected items were recorded, and no urgent alert is still open.
 *
 * Deliberately not called "verified". CareConnect cannot verify that care happened —
 * it records what a person on the scene typed, at a time, under their name, with
 * corrections kept. That is documentation, not verification. See docs/13-metrics.md.
 */
export function isDocumentedCareDay(day: DayRecord): boolean {
  if (day.score.expected === 0) return false;
  if (day.score.missed_critical > 0) return false;
  const criticalPending = day.meds.some((m) => m.critical && m.status === 'pending') ||
    day.tasks.some((t) => t.critical && t.status === 'pending');
  if (criticalPending) return false;
  const openUrgent = day.alerts.some((a) => a.severity === 'urgent' && a.status !== 'resolved');
  if (openUrgent) return false;
  return day.score.logged / day.score.expected >= 0.8;
}

/** The pack the next attendant reads on their first shift. */
export function buildHandover(planId: string) {
  const db = getDb();
  const bundle = getPlanBundle(planId);
  if (!bundle) return null;
  const { plan, medications, tasks, redFlags, vitals } = bundle;
  const dates = planDates(plan).slice(-7);
  const days = dates.map((d) => getDayRecord(planId, d)!).filter(Boolean);

  const openAlerts = db
    .prepare(`SELECT * FROM alerts WHERE plan_id = ? AND status != 'resolved' ORDER BY created_at DESC`)
    .all(planId) as Alert[];

  const recentObservations = db
    .prepare(
      `SELECT o.*, rf.label_en AS red_flag_label FROM observations o
       LEFT JOIN red_flags rf ON rf.id = o.red_flag_id
       WHERE o.plan_id = ? ORDER BY o.logged_at DESC LIMIT 10`
    )
    .all(planId) as Array<Observation & { red_flag_label: string | null }>;

  // Decisions the family already made. Without these, a new attendant re-raises
  // questions that were settled last week — the exact failure this pack exists to stop.
  const recentDecisions = db
    .prepare(
      `SELECT id, title, detail, severity, resolution_note, resolved_at FROM alerts
       WHERE plan_id = ? AND status = 'resolved' AND resolution_note IS NOT NULL
       ORDER BY resolved_at DESC LIMIT 5`
    )
    .all(planId) as Array<{
    id: string;
    title: string;
    detail: string;
    severity: string;
    resolution_note: string;
    resolved_at: string;
  }>;

  const outgoing = db
    .prepare(
      `SELECT * FROM plan_members WHERE plan_id = ? AND role = 'attendant'
       ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, ended_at DESC LIMIT 1`
    )
    .get(planId) as PlanMember | undefined;

  const lastNote = db
    .prepare(
      `SELECT handover_note, date, slot FROM shifts WHERE plan_id = ? AND handover_note IS NOT NULL
       ORDER BY started_at DESC LIMIT 1`
    )
    .get(planId) as { handover_note: string; date: string; slot: string } | undefined;

  const trouble = days
    .flatMap((d) =>
      [
        ...d.meds
          .filter((m) => m.status === 'missed' || m.status === 'refused')
          .map((m) => `Day ${d.day_number}: ${m.name} ${m.status}${m.reason ? ` — ${m.reason}` : ''}`),
        ...d.tasks
          .filter((t) => t.status === 'missed')
          .map((t) => `Day ${d.day_number}: ${t.title_en} missed${t.reason ? ` — ${t.reason}` : ''}`)
      ]
    )
    .slice(0, 12);

  return {
    plan,
    generated_for_days: dates,
    medications,
    tasks,
    vitals,
    red_flags: redFlags,
    open_alerts: openAlerts,
    recent_decisions: recentDecisions,
    recent_observations: recentObservations,
    outgoing_attendant: outgoing ?? null,
    last_handover_note: lastNote ?? null,
    week: days.map((d) => ({
      date: d.date,
      day_number: d.day_number,
      logged: d.score.logged,
      expected: d.score.expected,
      missed_critical: d.score.missed_critical,
      documented: isDocumentedCareDay(d)
    })),
    recent_problems: trouble
  };
}

export { slotForTime };
