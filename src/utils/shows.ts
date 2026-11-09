import type { Gig } from '@models/gig';
import { toIsoDate } from '@utils/dates';

/**
 * `Gig.date` is a human-readable string ('March 16, 2026') parsed by `new Date()`. A show stays upcoming
 * through the end of its day. An unparseable date drops the show from both lists.
 */
const showEndsAt = (show: Gig) => new Date(`${show.date} 23:59:59`).getTime();

/** Shows that haven't happened yet, soonest first. */
export const upcomingShows = (shows: Gig[], now = Date.now()) =>
	shows.filter(show => showEndsAt(show) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

/** Shows that are over, in the order the data lists them. */
export const pastShows = (shows: Gig[], now = Date.now()) => shows.filter(show => showEndsAt(show) < now);

/** 'September 26, 2026' → '2026-09-26'. */
export const showIsoDate = (show: Gig) => toIsoDate(new Date(show.date));
