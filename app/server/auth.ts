import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';
import { forbidden, notFound, unauthorized } from './errors.js';
import type { MemberRole, Role } from '../shared/types.js';

const COOKIE = 'cc_session';
const isProd = () => process.env.NODE_ENV === 'production';

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 8) {
    if (isProd()) throw new Error('JWT_SECRET must be set in production');
    return 'dev-only-insecure-secret';
  }
  return s;
}

export const hashPassword = (pw: string): string => bcrypt.hashSync(pw, 10);
export const verifyPassword = (pw: string, hash: string): boolean => bcrypt.compareSync(pw, hash);

export function issueSession(res: Response, userId: string): void {
  const token = jwt.sign({ sub: userId }, secret(), { expiresIn: '30d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd(),
    maxAge: 30 * 24 * 3600 * 1000,
    path: '/'
  });
}

export const clearSession = (res: Response): void => {
  res.clearCookie(COOKIE, { path: '/' });
};

/** Verifies a session cookie and returns the user id, or throws. */
export function readSession(raw: string): string {
  const payload = jwt.verify(raw, secret()) as { sub: string };
  return payload.sub;
}

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: Role;
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return next(unauthorized());
  try {
    const payload = jwt.verify(raw, secret()) as { sub: string };
    const user = getDb()
      .prepare('SELECT id, role FROM users WHERE id = ?')
      .get(payload.sub) as { id: string; role: Role } | undefined;
    if (!user) return next(unauthorized('Your session is no longer valid. Please sign in again.'));
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch {
    next(unauthorized('Your session has expired. Please sign in again.'));
  }
}

export interface Membership {
  id: string;
  role: MemberRole;
  status: string;
  plan_id: string;
}

/** Returns the caller's active membership on a plan, or throws 403/404. */
export function requireMembership(
  planId: string,
  userId: string,
  allowed: MemberRole[] = ['owner', 'family', 'attendant']
): Membership {
  const db = getDb();
  const plan = db.prepare('SELECT id FROM care_plans WHERE id = ?').get(planId);
  if (!plan) throw notFound('That care plan does not exist.');
  const m = db
    .prepare(
      `SELECT id, role, status, plan_id FROM plan_members
       WHERE plan_id = ? AND user_id = ? AND status = 'active'
       ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'family' THEN 1 ELSE 2 END LIMIT 1`
    )
    .get(planId, userId) as Membership | undefined;
  if (!m) throw forbidden();
  if (!allowed.includes(m.role)) throw forbidden('Your role cannot perform this action.');
  return m;
}
