import { describe, expect, it } from 'vitest';
import { makeAvailability, makeBandAvailability, makeForm, makeGig, makePractice } from '../test-utils/factories';
import { calendarDayStatus, nearMissText, nextAnswer, pickGroups, possibleDates, weeksInRange } from './band-calendar';

const TODAY = '2026-11-13';
const D1 = '2026-11-16';
const D2 = '2026-11-17';

describe('calendarDayStatus', () => {
	it('is possible only when all five said yes', () => {
		expect(calendarDayStatus(D1, makeBandAvailability([D1]), [], [])).toBe('possible');
	});

	it('is blocked by any no, and open for maybe or pending', () => {
		expect(calendarDayStatus(D1, makeBandAvailability([D1], 'yes', { kyle: { [D1]: 'no' } }), [], [])).toBe('blocked');
		expect(calendarDayStatus(D1, makeBandAvailability([D1], 'yes', { kyle: { [D1]: 'maybe' } }), [], [])).toBe('open');
		expect(calendarDayStatus(D1, [makeAvailability('anna', { [D1]: 'yes' })], [], [])).toBe('open');
	});

	it('is booked by a live practice or a show, beating a no, but not by a cancelled practice', () => {
		const allNo = makeBandAvailability([D1], 'no');
		expect(calendarDayStatus(D1, allNo, [makePractice({ date: D1 })], [])).toBe('booked');
		expect(calendarDayStatus(D1, allNo, [], [makeGig({ date: 'November 16, 2026' })])).toBe('booked');
		expect(calendarDayStatus(D1, allNo, [makePractice({ date: D1, status: 'cancelled' })], [])).toBe('blocked');
	});
});

describe('nearMissText', () => {
	it('names the one member who is not a yes', () => {
		const rows = makeBandAvailability([D1], 'yes', { francesco: { [D1]: 'maybe' } });
		expect(nearMissText(D1, rows)).toBe('Everyone but Franny (Not sure)');
		expect(nearMissText(D1, makeBandAvailability([D1]))).toBeUndefined();
	});
});

describe('possibleDates', () => {
	it('lists upcoming all-yes, unbooked days in order, from today', () => {
		const rows = makeBandAvailability(['2026-11-12', D2, D1]);
		const result = possibleDates(makeForm(), rows, [makePractice({ date: D2 })], [], TODAY);
		expect(result).toEqual([D1]); // 11-12 is past, 11-17 is booked
	});

	it('stops the day before the form target day', () => {
		const form = makeForm({
			availability: { startDay: '2026-11-10', endDay: '2027-01-31', targetLabel: 'Show', targetDay: D2 }
		});
		expect(possibleDates(form, makeBandAvailability([D1, D2]), [], [], TODAY)).toEqual([D1]);
	});
});

describe('pickGroups', () => {
	it('splits all-yes days from days one member short, skipping booked and past days', () => {
		const rows = makeBandAvailability(['2026-11-12', D1, D2, '2026-11-18'], 'yes', {
			nick: { [D2]: 'no' },
			anna: { '2026-11-18': 'yes' }
		});
		const groups = pickGroups(makeForm(), rows, [makePractice({ date: '2026-11-18' })], TODAY);
		expect(groups.everyoneYes).toEqual([D1]);
		expect(groups.oneShort).toEqual([{ day: D2, member: 'nick', short: 'Hermes' }]);
	});
});

describe('weeksInRange / nextAnswer', () => {
	it('pads the first and last week with undefined, Sunday first', () => {
		const weeks = weeksInRange('2026-11-11', '2026-11-15'); // Wed to Sun
		expect(weeks).toHaveLength(2);
		expect(weeks[0].slice(0, 3)).toEqual([undefined, undefined, undefined]);
		expect(weeks[0][3]).toBe('2026-11-11');
		expect(weeks[1]).toEqual(['2026-11-15', undefined, undefined, undefined, undefined, undefined, undefined]);
	});

	it('cycles blank → yes → no → maybe → yes', () => {
		expect([undefined, 'yes', 'no', 'maybe'].map(a => nextAnswer(a as never))).toEqual(['yes', 'no', 'maybe', 'yes']);
	});
});
