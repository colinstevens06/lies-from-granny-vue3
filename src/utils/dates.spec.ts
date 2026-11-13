import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, easternNow, formatClockTime, isIsoDate, weekdayIndex } from './dates';

describe('dates around DST', () => {
	it('easternNow follows the wall clock through the fall-back hour (2026-11-01)', () => {
		expect(easternNow(new Date('2026-11-01T05:30:00Z'))).toBe('2026-11-01T01:30'); // EDT
		expect(easternNow(new Date('2026-11-01T06:30:00Z'))).toBe('2026-11-01T01:30'); // EST, same wall time
		expect(easternNow(new Date('2026-11-01T07:30:00Z'))).toBe('2026-11-01T02:30');
	});

	it('easternNow follows the wall clock through spring-forward (2027-03-14)', () => {
		expect(easternNow(new Date('2027-03-14T06:59:00Z'))).toBe('2027-03-14T01:59'); // EST
		expect(easternNow(new Date('2027-03-14T07:00:00Z'))).toBe('2027-03-14T03:00'); // EDT, 2 AM skipped
	});

	it('addDays and daysBetween count calendar days, not 24-hour blocks', () => {
		expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
		expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
		expect(addDays('2027-03-13', 2)).toBe('2027-03-15');
		expect(daysBetween('2026-10-31', '2026-11-02')).toBe(2);
		expect(daysBetween('2027-03-13', '2027-03-15')).toBe(2);
	});

	it('weekdayIndex is unaffected by the transition days', () => {
		expect(weekdayIndex('2026-11-01')).toBe(0); // Sunday
		expect(weekdayIndex('2027-03-14')).toBe(0);
	});
});

describe('date helpers', () => {
	it('isIsoDate accepts only real calendar dates', () => {
		expect(isIsoDate('2027-02-28')).toBe(true);
		expect(isIsoDate('2027-02-29')).toBe(false);
		expect(isIsoDate('2027-2-1')).toBe(false);
		expect(isIsoDate(20270101)).toBe(false);
	});

	it('formatClockTime handles midnight and noon', () => {
		expect(formatClockTime('00:05')).toBe('12:05 AM');
		expect(formatClockTime('12:00')).toBe('12:00 PM');
		expect(formatClockTime('19:00')).toBe('7:00 PM');
	});
});
