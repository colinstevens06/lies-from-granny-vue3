import type { MemberId } from './band-member';

export type Answer = 'yes' | 'no' | 'maybe';

/** Higher beats lower when an import would overwrite an existing answer. Mirrors `source_rank()` in migration 0001. */
export type AvailabilitySource = 'self' | 'poll' | 'manual' | 'assumed';

export interface DayAnswer {
	answer: Answer;
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

/** `answer: null` clears the day, which only the admin may do. */
export interface AvailabilityChange {
	date: string;
	answer: Answer | null;
}

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

/** One entry of `band-data/import.ts`, expanded by `expandImport` in `@utils/availability`. */
export interface AvailabilityImport {
	source: 'poll' | 'manual' | 'assumed';
	/** In-window dates a listed member didn't list become 'no'; `busyWeekdays` narrows that to those weekdays. */
	window?: { start: string; end: string; busyWeekdays?: Weekday[] };
	/** 'yes' dates. A member who is absent is left untouched. */
	members: Partial<Record<MemberId, string[]>>;
}
