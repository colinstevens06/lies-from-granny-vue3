import { describe, expect, it } from 'vitest';
import { expandImport, parseAvailabilityChanges } from './availability';

const TODAY = '2026-11-13';
const parse = (changes: unknown[]) => parseAvailabilityChanges({ changes }, { today: TODAY, memberLimits: true });

describe('parseAvailabilityChanges show answer', () => {
	it('accepts "no" on a Yes Friday or Saturday', () => {
		const result = parse([
			{ date: '2026-11-20', answer: 'yes', showAnswer: 'no' },
			{ date: '2026-11-21', answer: 'yes', showAnswer: 'no' }
		]);
		expect(result).toMatchObject({ ok: true, value: { changes: [{ showAnswer: 'no' }, { showAnswer: 'no' }] } });
	});

	it('treats a missing or null show answer as none, which clears it', () => {
		const result = parse([
			{ date: '2026-11-20', answer: 'yes' },
			{ date: '2026-11-21', answer: 'yes', showAnswer: null }
		]);
		expect(result).toMatchObject({ ok: true });
		expect(result.ok && result.value.changes.every(change => !('showAnswer' in change))).toBe(true);
	});

	it.each([
		['a weekday', { date: '2026-11-17', answer: 'yes', showAnswer: 'no' }],
		['a Sunday', { date: '2026-11-22', answer: 'yes', showAnswer: 'no' }],
		['a day that is not Yes', { date: '2026-11-20', answer: 'maybe', showAnswer: 'no' }],
		['any value but no', { date: '2026-11-20', answer: 'yes', showAnswer: 'yes' }]
	])('rejects a show answer on %s', (_name, change) => {
		expect(parse([change])).toEqual({ ok: false, error: 'bad-show-answer' });
	});
});

describe('expandImport night-before rule', () => {
	// 2027-02-06 and 2027-02-13 are Saturdays; Sundays are the 7th and 14th.
	const entry = {
		source: 'manual' as const,
		window: { start: '2027-02-05', end: '2027-02-14', busyWeekdays: ['sun' as const] },
		members: { anna: ['2027-02-05', '2027-02-06', '2027-02-07', '2027-02-12', '2027-02-13'], kyle: ['2027-02-13'] },
		nightBeforeNoSunday: ['anna' as const]
	};
	const byDate = (member: string) =>
		Object.fromEntries(
			expandImport(entry)
				.filter(answer => answer.member === member)
				.map(({ date, answer, showAnswer }) => [date, { answer, showAnswer }])
		);

	it('makes the Saturday before a No Sunday practice-yes, show-no', () => {
		expect(byDate('anna')['2027-02-13']).toEqual({ answer: 'yes', showAnswer: 'no' });
	});

	it('leaves a Saturday before a Yes Sunday, and every Friday, plain Yes', () => {
		expect(byDate('anna')['2027-02-06']).toEqual({ answer: 'yes', showAnswer: undefined });
		expect(byDate('anna')['2027-02-05']).toEqual({ answer: 'yes', showAnswer: undefined });
		expect(byDate('anna')['2027-02-12']).toEqual({ answer: 'yes', showAnswer: undefined });
	});

	it('applies only to the members the entry lists', () => {
		expect(byDate('kyle')['2027-02-13']).toEqual({ answer: 'yes', showAnswer: undefined });
	});

	it('does nothing without a rule', () => {
		const plain = expandImport({ ...entry, nightBeforeNoSunday: undefined });
		expect(plain.some(answer => answer.showAnswer)).toBe(false);
	});
});
