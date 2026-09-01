import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { cleanup, freshApp, samplePlan, signUp } from './helpers.js';

let ctx: ReturnType<typeof freshApp>;
let family: any;
let planId: string;

beforeAll(async () => {
  ctx = freshApp('plans');
  family = await signUp(ctx.app, { name: 'Ananya Iyer', phone: '9810000010', role: 'family' });
});
afterAll(() => cleanup(ctx.file));

describe('care plan setup', () => {
  it('rejects a plan with missing essentials', async () => {
    const res = await family.post('/api/plans').send({ patient_name: 'X' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.details).length).toBeGreaterThan(0);
  });

  it('rejects a discharge date in the future', async () => {
    const res = await family.post('/api/plans').send({ ...samplePlan, discharge_date: '2099-01-01' });
    expect(res.status).toBe(400);
  });

  it('creates a plan seeded from the chosen recovery template', async () => {
    const res = await family.post('/api/plans').send(samplePlan);
    expect(res.status).toBe(201);
    planId = res.body.plan_id;
    const bundle = await family.get(`/api/plans/${planId}`);
    expect(bundle.status).toBe(200);
    expect(bundle.body.medications).toHaveLength(2);
    expect(bundle.body.tasks.length).toBeGreaterThan(5);
    expect(bundle.body.redFlags.length).toBeGreaterThan(5);
    expect(bundle.body.tasks.every((t: any) => t.title_hi)).toBe(true);
    expect(bundle.body.my_role).toBe('owner');
  });

  it('lists the plan for its owner', async () => {
    const res = await family.get('/api/plans');
    expect(res.body.plans).toHaveLength(1);
  });

  it('hides the plan from an unrelated account', async () => {
    const stranger = await signUp(ctx.app, { name: 'Stranger', phone: '9810000011', role: 'family' });
    expect((await stranger.get('/api/plans')).body.plans).toHaveLength(0);
    expect((await stranger.get(`/api/plans/${planId}`)).status).toBe(403);
    expect((await stranger.get(`/api/plans/${planId}/handover`)).status).toBe(403);
  });

  it('404s an unknown plan rather than leaking a 403', async () => {
    const res = await family.get('/api/plans/pln_doesnotexist');
    expect(res.status).toBe(404);
  });

  it('stops a medicine without deleting its history', async () => {
    const bundle = await family.get(`/api/plans/${planId}`);
    const med = bundle.body.medications[0];
    const res = await family.delete(`/api/plans/${planId}/medications/${med.id}`);
    expect(res.status).toBe(200);
    const after = await family.get(`/api/plans/${planId}`);
    expect(after.body.medications.find((m: any) => m.id === med.id)).toBeUndefined();
  });

  it('refuses to let an attendant account create a plan', async () => {
    const attendant = await signUp(ctx.app, { name: 'Reena', phone: '9810000012', role: 'attendant' });
    const res = await attendant.post('/api/plans').send(samplePlan);
    expect(res.status).toBe(403);
  });
});

describe('attendants and invites', () => {
  it('creates an invite code the attendant can redeem once', async () => {
    const invite = await family.post(`/api/plans/${planId}/members`).send({ display_name: 'Reena Kumari' });
    expect(invite.status).toBe(201);
    const code = invite.body.invite_code;
    expect(code).toHaveLength(6);

    const attendant = await signUp(ctx.app, { name: 'Reena Kumari', phone: '9810000013', role: 'attendant' });
    const accept = await attendant.post('/api/invites/accept').send({ code });
    expect(accept.status).toBe(200);
    expect(accept.body.plan_id).toBe(planId);

    const other = await signUp(ctx.app, { name: 'Someone', phone: '9810000014', role: 'attendant' });
    const reuse = await other.post('/api/invites/accept').send({ code });
    expect(reuse.status).toBe(409);
  });

  it('rejects an unknown invite code with a human message', async () => {
    const attendant = await signUp(ctx.app, { name: 'Nobody', phone: '9810000015', role: 'attendant' });
    const res = await attendant.post('/api/invites/accept').send({ code: 'ZZZZZZ' });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not valid/);
  });

  it('caps the number of attendants on one plan', async () => {
    for (let i = 0; i < 3; i++) {
      await family.post(`/api/plans/${planId}/members`).send({ display_name: `Helper ${i}` });
    }
    const res = await family.post(`/api/plans/${planId}/members`).send({ display_name: 'One too many' });
    expect(res.status).toBe(409);
  });
});
