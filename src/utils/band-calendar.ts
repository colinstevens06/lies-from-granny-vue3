import type { Gig } from '@models/gig';
import type { Answer, MemberAvailability } from '@models/availability';
import type { MemberId } from '@models/band-member';
import type { Form } from '@models/form';
import type { Practice } from '@models/practice';
import { members } from '@components/da-band/members';
import { addDays, easternNow, formatCalendarDate, toIsoDate, weekdayIndex } from '@utils/dates';
import { showIsoDate } from '@utils/shows';

// Pure helpers behind the availability UI (plan U3): no I/O, no Vue. Dates are Eastern 'YYYY-MM-DD' strings and
// every "today" parameter is one too, so tests and callers can pin it. Reuses `@utils/dates` and `@utils/shows`.

/** The public origin used in copy-paste texts. */
const SITE = 'https://liesfromgranny.com';

// ---- Answers ---------------------------------------------------------------------------------------------

/** Tapping cycles blank → yes → no → maybe → yes. There's no way back to blank. */
export const nextAnswer = (current?: Answer): Answer => {
	if (current === 'yes') return 'no';
	if (current === 'no') return 'maybe';
	return 'yes';
};

export const ANSWER_LABEL: Record<Answer | 'none', string> = {
	yes: 'Yes',
	no: 'No',
	maybe: 'Not sure',
	none: 'Pending'
};

// ---- Ranges ----------------------------------------------------------------------------------------------

/** A Date's local calendar day as 'YYYY-MM-DD'. Same function as `toIsoDate`; the plan names it `toIsoDay`. */
export const toIsoDay = toIsoDate;

/** Calendar weeks (Sunday first) covering [startDay, endDay]. Cells outside the range are `undefined`. */
export const weeksInRange = (startDay: string, endDay: string): (string | undefined)[][] => {
	const weeks: (string | undefined)[][] = [];
	let week: (string | undefined)[] = Array.from({ length: weekdayIndex(startDay) }, () => undefined);

	for (let day = startDay; day <= endDay; day = addDays(day, 1)) {
		week.push(day);
		if (week.length === 7) {
			weeks.push(week);
			week = [];
		}
	}
	if (week.length > 0) {
		while (week.length < 7) week.push(undefined);
		weeks.push(week);
	}

	return weeks;
};

export interface CalendarMonth {
	/** 'YYYY-MM' */
	key: string;
	/** 'November 2026' */
	label: string;
	firstDay: string;
	lastDay: string;
}

/** Every month from today's through December of next year. */
export const monthsFrom = (today: string): CalendarMonth[] => {
	const lastYear = Number(today.slice(0, 4)) + 1;
	const months: CalendarMonth[] = [];

	for (let year = Number(today.slice(0, 4)), month = Number(today.slice(5, 7)); year <= lastYear; ) {
		const key = `${year}-${String(month).padStart(2, '0')}`;
		const firstDay = `${key}-01`;
		const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`;

		months.push({
			key,
			label: formatCalendarDate(firstDay, { month: 'long', year: 'numeric' }),
			firstDay,
			lastDay: addDays(nextMonth, -1)
		});

		if (month === 12) {
			year++;
			month = 1;
		} else {
			month++;
		}
	}

	return months;
};

const lastDayOfNextYear = (today: string) => `${Number(today.slice(0, 4)) + 1}-12-31`;

const todayEastern = () => easternNow().slice(0, 10);

// ---- Status ----------------------------------------------------------------------------------------------

export type DayStatus = 'booked' | 'blocked' | 'possible' | 'open';

const answerOf = (availability: MemberAvailability[], member: MemberId, date: string): Answer | undefined =>
	availability.find(row => row.member === member)?.days[date]?.answer;

/** The five members' answers for a day, in roster order. */
export const dayAnswers = (date: string, availability: MemberAvailability[]) =>
	members.map(member => ({ member, answer: answerOf(availability, member.id, date) }));

/** A day is booked by any practice that isn't cancelled, or by a show. */
const isBooked = (date: string, practices: Practice[], shows: Gig[]) =>
	practices.some(practice => practice.date === date && practice.status !== 'cancelled') ||
	shows.some(show => showIsoDate(show) === date);

/**
 * Booked beats everything, then any No blocks the day, then five Yes make it possible. Maybe and Pending leave
 * it open but keep it off the possible list.
 */
export const calendarDayStatus = (
	date: string,
	availability: MemberAvailability[],
	practices: Practice[],
	shows: Gig[]
): DayStatus => {
	if (isBooked(date, practices, shows)) return 'booked';

	const answers = dayAnswers(date, availability).map(entry => entry.answer);
	if (answers.includes('no')) return 'blocked';

	return answers.every(answer => answer === 'yes') ? 'possible' : 'open';
};

/** "Everyone but {name} (Pending)" when exactly one member isn't a Yes and nobody said No; otherwise undefined. */
export const nearMissText = (date: string, availability: MemberAvailability[]): string | undefined => {
	const notYes = dayAnswers(date, availability).filter(entry => entry.answer !== 'yes');
	if (notYes.length !== 1) return undefined;

	const [{ member, answer }] = notYes;
	return `Everyone but ${member.short} (${ANSWER_LABEL[answer ?? 'none']})`;
};

// ---- Targets and possible dates --------------------------------------------------------------------------

export interface FormTarget {
	label: string;
	/** Eastern 'YYYY-MM-DD'; omitted for a label-only target. */
	day?: string;
	gig?: Gig;
}

/**
 * The booked gig if it's still in `shows` and hasn't passed, else the free-text label (and optional day),
 * else undefined.
 */
export const targetOf = (form: Form, shows: Gig[], today = todayEastern()): FormTarget | undefined => {
	const target = form.availability;
	if (!target) return undefined;

	const gig = target.gigId === undefined ? undefined : shows.find(show => show.id === target.gigId);
	if (gig && showIsoDate(gig) >= today) return { label: gig.name, day: showIsoDate(gig), gig };

	if (target.targetLabel === undefined) return undefined;
	return target.targetDay === undefined
		? { label: target.targetLabel }
		: { label: target.targetLabel, day: target.targetDay };
};

/**
 * The first and last day worth offering: today onward, ending the day before the target day, or at the form's
 * end when there's no target day. With no availability form it spans every upcoming date.
 */
const candidateRange = (form: Form | undefined, shows: Gig[], today: string) => {
	if (!form?.availability) return { first: today, last: lastDayOfNextYear(today) };

	const targetDay = targetOf(form, shows, today)?.day;
	if (targetDay !== undefined) return { first: today, last: addDays(targetDay, -1) };

	const { startDay, endDay } = form.availability;
	return { first: startDay > today ? startDay : today, last: endDay };
};

const daysBetweenInclusive = (first: string, last: string) => {
	const days: string[] = [];
	for (let day = first; day <= last; day = addDays(day, 1)) days.push(day);
	return days;
};

/** Upcoming days all five said Yes to and nothing is booked, soonest first. */
export const possibleDates = (
	form: Form | undefined,
	availability: MemberAvailability[],
	practices: Practice[],
	shows: Gig[],
	today = todayEastern()
): string[] => {
	const { first, last } = candidateRange(form, shows, today);

	return daysBetweenInclusive(first, last).filter(
		day => calendarDayStatus(day, availability, practices, shows) === 'possible'
	);
};

/**
 * How many practices the form still wants scheduled, or undefined when it doesn't say. A practice counts when
 * the form's lock-in made it, when it prepares for the form's gig, or when it falls between the form's start
 * and the target day. Cancelled practices don't count.
 */
export const practicesStillNeeded = (form: Form, practices: Practice[], shows: Gig[]): number | undefined => {
	const target = form.availability;
	if (target?.practicesNeeded === undefined) return undefined;

	const targetDay = targetOf(form, shows, '0000-00-00')?.day;
	const counted = practices.filter(
		practice =>
			practice.status !== 'cancelled' &&
			(practice.formId === form.id ||
				(target.gigId !== undefined && practice.gigId === target.gigId) ||
				(targetDay !== undefined && practice.date >= target.startDay && practice.date < targetDay))
	);

	return Math.max(0, target.practicesNeeded - counted.length);
};

// ---- Picking dates (admin) -------------------------------------------------------------------------------

export interface PickGroups {
	/** Everyone said Yes. */
	everyoneYes: string[];
	/** Exactly one member isn't a Yes (and so can't be counted in); `short` labels who ("no Franny"). */
	oneShort: { day: string; member: MemberId; short: string }[];
}

/** Future, unbooked days in the form's range, grouped for the admin's lock-in. */
export const pickGroups = (
	form: Form,
	availability: MemberAvailability[],
	practices: Practice[],
	today = todayEastern(),
	shows: Gig[] = []
): PickGroups => {
	const groups: PickGroups = { everyoneYes: [], oneShort: [] };
	if (!form.availability) return groups;

	const { startDay, endDay } = form.availability;
	for (const day of daysBetweenInclusive(startDay > today ? startDay : today, endDay)) {
		if (isBooked(day, practices, shows)) continue;

		const notYes = dayAnswers(day, availability).filter(entry => entry.answer !== 'yes');
		if (notYes.length === 0) groups.everyoneYes.push(day);
		else if (notYes.length === 1) {
			groups.oneShort.push({ day, member: notYes[0].member.id, short: notYes[0].member.short });
		}
	}

	return groups;
};

/** Days from today to the form's end that the member's calendar already answers. */
export const prefilledCount = (form: Form, myDays: Record<string, unknown>, today = todayEastern()): number => {
	if (!form.availability) return 0;

	const { startDay, endDay } = form.availability;
	return daysBetweenInclusive(startDay > today ? startDay : today, endDay).filter(day => myDays[day] !== undefined)
		.length;
};

// ---- Copy texts ------------------------------------------------------------------------------------------

const formLink = (form: Form) => `${SITE}/da-band/form/${form.id}`;

/** 'Sun Nov 15' */
const shortDay = (day: string) => formatCalendarDate(day, { weekday: 'short', month: 'short', day: 'numeric' });

/** The text the admin pastes into the group thread when a form goes out. */
export const inviteText = (form: Form): string =>
	`${form.title} is open on the band site. Please fill it out by ${shortDay(form.dueDay)}: ${formLink(form)}`;

/** A one-line reminder naming who hasn't signed off yet. */
export const nudgeText = (form: Form, waiting: MemberId[]): string => {
	const names = members.filter(member => waiting.includes(member.id)).map(member => member.short);

	return `Still waiting on ${names.join(', ')} for ${form.title} (due ${shortDay(form.dueDay)}): ${formLink(form)}`;
};

/** A plain list of dates for the group thread, soonest first, with an optional lead line. */
export const possibleListText = (days: string[], header?: string): string =>
	[header ?? 'Dates that work for everyone:', ...days.map(day => `• ${shortDay(day)}`)].join('\n');
