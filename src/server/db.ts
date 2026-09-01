import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let db: Database.Database | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('family','attendant')),
  lang TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en','hi')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS care_plans (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_sex TEXT NOT NULL CHECK (patient_sex IN ('male','female','other')),
  city TEXT NOT NULL,
  hospital TEXT,
  procedure TEXT NOT NULL,
  discharge_date TEXT NOT NULL,
  episode_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  doctor_name TEXT,
  doctor_phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plans_owner ON care_plans(owner_user_id);

CREATE TABLE IF NOT EXISTS plan_members (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('owner','family','attendant')),
  status TEXT NOT NULL CHECK (status IN ('invited','active','ended')),
  display_name TEXT NOT NULL,
  phone TEXT,
  invite_code TEXT UNIQUE,
  agency_name TEXT,
  started_at TEXT,
  ended_at TEXT,
  end_reason TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_members_plan ON plan_members(plan_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON plan_members(user_id);

CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  times TEXT NOT NULL,
  instruction TEXT,
  critical INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_meds_plan ON medications(plan_id);

CREATE TABLE IF NOT EXISTS care_tasks (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  window TEXT NOT NULL CHECK (window IN ('morning','afternoon','evening','night','anytime')),
  category TEXT NOT NULL,
  critical INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_plan ON care_tasks(plan_id);

CREATE TABLE IF NOT EXISTS vital_checks (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  times TEXT NOT NULL,
  low REAL, high REAL, low2 REAL, high2 REAL,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_vitalchecks_plan ON vital_checks(plan_id);

CREATE TABLE IF NOT EXISTS red_flags (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  label_en TEXT NOT NULL,
  label_hi TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('urgent','watch')),
  active INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_redflags_plan ON red_flags(plan_id);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES plan_members(id),
  date TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('day','night')),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  handover_note TEXT,
  UNIQUE (plan_id, date, slot)
);
CREATE INDEX IF NOT EXISTS idx_shifts_plan_date ON shifts(plan_id, date);

CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL REFERENCES care_tasks(id),
  status TEXT NOT NULL CHECK (status IN ('done','missed','not_applicable')),
  reason TEXT,
  logged_at TEXT NOT NULL,
  logged_by TEXT NOT NULL,
  UNIQUE (shift_id, task_id)
);
CREATE INDEX IF NOT EXISTS idx_tasklogs_plan ON task_logs(plan_id);

CREATE TABLE IF NOT EXISTS med_logs (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  shift_id TEXT REFERENCES shifts(id) ON DELETE SET NULL,
  medication_id TEXT NOT NULL REFERENCES medications(id),
  date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('given','missed','refused','held_on_advice')),
  reason TEXT,
  logged_at TEXT NOT NULL,
  logged_by TEXT NOT NULL,
  UNIQUE (medication_id, date, scheduled_time)
);
CREATE INDEX IF NOT EXISTS idx_medlogs_plan_date ON med_logs(plan_id, date);

CREATE TABLE IF NOT EXISTS vital_logs (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  shift_id TEXT REFERENCES shifts(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  value1 REAL NOT NULL,
  value2 REAL,
  out_of_range INTEGER NOT NULL DEFAULT 0,
  logged_at TEXT NOT NULL,
  logged_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vitallogs_plan ON vital_logs(plan_id, logged_at);

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  shift_id TEXT REFERENCES shifts(id) ON DELETE SET NULL,
  red_flag_id TEXT REFERENCES red_flags(id),
  note TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('urgent','watch')),
  logged_at TEXT NOT NULL,
  logged_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_obs_plan ON observations(plan_id, logged_at);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('urgent','watch')),
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  source_id TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  created_at TEXT NOT NULL,
  acknowledged_at TEXT,
  acknowledged_by TEXT,
  resolved_at TEXT,
  resolution_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_alerts_plan ON alerts(plan_id, status);

CREATE TABLE IF NOT EXISTS handovers (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  from_member_id TEXT REFERENCES plan_members(id),
  to_member_id TEXT REFERENCES plan_members(id),
  reason TEXT,
  snapshot TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_handovers_plan ON handovers(plan_id);

-- Every alert also produces the message that WOULD be pushed to the family.
-- Actual WhatsApp/SMS delivery is not connected in this prototype; the outbox makes
-- the gap visible instead of pretending the message was sent. See docs/16.
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  alert_id TEXT REFERENCES alerts(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  to_name TEXT,
  to_phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued_stub',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_plan ON notifications(plan_id, created_at);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT,
  plan_id TEXT,
  role TEXT,
  props TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(name, created_at);
`;

export function getDb(): Database.Database {
  if (db) return db;
  const file = process.env.DB_PATH || path.resolve(process.cwd(), 'data/careconnect.db');
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new Database(file);
  db.exec(SCHEMA);
  return db;
}

/** Test helper: drop the cached handle so the next getDb() re-opens (used with DB_PATH=:memory:). */
export function resetDb(): void {
  if (db) db.close();
  db = null;
}
