import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { clearSession, hashPassword, issueSession, readSession, requireAuth, verifyPassword, type AuthedRequest } from '../auth.js';
import { badRequest, conflict, unauthorized } from '../errors.js';
import { newId, nowIso } from '../util.js';
import { track } from '../services/events.js';
import { assertNotRateLimited, clearFailures, recordFailure } from '../rateLimit.js';

export const authRouter = Router();

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number.');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(60),
  phone,
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
  role: z.enum(['family', 'attendant']).default('family'),
  lang: z.enum(['en', 'hi']).default('en')
});

const limitKey = (req: { ip?: string; body?: unknown }): string =>
  `${req.ip ?? 'local'}:${String((req.body as { phone?: string })?.phone ?? '')}`;

authRouter.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest('Please check the form.', parsed.error.flatten().fieldErrors);
  const { name, phone: ph, password, role, lang } = parsed.data;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(ph);
  if (existing) throw conflict('An account with this mobile number already exists. Try signing in.');
  const id = newId('usr');
  db.prepare(
    'INSERT INTO users (id, name, phone, password_hash, role, lang, created_at) VALUES (?,?,?,?,?,?,?)'
  ).run(id, name, ph, hashPassword(password), role, lang, nowIso());
  issueSession(res, id);
  track({ name: 'account_created', userId: id, role, props: { lang } });
  res.status(201).json({ user: { id, name, phone: ph, role, lang } });
});

authRouter.post('/login', (req, res) => {
  const parsed = z.object({ phone, password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) throw badRequest('Enter your mobile number and password.', parsed.error.flatten().fieldErrors);
  const key = limitKey(req);
  assertNotRateLimited(key);
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(parsed.data.phone) as any;
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    recordFailure(key);
    throw unauthorized('That mobile number and password do not match.');
  }
  clearFailures(key);
  issueSession(res, user.id);
  track({ name: 'signed_in', userId: user.id, role: user.role });
  res.json({ user: { id: user.id, name: user.name, phone: user.phone, role: user.role, lang: user.lang } });
});

authRouter.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

/**
 * Session probe. Returns 200 with a null user when nobody is signed in: being signed
 * out is a normal state, not an error, and a 401 here fills the browser console with
 * red herrings on every first page load.
 */
authRouter.get('/me', (req, res) => {
  const raw = (req as any).cookies?.cc_session;
  if (!raw) return res.json({ user: null });
  try {
    const userId = readSession(raw);
    const user = getDb()
      .prepare('SELECT id, name, phone, role, lang, created_at FROM users WHERE id = ?')
      .get(userId);
    return res.json({ user: user ?? null });
  } catch {
    return res.json({ user: null });
  }
});

authRouter.patch('/me', requireAuth, (req: AuthedRequest, res) => {
  const parsed = z.object({ lang: z.enum(['en', 'hi']) }).safeParse(req.body);
  if (!parsed.success) throw badRequest('Unsupported language.');
  getDb().prepare('UPDATE users SET lang = ? WHERE id = ?').run(parsed.data.lang, req.userId!);
  res.json({ ok: true });
});
