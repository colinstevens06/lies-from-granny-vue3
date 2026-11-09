/** `tentative`: the date is being planned but isn't locked in. */
export type PracticeStatus = 'tentative' | 'scheduled' | 'cancelled' | 'complete';

export interface Practice {
	id: number;
	/** Eastern calendar date, 'YYYY-MM-DD'. Never hand it to `new Date()` alone; use the helpers in `@utils/dates`. */
	date: string;
	/** Eastern wall-clock time, 24h 'HH:MM'. Omit both while the time is TBD. */
	startTime?: string;
	endTime?: string;
	/** Omit for the usual spot (`PRACTICE_HOME` in `@utils/practices`); set it only when practice is somewhere else. */
	location?: string;
	/** Songs to have ready. Use titles exactly as they appear in songs.ts. */
	prepare?: string[];
	/** Written after practice: what we ran, what got cut, what changed. */
	recap?: string[];
	/** The show this practice is prepping for (`Gig.id`). */
	gigId?: number;
	status: PracticeStatus;
}
