import { describe, expect, it } from 'vitest';
import { addDays, dayNumber, istDate, istTime, slotForTime } from '../../src/server/util.js';
import { isOutOfRange, severityForVital, URGENT_BANDS } from '../../src/server/services/alerts.js';
import { isCompleteCareDay, isDocumentedCareDay, slotForWindow } from '../../src/server/services/record.js';
import type { DayRecord } from '../../src/shared/types.js';

describe('Indian time handling', () => {
  it('rolls the care day over at IST midnight, not UTC midnight', () => {
    // 20:00 UTC on 1 Sep is 01:30 IST on 2 Sep — a night-shift entry must land on the 2nd.
    expect(istDate('2026-09-01T20:00:00Z')).toBe('2026-09-02');
    expect(istDate('2026-09-01T18:00:00Z')).toBe('2026-09-01');
  });

  it('converts to IST wall-clock time', () => {
    expect(istTime('2026-09-01T03:30:00Z')).toBe('09:00');
  });

  it('counts the discharge day as day 1', () => {
    expect(dayNumber('2026-08-24', '2026-08-24')).toBe(1);
    expect(dayNumber('2026-08-24', '2026-09-01')).toBe(9);
  });

  it('adds days across a month boundary', () => {
    expect(addDays('2026-08-30', 3)).toBe('2026-09-02');
  });

  it('splits the clock into a day and a night shift', () => {
    expect(slotForTime('07:00')).toBe('day');
    expect(slotForTime('18:59')).toBe('day');
    expect(slotForTime('19:00')).toBe('night');
    expect(slotForTime('03:00')).toBe('night');
  });

  it('assigns every task window to exactly one shift', () => {
    expect(slotForWindow('morning')).toBe('day');
    expect(slotForWindow('afternoon')).toBe('day');
    expect(slotForWindow('anytime')).toBe('day');
    expect(slotForWindow('evening')).toBe('night');
    expect(slotForWindow('night')).toBe('night');
  });
});

describe('vital thresholds', () => {
  const band = { low: 96, high: 100.4, low2: null, high2: null };

  it('flags a reading outside the family-set band', () => {
    expect(isOutOfRange('temp', 101, null, band)).toBe(true);
    expect(isOutOfRange('temp', 98.4, null, band)).toBe(false);
  });

  it('escalates hard clinical bands even when no band was configured', () => {
    const none = { low: null, high: null, low2: null, high2: null };
    expect(isOutOfRange('spo2', 88, null, none)).toBe(true);
    expect(severityForVital('spo2', 88, null)).toBe('urgent');
    expect(severityForVital('temp', 100.8, null)).toBe('watch');
    expect(severityForVital('temp', 102.2, null)).toBe('urgent');
  });

  it('checks both blood pressure numbers', () => {
    const bpBand = { low: 95, high: 145, low2: 60, high2: 90 };
    expect(isOutOfRange('bp', 130, 95, bpBand)).toBe(true);
    expect(isOutOfRange('bp', 130, 82, bpBand)).toBe(false);
    expect(URGENT_BANDS.bp!(185, 90)).toBe(true);
  });
});

describe('the documented care day definition — the north star', () => {
  const day = (over: Partial<DayRecord> = {}): DayRecord => ({
    date: '2026-09-01',
    day_number: 9,
    shifts: [],
    meds: [],
    tasks: [],
    vitals: [],
    observations: [],
    alerts: [],
    revisions: [],
    score: { logged: 0, expected: 0, missed_critical: 0 },
    ...over
  });

  it('counts a day with any care record at all', () => {
    expect(isDocumentedCareDay(day({ score: { logged: 1, expected: 14, missed_critical: 0 } }))).toBe(true);
  });

  it('counts a day where only a reading was taken', () => {
    const d = day();
    d.vitals = [
      { id: 'v1', plan_id: 'p', shift_id: null, type: 'temp', value1: 98.4, value2: null, out_of_range: false, logged_at: '', logged_by: 'u' }
    ];
    expect(isDocumentedCareDay(d)).toBe(true);
  });

  it('counts a day where only a problem was reported', () => {
    const d = day();
    d.observations = [
      { id: 'o1', plan_id: 'p', shift_id: null, red_flag_id: null, note: 'wound looks red', severity: 'watch', logged_at: '', logged_by: 'u', red_flag_label: null }
    ];
    expect(isDocumentedCareDay(d)).toBe(true);
  });

  it('does not count a day with nothing recorded', () => {
    expect(isDocumentedCareDay(day({ score: { logged: 0, expected: 14, missed_critical: 0 } }))).toBe(false);
  });

  it('counts an imperfect day — a missed dose with a reason is still a record', () => {
    const d = day({ score: { logged: 3, expected: 14, missed_critical: 2 } });
    expect(isDocumentedCareDay(d)).toBe(true);
    expect(isCompleteCareDay(d)).toBe(false);
  });
});

describe('the complete care day definition — the quality measure', () => {
  const base = (over: Partial<DayRecord> = {}): DayRecord => ({
    date: '2026-09-01',
    day_number: 9,
    shifts: [],
    meds: [
      { medication_id: 'm1', name: 'Rivaroxaban', dose: '10mg', scheduled_time: '09:00', critical: true, status: 'given', reason: null, logged_at: null }
    ],
    tasks: [
      { task_id: 't1', title_en: 'Walk', title_hi: 'चलना', window: 'morning', critical: true, status: 'done', reason: null },
      { task_id: 't2', title_en: 'Bath', title_hi: 'स्नान', window: 'morning', critical: false, status: 'done', reason: null }
    ],
    vitals: [],
    observations: [],
    alerts: [],
    revisions: [],
    score: { logged: 3, expected: 3, missed_critical: 0 },
    ...over
  });

  it('counts a complete day with nothing outstanding', () => {
    expect(isCompleteCareDay(base())).toBe(true);
  });

  it('does not count a day where a must-not-miss item was missed', () => {
    const day = base();
    day.meds[0].status = 'missed';
    day.score.missed_critical = 1;
    expect(isCompleteCareDay(day)).toBe(false);
  });

  it('does not count a day where a critical item was never recorded at all', () => {
    const day = base();
    day.tasks[0].status = 'pending';
    day.score.logged = 2;
    expect(isCompleteCareDay(day)).toBe(false);
  });

  it('does not count a day with an urgent alert left open', () => {
    const day = base({
      alerts: [
        {
          id: 'a1', plan_id: 'p1', type: 'red_flag', severity: 'urgent', title: 'Wound', detail: 'red',
          source_id: null, status: 'open', created_at: '', acknowledged_at: null, acknowledged_by: null,
          resolved_at: null, resolution_note: null
        }
      ]
    });
    expect(isCompleteCareDay(day)).toBe(false);
  });

  it('still counts a day where an urgent alert was dealt with', () => {
    const day = base({
      alerts: [
        {
          id: 'a1', plan_id: 'p1', type: 'red_flag', severity: 'urgent', title: 'Wound', detail: 'red',
          source_id: null, status: 'resolved', created_at: '', acknowledged_at: '', acknowledged_by: 'u1',
          resolved_at: '', resolution_note: 'Called the doctor'
        }
      ]
    });
    expect(isCompleteCareDay(day)).toBe(true);
  });

  it('needs at least 80% of the day recorded', () => {
    const day = base();
    day.tasks[1].status = 'pending';
    day.score = { logged: 2, expected: 3, missed_critical: 0 };
    expect(isCompleteCareDay(day)).toBe(false);
  });

  it('never counts a day with nothing expected as documented', () => {
    expect(isCompleteCareDay(base({ meds: [], tasks: [], score: { logged: 0, expected: 0, missed_critical: 0 } }))).toBe(false);
  });
});
