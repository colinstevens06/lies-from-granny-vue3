import type { Gig } from '@models/gig';
import type { Practice } from '@models/practice';
import { shows } from '@components/shows/shows';
import { easternNow, formatCalendarDate, formatClockTime } from '@utils/dates';

// A practice with no time yet spans its whole day for sorting and for deciding whether it's past.
const startsAt = (practice: Practice) => `${practice.date}T${practice.startTime ?? '00:00'}`;
const endsAt = (practice: Practice) => `${practice.date}T${practice.endTime ?? '23:59'}`;

const byStart = (a: Practice, b: Practice) => startsAt(a).localeCompare(startsAt(b));

const isPast = (practice: Practice, now: string) => practice.status === 'complete' || endsAt(practice) < now;

/** Practices that haven't ended yet (cancelled ones included, so the cancellation is visible), soonest first. */
export const upcomingPractices = (practices: Practice[], now = easternNow()) =>
	practices.filter(p => !isPast(p, now)).sort(byStart);

/** Practices that are over (cancelled ones included), newest first. */
export const practiceHistory = (practices: Practice[], now = easternNow()) =>
	practices.filter(p => isPast(p, now)).sort((a, b) => byStart(b, a));

/** 'Monday, November 16' */
export const formatPracticeDay = (practice: Practice) =>
	formatCalendarDate(practice.date, { weekday: 'long', month: 'long', day: 'numeric' });

/** '7:00 PM – 10:00 PM', or 'Time TBD' until both times are set. */
export const formatPracticeTime = ({ startTime, endTime }: Practice) =>
	startTime && endTime ? `${formatClockTime(startTime)} – ${formatClockTime(endTime)}` : 'Time TBD';

/** Where practice happens unless a practice says otherwise. A town only; never a street address on this public page. */
export const PRACTICE_HOME = 'Burtonsville';

export const practiceLocation = (practice: Practice) => practice.location ?? PRACTICE_HOME;

/** The show a practice is prepping for, if it names one. */
export const practiceGig = (practice: Practice): Gig | undefined =>
	practice.gigId === undefined ? undefined : shows.find(show => show.id === practice.gigId);

/** An upcoming practice that's still on and has no time yet. */
export const needsTime = (practice: Practice) => practice.status !== 'cancelled' && !practice.startTime;
