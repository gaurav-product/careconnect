import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { cleanup, freshApp } from './helpers.js';

let ctx: ReturnType<typeof freshApp>;
beforeAll(() => {
  ctx = freshApp('auth');
});
afterAll(() => cleanup(ctx.file));

describe('authentication', () => {
  it('rejects a malformed mobile number with a field-level message', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/register')
      .send({ name: 'Test User', phone: '12345', password: 'password123', role: 'family' });
    expect(res.status).toBe(400);
    expect(res.body.details.phone[0]).toMatch(/10-digit/);
  });

  it('rejects a short password', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/register')
      .send({ name: 'Test User', phone: '9810000001', password: 'short', role: 'family' });
    expect(res.status).toBe(400);
    expect(res.body.details.password[0]).toMatch(/8 characters/);
  });

  it('registers, sets a session cookie and returns the user', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/register')
      .send({ name: 'Ananya Iyer', phone: '9810000002', password: 'password123', role: 'family' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('family');
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
  });

  it('refuses a duplicate mobile number', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/register')
      .send({ name: 'Someone Else', phone: '9810000002', password: 'password123', role: 'family' });
    expect(res.status).toBe(409);
  });

  it('refuses a wrong password without revealing which field was wrong', async () => {
    const res = await request(ctx.app).post('/api/auth/login').send({ phone: '9810000002', password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/do not match/);
  });

  it('blocks protected routes without a session', async () => {
    const res = await request(ctx.app).get('/api/plans');
    expect(res.status).toBe(401);
  });

  it('keeps the session across requests and clears it on sign out', async () => {
    const agent = request.agent(ctx.app);
    await agent.post('/api/auth/login').send({ phone: '9810000002', password: 'password123' });
    const me = await agent.get('/api/auth/me');
    expect(me.body.user.name).toBe('Ananya Iyer');
    await agent.post('/api/auth/logout');
    const after = await agent.get('/api/auth/me');
    // Being signed out is a normal state, so the probe answers 200 with no user.
    expect(after.status).toBe(200);
    expect(after.body.user).toBeNull();
  });
});

describe('credential rate limiting', () => {
  it('stops repeated password guessing on one number', async () => {
    const attempts = [];
    for (let i = 0; i < 12; i++) {
      attempts.push(await request(ctx.app).post('/api/auth/login').send({ phone: '9819999999', password: `guess${i}xyz` }));
    }
    const statuses = attempts.map((r) => r.status);
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
    expect(attempts[attempts.length - 1].body.message).toMatch(/Too many failed attempts/);
  });

  it('does not lock out a family who signs in successfully again and again', async () => {
    for (let i = 0; i < 12; i++) {
      const res = await request(ctx.app).post('/api/auth/login').send({ phone: '9810000002', password: 'password123' });
      expect(res.status).toBe(200);
    }
  });
});
