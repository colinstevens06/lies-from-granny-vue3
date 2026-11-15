import { describe, expect, it } from 'vitest';
import {
	makeAvailability,
	makeBandAvailability,
	makeForm,
	makeGig,
	makeMyDays,
	makePractice,
	NO_SHOW
} from '../../test-utils/factories';
import {
	calendarDayStatus,
	effectiveShowAnswer,
	nearMissText,
	nextAnswer,
	nextDayChange,
	noGigText,
	pickGroups,
	possibleDates,
	showNights,
	showNightSummary,
	weeksInRange
} from './band-calendar';

const TODAY = '2026-11-13';
const D1 = '2026-11-16';
const D2 = '2026-11-17';
const FRI = '2026-11-20';
const SAT = '2026-11-21';
const SUN = '2026-11-22';

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
		expect(nearMissText(D1, rows)).toBe('Everyone but Fran (Not sure)');
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
		expect(groups.oneShort).toEqual([{ day: D2, member: 'nick', name: 'Nick' }]);
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

/** Taps a day `count` times from blank, feeding each result back in, and returns what each tap produced. */
const tapFromBlank = (date: string, count: number) => {
	const results: ReturnType<typeof nextDayChange>[] = [];
	for (let tap = 0; tap < count; tap++) results.push(nextDayChange(date, results.at(-1)));
	return results;
};

describe('nextDayChange', () => {
	it('cycles a Friday blank → Yes → Yes, no show → No → Not sure', () => {
		expect(tapFromBlank(FRI, 4)).toEqual([
			{ answer: 'yes' },
			{ answer: 'yes', showAnswer: 'no' },
			{ answer: 'no' },
			{ answer: 'maybe' }
		]);
	});

	it('cycles a Tuesday blank → Yes → No → Not sure, with no "no show" stop', () => {
		expect(tapFromBlank(D2, 3)).toEqual([{ answer: 'yes' }, { answer: 'no' }, { answer: 'maybe' }]);
	});

	it('goes from Yes with "no show" to No, which drops the show answer', () => {
		expect(nextDayChange(SAT, { answer: 'yes', showAnswer: 'no' })).toEqual({ answer: 'no' });
	});

	it('comes back round to Yes from Not sure', () => {
		expect(nextDayChange(SAT, { answer: 'maybe' })).toEqual({ answer: 'yes' });
	});
});

describe('effectiveShowAnswer', () => {
	it('is the show answer when there is one, else the day answer', () => {
		expect(effectiveShowAnswer({ answer: 'yes', showAnswer: 'no' })).toBe('no');
		expect(effectiveShowAnswer({ answer: 'yes' })).toBe('yes');
		expect(effectiveShowAnswer({ answer: 'maybe' })).toBe('maybe');
		expect(effectiveShowAnswer(undefined)).toBeUndefined();
	});
});

describe('show nights in the calendar', () => {
	it('is a gig night when all five can practice and play on a Friday', () => {
		expect(calendarDayStatus(FRI, makeBandAvailability([FRI]), [], [])).toBe('gig');
	});

	it('stays plain possible (can practice) when one member is "no show" on a Saturday', () => {
		const rows = makeBandAvailability([SAT], 'yes', { anna: { [SAT]: NO_SHOW } });
		expect(calendarDayStatus(SAT, rows, [], [])).toBe('possible');
	});

	it('is never a gig night Sunday through Thursday', () => {
		expect(calendarDayStatus(SUN, makeBandAvailability([SUN]), [], [])).toBe('possible');
		expect(calendarDayStatus(D1, makeBandAvailability([D1]), [], [])).toBe('possible');
	});

	it('is blocked by a No and booked by a practice or show, whatever the show answers', () => {
		expect(calendarDayStatus(SAT, makeBandAvailability([SAT], 'yes', { kyle: { [SAT]: 'no' } }), [], [])).toBe(
			'blocked'
		);
		expect(calendarDayStatus(SAT, makeBandAvailability([SAT]), [makePractice({ date: SAT })], [])).toBe('booked');
	});

	it('lists a gig night under both possible dates and show nights, and a "no show" Saturday only under possible', () => {
		const rows = makeBandAvailability([FRI, SAT, D1], 'yes', { anna: { [SAT]: NO_SHOW } });
		expect(possibleDates(makeForm(), rows, [], [], TODAY)).toEqual([D1, FRI, SAT]);
		expect(showNights(makeForm(), rows, [], [], TODAY)).toEqual([FRI]);
	});

	it('names who can practice but not play on the day sheet', () => {
		const rows = makeBandAvailability([SAT], 'yes', { anna: { [SAT]: NO_SHOW } });
		expect(noGigText(SAT, rows)).toBe('Everyone can practice · no gig: Anna');
		expect(noGigText(SAT, makeBandAvailability([SAT]))).toBeUndefined();
		expect(noGigText(SAT, makeBandAvailability([SAT], 'yes', { kyle: { [SAT]: 'no' } }))).toBeUndefined();
	});
});

describe('showNightSummary', () => {
	const form = makeForm({ availability: { startDay: '2026-11-10', endDay: '2026-11-22' } });

	it('counts Fridays and Saturdays from today, splitting show-Yes from practice-only', () => {
		const myDays = makeMyDays({ [FRI]: 'yes', [SAT]: NO_SHOW, '2026-11-14': 'yes' });
		expect(showNightSummary(form, myDays, TODAY)).toEqual({
			total: 4, // Nov 13, 14, 20, 21; the 14th isn't in the 13th's past
			playable: ['2026-11-14', FRI],
			practiceOnly: [SAT]
		});
	});

	it('leaves No, Not sure and blank nights out of both lists', () => {
		const myDays = makeMyDays({ [FRI]: 'no', [SAT]: 'maybe' });
		expect(showNightSummary(form, myDays, TODAY)).toMatchObject({ playable: [], practiceOnly: [] });
	});
});
