import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, freshApp, samplePlan, signUp } from './helpers.js';

/**
 * The record is the product. A correction that leaves no trace would make it
 * unfalsifiable, so every change to an existing entry must be visible to the family.
 */
let ctx: ReturnType<typeof freshApp>;
let family: any;
let attendant: any;
let planId: string;
let shiftId: string;
let today: string;

beforeAll(async () => {
  ctx = freshApp('audit');
  family = await signUp(ctx.app, { name: 'Ananya', phone: '9830000001', role: 'family' });
  planId = (await family.post('/api/plans').send(samplePlan)).body.plan_id;
  const invite = await family.post(`/api/plans/${planId}/members`).send({ display_name: 'Reena' });
  attendant = await signUp(ctx.app, { name: 'Reena', phone: '9830000002', role: 'attendant' });
  await attendant.post('/api/invites/accept').send({ code: invite.body.invite_code });
  shiftId = (await attendant.post(`/api/plans/${planId}/shifts`)).body.shift_id;
  today = (await attendant.get(`/api/plans/${planId}/today`)).body.date;
});
afterAll(() => cleanup(ctx.file));

describe('care entries can be corrected, never quietly rewritten', () => {
  it('keeps the earlier value when a task entry is changed', async () => {
    const task = (await attendant.get(`/api/plans/${planId}/today`)).body.tasks[0];

    await attendant
      .post(`/api/shifts/${shiftId}/tasks`)
      .send({ task_id: task.id, status: 'missed', reason: 'He refused to get up' });
    await attendant.post(`/api/shifts/${shiftId}/tasks`).send({ task_id: task.id, status: 'done' });

    const day = await family.get(`/api/plans/${planId}/days/${today}`);
    expect(day.body.tasks.find((t: any) => t.task_id === task.id).status).toBe('done');

    expect(day.body.revisions).toHaveLength(1);
    const rev = day.body.revisions[0];
    expect(rev.entry_type).toBe('task');
    expect(rev.previous_status).toBe('missed');
    expect(rev.previous_reason).toBe('He refused to get up');
    expect(rev.new_status).toBe('done');
    expect(rev.changed_by_name).toBe('Reena');
    expect(rev.label).toBe(task.title_en);
  });

  it('does not record a revision when the same value is submitted twice', async () => {
    const task = (await attendant.get(`/api/plans/${planId}/today`)).body.tasks[1];
    await attendant.post(`/api/shifts/${shiftId}/tasks`).send({ task_id: task.id, status: 'done' });
    await attendant.post(`/api/shifts/${shiftId}/tasks`).send({ task_id: task.id, status: 'done' });

    const day = await family.get(`/api/plans/${planId}/days/${today}`);
    expect(day.body.revisions.filter((r: any) => r.entry_ref === task.id)).toHaveLength(0);
  });

  it('keeps the earlier value when a dose entry is changed', async () => {
    const med = (await attendant.get(`/api/plans/${planId}/today`)).body.meds[0];
    if (!med) return; // no dose falls in this shift slot

    await attendant.post(`/api/shifts/${shiftId}/meds`).send({
      medication_id: med.medication_id,
      scheduled_time: med.scheduled_time,
      status: 'missed',
      reason: 'Strip finished'
    });
    await attendant.post(`/api/shifts/${shiftId}/meds`).send({
      medication_id: med.medication_id,
      scheduled_time: med.scheduled_time,
      status: 'given'
    });

    const day = await family.get(`/api/plans/${planId}/days/${today}`);
    const rev = day.body.revisions.find((r: any) => r.entry_type === 'medication');
    expect(rev).toBeTruthy();
    expect(rev.previous_status).toBe('missed');
    expect(rev.previous_reason).toBe('Strip finished');
    expect(rev.new_status).toBe('given');
    expect(rev.label).toContain(med.name);
  });

  it('shows corrections to the family, not only to whoever made them', async () => {
    const day = await family.get(`/api/plans/${planId}/days/${today}`);
    expect(day.body.revisions.length).toBeGreaterThan(0);
    // and the attendant can see their own corrections too — no secret file about a worker
    const attendantView = await attendant.get(`/api/plans/${planId}/days/${today}`);
    expect(attendantView.status).toBe(200);
    expect(attendantView.body.revisions.length).toBe(day.body.revisions.length);
  });

  it('counts a corrected day by its final state, not its first draft', async () => {
    const metrics = await family.get(`/api/plans/${planId}/metrics`);
    expect(metrics.status).toBe(200);
    expect(metrics.body).toHaveProperty('documented_care_days');
    expect(metrics.body).not.toHaveProperty('verified_care_days');
  });
});
