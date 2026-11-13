import type { Gig } from '@models/gig';
import { toIsoDate } from '@utils/dates';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/**
 * `Gig.date` is a human-readable string ('March 16, 2026', 'Sept 27, 2025'). The month is read by its first three
 * letters, because `new Date('Sept 27, 2025')` is implementation-defined and only some engines accept it. Anything else
 * falls back to `new Date()`; an unparseable date is an Invalid Date, which drops the show from both lists.
 * `endOfDay` gives 23:59:59 local time, so a show stays upcoming through its day.
 */
export const parseShowDate = (text: string, endOfDay = false): Date => {
	const match = /^\s*([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\s*$/.exec(text);
	const month = match ? MONTHS.indexOf(match[1].toLowerCase()) : -1;
	if (!match || month === -1) return new Date(endOfDay ? `${text} 23:59:59` : text);

	return endOfDay
		? new Date(Number(match[3]), month, Number(match[2]), 23, 59, 59)
		: new Date(Number(match[3]), month, Number(match[2]));
};

const showEndsAt = (show: Gig) => parseShowDate(show.date, true).getTime();

/** Shows that haven't happened yet, soonest first. */
export const upcomingShows = (shows: Gig[], now = Date.now()) =>
	shows
		.filter(show => showEndsAt(show) >= now)
		.sort((a, b) => parseShowDate(a.date).getTime() - parseShowDate(b.date).getTime());

/** Shows that are over, in the order the data lists them. */
export const pastShows = (shows: Gig[], now = Date.now()) => shows.filter(show => showEndsAt(show) < now);

/** 'September 26, 2026' → '2026-09-26'. */
export const showIsoDate = (show: Gig) => toIsoDate(parseShowDate(show.date));
