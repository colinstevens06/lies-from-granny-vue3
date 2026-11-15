import type { MemberId } from './band-member';

export type Answer = 'yes' | 'no' | 'maybe';

/** Higher beats lower when an import would overwrite an existing answer. Mirrors `source_rank()` in migration 0001. */
export type AvailabilitySource = 'self' | 'poll' | 'manual' | 'assumed';

export interface DayAnswer {
	answer: Answer;
	/**
	 * The answer to "can you play a show?" when it differs from `answer`; only on Fridays and Saturdays. Empty means it
	 * follows `answer`: the effective show answer is `showAnswer ?? answer`. The grid only ever writes 'no', on a day
	 * whose `answer` is 'yes'.
	 */
	showAnswer?: Answer;
	source: AvailabilitySource;
	updatedBy: MemberId;
	/** ISO UTC instant. */
	updatedAt: string;
}

export interface MemberAvailability {
	member: MemberId;
	/** Keyed by Eastern 'YYYY-MM-DD'. A missing day is unanswered. */
	days: Record<string, DayAnswer>;
}

/**
 * One day replaced whole: leaving `showAnswer` out clears any show answer the day had. `answer: null` clears the day,
 * which only the admin may do.
 */
export interface AvailabilityChange {
	date: string;
	answer: Answer | null;
	/** 'no' only, on a Friday or Saturday whose `answer` is 'yes'. */
	showAnswer?: 'no';
}

/** A member's own change to one day: never a clear, so the answer is always set. */
export type MyAnswer = Omit<AvailabilityChange, 'answer'> & { answer: Answer };

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

/** One entry of `band-data/import.ts`, expanded by `expandImport` in `@utils/availability`. */
export interface AvailabilityImport {
	source: 'poll' | 'manual' | 'assumed';
	/** In-window dates a listed member didn't list become 'no'; `busyWeekdays` narrows that to those weekdays. */
	window?: { start: string; end: string; busyWeekdays?: Weekday[] };
	/** 'yes' dates. A member who is absent is left untouched. */
	members: Partial<Record<MemberId, string[]>>;
	/**
	 * Members whose 'yes' Saturday before a 'no' Sunday is practice-yes, show-no (a Sunday work shift rules out a late
	 * show but not a practice). Derived from the Sundays this entry already lists, so nothing is added by hand.
	 */
	nightBeforeNoSunday?: MemberId[];
}

export interface AvailabilityBody {
	changes: AvailabilityChange[];
	/** Only the admin writing someone else's row may set this. */
	source?: Exclude<AvailabilitySource, 'self'>;
}

export interface ExpandedAnswer {
	member: MemberId;
	date: string;
	answer: Answer;
	showAnswer?: 'no';
}

export interface AvailabilityRange {
	startDay: string;
	endDay: string;
}

export interface AvailabilityMissing {
	missingDays: number;
	firstMissing?: string;
}
