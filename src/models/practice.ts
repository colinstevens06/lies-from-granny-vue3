export type PracticeStatus = 'scheduled' | 'cancelled' | 'complete';

export interface Practice {
	id: number;
	/** Eastern calendar date, 'YYYY-MM-DD'. Never hand it to `new Date()` alone; use the helpers in `@utils/dates`. */
	date: string;
	/** Eastern wall-clock time, 24h 'HH:MM'. */
	startTime: string;
	endTime: string;
	location: string;
	/** Songs to have ready. Use titles exactly as they appear in songs.ts. */
	prepare?: string[];
	/** Written after practice: what we ran, what got cut, what changed. */
	recap?: string[];
	/** The show this practice is prepping for (`Gig.id`). */
	gigId?: number;
	status: PracticeStatus;
}
