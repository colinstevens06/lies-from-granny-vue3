import type { Gig } from './gig';
import type { MemberId } from './band-member';

export interface CalendarMonth {
	/** 'YYYY-MM' */
	key: string;
	/** 'November 2026' */
	label: string;
	firstDay: string;
	lastDay: string;
}

export interface FormTarget {
	label: string;
	/** Eastern 'YYYY-MM-DD'; omitted for a label-only target. */
	day?: string;
	gig?: Gig;
}

export interface PickGroups {
	/** Everyone said Yes. */
	everyoneYes: string[];
	/** Exactly one member isn't a Yes (and so can't be counted in); `name` labels who ("no Francesco"). */
	oneShort: { day: string; member: MemberId; name: string }[];
}

export interface ShowNightSummary {
	/** Fridays and Saturdays from today through the form's end. */
	total: number;
	/** The member can play a show. */
	playable: string[];
	/** Yes to practice, no to a show. */
	practiceOnly: string[];
}

/** `possible` is "can practice"; `gig` is a possible Friday or Saturday that all five can also play. */
export type DayStatus = 'booked' | 'blocked' | 'gig' | 'possible' | 'open';
