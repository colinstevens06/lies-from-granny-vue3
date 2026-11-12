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
	/** The form whose lock-in created this practice. */
	formId?: number;
}

/** The editor's whole-record body. `complete` is accepted only when the stored practice is already complete. */
export interface PracticeInput {
	date: string;
	startTime?: string;
	endTime?: string;
	location?: string;
	status: PracticeStatus;
	prepare: string[];
	recap: string[];
}

/** One entry of `band-data/import.ts`. */
export type PracticeImport = Omit<Practice, 'id' | 'formId'>;
