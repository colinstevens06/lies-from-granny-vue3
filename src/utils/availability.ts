import type {
	Answer,
	AvailabilityChange,
	AvailabilityImport,
	AvailabilitySource,
	Weekday
} from '../models/availability';
import type { MemberId } from '../models/band-member';
import { addDays, isIsoDate, weekdayIndex } from './dates';
import { isRecord, parsed, rejected, type Parsed } from './parsed';

// Shared by the Netlify functions and the client: relative imports only, no I/O.

const ANSWERS: Answer[] = ['yes', 'no', 'maybe'];
const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
/** A form's range is under 400 days, so one request never needs more. */
const MAX_CHANGES = 400;

export interface AvailabilityBody {
	changes: AvailabilityChange[];
	/** Only the admin writing someone else's row may set this. */
	source?: Exclude<AvailabilitySource, 'self'>;
}

interface ParseOptions {
	/** Eastern 'YYYY-MM-DD'. */
	today: string;
	/** True for anyone but the admin: dates must fall in today → December 31 of next year, and answers can't be cleared. */
	memberLimits: boolean;
}

export const parseAvailabilityChanges = (
	body: unknown,
	{ today, memberLimits }: ParseOptions
): Parsed<AvailabilityBody> => {
	if (!isRecord(body) || !Array.isArray(body.changes)) return rejected('bad-body');
	if (body.changes.length === 0 || body.changes.length > MAX_CHANGES) return rejected('bad-changes');

	const lastDay = `${Number(today.slice(0, 4)) + 1}-12-31`;
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

		changes.push({ date: raw.date, answer: raw.answer as Answer | null });
	}

	if (body.source === undefined) return parsed({ changes });
	if (body.source !== 'poll' && body.source !== 'manual' && body.source !== 'assumed') return rejected('bad-source');

	return parsed({ changes, source: body.source });
};

export interface ExpandedAnswer {
	member: MemberId;
	date: string;
	answer: Answer;
}

/** Turns one import entry into unique (member, date) answers. An explicit yes beats a window no. */
export const expandImport = ({ window, members }: AvailabilityImport): ExpandedAnswer[] => {
	const busy = window?.busyWeekdays?.map(day => WEEKDAYS.indexOf(day));
	const answers: ExpandedAnswer[] = [];

	for (const [member, yesDates] of Object.entries(members) as [MemberId, string[]][]) {
		const byDate = new Map<string, Answer>();

		if (window) {
			for (let day = window.start; day <= window.end; day = addDays(day, 1)) {
				if (!busy || busy.includes(weekdayIndex(day))) byDate.set(day, 'no');
			}
		}
		for (const date of yesDates) byDate.set(date, 'yes');

		for (const [date, answer] of [...byDate].sort(([a], [b]) => a.localeCompare(b))) {
			answers.push({ member, date, answer });
		}
	}

	return answers;
};

export interface AvailabilityRange {
	startDay: string;
	endDay: string;
}

export interface AvailabilityMissing {
	missingDays: number;
	firstMissing?: string;
}

/** The unanswered days in [max(startDay, today), endDay]. Every form with availability uses this in its sign-off rule. */
export const availabilityMissing = (
	{ startDay, endDay }: AvailabilityRange,
	myDays: Record<string, unknown>,
	today: string
): AvailabilityMissing => {
	let missingDays = 0;
	let firstMissing: string | undefined;

	for (let day = startDay < today ? today : startDay; day <= endDay; day = addDays(day, 1)) {
		if (myDays[day] !== undefined) continue;
		missingDays++;
		firstMissing ??= day;
	}

	return firstMissing === undefined ? { missingDays } : { missingDays, firstMissing };
};
