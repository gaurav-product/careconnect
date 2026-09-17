import { describe, expect, it } from 'vitest';
import { dateLabel, readingValue, shortDate, timeLabel } from '../../app/client/lib/format.js';

describe('formatting for Indian families', () => {
  it('keeps an IST calendar date on the right day regardless of the viewer timezone', () => {
    // The bug this guards: a browser in UTC rendered 24 Aug as "Sun, 23 Aug".
    expect(dateLabel('2026-08-24')).toMatch(/24 Aug/);
    expect(shortDate('2026-08-24')).toMatch(/24 Aug/);
    expect(dateLabel('2026-01-01')).toMatch(/1 Jan/);
  });

  it('writes dose times the way people say them', () => {
    expect(timeLabel('09:00')).toBe('9:00 am');
    expect(timeLabel('21:30')).toBe('9:30 pm');
    expect(timeLabel('00:15')).toBe('12:15 am');
    expect(timeLabel('12:00')).toBe('12:00 pm');
  });

  it('never shows a floating-point artefact on a reading', () => {
    expect(readingValue(98.39999999999999)).toBe('98.4');
    expect(readingValue(120)).toBe('120');
    expect(readingValue(37.25)).toBe('37.3');
  });
});
