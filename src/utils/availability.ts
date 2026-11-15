import type {
	Answer,
	AvailabilityBody,
	AvailabilityChange,
	AvailabilityImport,
	AvailabilityMissing,
	AvailabilityRange,
	ExpandedAnswer,
	Weekday
} from '../models/availability';
import type { MemberId } from '../models/band-member';
import { addDays, daysFrom, daysInRange, isIsoDate, isShowNight, lastDayOfNextYear, weekdayIndex } from './dates';
import type { Parsed } from '../models/parsed';
import { isRecord, parsed, rejected } from './parsed';

// Shared by the Netlify functions and the client: relative imports only, no I/O.

const ANSWERS: Answer[] = ['yes', 'no', 'maybe'];
const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
/** A form's range is under 400 days, so one request never needs more. */
export const MAX_DAYS_PER_REQUEST = 400;

interface ParseOptions {
	/** Eastern 'YYYY-MM-DD'. */
	today: string;
	/** True for anyone but the admin: dates must fall in today → December 31 of next year, and answers can't be cleared. */
	memberLimits: boolean;
}

/** A show answer is 'no' on a Friday or Saturday whose answer is 'yes', and nothing else. */
const parseShowAnswer = (raw: Record<string, unknown>): 'no' | undefined | 'bad' => {
	if (raw.showAnswer === undefined || raw.showAnswer === null) return undefined;

	const showNight = isShowNight(raw.date as string);
	return raw.showAnswer === 'no' && raw.answer === 'yes' && showNight ? 'no' : 'bad';
};

export const parseAvailabilityChanges = (
	body: unknown,
	{ today, memberLimits }: ParseOptions
): Parsed<AvailabilityBody> => {
	if (!isRecord(body) || !Array.isArray(body.changes)) return rejected('bad-body');
	if (body.changes.length === 0 || body.changes.length > MAX_DAYS_PER_REQUEST) return rejected('bad-changes');

	const lastDay = lastDayOfNextYear(today);
	const seen = new Set<string>();
	const changes: AvailabilityChange[] = [];

	for (const raw of body.changes) {
		if (!isRecord(raw) || !isIsoDate(raw.date)) return rejected('bad-date');
		if (seen.has(raw.date)) return rejected('duplicate-date');
		seen.add(raw.date);

		if (raw.answer === null) {
			if (memberLimits) return rejected('cannot-clear');
		} else if (!ANSWERS.includes(raw.answer as Answer)) {
			return rejected('bad-answer');
		}

		if (memberLimits && (raw.date < today || raw.date > lastDay)) return rejected('date-out-of-range');

		const showAnswer = parseShowAnswer(raw);
		if (showAnswer === 'bad') return rejected('bad-show-answer');

		changes.push({
			date: raw.date,
			answer: raw.answer as Answer | null,
			...(showAnswer && { showAnswer })
		});
	}

	if (body.source === undefined) return parsed({ changes });
	if (body.source !== 'poll' && body.source !== 'manual' && body.source !== 'assumed') return rejected('bad-source');

	return parsed({ changes, source: body.source });
};

/**
 * Turns one import entry into unique (member, date) answers. An explicit yes beats a window no. For members in
 * `nightBeforeNoSunday`, a yes Saturday followed by a no Sunday also gets `showAnswer: 'no'`.
 */
export const expandImport = ({ window, members, nightBeforeNoSunday = [] }: AvailabilityImport): ExpandedAnswer[] => {
	const busy = window?.busyWeekdays?.map(day => WEEKDAYS.indexOf(day));
	const answers: ExpandedAnswer[] = [];

	for (const [member, yesDates] of Object.entries(members) as [MemberId, string[]][]) {
		const byDate = new Map<string, Answer>();

		if (window) {
			for (const day of daysInRange(window.start, window.end)) {
				if (!busy || busy.includes(weekdayIndex(day))) byDate.set(day, 'no');
			}
		}
		for (const date of yesDates) byDate.set(date, 'yes');

		for (const [date, answer] of [...byDate].sort(([a], [b]) => a.localeCompare(b))) {
			const noShow =
				nightBeforeNoSunday.includes(member) &&
				answer === 'yes' &&
				weekdayIndex(date) === 6 &&
				byDate.get(addDays(date, 1)) === 'no';

			answers.push({ member, date, answer, ...(noShow && { showAnswer: 'no' as const }) });
		}
	}

	return answers;
};

/** The unanswered days in [max(startDay, today), endDay]. Every form with availability uses this in its sign-off rule. */
export const availabilityMissing = (
	{ startDay, endDay }: AvailabilityRange,
	myDays: Record<string, unknown>,
	today: string
): AvailabilityMissing => {
	let missingDays = 0;
	let firstMissing: string | undefined;

	for (const day of daysFrom(startDay, endDay, today)) {
		if (myDays[day] !== undefined) continue;
		missingDays++;
		firstMissing ??= day;
	}

	return firstMissing === undefined ? { missingDays } : { missingDays, firstMissing };
};
