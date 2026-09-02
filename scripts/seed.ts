/**
 * Seeds a realistic demo episode: a 74-year-old man recovering from a hip replacement
 * in Delhi, supervised by his daughter in Bengaluru, with one attendant replacement
 * midway through — the single most common failure mode CareConnect is built for.
 *
 * Run with: npm run seed          (add RESET=1 to wipe the database first)
 */
import fs from 'node:fs';
import path from 'node:path';
import { getDb, resetDb } from '../src/server/db.js';
import { hashPassword } from '../src/server/auth.js';
import { addDays, istDate, istTime, newId, newInviteCode } from '../src/server/util.js';
import { getTemplate } from '../src/server/templates.js';
import { buildHandover } from '../src/server/services/record.js';

const DB_FILE = process.env.DB_PATH || path.resolve(process.cwd(), 'data/careconnect.db');

if (process.env.RESET === '1' && DB_FILE !== ':memory:' && fs.existsSync(DB_FILE)) {
  resetDb();
  for (const suffix of ['', '-wal', '-shm']) {
    const f = `${DB_FILE}${suffix}`;
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}

const db = getDb();
const now = new Date();
const iso = (date: string, hhmm: string) =>
  new Date(`${date}T${hhmm}:00+05:30`).toISOString();

const EPISODE_DAYS = 30;
const DAYS_ELAPSED = 9;
const dischargeDate = addDays(istDate(now), -(DAYS_ELAPSED - 1));

function seed() {
  const existing = db.prepare("SELECT id FROM users WHERE phone = '9810012345'").get();
  if (existing) {
    console.log('Demo data already present. Run with RESET=1 to rebuild.');
    return;
  }

  const familyId = newId('usr');
  const attendant1Id = newId('usr');
  const attendant2Id = newId('usr');
  const pw = hashPassword('demo1234');
  const t = (d: string, h: string) => iso(d, h);

  db.prepare('INSERT INTO users (id,name,phone,password_hash,role,lang,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(familyId, 'Ananya Iyer', '9810012345', pw, 'family', 'en', t(dischargeDate, '09:00'));
  db.prepare('INSERT INTO users (id,name,phone,password_hash,role,lang,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(attendant1Id, 'Sunita Devi', '9810022222', pw, 'attendant', 'hi', t(dischargeDate, '10:00'));
  db.prepare('INSERT INTO users (id,name,phone,password_hash,role,lang,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(attendant2Id, 'Reena Kumari', '9810055555', pw, 'attendant', 'hi', t(addDays(dischargeDate, 5), '10:00'));

  const planId = newId('pln');
  db.prepare(
    `INSERT INTO care_plans (id, owner_user_id, patient_name, patient_age, patient_sex, city, hospital, procedure,
      discharge_date, episode_days, status, doctor_name, doctor_phone, emergency_contact_name, emergency_contact_phone,
      notes, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?, 'active', ?,?,?,?,?,?,?)`
  ).run(
    planId, familyId, 'Ramesh Iyer', 74, 'male', 'New Delhi', 'Max Super Speciality, Saket',
    'Right hip replacement (cemented), operated 3 days before discharge', dischargeDate, EPISODE_DAYS,
    'Dr. S. Menon (Orthopaedics)', '9810099999', 'Vikram Iyer (son, Gurugram)', '9810077777',
    'Sleeps in the ground-floor room. Walker beside the bed. Does not wear his hearing aid at night — knock loudly.',
    t(dischargeDate, '09:10'), t(dischargeDate, '09:10')
  );

  const ownerMemberId = newId('mem');
  const attendant1MemberId = newId('mem');
  const attendant2MemberId = newId('mem');
  db.prepare(
    `INSERT INTO plan_members (id,plan_id,user_id,role,status,display_name,phone,invite_code,agency_name,started_at,ended_at,end_reason,created_at)
     VALUES (?,?,?,'owner','active',?,?,NULL,NULL,?,NULL,NULL,?)`
  ).run(ownerMemberId, planId, familyId, 'Ananya Iyer', '9810012345', t(dischargeDate, '09:10'), t(dischargeDate, '09:10'));
  db.prepare(
    `INSERT INTO plan_members (id,plan_id,user_id,role,status,display_name,phone,invite_code,agency_name,started_at,ended_at,end_reason,created_at)
     VALUES (?,?,?,'attendant','ended',?,?,?,?,?,?,?,?)`
  ).run(
    attendant1MemberId, planId, attendant1Id, 'Sunita Devi', '9810022222', newInviteCode(), 'Sahyog Home Care',
    t(dischargeDate, '11:00'), t(addDays(dischargeDate, 5), '19:30'), 'Left for her village at short notice', t(dischargeDate, '10:30')
  );
  db.prepare(
    `INSERT INTO plan_members (id,plan_id,user_id,role,status,display_name,phone,invite_code,agency_name,started_at,ended_at,end_reason,created_at)
     VALUES (?,?,?,'attendant','active',?,?,?,?,?,NULL,NULL,?)`
  ).run(
    attendant2MemberId, planId, attendant2Id, 'Reena Kumari', '9810055555', 'DEMO01', 'Sahyog Home Care',
    t(addDays(dischargeDate, 6), '07:30'), t(addDays(dischargeDate, 5), '20:00')
  );

  // Plan content: the ortho template, plus the medicines from the discharge summary.
  const tpl = getTemplate('ortho');
  const taskIds: Array<{ id: string; window: string; critical: boolean }> = [];
  for (const task of tpl.tasks) {
    const id = newId('tsk');
    db.prepare(
      `INSERT INTO care_tasks (id,plan_id,title_en,title_hi,window,category,critical,active,created_at) VALUES (?,?,?,?,?,?,?,1,?)`
    ).run(id, planId, task.title_en, task.title_hi, task.window, task.category, task.critical ? 1 : 0, t(dischargeDate, '09:15'));
    taskIds.push({ id, window: task.window, critical: Boolean(task.critical) });
  }
  for (const v of tpl.vitals) {
    db.prepare(`INSERT INTO vital_checks (id,plan_id,type,times,low,high,low2,high2,active) VALUES (?,?,?,?,?,?,?,?,1)`)
      .run(newId('vtl'), planId, v.type, JSON.stringify(v.times), v.low ?? null, v.high ?? null, v.low2 ?? null, v.high2 ?? null);
  }
  for (const f of tpl.red_flags) {
    db.prepare(`INSERT INTO red_flags (id,plan_id,label_en,label_hi,severity,active) VALUES (?,?,?,?,?,1)`)
      .run(newId('flg'), planId, f.label_en, f.label_hi, f.severity);
  }

  const meds = [
    { name: 'Rivaroxaban', dose: '10 mg', times: ['09:00'], instruction: 'After breakfast. Blood thinner — never skip.', critical: 1 },
    { name: 'Paracetamol', dose: '650 mg', times: ['09:00', '15:00', '21:00'], instruction: 'For pain, after food', critical: 0 },
    { name: 'Pantoprazole', dose: '40 mg', times: ['08:00'], instruction: 'Empty stomach, 30 min before breakfast', critical: 0 },
    { name: 'Calcium + Vitamin D3', dose: '1 tablet', times: ['21:00'], instruction: 'After dinner', critical: 0 },
    { name: 'Cefuroxime', dose: '500 mg', times: ['09:00', '21:00'], instruction: 'Antibiotic — finish the full course', critical: 1 }
  ];
  const medIds = meds.map((m) => {
    const id = newId('med');
    db.prepare(
      `INSERT INTO medications (id,plan_id,name,dose,times,instruction,critical,active,created_at) VALUES (?,?,?,?,?,?,?,1,?)`
    ).run(id, planId, m.name, m.dose, JSON.stringify(m.times), m.instruction, m.critical, t(dischargeDate, '09:20'));
    return { id, ...m };
  });

  const slotOf = (w: string) => (w === 'evening' || w === 'night' ? 'night' : 'day');
  const slotForTime = (hhmm: string) => (Number(hhmm.slice(0, 2)) >= 7 && Number(hhmm.slice(0, 2)) < 19 ? 'day' : 'night');

  // Nine days of history. Day 6 is deliberately a bad day: a wound red flag, a missed
  // antibiotic dose and the attendant leaving that evening.
  for (let i = 0; i < DAYS_ELAPSED; i++) {
    const date = addDays(dischargeDate, i);
    const isToday = date === istDate(now);
    const memberId = i <= 5 ? attendant1MemberId : attendant2MemberId;
    const userId = i <= 5 ? attendant1Id : attendant2Id;

    // On the current day, only the shifts that have actually begun exist, and the one
    // running right now is left open so the demo always shows somebody on duty.
    const nowSlot = Number(istTime(now).slice(0, 2)) >= 7 && Number(istTime(now).slice(0, 2)) < 19 ? 'day' : 'night';
    for (const slot of ['day', 'night'] as const) {
      if (isToday && slot === 'night' && nowSlot === 'day') continue;
      const startTime = slot === 'day' ? '07:20' : '19:20';
      const endTime = slot === 'day' ? '19:05' : '07:05';
      const shiftId = newId('shf');
      const closed = !(isToday && slot === nowSlot);
      const note =
        slot === 'day'
          ? i === 5
            ? 'Wound looked pink around the lower stitch today. Told madam. He walked only once.'
            : 'Walked twice with walker. Ate full meals. No pain complaint.'
          : 'Slept through. Got up once for the toilet, no fall.';
      db.prepare(
        `INSERT INTO shifts (id,plan_id,member_id,date,slot,started_at,ended_at,handover_note) VALUES (?,?,?,?,?,?,?,?)`
      ).run(
        shiftId, planId, memberId, date, slot, t(date, startTime),
        closed ? (slot === 'day' ? t(date, endTime) : t(addDays(date, 1), endTime)) : null,
        closed ? note : null
      );

      const slotTasks = taskIds.filter((x) => slotOf(x.window) === slot);
      for (const [idx, task] of slotTasks.entries()) {
        // A believable amount of imperfection, and an in-progress look for the shift
        // that is still running: the last two items are simply not done yet.
        const misses = i === 5 && task.critical ? 1 : 0;
        if (!closed && idx >= slotTasks.length - 2) continue;
        // Only day 6 misses anything critical; other days lose the odd routine task.
        const status = misses ? 'missed' : !task.critical && Math.random() < 0.07 ? 'missed' : 'done';
        db.prepare(
          `INSERT INTO task_logs (id,plan_id,shift_id,task_id,status,reason,logged_at,logged_by) VALUES (?,?,?,?,?,?,?,?)`
        ).run(
          newId('tlg'), planId, shiftId, task.id, status,
          status === 'missed' ? (i === 5 ? 'He said the leg hurt too much to walk' : 'He refused today') : null,
          t(date, slot === 'day' ? '11:30' : '21:40'), userId
        );
      }

      for (const m of medIds) {
        for (const time of m.times) {
          if (slotForTime(time) !== slot) continue;
          if (!closed && time > '13:00') continue;
          const missed = i === 5 && m.name === 'Cefuroxime' && time === '21:00';
          db.prepare(
            `INSERT INTO med_logs (id,plan_id,shift_id,medication_id,date,scheduled_time,status,reason,logged_at,logged_by)
             VALUES (?,?,?,?,?,?,?,?,?,?)`
          ).run(
            newId('mlg'), planId, shiftId, m.id, date, time,
            missed ? 'missed' : 'given',
            missed ? 'Medicine strip finished, chemist was shut' : null,
            t(date, time), userId
          );
        }
      }

      if (slot === 'day') {
        const temp = i === 5 ? 101.4 : 97.6 + Math.round(Math.random() * 12) / 10;
        const sys = 118 + Math.round(Math.random() * 20);
        const dia = 72 + Math.round(Math.random() * 12);
        db.prepare(
          `INSERT INTO vital_logs (id,plan_id,shift_id,type,value1,value2,out_of_range,logged_at,logged_by) VALUES (?,?,?,?,?,?,?,?,?)`
        ).run(newId('vlg'), planId, shiftId, 'temp', temp, null, temp > 100.4 ? 1 : 0, t(date, '09:10'), userId);
        db.prepare(
          `INSERT INTO vital_logs (id,plan_id,shift_id,type,value1,value2,out_of_range,logged_at,logged_by) VALUES (?,?,?,?,?,?,?,?,?)`
        ).run(newId('vlg'), planId, shiftId, 'bp', sys, dia, 0, t(date, '09:12'), userId);
      }

      if (i === 5 && slot === 'day') {
        const obsId = newId('obs');
        db.prepare(
          `INSERT INTO observations (id,plan_id,shift_id,red_flag_id,note,severity,logged_at,logged_by) VALUES (?,?,?,?,?,?,?,?)`
        ).run(
          obsId, planId, shiftId,
          (db.prepare(`SELECT id FROM red_flags WHERE plan_id = ? AND label_en LIKE 'Wound is red%'`).get(planId) as any)?.id ?? null,
          'Skin around the lower stitch is red and warm to touch. Slight yellow stain on the gauze.',
          'urgent', t(date, '10:40'), userId
        );
        const alertId = newId('alt');
        db.prepare(
          `INSERT INTO alerts (id,plan_id,type,severity,title,detail,source_id,status,created_at,acknowledged_at,acknowledged_by,resolved_at,resolution_note)
           VALUES (?,?,?,?,?,?,?, 'resolved', ?,?,?,?,?)`
        ).run(
          alertId, planId, 'red_flag', 'urgent', 'Warning sign reported: Wound is red, warm, bleeding or leaking',
          'Skin around the lower stitch is red and warm to touch. Slight yellow stain on the gauze.', obsId,
          t(date, '10:41'), t(date, '10:58'), familyId, t(date, '18:20'),
          'Sent photo to Dr. Menon on WhatsApp. He added Augmentin and asked for a dressing change tomorrow.'
        );
        const tempAlert = newId('alt');
        db.prepare(
          `INSERT INTO alerts (id,plan_id,type,severity,title,detail,source_id,status,created_at,acknowledged_at,acknowledged_by,resolved_at,resolution_note)
           VALUES (?,?,?,?,?,?,?, 'resolved', ?,?,?,?,?)`
        ).run(
          tempAlert, planId, 'vital_out_of_range', 'watch', 'TEMP reading outside the expected range',
          'Recorded 101.4 at 09:10. Expected 96–100.4.', null, t(date, '09:11'), t(date, '10:58'), familyId,
          t(date, '18:20'), 'Same call with Dr. Menon — fever settled after the antibiotic change.'
        );
      }
    }
  }

  // A realistic correction: the attendant first recorded dinner as refused, then the
  // patient ate late and she changed it. The earlier value stays in the record.
  const correctionDate = addDays(dischargeDate, DAYS_ELAPSED - 3);
  const dinnerTask = db
    .prepare(`SELECT id, title_en FROM care_tasks WHERE plan_id = ? AND title_en LIKE 'Dinner%'`)
    .get(planId) as { id: string; title_en: string } | undefined;
  const nightShift = db
    .prepare(`SELECT id FROM shifts WHERE plan_id = ? AND date = ? AND slot = 'night'`)
    .get(planId, correctionDate) as { id: string } | undefined;
  if (dinnerTask && nightShift) {
    db.prepare(
      `INSERT INTO task_logs (id,plan_id,shift_id,task_id,status,reason,logged_at,logged_by)
       VALUES (?,?,?,?,'done',NULL,?,?)
       ON CONFLICT(shift_id, task_id) DO UPDATE SET status='done', reason=NULL, logged_at=excluded.logged_at`
    ).run(newId('tlg'), planId, nightShift.id, dinnerTask.id, t(correctionDate, '21:35'), attendant2Id);
    db.prepare(
      `INSERT INTO care_log_revisions
         (id,plan_id,shift_id,date,entry_type,entry_ref,label,previous_status,previous_reason,new_status,new_reason,changed_at,changed_by)
       VALUES (?,?,?,?, 'task', ?,?, 'missed', ?, 'done', NULL, ?, ?)`
    ).run(
      newId('rev'), planId, nightShift.id, correctionDate, dinnerTask.id, dinnerTask.title_en,
      'He said he was not hungry', t(correctionDate, '21:35'), attendant2Id
    );
  }

  // The replacement, with the handover snapshot the incoming attendant reads.
  const snapshot = buildHandover(planId);
  db.prepare(
    `INSERT INTO handovers (id,plan_id,from_member_id,to_member_id,reason,snapshot,created_at,created_by) VALUES (?,?,?,?,?,?,?,?)`
  ).run(
    newId('hnd'), planId, attendant1MemberId, attendant2MemberId, 'Left for her village at short notice',
    JSON.stringify(snapshot), t(addDays(dischargeDate, 5), '19:35'), familyId
  );

  // One open item so the demo dashboard is not artificially clean.
  db.prepare(
    `INSERT INTO alerts (id,plan_id,type,severity,title,detail,source_id,status,created_at) VALUES (?,?,?,?,?,?,?, 'open', ?)`
  ).run(
    newId('alt'), planId, 'shift_incomplete', 'watch', 'Important task missed: Prescribed physiotherapy exercises',
    'He said the leg hurt too much to do the second set. Physiotherapist is due on Thursday.', null,
    t(addDays(dischargeDate, DAYS_ELAPSED - 2), '18:40')
  );

  const alertRows = db.prepare('SELECT id, severity, title, detail, created_at FROM alerts WHERE plan_id = ?').all(planId) as any[];
  for (const a of alertRows) {
    db.prepare(
      `INSERT INTO notifications (id, plan_id, alert_id, channel, to_name, to_phone, message, status, created_at)
       VALUES (?,?,?,?,?,?,?, 'queued_stub', ?)`
    ).run(
      newId('ntf'), planId, a.id, a.severity === 'urgent' ? 'whatsapp' : 'app', 'Ananya Iyer', '9810012345',
      `${a.severity === 'urgent' ? '[Urgent] ' : ''}Ramesh Iyer: ${a.title}. ${a.detail}`.slice(0, 400), a.created_at
    );
  }

  const events = [
    'account_created', 'care_plan_created', 'attendant_invited', 'invite_accepted',
    'shift_started', 'task_logged', 'medication_logged', 'observation_reported',
    'alert_acknowledged', 'alert_resolved', 'shift_closed', 'handover_pack_viewed', 'day_record_viewed'
  ];
  events.forEach((name, idx) =>
    db.prepare('INSERT INTO analytics_events (id,name,user_id,plan_id,role,props,created_at) VALUES (?,?,?,?,?,?,?)')
      .run(newId('evt'), name, familyId, planId, 'family', '{"seed":true}', t(dischargeDate, `0${Math.min(9, idx)}:30`))
  );

  console.log(`Seeded care plan ${planId}`);
  console.log('  Family login    : 9810012345 / demo1234  (Ananya, daughter in Bengaluru)');
  console.log('  Attendant login : 9810055555 / demo1234  (Reena, current attendant)');
  console.log(`  Episode         : day ${DAYS_ELAPSED} of ${EPISODE_DAYS}, discharged ${dischargeDate}`);
}

seed();
