import { describe, expect, it } from 'vitest';
import { parseFlagPatch, repeatsLockIn } from './forms';

describe('parseFlagPatch', () => {
	it('accepts the one flag set to true and drops other fields', () => {
		expect(parseFlagPatch({ closed: true, name: 'x' }, 'closed')).toEqual({ ok: true, value: { closed: true } });
	});

	// A form never reopens and a sign-off is never taken back, so false is refused, not ignored.
	it.each([{ closed: false }, { closed: 'true' }, {}, [], null, undefined])('refuses %j', body => {
		expect(parseFlagPatch(body, 'closed')).toEqual({ ok: false, error: 'bad-body' });
	});
});

describe('repeatsLockIn', () => {
	const booked = [
		{ date: '2027-01-05', status: 'scheduled' as const },
		{ date: '2027-01-12', status: 'complete' as const },
		{ date: '2027-01-19', status: 'cancelled' as const }
	];

	it('matches a retry of the same days in any order, ignoring cancelled practices', () => {
		expect(repeatsLockIn({ days: ['2027-01-12', '2027-01-05'] }, booked)).toBe(true);
	});

	it.each([{ days: ['2027-01-05'] }, { days: ['2027-01-05', '2027-01-12', '2027-01-19'] }, { days: [] }, {}])(
		'does not match %j',
		body => {
			expect(repeatsLockIn(body, booked)).toBe(false);
		}
	);

	it('does not match a form closed without a lock-in', () => {
		expect(repeatsLockIn({ days: ['2027-01-05'] }, [])).toBe(false);
	});
});
