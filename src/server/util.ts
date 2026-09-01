import { customAlphabet } from 'nanoid';

const idGen = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const codeGen = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 6);

export const newId = (prefix: string): string => `${prefix}_${idGen()}`;
export const newInviteCode = (): string => codeGen();

export const IST_OFFSET_MIN = 330;

/** Current instant as an ISO-8601 UTC string (all timestamps are stored in UTC). */
export const nowIso = (): string => new Date().toISOString();

/** Calendar date in India Standard Time, YYYY-MM-DD. All "days of care" are IST days. */
export function istDate(at: Date | string = new Date()): string {
  const d = typeof at === 'string' ? new Date(at) : at;
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  return shifted.toISOString().slice(0, 10);
}

/** Wall-clock HH:MM in IST. */
export function istTime(at: Date | string = new Date()): string {
  const d = typeof at === 'string' ? new Date(at) : at;
  const shifted = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  return shifted.toISOString().slice(11, 16);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Day 1 is the discharge day itself, which is how families count it. */
export function dayNumber(dischargeDate: string, date: string): number {
  return daysBetween(dischargeDate, date) + 1;
}

/** 07:00–18:59 IST is the day shift; the rest is night. */
export function slotForTime(hhmm: string): 'day' | 'night' {
  const h = Number(hhmm.slice(0, 2));
  return h >= 7 && h < 19 ? 'day' : 'night';
}

export const parseJson = <T>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const toBool = (v: unknown): boolean => v === 1 || v === true;

/** Express 5 types route params as string | string[]; every route here uses single values. */
export const p = (req: { params: Record<string, unknown> }, key: string): string => {
  const v = req.params[key];
  return Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '');
};
