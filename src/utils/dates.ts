/**
 * Every band date and time means Maryland time. Use the IANA zone, never a fixed offset: Maryland observes DST.
 *
 * Band dates are stored as Eastern wall-clock strings ('YYYY-MM-DD', 'HH:MM') and compared as strings against
 * `easternNow()`. Nothing is converted through the viewer's own timezone, so a phone set to Denver still shows
 * a 7 PM practice as 7 PM.
 */
export const EASTERN = 'America/New_York';

const MS_PER_DAY = 86400000;

const pad = (value: number) => String(value).padStart(2, '0');

const easternClock = new Intl.DateTimeFormat('en-US', {
	timeZone: EASTERN,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

/** The current Eastern wall-clock time as 'YYYY-MM-DDTHH:MM', which sorts and compares as a plain string. */
export const easternNow = (now = new Date()): string => {
	const part = (type: Intl.DateTimeFormatPartTypes) =>
		easternClock.formatToParts(now).find(p => p.type === type)?.value ?? '';

	return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};

/** A 'YYYY-MM-DD' date pinned to UTC noon, so formatting it in UTC can never shift the day. */
const calendarDay = (date: string) => new Date(`${date}T12:00:00Z`);

/** Formats a 'YYYY-MM-DD' calendar date, e.g. `{ weekday: 'long' }` → 'Monday'. */
export const formatCalendarDate = (date: string, options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(calendarDay(date));

/** '19:00' → '7:00 PM'. */
export const formatClockTime = (time: string) => {
	const [hours, minutes] = time.split(':').map(Number);

	return `${hours % 12 || 12}:${pad(minutes)} ${hours < 12 ? 'AM' : 'PM'}`;
};

/** Whole days from one 'YYYY-MM-DD' date to another. */
export const daysBetween = (from: string, to: string) =>
	Math.round((calendarDay(to).getTime() - calendarDay(from).getTime()) / MS_PER_DAY);

/** A Date's local calendar day as 'YYYY-MM-DD'. */
export const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** A 'YYYY-MM-DD' date moved by whole days. */
export const addDays = (date: string, days: number) =>
	new Date(calendarDay(date).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);

/** 0 (Sunday) to 6 (Saturday) for a 'YYYY-MM-DD' date. */
export const weekdayIndex = (date: string) => calendarDay(date).getUTCDay();

/** True for a real calendar date written exactly as 'YYYY-MM-DD'. */
export const isIsoDate = (value: unknown): value is string =>
	typeof value === 'string' &&
	/^\d{4}-\d{2}-\d{2}$/.test(value) &&
	calendarDay(value).toISOString().slice(0, 10) === value;
