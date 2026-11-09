import type { Gig } from '@models/gig';
import type { Practice } from '@models/practice';
import { shows } from '@components/shows/shows';
import { easternNow, formatCalendarDate, formatClockTime } from '@utils/dates';

const startsAt = (practice: Practice) => `${practice.date}T${practice.startTime}`;
const endsAt = (practice: Practice) => `${practice.date}T${practice.endTime}`;

const byStart = (a: Practice, b: Practice) => startsAt(a).localeCompare(startsAt(b));

/** Practices that haven't ended yet (cancelled ones included, so the cancellation is visible), soonest first. */
export const upcomingPractices = (practices: Practice[], now = easternNow()) =>
	practices.filter(p => p.status !== 'complete' && endsAt(p) >= now).sort(byStart);

/** Practices with a written recap, newest first. */
export const practiceRecaps = (practices: Practice[]) =>
	practices.filter(p => p.recap?.length).sort((a, b) => byStart(b, a));

/** 'Monday, November 16' */
export const formatPracticeDay = (practice: Practice) =>
	formatCalendarDate(practice.date, { weekday: 'long', month: 'long', day: 'numeric' });

/** '7:00 PM – 10:00 PM' */
export const formatPracticeTime = (practice: Practice) =>
	`${formatClockTime(practice.startTime)} – ${formatClockTime(practice.endTime)}`;

/** The show a practice is prepping for, if it names one. */
export const practiceGig = (practice: Practice): Gig | undefined =>
	practice.gigId === undefined ? undefined : shows.find(show => show.id === practice.gigId);
