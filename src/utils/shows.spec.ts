import { describe, expect, it } from 'vitest';
import { makeGig } from '../test-utils/factories';
import { nextShowFrom, parseShowDate, showIsoDate, upcomingShows } from './shows';

describe('show dates', () => {
	// Code review #11: 'Sept' is only understood by some engines' Date parser, so parse the month ourselves.
	it.each([
		['Sept 27, 2025', '2025-09-27'],
		['September 26, 2026', '2026-09-26'],
		['Sep. 5, 2026', '2026-09-05'],
		['March 16, 2026', '2026-03-16']
	])('reads %s as %s without relying on Date parsing', (date, iso) => {
		expect(showIsoDate(makeGig({ date }))).toBe(iso);
	});

	it('parseShowDate gives an invalid date for text it cannot read', () => {
		expect(Number.isNaN(parseShowDate('someday').getTime())).toBe(true);
	});

	it('keeps a show upcoming through the end of its day', () => {
		const show = makeGig({ date: 'Sept 27, 2025' });
		expect(upcomingShows([show], new Date(2025, 8, 27, 20).getTime())).toHaveLength(1);
		expect(upcomingShows([show], new Date(2025, 8, 28, 1).getTime())).toHaveLength(0);
	});

	it('nextShowFrom picks the soonest show on or after an Eastern day and skips unreadable dates', () => {
		const later = makeGig({ id: 2, date: 'December 12, 2026' });
		const sooner = makeGig({ id: 3, date: 'December 5, 2026' });
		const broken = makeGig({ id: 4, date: 'someday' });
		const list = [later, broken, sooner];

		expect(nextShowFrom(list, '2026-12-05')).toBe(sooner);
		expect(nextShowFrom(list, '2026-12-06')).toBe(later);
		expect(nextShowFrom(list, '2026-12-13')).toBeUndefined();
	});
});
