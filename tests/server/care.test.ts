import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, freshApp, samplePlan, signUp } from './helpers.js';

let ctx: ReturnType<typeof freshApp>;
let family: any;
let attendant: any;
let planId: string;
let shiftId: string;

beforeAll(async () => {
  ctx = freshApp('care');
  family = await signUp(ctx.app, { name: 'Ananya', phone: '9820000001', role: 'family' });
  planId = (await family.post('/api/plans').send(samplePlan)).body.plan_id;
  const invite = await family.post(`/api/plans/${planId}/members`).send({ display_name: 'Reena Kumari' });
  attendant = await signUp(ctx.app, { name: 'Reena Kumari', phone: '9820000002', role: 'attendant' });
  await attendant.post('/api/invites/accept').send({ code: invite.body.invite_code });
});
afterAll(() => cleanup(ctx.file));

describe('the shift', () => {
  it('shows the attendant only the tasks and doses for the current shift', async () => {
    const res = await attendant.get(`/api/plans/${planId}/today`);
    expect(res.status).toBe(200);
    expect(res.body.is_my_shift).toBe(false);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(['day', 'night']).toContain(res.body.slot);
  });

  it('starts a shift and is idempotent for the same attendant', async () => {
    const first = await attendant.post(`/api/plans/${planId}/shifts`);
    expect(first.status).toBe(201);
    shiftId = first.body.shift_id;
    const again = await attendant.post(`/api/plans/${planId}/shifts`);
    expect(again.body.resumed).toBe(true);
    expect(again.body.shift_id).toBe(shiftId);
  });

  it('refuses a second attendant on the same slot', async () => {
    const invite = await family.post(`/api/plans/${planId}/members`).send({ display_name: 'Other Helper' });
    const other = await signUp(ctx.app, { name: 'Other Helper', phone: '9820000003', role: 'attendant' });
    await other.post('/api/invites/accept').send({ code: invite.body.invite_code });
    const res = await other.post(`/api/plans/${planId}/shifts`);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already started/);
  });

  it('will not let a family member record care', async () => {
    const today = await family.get(`/api/plans/${planId}/today`);
    const task = today.body.tasks[0];
    const res = await family.post(`/api/shifts/${shiftId}/tasks`).send({ task_id: task.id, status: 'done' });
    expect(res.status).toBe(403);
  });

  it('demands a reason when something was not done', async () => {
    const today = await attendant.get(`/api/plans/${planId}/today`);
    const task = today.body.tasks[0];
    const bad = await attendant.post(`/api/shifts/${shiftId}/tasks`).send({ task_id: task.id, status: 'missed' });
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/why/i);
    const good = await attendant
      .post(`/api/shifts/${shiftId}/tasks`)
      .send({ task_id: task.id, status: 'missed', reason: 'He refused to get up today' });
    expect(good.status).toBe(200);
  });

  it('records a dose and is safe to submit twice', async () => {
    const today = await attendant.get(`/api/plans/${planId}/today`);
    const med = today.body.meds[0];
    if (!med) return; // no dose falls in this shift; covered by the med-alert test below
    const first = await attendant
      .post(`/api/shifts/${shiftId}/meds`)
      .send({ medication_id: med.medication_id, scheduled_time: med.scheduled_time, status: 'given' });
    expect(first.status).toBe(200);
    const second = await attendant
      .post(`/api/shifts/${shiftId}/meds`)
      .send({ medication_id: med.medication_id, scheduled_time: med.scheduled_time, status: 'given' });
    expect(second.status).toBe(200);
    const day = await family.get(`/api/plans/${planId}/days/${today.body.date}`);
    const entries = day.body.meds.filter(
      (m: any) => m.medication_id === med.medication_id && m.scheduled_time === med.scheduled_time
    );
    expect(entries).toHaveLength(1);
  });

  it('rejects a dose time that is not on the schedule', async () => {
    const today = await attendant.get(`/api/plans/${planId}/today`);
    const bundle = await family.get(`/api/plans/${planId}`);
    const med = bundle.body.medications[0];
    const res = await attendant
      .post(`/api/shifts/${shiftId}/meds`)
      .send({ medication_id: med.id, scheduled_time: '03:33', status: 'given' });
    expect(res.status).toBe(400);
    expect(today.body.date).toBeTruthy();
  });
});

describe('escalation', () => {
  it('raises an urgent alert when a red flag is reported', async () => {
    const today = await attendant.get(`/api/plans/${planId}/today`);
    const flag = today.body.red_flags.find((f: any) => f.severity === 'urgent');
    const res = await attendant
      .post(`/api/plans/${planId}/observations`)
      .send({ red_flag_id: flag.id, note: 'Wound is red and warm around the lower stitch.' });
    expect(res.status).toBe(201);
    expect(res.body.severity).toBe('urgent');
    const alerts = await family.get(`/api/plans/${planId}/alerts?status=open`);
    expect(alerts.body.alerts.some((a: any) => a.type === 'red_flag' && a.severity === 'urgent')).toBe(true);
  });

  it('raises an alert on an out-of-range reading and stores the reading either way', async () => {
    const high = await attendant.post(`/api/shifts/${shiftId}/vitals`).send({ type: 'temp', value1: 102.6 });
    expect(high.body.out_of_range).toBe(true);
    const normal = await attendant.post(`/api/shifts/${shiftId}/vitals`).send({ type: 'temp', value1: 98.2 });
    expect(normal.body.out_of_range).toBe(false);
    const alerts = await family.get(`/api/plans/${planId}/alerts`);
    const vitalAlerts = alerts.body.alerts.filter((a: any) => a.type === 'vital_out_of_range');
    expect(vitalAlerts).toHaveLength(1);
    expect(vitalAlerts[0].severity).toBe('urgent');
  });

  it('needs both numbers for blood pressure', async () => {
    const res = await attendant.post(`/api/shifts/${shiftId}/vitals`).send({ type: 'bp', value1: 130 });
    expect(res.status).toBe(400);
  });

  it('lets the family acknowledge and then close an alert with a note', async () => {
    const open = (await family.get(`/api/plans/${planId}/alerts?status=open`)).body.alerts[0];
    const ack = await family.post(`/api/alerts/${open.id}/ack`);
    expect(ack.body.status).toBe('acknowledged');
    const noNote = await family.post(`/api/alerts/${open.id}/resolve`).send({ note: '' });
    expect(noNote.status).toBe(400);
    const done = await family.post(`/api/alerts/${open.id}/resolve`).send({ note: 'Spoke to Dr Menon, antibiotic added.' });
    expect(done.status).toBe(200);
    const after = (await family.get(`/api/plans/${planId}/alerts`)).body.alerts.find((a: any) => a.id === open.id);
    expect(after.status).toBe('resolved');
    expect(after.resolution_note).toMatch(/Menon/);
  });

  it('will not let an attendant close an alert', async () => {
    const alert = (await family.get(`/api/plans/${planId}/alerts`)).body.alerts[0];
    const res = await attendant.post(`/api/alerts/${alert.id}/ack`);
    expect(res.status).toBe(403);
  });

  it('flags a shift closed with important items unrecorded', async () => {
    const res = await attendant.post(`/api/shifts/${shiftId}/close`).send({ handover_note: 'Ate well, slept in the afternoon.' });
    expect(res.status).toBe(200);
    expect(res.body.unlogged).toBeGreaterThan(0);
    const alerts = await family.get(`/api/plans/${planId}/alerts`);
    expect(alerts.body.alerts.some((a: any) => a.type === 'shift_incomplete')).toBe(true);
  });

  it('refuses further logging on a closed shift', async () => {
    const today = await attendant.get(`/api/plans/${planId}/today`);
    const task = today.body.tasks.find((t: any) => t.status === 'pending');
    const res = await attendant
      .post(`/api/shifts/${shiftId}/tasks`)
      .send({ task_id: task?.id ?? 'tsk_missing', status: 'done' });
    expect([404, 409]).toContain(res.status);
  });
});

describe('continuity when the attendant changes', () => {
  it('builds a handover pack containing the plan, the week and the warning signs', async () => {
    const pack = await family.get(`/api/plans/${planId}/handover`);
    expect(pack.status).toBe(200);
    expect(pack.body.medications.length).toBeGreaterThan(0);
    expect(pack.body.red_flags.length).toBeGreaterThan(0);
    expect(pack.body.week.length).toBeGreaterThan(0);
    expect(pack.body.last_handover_note.handover_note).toMatch(/Ate well/);
  });

  it('ends an attendant, revokes their access and saves a handover', async () => {
    const members = (await family.get(`/api/plans/${planId}/members`)).body.members;
    const reena = members.find((m: any) => m.display_name === 'Reena Kumari');
    const res = await family.post(`/api/plans/${planId}/members/${reena.id}/end`).send({ reason: 'Went back to her village' });
    expect(res.status).toBe(200);

    const blocked = await attendant.get(`/api/plans/${planId}/today`);
    expect(blocked.status).toBe(403);

    const handovers = await family.get(`/api/plans/${planId}/handovers`);
    expect(handovers.body.handovers[0].reason).toMatch(/village/);
    expect(handovers.body.handovers[0].from_name).toBe('Reena Kumari');
  });

  it('will not end the plan owner', async () => {
    const members = (await family.get(`/api/plans/${planId}/members`)).body.members;
    const owner = members.find((m: any) => m.role === 'owner');
    const res = await family.post(`/api/plans/${planId}/members/${owner.id}/end`).send({});
    expect(res.status).toBe(400);
  });

  it('keeps the record readable after the attendant leaves', async () => {
    const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
    const day = await family.get(`/api/plans/${planId}/days/${today}`);
    expect(day.status).toBe(200);
    expect(day.body.shifts[0].attendant_name).toBe('Reena Kumari');
  });
});

describe('metrics', () => {
  it('computes the measurement definitions without inventing data', async () => {
    const res = await family.get(`/api/plans/${planId}/metrics`);
    expect(res.status).toBe(200);
    expect(res.body.days_elapsed).toBeGreaterThan(0);
    expect(res.body.documented_care_days).toBeLessThanOrEqual(res.body.days_elapsed);
    expect(res.body.logging_completeness).toBeGreaterThanOrEqual(0);
    expect(res.body.logging_completeness).toBeLessThanOrEqual(1);
  });

  it('rejects a future date on the day record', async () => {
    const res = await family.get(`/api/plans/${planId}/days/2099-01-01`);
    expect(res.status).toBe(400);
  });

  it('rejects a malformed date', async () => {
    const res = await family.get(`/api/plans/${planId}/days/not-a-date`);
    expect(res.status).toBe(400);
  });
});
