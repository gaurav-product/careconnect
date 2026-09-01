/**
 * Shared domain types between the API and the web client.
 * Kept dependency-free so both sides can import it.
 */

export type Role = 'family' | 'attendant';
export type MemberRole = 'owner' | 'family' | 'attendant';
export type MemberStatus = 'invited' | 'active' | 'ended';
export type Lang = 'en' | 'hi';

export type ShiftSlot = 'day' | 'night';
export type TaskWindow = 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
export type TaskCategory =
  | 'mobility'
  | 'hygiene'
  | 'nutrition'
  | 'wound'
  | 'exercise'
  | 'observation'
  | 'other';

export type VitalType = 'bp' | 'sugar' | 'temp' | 'spo2' | 'pulse' | 'weight';

export type TaskLogStatus = 'done' | 'missed' | 'not_applicable';
export type MedLogStatus = 'given' | 'missed' | 'refused' | 'held_on_advice';

export type AlertType =
  | 'red_flag'
  | 'vital_out_of_range'
  | 'critical_med_missed'
  | 'shift_not_started'
  | 'shift_incomplete';
export type AlertSeverity = 'urgent' | 'watch';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';

export type PlanStatus = 'active' | 'completed' | 'paused';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  lang: Lang;
  created_at: string;
}

export interface CarePlan {
  id: string;
  owner_user_id: string;
  patient_name: string;
  patient_age: number;
  patient_sex: 'male' | 'female' | 'other';
  city: string;
  hospital: string | null;
  procedure: string;
  discharge_date: string; // YYYY-MM-DD (IST)
  episode_days: number;
  status: PlanStatus;
  doctor_name: string | null;
  doctor_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanMember {
  id: string;
  plan_id: string;
  user_id: string | null;
  role: MemberRole;
  status: MemberStatus;
  display_name: string;
  phone: string | null;
  invite_code: string | null;
  agency_name: string | null;
  started_at: string | null;
  ended_at: string | null;
  end_reason: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  plan_id: string;
  name: string;
  dose: string;
  times: string[]; // ['08:00','20:00'] IST
  instruction: string | null;
  critical: boolean;
  active: boolean;
  created_at: string;
}

export interface CareTask {
  id: string;
  plan_id: string;
  title_en: string;
  title_hi: string;
  window: TaskWindow;
  category: TaskCategory;
  critical: boolean;
  active: boolean;
  created_at: string;
}

export interface VitalCheck {
  id: string;
  plan_id: string;
  type: VitalType;
  times: string[];
  low: number | null;
  high: number | null;
  low2: number | null;
  high2: number | null;
  active: boolean;
}

export interface RedFlag {
  id: string;
  plan_id: string;
  label_en: string;
  label_hi: string;
  severity: AlertSeverity;
  active: boolean;
}

export interface Shift {
  id: string;
  plan_id: string;
  member_id: string;
  date: string; // YYYY-MM-DD IST
  slot: ShiftSlot;
  started_at: string;
  ended_at: string | null;
  handover_note: string | null;
}

export interface TaskLog {
  id: string;
  plan_id: string;
  shift_id: string;
  task_id: string;
  status: TaskLogStatus;
  reason: string | null;
  logged_at: string;
  logged_by: string;
}

export interface MedLog {
  id: string;
  plan_id: string;
  shift_id: string;
  medication_id: string;
  scheduled_time: string;
  date: string;
  status: MedLogStatus;
  reason: string | null;
  logged_at: string;
  logged_by: string;
}

export interface VitalLog {
  id: string;
  plan_id: string;
  shift_id: string | null;
  type: VitalType;
  value1: number;
  value2: number | null;
  out_of_range: boolean;
  logged_at: string;
  logged_by: string;
}

export interface Observation {
  id: string;
  plan_id: string;
  shift_id: string | null;
  red_flag_id: string | null;
  note: string;
  severity: AlertSeverity;
  logged_at: string;
  logged_by: string;
}

export interface Alert {
  id: string;
  plan_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  detail: string;
  source_id: string | null;
  status: AlertStatus;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
}

/** A single day of care, assembled for the family record view. */
export interface DayRecord {
  date: string;
  day_number: number;
  shifts: Array<
    Shift & { attendant_name: string; task_total: number; task_done: number; closed: boolean }
  >;
  meds: Array<{
    medication_id: string;
    name: string;
    dose: string;
    scheduled_time: string;
    critical: boolean;
    status: MedLogStatus | 'pending';
    reason: string | null;
    logged_at: string | null;
  }>;
  tasks: Array<{
    task_id: string;
    title_en: string;
    title_hi: string;
    window: TaskWindow;
    critical: boolean;
    status: TaskLogStatus | 'pending';
    reason: string | null;
  }>;
  vitals: VitalLog[];
  observations: Array<Observation & { red_flag_label: string | null }>;
  alerts: Alert[];
  score: { logged: number; expected: number; missed_critical: number };
}

export const VITAL_META: Record<
  VitalType,
  { label: string; unit: string; dual: boolean; label2?: string }
> = {
  bp: { label: 'Blood pressure', unit: 'mmHg', dual: true, label2: 'Diastolic' },
  sugar: { label: 'Blood sugar', unit: 'mg/dL', dual: false },
  temp: { label: 'Temperature', unit: '°F', dual: false },
  spo2: { label: 'Oxygen (SpO2)', unit: '%', dual: false },
  pulse: { label: 'Pulse', unit: 'bpm', dual: false },
  weight: { label: 'Weight', unit: 'kg', dual: false }
};
